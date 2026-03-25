import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
const USER_ID_KEY = 'iiqe_qq_cloud_user_id'
const PREFIX = 'iiqe_qq_'

// Only create client if env vars are configured
export const supabase = (SUPABASE_URL && SUPABASE_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_KEY)
  : null

export function isCloudEnabled() {
  return supabase !== null
}

// --- User ID management ---

export function getLocalUserId() {
  let id = localStorage.getItem(USER_ID_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(USER_ID_KEY, id)
  }
  return id
}

function setLocalUserId(id) {
  localStorage.setItem(USER_ID_KEY, id)
}

async function ensureUser() {
  if (!supabase) return null
  const userId = getLocalUserId()

  const { data } = await supabase
    .from('users')
    .select('id')
    .eq('id', userId)
    .single()

  if (!data) {
    await supabase.from('users').insert({ id: userId })
  }
  return userId
}

// --- Sync Code ---

export async function generateSyncCode() {
  if (!supabase) return null
  const userId = await ensureUser()
  if (!userId) return null

  const { data: user } = await supabase
    .from('users')
    .select('sync_code')
    .eq('id', userId)
    .single()

  if (user?.sync_code) return user.sync_code

  const { data: code } = await supabase.rpc('generate_sync_code')
  if (!code) return null

  await supabase
    .from('users')
    .update({ sync_code: code })
    .eq('id', userId)

  return code
}

export async function restoreFromSyncCode(code) {
  if (!supabase) return { ok: false, error: '云端同步未配置' }

  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('sync_code', code.toUpperCase().trim())
    .single()

  if (!user) return { ok: false, error: '同步码无效' }

  setLocalUserId(user.id)
  const cloud = await pullFromCloud()
  if (cloud) applyCloudData(cloud)
  return { ok: true }
}

// --- Debounced push ---

let syncTimer = null

export function scheduleSyncToCloud() {
  if (!supabase) return
  if (syncTimer) clearTimeout(syncTimer)
  syncTimer = setTimeout(() => {
    syncTimer = null
    pushToCloud()
  }, 5000)
}

async function pushToCloud() {
  if (!supabase) return
  try {
    const userId = await ensureUser()
    if (!userId) return

    // 1. Stats (per-chapter)
    const stats = readLocal('stats_v3', {})
    const statsRows = Object.entries(stats).map(([chapterId, s]) => ({
      user_id: userId,
      chapter_id: chapterId,
      correct: s.correct,
      total: s.total,
      updated_at: new Date().toISOString(),
    }))
    if (statsRows.length > 0) {
      await supabase.from('stats').upsert(statsRows, { onConflict: 'user_id,chapter_id' })
    }

    // 2. Error book — replace all
    const errors = readLocal('errorbook_v2', [])
    await supabase.from('errors').delete().eq('user_id', userId)
    if (errors.length > 0) {
      const rows = errors.map(e => ({
        id: e.id,
        user_id: userId,
        paper: e.paper,
        chapter_id: e.chapterId,
        chapter_name: e.chapterName,
        question: e.question,
        user_answer: e.userAnswer,
        correct_answer: e.correctAnswer,
        review_count: e.reviewCount,
        last_review_at: e.lastReviewAt,
        next_review_at: e.nextReviewAt,
        mastered: e.mastered,
        created_at: e.timestamp,
      }))
      for (let i = 0; i < rows.length; i += 100) {
        await supabase.from('errors').insert(rows.slice(i, i + 100))
      }
    }

    // 3. User data blob (streak, daily, achievements, settings, counters)
    const userData = {}
    for (const key of ['streak', 'daily', 'achievements', 'settings', 'exam_passed', 'perfect_exam', 'errors_mastered']) {
      const val = readLocal(key)
      if (val !== undefined) userData[key] = val
    }
    await supabase.from('user_data').upsert({
      user_id: userId,
      data: userData,
      updated_at: new Date().toISOString(),
    })

    window.dispatchEvent(new CustomEvent('cloud-sync', { detail: { status: 'synced' } }))
  } catch (err) {
    console.warn('Cloud sync push failed:', err)
    window.dispatchEvent(new CustomEvent('cloud-sync', { detail: { status: 'error' } }))
  }
}

// --- Pull from cloud ---

async function pullFromCloud() {
  if (!supabase) return null
  const userId = getLocalUserId()

  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('id', userId)
    .single()

  if (!user) return null

  const [statsRes, errorsRes, udRes] = await Promise.all([
    supabase.from('stats').select('chapter_id, correct, total').eq('user_id', userId),
    supabase.from('errors').select('*').eq('user_id', userId),
    supabase.from('user_data').select('data, updated_at').eq('user_id', userId).single(),
  ])

  return {
    statsRows: statsRes.data,
    errorRows: errorsRes.data,
    userData: udRes.data,
  }
}

function applyCloudData(cloud) {
  if (!cloud) return

  // Merge stats: keep whichever has more total answered
  if (cloud.statsRows?.length > 0) {
    const local = readLocal('stats_v3', {})
    const merged = { ...local }
    cloud.statsRows.forEach(r => {
      const existing = merged[r.chapter_id]
      if (!existing || r.total > existing.total) {
        merged[r.chapter_id] = { correct: r.correct, total: r.total }
      }
    })
    writeLocal('stats_v3', merged)
  }

  // Merge errors: combine by id, keep higher reviewCount
  if (cloud.errorRows?.length > 0) {
    const local = readLocal('errorbook_v2', [])
    const map = new Map(local.map(e => [e.id, e]))
    cloud.errorRows.forEach(r => {
      const e = {
        id: r.id, paper: r.paper, chapterId: r.chapter_id,
        chapterName: r.chapter_name, question: r.question,
        userAnswer: r.user_answer, correctAnswer: r.correct_answer,
        reviewCount: r.review_count, lastReviewAt: r.last_review_at,
        nextReviewAt: r.next_review_at, mastered: r.mastered,
        timestamp: r.created_at,
      }
      const existing = map.get(e.id)
      if (!existing || e.reviewCount > existing.reviewCount) map.set(e.id, e)
    })
    writeLocal('errorbook_v2', Array.from(map.values()))
  }

  // Merge user data
  if (cloud.userData?.data) {
    const d = cloud.userData.data
    if (d.streak) {
      const local = readLocal('streak', { current: 0, max: 0 })
      writeLocal('streak', {
        current: Math.max(local.current, d.streak.current || 0),
        max: Math.max(local.max, d.streak.max || 0),
      })
    }
    if (d.achievements) {
      const local = readLocal('achievements', [])
      writeLocal('achievements', [...new Set([...local, ...d.achievements])])
    }
    if (d.daily) {
      const local = readLocal('daily', { date: '', count: 0, correct: 0, max: 0 })
      writeLocal('daily', { ...d.daily, max: Math.max(local.max || 0, d.daily.max || 0) })
    }
    if (d.settings) writeLocal('settings', d.settings)
    for (const key of ['exam_passed', 'perfect_exam', 'errors_mastered']) {
      if (d[key] !== undefined) {
        const localVal = readLocal(key, 0)
        if (d[key] > localVal) writeLocal(key, d[key])
      }
    }
  }
}

// --- Initial sync on page load ---

export async function initialSync() {
  if (!supabase) return false
  try {
    const cloud = await pullFromCloud()
    if (cloud && (cloud.statsRows?.length || cloud.errorRows?.length || cloud.userData?.data)) {
      applyCloudData(cloud)
      window.dispatchEvent(new CustomEvent('cloud-sync', { detail: { status: 'synced' } }))
      return true // data was merged, caller may want to reload state
    }
    return false
  } catch (err) {
    console.warn('Initial cloud sync failed:', err)
    return false
  }
}

// --- Force push (for manual sync button) ---

export async function forcePush() {
  if (!supabase) return
  await pushToCloud()
}

// --- localStorage helpers ---

function readLocal(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw ? JSON.parse(raw) : fallback
  } catch { return fallback }
}

function writeLocal(key, data) {
  try { localStorage.setItem(PREFIX + key, JSON.stringify(data)) } catch {}
}

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ajzdcbedxlkuzwvdioof.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqemRjYmVkeGxrdXp3dmRpb29mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0MzkzMTIsImV4cCI6MjA5MDAxNTMxMn0.0L7ldxckt99YwvK5rBx6JmkOtJHlc6q7dxghLNwMXh4'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const TABLE = 'qq_progress'
const ROW_ID = 'sherry'

let syncTimer = null

// Auto-sync to cloud (debounced 3 seconds)
export function scheduleSync() {
  clearTimeout(syncTimer)
  syncTimer = setTimeout(syncToCloud, 3000)
}

async function syncToCloud() {
  try {
    const data = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('iiqe_')) {
        data[key] = localStorage.getItem(key)
      }
    }
    
    await supabase
      .from(TABLE)
      .upsert({ id: ROW_ID, data, updated_at: new Date().toISOString() })
  } catch (e) {
    // Silent fail — localStorage is still the primary store
  }
}

// On app start: restore from cloud if local is empty
export async function syncFromCloud() {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select('data')
      .eq('id', ROW_ID)
      .single()
    
    if (error || !data?.data) return false
    
    // Only restore if localStorage has no quiz data
    const hasLocalData = localStorage.getItem('iiqe_qq_stats_v3')
    if (hasLocalData) return false // local data exists, don't overwrite
    
    // Restore from cloud
    let restored = 0
    for (const [key, value] of Object.entries(data.data)) {
      if (key.startsWith('iiqe_')) {
        localStorage.setItem(key, value)
        restored++
      }
    }
    
    return restored > 0
  } catch {
    return false
  }
}

export default supabase

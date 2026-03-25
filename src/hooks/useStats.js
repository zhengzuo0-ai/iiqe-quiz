import { useState, useCallback, useEffect } from 'react'
import { load, save } from '../lib/storage'
import { PAPERS } from '../data/chapters'

const STATS_KEY = 'stats_v3'
const STREAK_KEY = 'streak'
const DAILY_KEY = 'daily'
const ACHIEVEMENTS_KEY = 'achievements'

export function useStats() {
  const [stats, setStats] = useState(() => load(STATS_KEY, {}))
  const [streak, setStreak] = useState(() => load(STREAK_KEY, { current: 0, max: 0 }))
  const [daily, setDaily] = useState(() => {
    const d = load(DAILY_KEY, { date: '', count: 0, correct: 0, max: 0 })
    const today = new Date().toDateString()
    if (d.date !== today) return { date: today, count: 0, correct: 0, max: d.max }
    return d
  })
  const [achievements, setAchievements] = useState(() => load(ACHIEVEMENTS_KEY, []))

  useEffect(() => save(STATS_KEY, stats), [stats])
  useEffect(() => save(STREAK_KEY, streak), [streak])
  useEffect(() => save(DAILY_KEY, daily), [daily])
  useEffect(() => save(ACHIEVEMENTS_KEY, achievements), [achievements])

  const getStat = useCallback((chId) => stats[chId] || { correct: 0, total: 0 }, [stats])
  const getAcc = useCallback((chId) => {
    const s = getStat(chId)
    return s.total > 0 ? Math.round((s.correct / s.total) * 100) : null
  }, [getStat])

  const getPaperStats = useCallback((paperId) => {
    const chapters = PAPERS[paperId].chapters
    let c = 0, t = 0
    chapters.forEach(ch => { const s = getStat(ch.id); c += s.correct; t += s.total })
    return { correct: c, total: t, acc: t > 0 ? Math.round((c / t) * 100) : null }
  }, [getStat])

  const recordAnswer = useCallback((chId, isCorrect) => {
    setStats(prev => {
      const s = prev[chId] || { correct: 0, total: 0 }
      return { ...prev, [chId]: { correct: s.correct + (isCorrect ? 1 : 0), total: s.total + 1 } }
    })
    setStreak(prev => {
      if (isCorrect) {
        const newCurrent = prev.current + 1
        return { current: newCurrent, max: Math.max(newCurrent, prev.max) }
      }
      return { ...prev, current: 0 }
    })
    setDaily(prev => {
      const today = new Date().toDateString()
      const base = prev.date === today ? prev : { date: today, count: 0, correct: 0, max: prev.max }
      const newCount = base.count + 1
      return {
        date: today,
        count: newCount,
        correct: base.correct + (isCorrect ? 1 : 0),
        max: Math.max(newCount, base.max),
      }
    })
  }, [])

  const unlockAchievement = useCallback((id) => {
    setAchievements(prev => prev.includes(id) ? prev : [...prev, id])
  }, [])

  const getAchievementStats = useCallback(() => {
    let totalCorrect = 0, totalAnswered = 0, chaptersStarted = 0
    const allChapters = [...PAPERS.paper1.chapters, ...PAPERS.paper3.chapters]
    allChapters.forEach(ch => {
      const s = getStat(ch.id)
      totalCorrect += s.correct
      totalAnswered += s.total
      if (s.total > 0) chaptersStarted++
    })
    return {
      totalCorrect,
      totalAnswered,
      chaptersStarted,
      maxStreak: streak.max,
      dailyMax: daily.max,
      examPassed: load('exam_passed', 0),
      perfectExam: load('perfect_exam', 0),
      errorsMastered: load('errors_mastered', 0),
    }
  }, [getStat, streak.max, daily.max])

  const resetAll = useCallback(() => {
    setStats({})
    setStreak({ current: 0, max: 0 })
    setDaily({ date: new Date().toDateString(), count: 0, correct: 0, max: 0 })
    setAchievements([])
  }, [])

  const resetPaper = useCallback((paperId) => {
    const chapters = PAPERS[paperId].chapters
    setStats(prev => {
      const next = { ...prev }
      chapters.forEach(ch => delete next[ch.id])
      return next
    })
  }, [])

  const resetChapter = useCallback((chapterId) => {
    setStats(prev => {
      const next = { ...prev }
      delete next[chapterId]
      return next
    })
  }, [])

  return {
    stats, getStat, getAcc, getPaperStats,
    recordAnswer, streak, daily,
    achievements, unlockAchievement, getAchievementStats,
    resetAll, resetPaper, resetChapter,
  }
}

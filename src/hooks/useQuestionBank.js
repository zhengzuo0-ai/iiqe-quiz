import { useState, useCallback, useRef } from 'react'
import { PAPERS, generatePrompt } from '../data/chapters'

// Track which questions have been shown to avoid repeats
const usedQuestions = new Map()

function getUsedKey(chapterId) {
  if (!usedQuestions.has(chapterId)) usedQuestions.set(chapterId, new Set())
  return usedQuestions.get(chapterId)
}

export function useQuestionBank() {
  const [questionBank, setQuestionBank] = useState({ paper1: null, paper3: null })
  const loadedRef = useRef(false)

  const loadBank = useCallback(async () => {
    if (loadedRef.current) return questionBank
    try {
      const [p1, p3] = await Promise.all([
        fetch('/data/paper1-questions.json').then(r => r.ok ? r.json() : null).catch(() => null),
        fetch('/data/paper3-questions.json').then(r => r.ok ? r.json() : null).catch(() => null),
      ])
      const bank = { paper1: p1, paper3: p3 }
      setQuestionBank(bank)
      loadedRef.current = true
      return bank
    } catch {
      return questionBank
    }
  }, [questionBank])

  const getFromBank = useCallback((bank, paperId, chapterId) => {
    const data = bank?.[paperId]
    if (!data?.questions) return null
    const chapterQs = data.questions.filter(q => q.chapterId === chapterId)
    if (chapterQs.length === 0) return null

    const used = getUsedKey(chapterId)
    const available = chapterQs.filter(q => !used.has(q.question))
    if (available.length === 0) {
      // Reset used set when all questions exhausted
      used.clear()
      const q = chapterQs[Math.floor(Math.random() * chapterQs.length)]
      used.add(q.question)
      return q
    }
    const q = available[Math.floor(Math.random() * available.length)]
    used.add(q.question)
    return q
  }, [])

  const fetchFromAPI = useCallback(async (paperId, chapter) => {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1200,
        messages: [{ role: 'user', content: generatePrompt(paperId, chapter) }],
      }),
    })
    const data = await res.json()
    const text = data.content?.map(i => i.text || '').join('') || ''
    return JSON.parse(text.replace(/```json|```/g, '').trim())
  }, [])

  const getQuestion = useCallback(async (paperId, chapter) => {
    const bank = await loadBank()
    const bankQ = getFromBank(bank, paperId, chapter.id)
    if (bankQ) return bankQ
    // Fallback to API
    return fetchFromAPI(paperId, chapter)
  }, [loadBank, getFromBank, fetchFromAPI])

  const getExamQuestions = useCallback(async (paperId, count) => {
    const bank = await loadBank()
    const paper = PAPERS[paperId]
    const chapterPool = []
    paper.chapters.forEach(ch => {
      const n = Math.max(1, Math.round((ch.weight / 100) * count))
      for (let i = 0; i < n; i++) chapterPool.push(ch)
    })
    const shuffled = chapterPool.sort(() => Math.random() - 0.5).slice(0, count)

    const questions = []
    for (const ch of shuffled) {
      try {
        const bankQ = getFromBank(bank, paperId, ch.id)
        if (bankQ) {
          questions.push({ ...bankQ, _ch: ch })
        } else {
          const q = await fetchFromAPI(paperId, ch)
          questions.push({ ...q, _ch: ch })
        }
      } catch {}
    }
    return questions
  }, [loadBank, getFromBank, fetchFromAPI])

  // Smart question selection: prioritizes weak areas and mixes in error book questions
  const getSmartQuestions = useCallback(async (paperId, chapterId, count = 20, { statsHook, errorBookHook } = {}) => {
    const bank = await loadBank()
    const chapter = PAPERS[paperId].chapters.find(ch => ch.id === chapterId)
    if (!chapter) return []

    const questions = []

    // Mix in 3-5 error book questions if available
    let errorMixCount = 0
    if (errorBookHook) {
      const chapterErrors = errorBookHook.activeErrors.filter(
        e => e.chapterId === chapterId && e.question
      )
      const errorCount = Math.min(Math.floor(Math.random() * 3) + 3, chapterErrors.length, Math.floor(count * 0.25))
      const shuffledErrors = [...chapterErrors].sort(() => Math.random() - 0.5)
      for (let i = 0; i < errorCount; i++) {
        questions.push({ ...shuffledErrors[i].question, _fromErrorBook: true, _errorId: shuffledErrors[i].id })
      }
      errorMixCount = errorCount
    }

    // Fill remaining slots from question bank
    const remaining = count - errorMixCount
    for (let i = 0; i < remaining; i++) {
      try {
        const bankQ = getFromBank(bank, paperId, chapterId)
        if (bankQ) {
          questions.push(bankQ)
        } else {
          const q = await fetchFromAPI(paperId, chapter)
          questions.push(q)
        }
      } catch {}
    }

    // Shuffle to intersperse error book questions randomly
    return questions.sort(() => Math.random() - 0.5)
  }, [loadBank, getFromBank, fetchFromAPI])

  return { getQuestion, getExamQuestions, getSmartQuestions, questionBank }
}

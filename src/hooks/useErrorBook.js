import { useState, useCallback, useEffect } from 'react'
import { load, save } from '../lib/storage'
import { getNextReviewDate, getDueRecords, getDueCount } from '../lib/spaced-review'

const KEY = 'errorbook_v2'

export function useErrorBook() {
  const [errors, setErrors] = useState(() => load(KEY, []))

  useEffect(() => save(KEY, errors), [errors])

  const addError = useCallback((record) => {
    setErrors(prev => {
      // Check duplicate by question text
      const exists = prev.find(e =>
        e.question.question === record.question.question && !e.mastered
      )
      if (exists) return prev
      const now = Date.now()
      return [...prev, {
        id: `err_${now}_${Math.random().toString(36).slice(2, 8)}`,
        paper: record.paper,
        chapterId: record.chapterId,
        chapterName: record.chapterName,
        question: record.question,
        userAnswer: record.userAnswer,
        correctAnswer: record.correctAnswer,
        timestamp: now,
        reviewCount: 0,
        lastReviewAt: now,
        nextReviewAt: getNextReviewDate(0, now),
        mastered: false,
      }]
    })
  }, [])

  const markReviewed = useCallback((id, isCorrect) => {
    setErrors(prev => prev.map(e => {
      if (e.id !== id) return e
      if (isCorrect) {
        const newCount = e.reviewCount + 1
        if (newCount >= 3) {
          save('errors_mastered', load('errors_mastered', 0) + 1)
          return { ...e, reviewCount: newCount, lastReviewAt: Date.now(), mastered: true }
        }
        return {
          ...e,
          reviewCount: newCount,
          lastReviewAt: Date.now(),
          nextReviewAt: getNextReviewDate(newCount, Date.now()),
        }
      }
      return {
        ...e,
        reviewCount: 0,
        lastReviewAt: Date.now(),
        nextReviewAt: getNextReviewDate(0, Date.now()),
      }
    }))
  }, [])

  const markMastered = useCallback((id) => {
    setErrors(prev => prev.map(e => {
      if (e.id !== id) return e
      if (!e.mastered) save('errors_mastered', load('errors_mastered', 0) + 1)
      return { ...e, mastered: true }
    }))
  }, [])

  const getErrorsByChapter = useCallback(() => {
    const grouped = {}
    errors.filter(e => !e.mastered).forEach(e => {
      if (!grouped[e.chapterId]) grouped[e.chapterId] = { name: e.chapterName, errors: [] }
      grouped[e.chapterId].errors.push(e)
    })
    return grouped
  }, [errors])

  const dueCount = getDueCount(errors)
  const dueRecords = getDueRecords(errors)
  const activeErrors = errors.filter(e => !e.mastered)
  const masteredCount = errors.filter(e => e.mastered).length

  return {
    errors, activeErrors, addError, markReviewed, markMastered,
    getErrorsByChapter, dueCount, dueRecords, masteredCount,
  }
}

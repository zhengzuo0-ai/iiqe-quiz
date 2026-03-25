// Ebbinghaus spaced repetition intervals (in days)
const INTERVALS = [1, 3, 7, 14, 30]

export function getNextReviewDate(reviewCount, lastReviewAt) {
  const intervalIndex = Math.min(reviewCount, INTERVALS.length - 1)
  const days = INTERVALS[intervalIndex]
  const next = new Date(lastReviewAt)
  next.setDate(next.getDate() + days)
  return next.getTime()
}

export function isDueForReview(record) {
  if (record.mastered) return false
  if (!record.nextReviewAt) return true
  return Date.now() >= record.nextReviewAt
}

export function getDueCount(errorRecords) {
  return errorRecords.filter(isDueForReview).length
}

export function getDueRecords(errorRecords) {
  return errorRecords.filter(isDueForReview)
}

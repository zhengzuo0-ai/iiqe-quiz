import { useState, useEffect, useCallback } from 'react'
import QuestionCard from './QuestionCard'
import LoadingSpinner from './LoadingSpinner'

export default function Practice({ paperId, chapter, stats, errorBook, questionBank, onBack }) {
  const [question, setQuestion] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [questionKey, setQuestionKey] = useState(0)

  const fetchQuestion = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const q = await questionBank.getQuestion(paperId, chapter)
      setQuestion(q)
    } catch {
      setError('题目加载失败，请重试')
    }
    setLoading(false)
  }, [paperId, chapter, questionBank])

  useEffect(() => { fetchQuestion() }, [fetchQuestion])

  const handleAnswer = (key, isCorrect) => {
    stats.recordAnswer(chapter.id, isCorrect)
    if (!isCorrect && question) {
      errorBook.addError({
        paper: paperId,
        chapterId: chapter.id,
        chapterName: chapter.name,
        question,
        userAnswer: key,
        correctAnswer: question.correct,
      })
    }
  }

  const handleNext = () => {
    setQuestionKey(k => k + 1)
    fetchQuestion()
  }

  const s = stats.getStat(chapter.id)
  const acc = stats.getAcc(chapter.id)

  return (
    <div className="animate-fade-in">
      <button onClick={onBack} className="text-lavender-400 text-sm mb-3 hover:text-lavender-500 transition-colors font-medium">
        ← 返回章节
      </button>
      <div className="mb-4">
        <h3 className="font-display text-xl font-semibold text-charcoal mb-1">{chapter.name}</h3>
        <div className="text-xs text-charcoal-light/50">
          {s.total > 0 ? (
            <span>
              已做{s.total}题 · 正确率
              <span className={`ml-1 font-semibold ${acc >= 70 ? 'text-mint-600' : 'text-coral-500'}`}>{acc}%</span>
            </span>
          ) : '开始练习'}
        </div>
        {s.total > 0 && (
          <div className="h-1.5 bg-cream-100 rounded-full overflow-hidden mt-2">
            <div className="h-full rounded-full gradient-progress transition-all duration-500" style={{ width: `${Math.min(100, acc)}%` }} />
          </div>
        )}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className="text-center py-10">
          <p className="text-coral-500 text-sm mb-3">{error}</p>
          <button
            onClick={fetchQuestion}
            className="px-5 py-2 glass-card-solid rounded-lg text-sm text-gray-600 hover:shadow-sm transition-all"
          >
            重试
          </button>
        </div>
      ) : question ? (
        <QuestionCard
          key={questionKey}
          question={question}
          onAnswer={handleAnswer}
          streak={stats.streak.current}
          showNext
          onNext={handleNext}
        />
      ) : null}
    </div>
  )
}

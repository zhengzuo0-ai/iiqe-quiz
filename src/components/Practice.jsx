import { useState, useEffect, useCallback, useRef } from 'react'
import QuestionCard from './QuestionCard'
import LoadingSpinner from './LoadingSpinner'
import { CelebrationEffect } from './CelebrationEffect'
import { load } from '../lib/storage'

function getModuleSize() {
  const settings = load('settings', { questionsPerRound: 20 })
  return settings.questionsPerRound || 20
}

function ModuleSummary({ results, chapter, timeSpent, onRetry, onBack }) {
  const correct = results.filter(r => r.isCorrect).length
  const total = results.length
  const acc = Math.round((correct / total) * 100)
  const passed = acc >= 70
  const minutes = Math.floor(timeSpent / 60)
  const seconds = timeSpent % 60

  // Find weak key_concepts from wrong answers
  const wrongConcepts = results
    .filter(r => !r.isCorrect && r.question.key_concept)
    .map(r => r.question.key_concept)
  const uniqueWeak = [...new Set(wrongConcepts)]

  return (
    <div className="animate-fade-in space-y-4">
      <CelebrationEffect show={passed} />

      <div className="glass-card-solid rounded-2xl p-6 text-center">
        <div className="text-4xl mb-3">{passed ? '🎉' : '💪'}</div>
        <h2 className="font-display text-xl font-semibold text-charcoal mb-1">
          {passed ? '太棒了！本轮完成！' : '继续加油！'}
        </h2>
        <p className="text-xs text-charcoal-light/50">{chapter.name}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card-solid rounded-xl p-4 text-center">
          <div className={`font-display text-2xl font-bold ${acc >= 70 ? 'text-mint-600' : 'text-coral-500'}`}>
            {acc}%
          </div>
          <div className="text-[10px] text-charcoal-light/50 mt-1">正确率</div>
        </div>
        <div className="glass-card-solid rounded-xl p-4 text-center">
          <div className="font-display text-2xl font-bold text-charcoal">
            {correct}/{total}
          </div>
          <div className="text-[10px] text-charcoal-light/50 mt-1">答对题数</div>
        </div>
        <div className="glass-card-solid rounded-xl p-4 text-center">
          <div className="font-display text-2xl font-bold text-charcoal">
            {minutes}:{seconds.toString().padStart(2, '0')}
          </div>
          <div className="text-[10px] text-charcoal-light/50 mt-1">用时</div>
        </div>
      </div>

      {/* Weak Concepts */}
      {uniqueWeak.length > 0 && (
        <div className="glass-card-solid rounded-2xl p-5">
          <div className="text-xs text-coral-500 font-semibold mb-2">⚠️ 薄弱考点</div>
          <div className="flex flex-wrap gap-1.5">
            {uniqueWeak.map(c => (
              <span key={c} className="text-xs px-2.5 py-1 bg-coral-50 text-coral-600 rounded-full">
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Question Review */}
      <div className="glass-card-solid rounded-2xl p-5">
        <div className="text-xs text-pink-400 font-semibold mb-3 uppercase tracking-wider">答题回顾</div>
        <div className="space-y-2">
          {results.map((r, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${r.isCorrect ? 'bg-mint-500' : 'bg-coral-500'}`}>
                {i + 1}
              </span>
              <span className="text-charcoal-light/70 leading-relaxed line-clamp-1">
                {r.question.question}
              </span>
              {!r.isCorrect && (
                <span className="flex-shrink-0 text-coral-400 font-medium">
                  {r.userAnswer}→{r.question.correct}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3.5 rounded-xl text-sm font-semibold glass-card-solid text-charcoal-light hover:shadow-sm transition-all"
        >
          返回章节
        </button>
        <button
          onClick={onRetry}
          className="flex-1 py-3.5 rounded-xl text-sm font-semibold text-white btn-primary"
        >
          再来一轮 →
        </button>
      </div>
    </div>
  )
}

export default function Practice({ paperId, chapter, stats, errorBook, questionBank, onBack, quickStart = false }) {
  const [question, setQuestion] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [questionKey, setQuestionKey] = useState(0)

  // Module state
  const [moduleSize] = useState(getModuleSize)
  const [moduleIndex, setModuleIndex] = useState(0) // 0-indexed current question in module
  const [moduleResults, setModuleResults] = useState([])
  const [moduleComplete, setModuleComplete] = useState(false)
  const startTimeRef = useRef(Date.now())
  const [timeSpent, setTimeSpent] = useState(0)

  // Smart question batch
  const smartBatchRef = useRef(null)
  const currentQuestionRef = useRef(null) // Stable ref for current question

  const fetchSmartBatch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let batch
      if (quickStart) {
        // Quick Start: mixed questions from both papers
        batch = await questionBank.getQuickStartQuestions(
          moduleSize, { statsHook: stats, errorBookHook: errorBook }
        )
      } else {
        batch = await questionBank.getSmartQuestions(
          paperId, chapter.id, moduleSize,
          { statsHook: stats, errorBookHook: errorBook }
        )
      }
      smartBatchRef.current = batch
      if (batch.length > 0) {
        currentQuestionRef.current = batch[0]
        setQuestion(batch[0])
      } else if (!quickStart) {
        const q = await questionBank.getQuestion(paperId, chapter)
        smartBatchRef.current = null
        currentQuestionRef.current = q
        setQuestion(q)
      }
    } catch {
      setError('题目加载失败，请重试')
    }
    setLoading(false)
  }, [paperId, chapter, questionBank, stats, errorBook, quickStart])

  useEffect(() => { fetchSmartBatch() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchQuestion = useCallback(async () => {
    // Try to serve from smart batch first
    if (smartBatchRef.current && smartBatchRef.current[moduleIndex]) {
      const q = smartBatchRef.current[moduleIndex]
      currentQuestionRef.current = q
      setQuestion(q)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const q = await questionBank.getQuestion(paperId, chapter)
      currentQuestionRef.current = q
      setQuestion(q)
    } catch {
      setError('题目加载失败，请重试')
    }
    setLoading(false)
  }, [paperId, chapter, questionBank, moduleIndex])

  const handleAnswer = (key, isCorrect) => {
    // Use ref for stability — guaranteed to be the question currently displayed
    const q = currentQuestionRef.current || question
    const qChapterId = q?.chapterId || chapter?.id
    const qPaperId = q?.chapterId?.startsWith('3') ? 'paper3' : paperId || 'paper1'
    const qChapterName = q?.chapterName || chapter?.name || ''
    stats.recordAnswer(qChapterId, isCorrect)
    if (!isCorrect && q) {
      errorBook.addError({
        paper: qPaperId,
        chapterId: qChapterId,
        chapterName: qChapterName,
        question: q,
        userAnswer: key,
        correctAnswer: q.correct,
      })
    }
    // Record result for module summary — use ref for guaranteed match
    setModuleResults(prev => [...prev, { question: q, userAnswer: key, isCorrect }])
  }

  const handleNext = () => {
    const nextIndex = moduleIndex + 1
    if (nextIndex >= moduleSize) {
      // Module complete
      const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000)
      setTimeSpent(elapsed)
      setModuleComplete(true)
      return
    }
    setModuleIndex(nextIndex)
    setQuestionKey(k => k + 1)
    // Serve from smart batch if available
    if (smartBatchRef.current && smartBatchRef.current[nextIndex]) {
      const q = smartBatchRef.current[nextIndex]
      currentQuestionRef.current = q
      setQuestion(q)
    } else {
      fetchQuestion()
    }
  }

  const handleRetry = () => {
    setModuleIndex(0)
    setModuleResults([])
    setModuleComplete(false)
    startTimeRef.current = Date.now()
    setQuestionKey(k => k + 1)
    smartBatchRef.current = null
    fetchSmartBatch()
  }

  const s = !quickStart && chapter ? stats.getStat(chapter.id) : { total: 0, correct: 0 }
  const acc = !quickStart && chapter ? stats.getAcc(chapter.id) : null

  const displayChapter = quickStart ? { name: '智能混合刷题', id: 'quickstart' } : chapter

  if (moduleComplete) {
    return (
      <ModuleSummary
        results={moduleResults}
        chapter={displayChapter}
        timeSpent={timeSpent}
        onRetry={handleRetry}
        onBack={onBack}
      />
    )
  }

  return (
    <div className="animate-fade-in">
      <button onClick={onBack} className="text-pink-400 text-sm mb-3 hover:text-pink-500 transition-colors font-medium">
        ← {quickStart ? '返回首页' : '返回章节'}
      </button>
      <div className="mb-4">
        <h3 className="font-display text-xl font-semibold text-charcoal mb-1">
          {quickStart ? '🚀 智能混合刷题' : chapter.name}
        </h3>
        <div className="flex items-center justify-between">
          <div className="text-xs text-charcoal-light/50">
            {s.total > 0 ? (
              <span>
                已做{s.total}题 · 正确率
                <span className={`ml-1 font-semibold ${acc >= 70 ? 'text-mint-600' : 'text-coral-500'}`}>{acc}%</span>
              </span>
            ) : '开始练习'}
          </div>
          <div className="text-xs font-semibold text-pink-400">
            {moduleIndex + 1} / {moduleSize}
          </div>
        </div>
        {/* Module progress bar */}
        <div className="h-2 bg-cream-100 rounded-full overflow-hidden mt-2">
          <div
            className="h-full rounded-full gradient-progress transition-all duration-500"
            style={{ width: `${((moduleIndex + 1) / moduleSize) * 100}%` }}
          />
        </div>
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
        <>
        {/* Show chapter tag in quickStart mode */}
        {quickStart && question.chapterName && (
          <div className="mb-2 inline-block text-[10px] px-2.5 py-1 bg-lavender-50 text-lavender-400 rounded-full font-medium">
            {question.chapterId?.startsWith('3') ? '卷三' : '卷一'} · {question.chapterName}
          </div>
        )}
        <QuestionCard
          key={questionKey}
          question={question}
          onAnswer={handleAnswer}
          streak={stats.streak.current}
          showNext
          onNext={handleNext}
          moduleProgress={{ current: moduleIndex + 1, total: moduleSize }}
        />
        </>
      ) : null}
    </div>
  )
}

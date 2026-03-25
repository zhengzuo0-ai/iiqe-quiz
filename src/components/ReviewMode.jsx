import { useState, useMemo } from 'react'
import QuestionCard from './QuestionCard'

export default function ReviewMode({ errorBook, onBack, mode = 'review' }) {
  const { dueRecords, activeErrors, markReviewed } = errorBook

  const questions = useMemo(() => {
    const source = mode === 'review' ? dueRecords : activeErrors
    return [...source].sort(() => Math.random() - 0.5).slice(0, 10)
  }, [mode, dueRecords, activeErrors])

  const [currentIdx, setCurrentIdx] = useState(0)
  const [results, setResults] = useState([])
  const [done, setDone] = useState(false)

  if (questions.length === 0) {
    return (
      <div className="animate-fade-in">
        <button onClick={onBack} className="text-pink-400 text-sm mb-4 hover:text-pink-500 transition-colors">
          ← 返回
        </button>
        <div className="text-center py-16">
          <div className="text-5xl mb-4 animate-float">✨</div>
          <p className="text-gray-500 text-sm">
            {mode === 'review' ? '今日没有需要复习的题目' : '没有错题，继续保持！'}
          </p>
        </div>
      </div>
    )
  }

  if (done) {
    const correct = results.filter(r => r.correct).length
    return (
      <div className="animate-fade-in">
        <div className="glass-card-solid rounded-2xl p-8 text-center shadow-md mb-5 relative overflow-hidden">
          <div className="absolute inset-0 gradient-pink-purple-light opacity-40" />
          <div className="relative z-10">
            <div className="text-5xl mb-3 animate-float">🦋</div>
            <h2 className="text-xl font-normal text-gray-800 mb-2">复习完成！</h2>
            <div className="text-3xl font-light my-3" style={{ background: 'linear-gradient(135deg, #f472b6, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {correct}/{results.length}
            </div>
            <div className="text-sm text-gray-400">答对的题目会自动推进复习周期</div>
          </div>
        </div>
        <button
          onClick={onBack}
          className="w-full py-3.5 text-white rounded-xl text-sm font-medium active:scale-[0.98] transition-all shadow-lg"
          style={{ background: 'linear-gradient(135deg, #f472b6 0%, #c4b5fd 100%)' }}
        >
          返回
        </button>
      </div>
    )
  }

  const current = questions[currentIdx]

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <button onClick={onBack} className="text-pink-400 text-sm hover:text-pink-500 transition-colors">
          ← 返回
        </button>
        <span className="text-sm text-pink-400 bg-pink-50 px-3 py-1 rounded-full font-medium">
          {currentIdx + 1} / {questions.length}
        </span>
      </div>

      <div className="mb-3">
        <span className="text-xs px-3 py-1 gradient-pink-purple-light text-lavender-500 rounded-full font-medium">
          {mode === 'review' ? '📖 间隔复习' : '🔄 错题重做'} · {current.chapterName}
        </span>
      </div>

      <QuestionCard
        key={current.id}
        question={current.question}
        onAnswer={(key, isCorrect) => {
          markReviewed(current.id, isCorrect)
          setResults(prev => [...prev, { id: current.id, correct: isCorrect }])
        }}
        showNext
        onNext={() => {
          if (currentIdx < questions.length - 1) {
            setCurrentIdx(i => i + 1)
          } else {
            setDone(true)
          }
        }}
      />
    </div>
  )
}

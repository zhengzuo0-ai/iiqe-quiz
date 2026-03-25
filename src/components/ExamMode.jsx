import { useState, useEffect, useRef } from 'react'
import { PAPERS } from '../data/chapters'
import { PageLoading } from './LoadingSpinner'
import { save, load } from '../lib/storage'

const fmt = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

export default function ExamMode({ paperId, stats, errorBook, questionBank, onBack }) {
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [currentIdx, setCurrentIdx] = useState(0)
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(true)
  const [timer, setTimer] = useState(0)
  const timerRef = useRef(null)

  useEffect(() => {
    const count = paperId === 'paper1' ? 15 : 10
    questionBank.getExamQuestions(paperId, count).then(qs => {
      setQuestions(qs)
      setLoading(false)
    })
  }, [paperId, questionBank])

  useEffect(() => {
    if (!loading && !done) {
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000)
      return () => clearInterval(timerRef.current)
    }
  }, [loading, done])

  const submit = () => {
    setDone(true)
    clearInterval(timerRef.current)
    let correct = 0
    questions.forEach((q, i) => {
      const ans = answers[i]
      if (ans) {
        const isCorrect = ans === q.correct
        stats.recordAnswer(q._ch.id, isCorrect)
        if (!isCorrect) {
          errorBook.addError({
            paper: paperId,
            chapterId: q._ch.id,
            chapterName: q._ch.name,
            question: q,
            userAnswer: ans,
            correctAnswer: q.correct,
          })
        }
        if (isCorrect) correct++
      }
    })
    const pct = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0
    if (pct >= 70) save('exam_passed', load('exam_passed', 0) + 1)
    if (pct === 100) save('perfect_exam', load('perfect_exam', 0) + 1)
  }

  if (loading) return <PageLoading text={`正在准备${PAPERS[paperId].name}模拟试卷...`} />

  if (done) {
    let correct = 0
    questions.forEach((q, i) => { if (answers[i] === q.correct) correct++ })
    const pct = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0
    const passed = pct >= 70

    return (
      <div className="animate-fade-in">
        <div className="bg-white rounded-2xl p-8 text-center border border-pink-100 shadow-sm mb-5">
          <div className="text-5xl mb-3">{passed ? '🎉' : '💪'}</div>
          <h2 className="text-xl font-normal text-gray-800 mb-2">
            {passed ? '恭喜通过！太棒了！' : '继续加油！你可以的！'}
          </h2>
          <div className={`text-5xl font-light my-4 ${passed ? 'text-mint-600' : 'text-coral-500'}`}>{pct}%</div>
          <div className="text-sm text-gray-400">{correct}/{questions.length} 正确 · 用时 {fmt(timer)}</div>
          <div className="mt-4 text-xs text-gray-300 border-t border-dashed border-pink-100 pt-3">及格线 70%</div>
        </div>

        <div className="text-xs text-pink-300 tracking-wider mb-3">📋 题目回顾</div>
        <div className="space-y-2.5">
          {questions.map((q, i) => {
            const ans = answers[i]
            const ok = ans === q.correct
            return (
              <div key={i} className={`bg-white rounded-xl p-4 border-l-[3px] border border-pink-100 ${ok ? 'border-l-mint-400' : 'border-l-coral-400'}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-400">Q{i + 1} · {q._ch.name}</span>
                  <span className={`text-xs font-semibold ${ok ? 'text-mint-600' : 'text-coral-500'}`}>{ok ? '✓' : '✗'}</span>
                </div>
                <p className="text-sm leading-relaxed text-gray-700 mb-2">{q.question}</p>
                {!ok && (
                  <>
                    <div className="text-xs text-mint-600 bg-mint-50 px-2.5 py-1.5 rounded-lg mb-1">
                      正确: {q.correct}. {q.options[q.correct]}
                    </div>
                    {ans && (
                      <div className="text-xs text-coral-500 bg-coral-50 px-2.5 py-1.5 rounded-lg mb-1">
                        你选: {ans}. {q.options[ans]}
                      </div>
                    )}
                  </>
                )}
                <div className="text-xs leading-relaxed text-gray-400 mt-2 pt-2 border-t border-pink-50">
                  {q.explanation}
                </div>
              </div>
            )
          })}
        </div>
        <button
          onClick={onBack}
          className="w-full mt-4 py-3.5 bg-gradient-to-r from-pink-400 to-pink-500 text-white rounded-xl text-sm font-medium hover:from-pink-500 hover:to-pink-600 active:scale-[0.98] transition-all shadow-md"
        >
          返回首页
        </button>
      </div>
    )
  }

  const cq = questions[currentIdx]
  if (!cq) return null

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-500">⏱ {fmt(timer)}</span>
        <span className="text-sm text-pink-400">{currentIdx + 1} / {questions.length}</span>
      </div>
      <div className="h-1 bg-pink-50 rounded-full mb-5 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-pink-300 to-pink-400 rounded-full transition-all duration-300"
          style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="bg-white rounded-2xl p-5 mb-3 border border-pink-100 shadow-sm">
        <span className="inline-block text-xs px-3 py-1 bg-lavender-50 text-lavender-400 rounded-full mb-3">{cq._ch.name}</span>
        <p className="text-[15px] leading-relaxed text-gray-800 m-0">{cq.question}</p>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-2 mb-4">
        {Object.entries(cq.options).map(([k, v]) => {
          const isSel = answers[currentIdx] === k
          return (
            <button
              key={k}
              onClick={() => setAnswers(p => ({ ...p, [currentIdx]: k }))}
              className={`flex items-start gap-3 p-3.5 rounded-xl border-2 text-left transition-all w-full ${
                isSel ? 'bg-pink-50 border-pink-300' : 'bg-white border-gray-100 hover:border-pink-200'
              }`}
            >
              <span className={`flex items-center justify-center w-7 h-7 min-w-[28px] rounded-full text-xs font-bold ${
                isSel ? 'bg-pink-400 text-white' : 'bg-pink-50 text-pink-400'
              }`}>{k}</span>
              <span className="text-sm leading-relaxed text-gray-700 pt-0.5">{v}</span>
            </button>
          )
        })}
      </div>

      {/* Nav */}
      <div className="flex gap-2.5">
        {currentIdx > 0 && (
          <button onClick={() => setCurrentIdx(i => i - 1)} className="px-4 py-3 border border-pink-100 rounded-xl bg-white text-sm text-gray-500 hover:border-pink-200 transition-colors">
            ← 上一题
          </button>
        )}
        <div className="flex-1" />
        {currentIdx < questions.length - 1 ? (
          <button onClick={() => setCurrentIdx(i => i + 1)} className="px-4 py-3 bg-gray-800 text-white rounded-xl text-sm hover:bg-gray-700 transition-colors">
            下一题 →
          </button>
        ) : (
          <button onClick={submit} className="px-4 py-3 bg-mint-500 text-white rounded-xl text-sm hover:bg-mint-600 transition-colors">
            提交试卷
          </button>
        )}
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-1.5 mt-4 flex-wrap">
        {questions.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIdx(i)}
            className={`w-2.5 h-2.5 rounded-full border-none transition-all ${
              answers[i]
                ? (i === currentIdx ? 'bg-pink-400 scale-125' : 'bg-pink-300')
                : (i === currentIdx ? 'bg-gray-400 scale-125' : 'bg-gray-200')
            }`}
          />
        ))}
      </div>
    </div>
  )
}

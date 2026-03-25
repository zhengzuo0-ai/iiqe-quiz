import { useState, useCallback } from 'react'
import { CelebrationEffect, StreakBadge, getEncouragement } from './CelebrationEffect'
import CharacterPopup from './CharacterPopup'

const STREAK_MILESTONES = [3, 5, 10, 15, 20]

export default function QuestionCard({ question, onAnswer, streak = 0, showNext, onNext, moduleProgress }) {
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [charMood, setCharMood] = useState(null)
  const [charTrigger, setCharTrigger] = useState(0)
  const [animatingOption, setAnimatingOption] = useState(null)


  const handleAnswer = (key) => {
    if (revealed) return
    setSelected(key)
    setAnimatingOption(key)
    setTimeout(() => setAnimatingOption(null), 300)
    setRevealed(true)
    const isCorrect = key === question.correct
    if (isCorrect) setShowCelebration(true)
    onAnswer(key, isCorrect)

    const newStreak = isCorrect ? streak + 1 : 0
    if (isCorrect && STREAK_MILESTONES.includes(newStreak)) {
      setCharMood('surprise')
    } else {
      setCharMood(isCorrect ? 'cheer' : 'encourage')
    }
    setCharTrigger(t => t + 1)
  }

  const handleCharDone = useCallback(() => {
    setCharMood(null)
  }, [])

  const handleNext = () => {
    setSelected(null)
    setRevealed(false)
    setShowCelebration(false)
    onNext()
  }

  const isCorrect = selected === question.correct

  return (
    <div className="animate-slide-from-right">
      <CelebrationEffect show={showCelebration} />
      {charMood && (
        <CharacterPopup mood={charMood} trigger={charTrigger} onDone={handleCharDone} />
      )}

      {/* Question */}
      <div className="glass-card-solid rounded-2xl p-5 mb-3">
        {question.key_concept && (
          <span className="inline-block text-xs px-3 py-1 gradient-pink-purple-light text-pink-500 rounded-full mb-3 font-semibold">
            {question.key_concept}
          </span>
        )}
        <p className="text-[15px] leading-relaxed text-charcoal m-0">{question.question}</p>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-2 mb-3">
        {Object.entries(question.options).map(([k, v]) => {
          const isSel = selected === k
          const isCorr = k === question.correct
          const isAnimating = animatingOption === k
          let classes = 'option-hover flex items-start gap-3 p-4 rounded-xl border-2 text-left w-full min-h-[52px] '
          let circleClasses = 'flex items-center justify-center w-7 h-7 min-w-[28px] rounded-full text-xs font-bold transition-all '

          if (revealed) {
            if (isCorr) {
              classes += 'bg-mint-50 border-mint-400 animate-correct-flash'
              circleClasses += 'bg-mint-500 text-white'
            } else if (isSel) {
              classes += 'bg-coral-50 border-coral-400 animate-wrong-shake'
              circleClasses += 'bg-coral-500 text-white'
            } else {
              classes += 'bg-white/60 border-cream-100 opacity-40'
              circleClasses += 'bg-cream-100 text-charcoal-light/40'
            }
          } else if (isSel) {
            classes += 'bg-pink-50 border-pink-300 shadow-sm'
            circleClasses += 'bg-pink-400 text-white'
          } else {
            classes += 'bg-white/80 border-cream-100 hover:border-pink-200 hover:bg-pink-50/30'
            circleClasses += 'bg-pink-50 text-pink-400'
          }

          if (isAnimating) classes += ' animate-bounce-select'

          return (
            <button key={k} onClick={() => handleAnswer(k)} disabled={revealed} className={classes}>
              <span className={circleClasses}>{k}</span>
              <span className="text-sm leading-relaxed text-charcoal-light pt-0.5">{v}</span>
            </button>
          )
        })}
      </div>

      {/* Enhanced Result & Explanation */}
      {revealed && (
        <div className="animate-fade-in-up glass-card-solid rounded-2xl p-5 mb-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className={`text-base font-semibold ${isCorrect ? 'text-mint-600' : 'text-coral-500'}`}>
              {isCorrect ? '✨ 答对啦！好棒！' : getEncouragement()}
            </div>
            {isCorrect && <StreakBadge count={streak} />}
          </div>

          {/* Correct answer highlight (when wrong) */}
          {!isCorrect && (
            <div className="mb-3 p-3 bg-mint-50 rounded-xl border border-mint-200">
              <div className="text-xs font-semibold text-mint-600 mb-1">✅ 正确答案：{question.correct}</div>
              <div className="text-sm text-charcoal-light/80">{question.options[question.correct]}</div>
            </div>
          )}

          {/* Main explanation */}
          <div className="mb-3">
            <div className="text-xs font-semibold text-pink-400 mb-1.5">📖 解析</div>
            <p className="text-[14px] leading-[1.8] text-charcoal-light/80 whitespace-pre-wrap m-0">
              {question.explanation}
            </p>
          </div>

          {/* Reference - only show if question has specific reference */}
          {question.reference && (
            <div className="mt-2 text-xs text-pink-400 font-medium">
              📚 参考研习手册 {question.reference} 节
            </div>
          )}

          {showNext && (
            <button
              onClick={handleNext}
              className="w-full mt-4 py-3.5 text-white rounded-xl text-sm font-semibold btn-primary"
            >
              {moduleProgress && moduleProgress.current >= moduleProgress.total
                ? '查看本轮总结 →'
                : '下一题 →'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

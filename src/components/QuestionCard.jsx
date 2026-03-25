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
  const [showFullExplanation, setShowFullExplanation] = useState(false)

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
    setShowFullExplanation(false)
    onNext()
  }

  const isCorrect = selected === question.correct

  // Build per-option explanations
  const getOptionAnalysis = () => {
    const options = question.options
    const correct = question.correct
    return Object.entries(options).map(([key, text]) => ({
      key,
      text,
      isCorrect: key === correct,
      isSelected: key === selected,
    }))
  }

  return (
    <div className="animate-slide-from-right">
      <CelebrationEffect show={showCelebration} />
      {charMood && (
        <CharacterPopup mood={charMood} trigger={charTrigger} onDone={handleCharDone} />
      )}

      {/* Question */}
      <div className="glass-card-solid rounded-2xl p-5 mb-3">
        {question.key_concept && (
          <span className="inline-block text-xs px-3 py-1 gradient-pink-purple-light text-lavender-500 rounded-full mb-3 font-semibold">
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
            classes += 'bg-lavender-50 border-lavender-300 shadow-sm'
            circleClasses += 'bg-lavender-400 text-white'
          } else {
            classes += 'bg-white/80 border-cream-100 hover:border-lavender-200 hover:bg-lavender-50/30'
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
            <div className="text-xs font-semibold text-lavender-400 mb-1.5">📖 解析</div>
            <p className="text-sm leading-relaxed text-charcoal-light/80 whitespace-pre-wrap m-0">
              {question.explanation}
            </p>
          </div>

          {/* Expanded explanation section */}
          {!showFullExplanation ? (
            <button
              onClick={() => setShowFullExplanation(true)}
              className="w-full text-xs text-lavender-400 font-medium py-2 hover:text-lavender-500 transition-colors"
            >
              📚 展开详解 — 查看每个选项分析 ▼
            </button>
          ) : (
            <div className="animate-fade-in space-y-3 mt-2 pt-3 border-t border-cream-100">
              {/* Per-option analysis */}
              <div>
                <div className="text-xs font-semibold text-charcoal-light/60 mb-2">🔍 逐项分析</div>
                <div className="space-y-2">
                  {getOptionAnalysis().map(opt => (
                    <div
                      key={opt.key}
                      className={`p-2.5 rounded-lg text-xs leading-relaxed ${
                        opt.isCorrect
                          ? 'bg-mint-50 border border-mint-200'
                          : 'bg-cream-50 border border-cream-100'
                      }`}
                    >
                      <span className={`font-bold ${opt.isCorrect ? 'text-mint-600' : 'text-charcoal-light/50'}`}>
                        {opt.key}. {opt.isCorrect ? '✅' : '❌'}
                      </span>
                      <span className="text-charcoal-light/70 ml-1.5">{opt.text}</span>
                      {opt.isCorrect && (
                        <div className="text-mint-600 mt-1 font-medium">← 正确答案</div>
                      )}
                      {opt.isSelected && !opt.isCorrect && (
                        <div className="text-coral-500 mt-1 font-medium">← 你的选择</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Key concept reminder */}
              {question.key_concept && (
                <div className="p-3 bg-lavender-50 rounded-xl border border-lavender-200">
                  <div className="text-xs font-semibold text-lavender-500 mb-1">📚 相关知识点</div>
                  <div className="text-xs text-charcoal-light/70">
                    考点：{question.key_concept}
                  </div>
                  {question.chapterId && (
                    <div className="text-[10px] text-charcoal-light/40 mt-1">
                      建议参考研习手册相关章节加深理解
                    </div>
                  )}
                </div>
              )}

              {/* Memory tip */}
              <div className="p-3 bg-pink-50 rounded-xl border border-pink-200">
                <div className="text-xs font-semibold text-pink-500 mb-1">💡 记忆技巧</div>
                <div className="text-xs text-charcoal-light/70">
                  {isCorrect
                    ? '你答对了！多做几道同类题巩固记忆，下次考试遇到也不怕。'
                    : '把这道错题的正确答案和解析再看一遍，理解"为什么对"比记住"选什么"更重要。'}
                </div>
              </div>

              <button
                onClick={() => setShowFullExplanation(false)}
                className="w-full text-xs text-charcoal-light/40 py-1 hover:text-charcoal-light/60 transition-colors"
              >
                收起详解 ▲
              </button>
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

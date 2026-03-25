import { useState } from 'react'

export default function ErrorBook({ errorBook, onBack, onStartReview }) {
  const { activeErrors, masteredCount, getErrorsByChapter, markMastered } = errorBook
  const [expandedChapter, setExpandedChapter] = useState(null)
  const [expandedError, setExpandedError] = useState(null)
  const grouped = getErrorsByChapter()
  const chapters = Object.entries(grouped)

  return (
    <div className="animate-fade-in">
      <div className="gradient-banner rounded-2xl px-5 py-4 mb-5 text-white">
        <h2 className="text-xl font-normal mb-1">📝 错题本</h2>
        <p className="text-xs text-white/80">
          {activeErrors.length} 道待攻克 · {masteredCount} 道已掌握
        </p>
      </div>

      {activeErrors.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4 animate-float">🎉</div>
          <p className="text-gray-500 text-sm">还没有错题，继续保持！</p>
        </div>
      ) : (
        <>
          <button
            onClick={onStartReview}
            className="w-full mb-4 py-3.5 text-white rounded-xl text-sm font-medium active:scale-[0.98] transition-all shadow-lg"
            style={{ background: 'linear-gradient(135deg, #a78bfa 0%, #f472b6 100%)' }}
          >
            🔄 错题重做（随机 {Math.min(10, activeErrors.length)} 题）
          </button>

          <div className="stagger-children space-y-2.5">
            {chapters.map(([chId, { name, errors }]) => (
              <div key={chId} className="glass-card-solid rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedChapter(expandedChapter === chId ? null : chId)}
                  className="w-full flex justify-between items-center p-4 text-left hover:bg-pink-50/30 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-coral-400 text-xs">●</span>
                    <div>
                      <div className="text-sm text-gray-800">{name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{errors.length} 道错题</div>
                    </div>
                  </div>
                  <span className={`text-pink-300 text-sm transition-transform ${expandedChapter === chId ? 'rotate-45' : ''}`}>+</span>
                </button>

                {expandedChapter === chId && (
                  <div className="border-t border-pink-50">
                    {errors.map(err => (
                      <div key={err.id} className="border-b border-pink-50 last:border-b-0">
                        <button
                          onClick={() => setExpandedError(expandedError === err.id ? null : err.id)}
                          className="w-full p-3.5 text-left hover:bg-pink-50/30 transition-colors"
                        >
                          <p className="text-sm text-gray-700 leading-relaxed line-clamp-2">{err.question.question}</p>
                          <div className="flex gap-2 mt-1.5 text-xs">
                            <span className="text-coral-400 bg-coral-50 px-1.5 py-0.5 rounded">你选: {err.userAnswer}</span>
                            <span className="text-mint-600 bg-mint-50 px-1.5 py-0.5 rounded">正确: {err.correctAnswer}</span>
                            <span className="text-gray-300 ml-auto">复习{err.reviewCount}次</span>
                          </div>
                        </button>

                        {expandedError === err.id && (
                          <div className="px-3.5 pb-3.5 animate-fade-in">
                            <div className="gradient-pink-purple-light rounded-lg p-3 mb-2">
                              <div className="text-xs text-gray-500 mb-2 font-medium">选项：</div>
                              {Object.entries(err.question.options).map(([k, v]) => (
                                <div key={k} className={`text-xs py-0.5 ${
                                  k === err.correctAnswer ? 'text-mint-600 font-medium' :
                                  k === err.userAnswer ? 'text-coral-400' : 'text-gray-500'
                                }`}>
                                  {k}. {v} {k === err.correctAnswer ? '✓' : k === err.userAnswer ? '✗' : ''}
                                </div>
                              ))}
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed mb-2">{err.question.explanation}</p>
                            <button
                              onClick={() => markMastered(err.id)}
                              className="text-xs px-3 py-1.5 bg-mint-50 text-mint-600 rounded-lg hover:bg-mint-100 transition-colors shadow-sm"
                            >
                              ✓ 标记已掌握
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

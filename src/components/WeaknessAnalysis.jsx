import { PAPERS } from '../data/chapters'

function MiniProgressRing({ value, size = 40, strokeWidth = 3 }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference
  const color = value >= 70 ? '#5a8f5a' : value >= 50 ? '#d4a574' : '#d47070'
  return (
    <svg width={size} height={size} className="block">
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#fef5f0" strokeWidth={strokeWidth} />
      <circle
        cx={size/2} cy={size/2} r={radius} fill="none"
        stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
        strokeDasharray={circumference} strokeDashoffset={offset}
        className="progress-ring-circle"
      />
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle"
        fill={color} style={{ fontSize: 9, fontWeight: 600 }}>
        {value}%
      </text>
    </svg>
  )
}

export default function WeaknessAnalysis({ stats, errorBook, onBack }) {
  const { getStat, getAcc, getPaperStats } = stats
  const allChapters = [...PAPERS.paper1.chapters, ...PAPERS.paper3.chapters]
  const s1 = getPaperStats('paper1')
  const s3 = getPaperStats('paper3')
  const totalQ = s1.total + s3.total
  const totalAcc = totalQ > 0 ? Math.round(((s1.correct + s3.correct) / totalQ) * 100) : null
  const daysLeft = Math.max(0, Math.ceil((new Date('2026-04-08') - new Date()) / 86400000))

  const chapterStats = allChapters.map(ch => {
    const s = getStat(ch.id)
    const acc = getAcc(ch.id)
    const paper = ch.id.startsWith('1') ? 'paper1' : 'paper3'
    return { ...ch, stat: s, acc, paper }
  }).filter(ch => ch.stat.total > 0).sort((a, b) => (a.acc ?? 100) - (b.acc ?? 100))

  const conceptFreq = {}
  errorBook.activeErrors.forEach(err => {
    const concept = err.question.key_concept || '其他'
    conceptFreq[concept] = (conceptFreq[concept] || 0) + 1
  })
  const topConcepts = Object.entries(conceptFreq).sort((a, b) => b[1] - a[1]).slice(0, 8)

  const dailyGoal = daysLeft > 0 ? Math.max(20, Math.ceil(250 / daysLeft)) : 50

  return (
    <div className="animate-fade-in">
      <div className="gradient-banner rounded-2xl px-5 py-5 mb-5 text-white">
        <h2 className="font-display text-2xl font-semibold mb-1">薄弱分析</h2>
        <p className="text-xs text-white/70">找到薄弱环节，精准提升</p>
      </div>

      {/* Countdown + Goal */}
      <div className="glass-card-solid rounded-2xl p-5 mb-4">
        <div className="flex justify-between items-center">
          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-pink-50 border-2 border-pink-200 mx-auto mb-1">
              <span className="font-display text-xl font-bold text-pink-500">{daysLeft}</span>
            </div>
            <div className="text-[11px] text-charcoal-light/50">天倒计时</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-pink-50 border-2 border-pink-200 mx-auto mb-1">
              <span className="font-display text-xl font-bold text-pink-500">{dailyGoal}</span>
            </div>
            <div className="text-[11px] text-charcoal-light/50">每日建议</div>
          </div>
          {totalAcc !== null && (
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-1"
                style={{ background: totalAcc >= 70 ? '#f2f5f0' : '#fef2f0', border: `2px solid ${totalAcc >= 70 ? '#c2d6b8' : '#fde0dc'}` }}>
                <span className={`font-display text-xl font-bold ${totalAcc >= 70 ? 'text-mint-600' : 'text-coral-500'}`}>{totalAcc}%</span>
              </div>
              <div className="text-[11px] text-charcoal-light/50">总正确率</div>
            </div>
          )}
        </div>
        {totalAcc !== null && (
          <div className="mt-4 pt-3 border-t border-cream-100">
            <div className="h-2 bg-cream-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all gradient-progress"
                style={{ width: `${totalAcc}%` }}
              />
            </div>
            <div className="text-xs text-charcoal-light/30 mt-1.5">及格线 70%{totalAcc >= 70 ? ' ✓ 已达标' : ` · 还差${70 - totalAcc}%`}</div>
          </div>
        )}
      </div>

      {/* Paper breakdown */}
      {[{ id: 'paper1', name: '📘 卷一', s: s1 }, { id: 'paper3', name: '📗 卷三', s: s3 }].map(p => (
        p.s.total > 0 && (
          <div key={p.id} className="glass-card-solid rounded-2xl p-4 shadow-sm mb-3">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-charcoal font-semibold">{p.name}</span>
              <MiniProgressRing value={p.s.acc} />
            </div>
            <div className="space-y-2.5">
              {PAPERS[p.id].chapters.map(ch => {
                const acc = getAcc(ch.id)
                const s = getStat(ch.id)
                if (s.total === 0) return null
                return (
                  <div key={ch.id}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-charcoal-light/60 truncate mr-2">{ch.name}</span>
                      <span className={`flex-shrink-0 font-medium ${
                        acc >= 80 ? 'text-mint-600' : acc >= 60 ? 'text-warm-400' : 'text-coral-500'
                      }`}>{acc}% ({s.total}题)</span>
                    </div>
                    <div className="h-1.5 bg-cream-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${acc}%`,
                          background: acc >= 80 ? 'linear-gradient(90deg, #4ade80, #22c55e)' :
                            acc >= 60 ? 'linear-gradient(90deg, #f0c89a, #d4a574)' :
                            'linear-gradient(90deg, #fb7185, #f43f5e)',
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      ))}

      {/* Weakest chapters */}
      {chapterStats.length > 0 && (
        <div className="glass-card-solid rounded-2xl p-4 shadow-sm mb-3">
          <div className="text-xs text-coral-400 tracking-wider mb-3 font-semibold uppercase">最需加强的章节</div>
          <div className="space-y-2">
            {chapterStats.filter(ch => ch.acc < 70).slice(0, 5).map(ch => (
              <div key={ch.id} className="flex justify-between items-center py-1.5 border-b border-cream-100 last:border-b-0">
                <div>
                  <div className="text-sm text-charcoal">{ch.name}</div>
                  <div className="text-xs text-charcoal-light/45">{ch.paper === 'paper1' ? '卷一' : '卷三'} · {ch.stat.total}题</div>
                </div>
                <MiniProgressRing value={ch.acc} size={36} />
              </div>
            ))}
            {chapterStats.filter(ch => ch.acc < 70).length === 0 && (
              <p className="text-sm text-mint-600 text-center py-2">所有已做章节正确率都达标了！</p>
            )}
          </div>
        </div>
      )}

      {/* Unstarted chapters */}
      {(() => {
        const unstarted = allChapters.filter(ch => getStat(ch.id).total === 0)
        if (unstarted.length === 0) return null
        return (
          <div className="glass-card-solid rounded-2xl p-4 shadow-sm mb-3">
            <div className="text-xs text-charcoal-light/40 tracking-wider mb-3 font-semibold uppercase">尚未开始的章节</div>
            <div className="flex flex-wrap gap-2">
              {unstarted.map(ch => (
                <span key={ch.id} className="text-xs px-2.5 py-1.5 gradient-pink-purple-light text-charcoal-light/50 rounded-lg">
                  {ch.name}
                </span>
              ))}
            </div>
          </div>
        )
      })()}

      {/* Error concept frequency */}
      {topConcepts.length > 0 && (
        <div className="glass-card-solid rounded-2xl p-4 shadow-sm mb-3">
          <div className="text-xs text-pink-400 tracking-wider mb-3 font-semibold uppercase">高频错误考点</div>
          <div className="space-y-2">
            {topConcepts.map(([concept, count]) => (
              <div key={concept} className="flex justify-between items-center">
                <span className="text-sm text-charcoal-light truncate mr-2">{concept}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 bg-pink-50 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full gradient-progress"
                      style={{ width: `${Math.min(100, (count / topConcepts[0][1]) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-charcoal-light/40 w-6 text-right font-medium">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {totalQ === 0 && (
        <div className="text-center py-16">
          <div className="text-5xl mb-4 animate-float">📖</div>
          <p className="text-charcoal-light/50 text-sm">开始做题后，这里会显示你的学习分析</p>
        </div>
      )}
    </div>
  )
}

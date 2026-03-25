import { PAPERS } from '../data/chapters'

export default function WeaknessAnalysis({ stats, errorBook, onBack }) {
  const { getStat, getAcc, getPaperStats } = stats
  const allChapters = [...PAPERS.paper1.chapters, ...PAPERS.paper3.chapters]
  const s1 = getPaperStats('paper1')
  const s3 = getPaperStats('paper3')
  const totalQ = s1.total + s3.total
  const totalAcc = totalQ > 0 ? Math.round(((s1.correct + s3.correct) / totalQ) * 100) : null
  const daysLeft = Math.max(0, Math.ceil((new Date('2026-04-08') - new Date()) / 86400000))

  // Sort chapters by accuracy (weakest first)
  const chapterStats = allChapters.map(ch => {
    const s = getStat(ch.id)
    const acc = getAcc(ch.id)
    const paper = ch.id.startsWith('1') ? 'paper1' : 'paper3'
    return { ...ch, stat: s, acc, paper }
  }).filter(ch => ch.stat.total > 0).sort((a, b) => (a.acc ?? 100) - (b.acc ?? 100))

  // Error frequency by key concept
  const conceptFreq = {}
  errorBook.activeErrors.forEach(err => {
    const concept = err.question.key_concept || '其他'
    conceptFreq[concept] = (conceptFreq[concept] || 0) + 1
  })
  const topConcepts = Object.entries(conceptFreq).sort((a, b) => b[1] - a[1]).slice(0, 8)

  // Daily goal suggestion
  const dailyGoal = daysLeft > 0 ? Math.max(20, Math.ceil(250 / daysLeft)) : 50

  return (
    <div className="animate-fade-in">
      <button onClick={onBack} className="text-pink-400 text-sm mb-4 hover:text-pink-500 transition-colors">
        ← 返回首页
      </button>
      <h2 className="text-xl font-normal text-gray-800 mb-1">📊 薄弱分析</h2>
      <p className="text-xs text-gray-400 mb-5">找到薄弱环节，精准提升</p>

      {/* Countdown + Goal */}
      <div className="bg-white rounded-2xl p-5 border border-pink-100 shadow-sm mb-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-sm text-gray-600">考试倒计时</div>
            <div className="text-3xl font-light text-pink-400 mt-1">{daysLeft} <span className="text-base">天</span></div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">每日建议</div>
            <div className="text-3xl font-light text-lavender-400 mt-1">{dailyGoal} <span className="text-base">题</span></div>
          </div>
        </div>
        {totalAcc !== null && (
          <div className="mt-4 pt-3 border-t border-pink-50">
            <div className="flex justify-between text-xs text-gray-400 mb-1.5">
              <span>整体正确率</span>
              <span className={totalAcc >= 70 ? 'text-mint-600' : 'text-coral-500'}>{totalAcc}%</span>
            </div>
            <div className="h-2 bg-pink-50 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${totalAcc >= 70 ? 'bg-gradient-to-r from-mint-400 to-mint-500' : 'bg-gradient-to-r from-coral-400 to-coral-500'}`}
                style={{ width: `${totalAcc}%` }}
              />
            </div>
            <div className="text-xs text-gray-300 mt-1.5">及格线 70%{totalAcc >= 70 ? ' ✓ 已达标' : ` · 还差${70 - totalAcc}%`}</div>
          </div>
        )}
      </div>

      {/* Paper breakdown */}
      {[{ id: 'paper1', name: '卷一', s: s1 }, { id: 'paper3', name: '卷三', s: s3 }].map(p => (
        p.s.total > 0 && (
          <div key={p.id} className="bg-white rounded-2xl p-4 border border-pink-100 shadow-sm mb-3">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-gray-700">{p.name}</span>
              <span className={`text-sm font-medium ${p.s.acc >= 70 ? 'text-mint-600' : 'text-coral-500'}`}>{p.s.acc}%</span>
            </div>
            <div className="space-y-2">
              {PAPERS[p.id].chapters.map(ch => {
                const acc = getAcc(ch.id)
                const s = getStat(ch.id)
                if (s.total === 0) return null
                return (
                  <div key={ch.id}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500 truncate mr-2">{ch.name}</span>
                      <span className={`flex-shrink-0 ${
                        acc >= 80 ? 'text-mint-600' : acc >= 60 ? 'text-warm-400' : 'text-coral-500'
                      }`}>{acc}% ({s.total}题)</span>
                    </div>
                    <div className="h-1.5 bg-pink-50 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          acc >= 80 ? 'bg-mint-400' : acc >= 60 ? 'bg-warm-400' : 'bg-coral-400'
                        }`}
                        style={{ width: `${acc}%` }}
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
        <div className="bg-white rounded-2xl p-4 border border-pink-100 shadow-sm mb-3">
          <div className="text-xs text-coral-400 tracking-wider mb-3">⚠️ 最需加强的章节</div>
          <div className="space-y-2">
            {chapterStats.filter(ch => ch.acc < 70).slice(0, 5).map(ch => (
              <div key={ch.id} className="flex justify-between items-center py-1.5 border-b border-pink-50 last:border-b-0">
                <div>
                  <div className="text-sm text-gray-700">{ch.name}</div>
                  <div className="text-xs text-gray-400">{ch.paper === 'paper1' ? '卷一' : '卷三'} · {ch.stat.total}题</div>
                </div>
                <div className="text-lg font-light text-coral-500">{ch.acc}%</div>
              </div>
            ))}
            {chapterStats.filter(ch => ch.acc < 70).length === 0 && (
              <p className="text-sm text-mint-600 text-center py-2">🎉 所有已做章节正确率都达标了！</p>
            )}
          </div>
        </div>
      )}

      {/* Unstarted chapters */}
      {(() => {
        const unstarted = allChapters.filter(ch => getStat(ch.id).total === 0)
        if (unstarted.length === 0) return null
        return (
          <div className="bg-white rounded-2xl p-4 border border-pink-100 shadow-sm mb-3">
            <div className="text-xs text-gray-400 tracking-wider mb-3">📋 尚未开始的章节</div>
            <div className="flex flex-wrap gap-2">
              {unstarted.map(ch => (
                <span key={ch.id} className="text-xs px-2.5 py-1.5 bg-pink-50 text-gray-500 rounded-lg">
                  {ch.name}
                </span>
              ))}
            </div>
          </div>
        )
      })()}

      {/* Error concept frequency */}
      {topConcepts.length > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-pink-100 shadow-sm mb-3">
          <div className="text-xs text-lavender-400 tracking-wider mb-3">🔍 高频错误考点</div>
          <div className="space-y-2">
            {topConcepts.map(([concept, count]) => (
              <div key={concept} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 truncate mr-2">{concept}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 bg-pink-50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-lavender-300 rounded-full"
                      style={{ width: `${Math.min(100, (count / topConcepts[0][1]) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-6 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {totalQ === 0 && (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">📖</div>
          <p className="text-gray-500 text-sm">开始做题后，这里会显示你的学习分析</p>
        </div>
      )}
    </div>
  )
}

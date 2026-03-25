import { PAPERS } from '../data/chapters'
import { ACHIEVEMENTS } from '../lib/achievements'

export default function Home({ stats, errorBook, onNavigate, onStartExam }) {
  const { getPaperStats, daily, achievements, streak } = stats
  const s1 = getPaperStats('paper1')
  const s3 = getPaperStats('paper3')
  const totalQ = s1.total + s3.total
  const totalAcc = totalQ > 0 ? Math.round(((s1.correct + s3.correct) / totalQ) * 100) : null
  const daysLeft = Math.max(0, Math.ceil((new Date('2026-04-08') - new Date()) / 86400000))
  const { dueCount } = errorBook

  const unlockedBadges = ACHIEVEMENTS.filter(a => achievements.includes(a.id))

  return (
    <div className="animate-fade-in space-y-4">
      {/* Header */}
      <div className="text-center pt-6 pb-2">
        <div className="text-xs tracking-widest text-pink-300 uppercase mb-1">IIQE 备考</div>
        <h1 className="text-2xl font-normal text-gray-800 tracking-wide">泉泉专用学习网站</h1>
        <div className="mt-3 inline-flex items-center gap-1.5 px-4 py-1.5 border border-pink-300 rounded-full text-sm text-pink-400">
          📅 距离考试还有 <b className="text-pink-500">{daysLeft}</b> 天
        </div>
      </div>

      {/* Due Review Alert */}
      {dueCount > 0 && (
        <button
          onClick={() => onNavigate('review')}
          className="w-full bg-gradient-to-r from-lavender-100 to-pink-100 rounded-2xl p-4 border border-lavender-200 text-left hover:shadow-md transition-all active:scale-[0.99]"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-lavender-400">📖 今日待复习</div>
              <div className="text-xs text-gray-500 mt-1">有 {dueCount} 道错题需要复习</div>
            </div>
            <div className="text-2xl font-light text-lavender-400">{dueCount}</div>
          </div>
        </button>
      )}

      {/* Daily Summary */}
      {daily.count > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-pink-100 shadow-sm">
          <div className="text-xs text-pink-300 tracking-wider mb-3">📊 今日学习</div>
          <div className="flex justify-around text-center">
            <div>
              <div className="text-2xl font-light text-gray-800">{daily.count}</div>
              <div className="text-xs text-gray-400 mt-1">做题数</div>
            </div>
            <div>
              <div className="text-2xl font-light text-gray-800">
                {daily.count > 0 ? Math.round((daily.correct / daily.count) * 100) + '%' : '—'}
              </div>
              <div className="text-xs text-gray-400 mt-1">正确率</div>
            </div>
            <div>
              <div className="text-2xl font-light text-gray-800">{streak.current > 0 ? `🔥${streak.current}` : '—'}</div>
              <div className="text-xs text-gray-400 mt-1">连对</div>
            </div>
          </div>
        </div>
      )}

      {/* Overall Stats */}
      {totalQ > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-pink-100 shadow-sm">
          <div className="text-xs text-pink-300 tracking-wider mb-3">🌟 学习概况</div>
          <div className="flex justify-around text-center">
            <div>
              <div className="text-2xl font-light text-gray-800">{totalQ}</div>
              <div className="text-xs text-gray-400 mt-1">总做题</div>
            </div>
            <div>
              <div className={`text-2xl font-light ${totalAcc >= 70 ? 'text-mint-600' : 'text-coral-500'}`}>
                {totalAcc}%
              </div>
              <div className="text-xs text-gray-400 mt-1">总正确率</div>
            </div>
            <div>
              <div className="text-2xl font-light text-gray-800">{errorBook.activeErrors.length}</div>
              <div className="text-xs text-gray-400 mt-1">待攻克</div>
            </div>
          </div>
        </div>
      )}

      {/* Paper Cards */}
      {['paper1', 'paper3'].map(pid => {
        const p = PAPERS[pid]
        const ps = getPaperStats(pid)
        return (
          <button
            key={pid}
            onClick={() => onNavigate('chapters', { paperId: pid })}
            className="w-full bg-white rounded-2xl p-5 border border-pink-100 shadow-sm text-left hover:shadow-md hover:border-pink-200 transition-all active:scale-[0.99]"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="text-base text-gray-800">{p.name}</div>
                <div className="text-xs text-gray-400 mt-1">{p.examDate} · {p.questions}题 · {p.time}</div>
              </div>
              <span className="text-pink-300 text-sm">→</span>
            </div>
            {ps.total > 0 && (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                  <span>{ps.total}题已做</span>
                  <span className={ps.acc >= 70 ? 'text-mint-600' : 'text-coral-500'}>{ps.acc}%</span>
                </div>
                <div className="h-1 bg-pink-50 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${ps.acc >= 70 ? 'bg-mint-400' : 'bg-coral-400'}`}
                    style={{ width: `${ps.acc}%` }}
                  />
                </div>
              </div>
            )}
          </button>
        )
      })}

      {/* Exam Buttons */}
      <div>
        <div className="text-xs text-pink-300 tracking-wider mb-2">🎯 模拟考试</div>
        <div className="flex gap-3">
          {['paper1', 'paper3'].map(pid => (
            <button
              key={pid}
              onClick={() => onStartExam(pid)}
              className="flex-1 py-4 bg-gradient-to-br from-gray-800 to-gray-900 text-white rounded-xl text-sm font-medium hover:from-gray-700 hover:to-gray-800 active:scale-[0.97] transition-all shadow-md"
            >
              {pid === 'paper1' ? '卷一模拟' : '卷三模拟'}
              <div className="text-xs opacity-60 mt-1">{pid === 'paper1' ? '15题' : '10题'}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => onNavigate('errorbook')}
          className="flex-1 py-3.5 bg-white rounded-xl text-sm text-gray-600 border border-pink-100 hover:border-pink-200 hover:bg-pink-50/50 active:scale-[0.97] transition-all"
        >
          📝 错题本 {errorBook.activeErrors.length > 0 && <span className="text-coral-400">({errorBook.activeErrors.length})</span>}
        </button>
        <button
          onClick={() => onNavigate('analysis')}
          className="flex-1 py-3.5 bg-white rounded-xl text-sm text-gray-600 border border-pink-100 hover:border-pink-200 hover:bg-pink-50/50 active:scale-[0.97] transition-all"
        >
          📊 薄弱分析
        </button>
      </div>

      {/* Achievement Badges */}
      {unlockedBadges.length > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-pink-100 shadow-sm">
          <div className="text-xs text-pink-300 tracking-wider mb-3">🏅 成就徽章 ({unlockedBadges.length}/{ACHIEVEMENTS.length})</div>
          <div className="flex flex-wrap gap-2">
            {ACHIEVEMENTS.map(a => {
              const unlocked = achievements.includes(a.id)
              return (
                <div
                  key={a.id}
                  className={`px-2.5 py-1.5 rounded-lg text-xs ${unlocked ? 'bg-pink-50 text-gray-700' : 'bg-gray-50 text-gray-300'}`}
                  title={a.desc}
                >
                  {a.icon} {unlocked ? a.name : '???'}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Reset */}
      {totalQ > 0 && (
        <button
          onClick={stats.resetAll}
          className="block mx-auto text-xs text-gray-300 underline hover:text-gray-400 transition-colors pb-8"
        >
          重置所有数据
        </button>
      )}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { PAPERS } from '../data/chapters'
import { ACHIEVEMENTS } from '../lib/achievements'

const ENCOURAGEMENTS = [
  '每一道题都是通往成功的一步 🌟',
  '今天的努力，明天的底气 💪',
  '相信自己，泉泉最棒了 ✨',
  '坚持就是胜利，加油鸭 🦆',
  '学习使你发光 💖',
  '一步一个脚印，稳稳的 🌸',
  '你比昨天更强了 🎀',
  '知识是最好的投资 📚',
]

const PAPER_EMOJI = {
  paper1: '📘',
  paper3: '📗',
}

const PAPER_COLORS = {
  paper1: { border: 'border-l-lavender-400', bg: 'from-lavender-50 to-white', accent: 'text-lavender-400' },
  paper3: { border: 'border-l-pink-400', bg: 'from-pink-50 to-white', accent: 'text-pink-400' },
}

function ProgressRing({ value, size = 52, strokeWidth = 4, color = 'url(#ringGrad)' }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference
  return (
    <svg width={size} height={size} className="block">
      <defs>
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f9a8d4" />
          <stop offset="100%" stopColor="#c4b5fd" />
        </linearGradient>
      </defs>
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#f5f3ff" strokeWidth={strokeWidth} />
      <circle
        cx={size/2} cy={size/2} r={radius} fill="none"
        stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
        strokeDasharray={circumference} strokeDashoffset={offset}
        className="progress-ring-circle"
      />
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle"
        className="text-xs font-medium" fill="#6b7280" style={{ fontSize: 11 }}>
        {value}%
      </text>
    </svg>
  )
}

export default function Home({ stats, errorBook, onNavigate, onStartExam }) {
  const { getPaperStats, daily, achievements, streak } = stats
  const s1 = getPaperStats('paper1')
  const s3 = getPaperStats('paper3')
  const totalQ = s1.total + s3.total
  const totalAcc = totalQ > 0 ? Math.round(((s1.correct + s3.correct) / totalQ) * 100) : null
  const daysLeft = Math.max(0, Math.ceil((new Date('2026-04-08') - new Date()) / 86400000))
  const { dueCount } = errorBook
  const unlockedBadges = ACHIEVEMENTS.filter(a => achievements.includes(a.id))

  const [encouragement] = useState(() =>
    ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)]
  )

  return (
    <div className="animate-fade-in space-y-4">
      {/* Gradient Banner */}
      <div className="gradient-banner rounded-b-3xl -mx-4 px-6 pt-8 pb-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{
          background: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.3) 0%, transparent 50%)',
        }} />
        <div className="relative z-10">
          <div className="text-xs tracking-widest text-white/80 uppercase mb-1.5">IIQE 备考</div>
          <h1 className="text-2xl font-normal text-white tracking-wide mb-4">泉泉专用学习网站</h1>

          {/* Countdown Badge */}
          <div className="inline-flex flex-col items-center justify-center w-20 h-20 rounded-full bg-white/25 backdrop-blur-sm border-2 border-white/40 animate-pulse-glow">
            <span className="text-2xl font-bold text-white leading-none">{daysLeft}</span>
            <span className="text-[10px] text-white/90 mt-0.5">天倒计时</span>
          </div>
        </div>
      </div>

      {/* Due Review Alert */}
      {dueCount > 0 && (
        <button
          onClick={() => onNavigate('review')}
          className="w-full glass-card-solid rounded-2xl p-4 text-left card-hover"
          style={{ borderLeft: '4px solid #c4b5fd' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-lavender-400">📖 今日待复习</div>
              <div className="text-xs text-gray-500 mt-1">有 {dueCount} 道错题需要复习</div>
            </div>
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-lavender-100 text-lavender-500 text-lg font-bold">
              {dueCount}
            </div>
          </div>
        </button>
      )}

      {/* Daily Summary */}
      {daily.count > 0 && (
        <div className="glass-card-solid rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-pink-400 tracking-wider mb-3 font-medium">📊 今日学习</div>
          <div className="flex justify-around text-center">
            <div>
              <div className="text-2xl font-light text-gray-800">{daily.count}</div>
              <div className="text-xs text-gray-400 mt-1">做题数</div>
            </div>
            <div>
              {daily.count > 0 ? (
                <ProgressRing value={Math.round((daily.correct / daily.count) * 100)} />
              ) : (
                <div className="text-2xl font-light text-gray-800">—</div>
              )}
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
        <div className="glass-card-solid rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-pink-400 tracking-wider mb-3 font-medium">🌟 学习概况</div>
          <div className="flex justify-around text-center">
            <div>
              <div className="text-2xl font-light text-gray-800">{totalQ}</div>
              <div className="text-xs text-gray-400 mt-1">总做题</div>
            </div>
            <div>
              {totalAcc !== null ? (
                <ProgressRing value={totalAcc} />
              ) : (
                <div className="text-2xl font-light text-gray-800">—</div>
              )}
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
      <div className="stagger-children space-y-3">
        {['paper1', 'paper3'].map(pid => {
          const p = PAPERS[pid]
          const ps = getPaperStats(pid)
          const colors = PAPER_COLORS[pid]
          return (
            <button
              key={pid}
              onClick={() => onNavigate('chapters', { paperId: pid })}
              className={`w-full glass-card-solid rounded-2xl p-5 text-left card-hover border-l-4 ${colors.border}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                  <span className="text-2xl mt-0.5">{PAPER_EMOJI[pid]}</span>
                  <div>
                    <div className="text-base text-gray-800 font-medium">{p.name}</div>
                    <div className="text-xs text-gray-400 mt-1">{p.examDate} · {p.questions}题 · {p.time}</div>
                  </div>
                </div>
                <span className={`text-sm ${colors.accent}`}>→</span>
              </div>
              {ps.total > 0 && (
                <div className="mt-3 ml-9">
                  <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                    <span>{ps.total}题已做</span>
                    <span className={ps.acc >= 70 ? 'text-mint-600' : 'text-coral-500'}>{ps.acc}%</span>
                  </div>
                  <div className="h-1.5 bg-pink-50 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 gradient-progress"
                      style={{ width: `${ps.acc}%` }}
                    />
                  </div>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Exam Buttons */}
      <div>
        <div className="text-xs text-pink-400 tracking-wider mb-2 font-medium">🎯 模拟考试</div>
        <div className="flex gap-3">
          {['paper1', 'paper3'].map(pid => (
            <button
              key={pid}
              onClick={() => onStartExam(pid)}
              className="flex-1 py-4 rounded-xl text-sm font-medium active:scale-[0.97] transition-all shadow-lg text-white"
              style={{
                background: pid === 'paper1'
                  ? 'linear-gradient(135deg, #a78bfa 0%, #c4b5fd 100%)'
                  : 'linear-gradient(135deg, #f472b6 0%, #f9a8d4 100%)',
              }}
            >
              {pid === 'paper1' ? '📘 卷一模拟' : '📗 卷三模拟'}
              <div className="text-xs opacity-80 mt-1">{pid === 'paper1' ? '15题' : '10题'}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Achievement Badges */}
      <div className="glass-card-solid rounded-2xl p-4 shadow-sm">
        <div className="text-xs text-pink-400 tracking-wider mb-3 font-medium">
          🏅 成就徽章 ({unlockedBadges.length}/{ACHIEVEMENTS.length})
        </div>
        <div className="flex flex-wrap gap-2">
          {ACHIEVEMENTS.map(a => {
            const unlocked = achievements.includes(a.id)
            return (
              <div
                key={a.id}
                className={`px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                  unlocked
                    ? 'gradient-pink-purple-light text-gray-700 shadow-sm'
                    : 'bg-gray-50 text-gray-300'
                }`}
                title={a.desc}
              >
                {unlocked ? a.icon : '🔒'} {unlocked ? a.name : '???'}
              </div>
            )
          })}
        </div>
      </div>

      {/* Encouragement */}
      <div className="text-center py-2">
        <p className="text-xs text-pink-300 italic">{encouragement}</p>
      </div>

      {/* Reset */}
      {totalQ > 0 && (
        <button
          onClick={stats.resetAll}
          className="block mx-auto text-xs text-gray-300 underline hover:text-gray-400 transition-colors pb-4"
        >
          重置所有数据
        </button>
      )}
    </div>
  )
}

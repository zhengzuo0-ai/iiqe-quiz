import { useState, useEffect } from 'react'
import { PAPERS } from '../data/chapters'
import { ACHIEVEMENTS } from '../lib/achievements'

const CHEER_SQUAD = [
  { name: 'Luka', src: '/characters/luka_cheer.png', emoji: '👦' },
  { name: 'Rocky', src: '/characters/rocky_cheer.png', emoji: '👶' },
  { name: 'Spring', src: '/characters/spring_cheer.png', emoji: '🐕' },
  { name: 'Winter', src: '/characters/winter_cheer.png', emoji: '🐕‍🦺' },
]

const OHTANI_CHEER = { name: '大谷翔平', src: '/characters/ohtani_cheer.png', emoji: '⚾' }

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
  paper1: { accent: 'text-pink-400' },
  paper3: { accent: 'text-warm-400' },
}

function ProgressRing({ value, size = 52, strokeWidth = 4, color = 'url(#ringGrad)' }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference
  return (
    <svg width={size} height={size} className="block">
      <defs>
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e88b9e" />
          <stop offset="100%" stopColor="#d4708a" />
        </linearGradient>
      </defs>
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#fef5f0" strokeWidth={strokeWidth} />
      <circle
        cx={size/2} cy={size/2} r={radius} fill="none"
        stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
        strokeDasharray={circumference} strokeDashoffset={offset}
        className="progress-ring-circle"
      />
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle"
        className="text-xs font-medium" fill="#4A4543" style={{ fontSize: 11 }}>
        {value}%
      </text>
    </svg>
  )
}

function getCountdownAdvice(daysLeft) {
  if (daysLeft <= 0) return '今天就是考试日！你准备好了！加油！🎉'
  if (daysLeft <= 3) return '轻松复习错题和知识要点，保持状态 🌟'
  if (daysLeft <= 7) return '密集刷模拟考+错题重做，查漏补缺 🔥'
  if (daysLeft <= 10) return '重点攻克薄弱章节，每天做40题+复习错题 💪'
  return '每天完成2个章节各20题，稳步推进 📚'
}

function calcPaperReadiness(stats, paperId) {
  const chapters = PAPERS[paperId].chapters
  let weightedScore = 0
  let totalWeight = 0
  const weakChapters = []

  chapters.forEach(ch => {
    const acc = stats.getAcc(ch.id)
    const weight = ch.weight
    totalWeight += weight
    if (acc !== null) {
      weightedScore += (acc / 100) * weight
      weakChapters.push({ name: ch.name, acc })
    }
  })

  const hasData = weakChapters.length > 0
  const estimatedScore = hasData ? Math.round((weightedScore / totalWeight) * 100) : null
  weakChapters.sort((a, b) => a.acc - b.acc)
  const weakest = weakChapters.slice(0, 2).filter(c => c.acc < 80)

  return { estimatedScore, weakest, hasData }
}

function ReadinessIndicator({ label, score }) {
  if (score === null) return null
  const status = score >= 70 ? '✅' : score >= 60 ? '⚠️' : '❌'
  const color = score >= 70 ? 'text-mint-600' : score >= 60 ? 'text-yellow-500' : 'text-coral-500'
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-charcoal font-medium">{label}</span>
      <span className={`text-sm font-bold ${color}`}>预估 {score}% {status}</span>
    </div>
  )
}

function DailyRecommendation({ stats, errorBook, daysLeft, totalQ, onNavigate, onStartExam }) {
  const { dueCount } = errorBook
  const { getPaperStats, getAcc } = stats

  // Determine recommendation
  let title, subtitle, action, actionLabel

  if (totalQ === 0) {
    // Never done any questions
    title = '从卷三第1章开始（占比25%，最重要）'
    subtitle = '先考的先练，卷三第1章权重最高'
    actionLabel = '开始20题'
    action = () => onNavigate('practice', { paperId: 'paper3', chapter: PAPERS.paper3.chapters[0] })
  } else if (dueCount > 0) {
    // Has errors due for review
    title = `先复习 ${dueCount} 道错题`
    subtitle = '间隔复习是最高效的记忆方法'
    actionLabel = '去复习'
    action = () => onNavigate('review')
  } else {
    // Find weakest chapter with <60% accuracy
    let weakest = null
    for (const pid of ['paper3', 'paper1']) {
      for (const ch of PAPERS[pid].chapters) {
        const acc = getAcc(ch.id)
        if (acc !== null && acc < 60) {
          if (!weakest || acc < weakest.acc) {
            weakest = { ch, pid, acc }
          }
        }
      }
    }

    if (weakest) {
      title = `重点攻克：${weakest.ch.name}（正确率${weakest.acc}%）`
      subtitle = '反复练习薄弱环节，提升最快'
      actionLabel = '去练习'
      action = () => onNavigate('practice', { paperId: weakest.pid, chapter: weakest.ch })
    } else {
      // All chapters > 60%, check if > 80%
      const allAbove80 = ['paper3', 'paper1'].every(pid =>
        PAPERS[pid].chapters.every(ch => {
          const acc = getAcc(ch.id)
          return acc !== null && acc >= 80
        })
      )

      if (allAbove80) {
        title = '太棒了！做一套模拟考试检验成果'
        subtitle = '所有章节正确率都超过80%了'
        actionLabel = '开始模拟考'
        action = () => onStartExam('paper3')
      } else {
        // Find next untouched or lowest chapter
        for (const pid of ['paper3', 'paper1']) {
          for (const ch of PAPERS[pid].chapters) {
            const acc = getAcc(ch.id)
            if (acc === null) {
              title = `继续新章节：${ch.name}`
              subtitle = `${pid === 'paper3' ? '卷三' : '卷一'} · 权重${ch.weight}%`
              actionLabel = '开始20题'
              action = () => onNavigate('practice', { paperId: pid, chapter: ch })
              break
            }
          }
          if (action) break
        }

        if (!action) {
          // All touched but some between 60-80
          let lowest = null
          for (const pid of ['paper3', 'paper1']) {
            for (const ch of PAPERS[pid].chapters) {
              const acc = getAcc(ch.id)
              if (acc !== null && (!lowest || acc < lowest.acc)) {
                lowest = { ch, pid, acc }
              }
            }
          }
          if (lowest) {
            title = `巩固提升：${lowest.ch.name}（${lowest.acc}%）`
            subtitle = '再练一轮，冲刺80%+'
            actionLabel = '去练习'
            action = () => onNavigate('practice', { paperId: lowest.pid, chapter: lowest.ch })
          }
        }
      }
    }
  }

  // Suggested daily count
  const suggestedDaily = daysLeft > 0 ? Math.max(20, Math.ceil(200 / daysLeft)) : 40

  return (
    <div className="glass-card-solid rounded-2xl p-5 space-y-3">
      <div className="text-xs text-pink-400 tracking-wider font-semibold uppercase">🎯 推荐今日学习</div>
      <div className="text-sm font-semibold text-charcoal">{title}</div>
      {subtitle && <div className="text-xs text-charcoal-light/60">{subtitle}</div>}
      {action && (
        <button
          onClick={action}
          className="w-full py-3 rounded-xl text-sm font-semibold text-white btn-primary mt-2"
        >
          {actionLabel}
        </button>
      )}
      <div className="text-[11px] text-charcoal-light/40 pt-1 border-t border-cream-100">
        距考试{daysLeft}天，建议今日完成{suggestedDaily}题
      </div>
    </div>
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
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const readiness1 = calcPaperReadiness(stats, 'paper1')
  const readiness3 = calcPaperReadiness(stats, 'paper3')
  const countdownAdvice = getCountdownAdvice(daysLeft)

  const [encouragement] = useState(() =>
    ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)]
  )

  // 15% chance to show Ohtani as easter egg
  const [showOhtani] = useState(() => Math.random() < 0.15)

  return (
    <div className="animate-fade-in space-y-4">
      {/* Gradient Banner */}
      <div className="gradient-banner rounded-2xl px-6 pt-10 pb-7 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{
          background: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.3) 0%, transparent 50%)',
        }} />
        <div className="relative z-10">
          <div className="text-[10px] tracking-[0.25em] text-white/70 uppercase mb-2 font-medium">IIQE Preparation</div>
          <h1 className="font-display text-3xl font-semibold text-white tracking-wide mb-5">泉泉专用学习网站</h1>

          {/* Countdown Badge */}
          <div className="inline-flex flex-col items-center justify-center w-22 h-22 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 animate-pulse-glow">
            <span className="font-display text-3xl font-bold text-white leading-none">{daysLeft}</span>
            <span className="text-[10px] text-white/80 mt-1 tracking-wider">天倒计时</span>
          </div>

          {/* Cheerleader Squad */}
          <div className="mt-5 flex items-end justify-center gap-1">
            {CHEER_SQUAD.map((char, i) => (
              <div
                key={char.name}
                className="flex flex-col items-center"
                style={{ animation: `cheerBounce 1.2s ease-in-out ${i * 0.15}s infinite` }}
              >
                <img
                  src={char.src}
                  alt={char.name}
                  className="w-14 h-14 object-contain drop-shadow-md"
                />
                <span className="text-[9px] text-white/70 mt-0.5 font-medium">{char.name}</span>
              </div>
            ))}
            {showOhtani && (
              <div
                className="flex flex-col items-center ml-1"
                style={{ animation: `cheerBounce 1.2s ease-in-out 0.6s infinite` }}
              >
                <img
                  src={OHTANI_CHEER.src}
                  alt={OHTANI_CHEER.name}
                  className="w-14 h-14 object-contain drop-shadow-md"
                />
                <span className="text-[9px] text-white/70 mt-0.5 font-medium">⚾ 彩蛋!</span>
              </div>
            )}
          </div>
          <div className="text-[10px] text-white/50 mt-2">
            {showOhtani ? '大谷翔平也来给你加油了！💪' : '家人们为泉泉加油 💕'}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes cheerBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>

      {/* Smart Daily Recommendation */}
      <DailyRecommendation
        stats={stats}
        errorBook={errorBook}
        daysLeft={daysLeft}
        totalQ={totalQ}
        onNavigate={onNavigate}
        onStartExam={onStartExam}
      />

      {/* Exam Readiness Dashboard */}
      {(readiness1.hasData || readiness3.hasData) && (
        <div className="glass-card-solid rounded-2xl p-5 space-y-3">
          <div className="text-xs text-pink-400 tracking-wider font-semibold uppercase">🎯 考试准备度</div>
          <ReadinessIndicator label="📗 卷三（长期保险）" score={readiness3.estimatedScore} />
          <ReadinessIndicator label="📘 卷一（保险原理）" score={readiness1.estimatedScore} />

          {/* Weakest chapters */}
          {(() => {
            const allWeak = [...readiness3.weakest.map(w => ({ ...w, paper: '卷三' })), ...readiness1.weakest.map(w => ({ ...w, paper: '卷一' }))]
            allWeak.sort((a, b) => a.acc - b.acc)
            const top2 = allWeak.slice(0, 2)
            if (top2.length === 0) return null
            return (
              <div className="text-xs text-charcoal-light/60 mt-1 pt-2 border-t border-cream-100">
                建议重点复习：{top2.map(w => `${w.name}(${w.acc}%)`).join('、')}
              </div>
            )
          })()}

          {/* Countdown advice */}
          <div className="text-xs text-pink-400/80 font-medium pt-1">
            {countdownAdvice}
          </div>
        </div>
      )}

      {/* Countdown advice when no data yet */}
      {!readiness1.hasData && !readiness3.hasData && (
        <div className="glass-card-solid rounded-2xl p-4 text-center">
          <div className="text-xs text-pink-400/80 font-medium">{countdownAdvice}</div>
        </div>
      )}

      {/* Due Review Alert */}
      {dueCount > 0 && (
        <button
          onClick={() => onNavigate('review')}
          className="w-full glass-card-solid rounded-2xl p-4 text-left card-hover"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-pink-400">📖 今日待复习</div>
              <div className="text-xs text-charcoal-light/50 mt-1">有 {dueCount} 道错题需要复习</div>
            </div>
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-pink-100 text-pink-500 font-display text-lg font-bold">
              {dueCount}
            </div>
          </div>
        </button>
      )}

      {/* Daily Summary */}
      {daily.count > 0 && (
        <div className="glass-card-solid rounded-2xl p-5">
          <div className="text-xs text-pink-400 tracking-wider mb-3 font-semibold uppercase">今日学习</div>
          <div className="flex justify-around text-center">
            <div>
              <div className="font-display text-2xl font-semibold text-charcoal">{daily.count}</div>
              <div className="text-[11px] text-charcoal-light/60 mt-1">做题数</div>
            </div>
            <div>
              {daily.count > 0 ? (
                <ProgressRing value={Math.round((daily.correct / daily.count) * 100)} />
              ) : (
                <div className="font-display text-2xl font-semibold text-charcoal">—</div>
              )}
              <div className="text-[11px] text-charcoal-light/60 mt-1">正确率</div>
            </div>
            <div>
              <div className="font-display text-2xl font-semibold text-charcoal">{streak.current > 0 ? `🔥${streak.current}` : '—'}</div>
              <div className="text-[11px] text-charcoal-light/60 mt-1">连对</div>
            </div>
          </div>
        </div>
      )}

      {/* Overall Stats */}
      {totalQ > 0 && (
        <div className="glass-card-solid rounded-2xl p-5">
          <div className="text-xs text-pink-400 tracking-wider mb-3 font-semibold uppercase">学习概况</div>
          <div className="flex justify-around text-center">
            <div>
              <div className="font-display text-2xl font-semibold text-charcoal">{totalQ}</div>
              <div className="text-[11px] text-charcoal-light/60 mt-1">总做题</div>
            </div>
            <div>
              {totalAcc !== null ? (
                <ProgressRing value={totalAcc} />
              ) : (
                <div className="font-display text-2xl font-semibold text-charcoal">—</div>
              )}
              <div className="text-[11px] text-charcoal-light/60 mt-1">总正确率</div>
            </div>
            <div>
              <div className="font-display text-2xl font-semibold text-charcoal">{errorBook.activeErrors.length}</div>
              <div className="text-[11px] text-charcoal-light/60 mt-1">待攻克</div>
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
              className="w-full glass-card-solid rounded-2xl p-5 text-left card-hover"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                  <span className="text-2xl mt-0.5">{PAPER_EMOJI[pid]}</span>
                  <div>
                    <div className="text-base text-charcoal font-semibold">{p.name}</div>
                    <div className="text-xs text-charcoal-light/50 mt-1">{p.examDate} · {p.questions}题 · {p.time}</div>
                  </div>
                </div>
                <span className={`text-sm ${colors.accent}`}>→</span>
              </div>
              {ps.total > 0 && (
                <div className="mt-3 ml-9">
                  <div className="flex justify-between text-xs text-charcoal-light/50 mb-1.5">
                    <span>{ps.total}题已做</span>
                    <span className={ps.acc >= 70 ? 'text-mint-600' : 'text-coral-500'}>{ps.acc}%</span>
                  </div>
                  <div className="h-1.5 bg-cream-100 rounded-full overflow-hidden">
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
        <div className="text-xs text-pink-400 tracking-wider mb-2 font-semibold uppercase">模拟考试</div>
        <div className="flex gap-3">
          {['paper1', 'paper3'].map(pid => (
            <button
              key={pid}
              onClick={() => onStartExam(pid)}
              className="flex-1 py-4 rounded-xl text-sm font-semibold text-white btn-primary"
            >
              {pid === 'paper1' ? '📘 卷一模拟' : '📗 卷三模拟'}
              <div className="text-xs opacity-80 mt-1 font-normal">{pid === 'paper1' ? '15题' : '10题'}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Achievement Badges */}
      <div className="glass-card-solid rounded-2xl p-5">
        <div className="text-xs text-pink-400 tracking-wider mb-3 font-semibold uppercase">
          成就徽章 ({unlockedBadges.length}/{ACHIEVEMENTS.length})
        </div>
        <div className="flex flex-wrap gap-2">
          {ACHIEVEMENTS.map(a => {
            const unlocked = achievements.includes(a.id)
            return (
              <div
                key={a.id}
                className={`px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                  unlocked
                    ? 'gradient-pink-purple-light text-charcoal-light shadow-sm'
                    : 'bg-cream-100 text-charcoal-light/50'
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
      <div className="text-center py-3">
        <p className="text-xs text-pink-400/70 italic">{encouragement}</p>
      </div>

      {/* Reset */}
      {totalQ > 0 && (
        <button
          onClick={() => setShowResetConfirm(true)}
          className="block mx-auto text-xs text-charcoal-light/40 underline hover:text-charcoal-light/60 transition-colors pb-4"
        >
          重置所有数据
        </button>
      )}

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in px-6">
          <div className="glass-card-solid rounded-2xl p-6 max-w-sm w-full text-center space-y-4">
            <div className="text-3xl">⚠️</div>
            <p className="text-sm text-charcoal leading-relaxed">确定要重置所有数据（做题记录、错题本、成就）吗？此操作不可恢复。</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold glass-card-solid text-charcoal-light hover:shadow-sm transition-all"
              >
                取消
              </button>
              <button
                onClick={() => { stats.resetAll(); errorBook.resetErrors(); setShowResetConfirm(false) }}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-coral-500 hover:bg-coral-600 transition-colors"
              >
                确认重置
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

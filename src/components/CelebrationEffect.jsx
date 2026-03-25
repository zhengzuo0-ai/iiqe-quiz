import { useState, useEffect } from 'react'

const PARTICLES = ['🌸', '✨', '💖', '⭐', '🎀', '💫', '🌟', '🦋']
const WRONG_ENCOURAGEMENTS = [
  '没关系，错误是最好的老师 💕',
  '加油！下次一定可以的 🌸',
  '慢慢来，你已经很棒了 ✨',
  '学到了新知识，就是进步 🌟',
  '别灰心，泉泉最棒了 💪',
  '每错一题，离成功更近一步 🎯',
]

export function getEncouragement() {
  return WRONG_ENCOURAGEMENTS[Math.floor(Math.random() * WRONG_ENCOURAGEMENTS.length)]
}

export function CelebrationEffect({ show }) {
  const [particles, setParticles] = useState([])

  useEffect(() => {
    if (!show) return
    const items = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      emoji: PARTICLES[Math.floor(Math.random() * PARTICLES.length)],
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      size: 16 + Math.random() * 12,
    }))
    setParticles(items)
    const timer = setTimeout(() => setParticles([]), 1200)
    return () => clearTimeout(timer)
  }, [show])

  if (particles.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute animate-confetti"
          style={{
            left: `${p.left}%`,
            bottom: '40%',
            fontSize: p.size,
            animationDelay: `${p.delay}s`,
          }}
        >
          {p.emoji}
        </div>
      ))}
    </div>
  )
}

export function StreakBadge({ count }) {
  if (count < 3) return null
  return (
    <div className="animate-pop-in inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-orange-400 to-pink-400 text-white rounded-full text-sm font-semibold shadow-lg">
      🔥 连对{count}题！
    </div>
  )
}

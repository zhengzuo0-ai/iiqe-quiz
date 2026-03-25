import { useEffect, useState } from 'react'

export default function AchievementToast({ achievement, onDone }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    setShow(true)
    const timer = setTimeout(() => {
      setShow(false)
      setTimeout(onDone, 300)
    }, 3000)
    return () => clearTimeout(timer)
  }, [onDone])

  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
      show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
    }`}>
      <div className="glass-card rounded-2xl px-5 py-3.5 shadow-xl flex items-center gap-3 animate-pop-in"
        style={{ border: '2px solid rgba(139,92,246,0.3)' }}>
        <span className="text-2xl animate-bounce">{achievement.icon}</span>
        <div>
          <div className="text-xs font-semibold" style={{ background: 'linear-gradient(135deg, #e88b9e, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            解锁成就！
          </div>
          <div className="text-sm text-charcoal font-semibold">{achievement.name}</div>
          <div className="text-xs text-charcoal-light/50">{achievement.desc}</div>
        </div>
      </div>
    </div>
  )
}

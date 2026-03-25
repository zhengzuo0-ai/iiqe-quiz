import { useState, useEffect } from 'react'

const CHARACTERS = [
  { name: 'Luka', src: '/characters/luka_cheer.png' },
  { name: 'Rocky', src: '/characters/rocky_cheer.png' },
  { name: 'Winter', src: '/characters/winter_cheer.png' },
  { name: 'Spring', src: '/characters/spring_cheer.png' },
  { name: '大谷翔平', src: '/characters/ohtani_cheer.png' },
]

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0)
  const [entering, setEntering] = useState(true)
  const [direction, setDirection] = useState(1) // 1 = forward, -1 = back
  const [touchStart, setTouchStart] = useState(null)

  useEffect(() => {
    setEntering(true)
  }, [step])

  const goTo = (next) => {
    if (next === step || next < 0 || next > 2) return
    setDirection(next > step ? 1 : -1)
    setEntering(false)
    setTimeout(() => {
      setStep(next)
    }, 200)
  }

  const handleFinish = () => {
    localStorage.setItem('iiqe_onboarding_done', 'true')
    onComplete()
  }

  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX)
  }

  const handleTouchEnd = (e) => {
    if (touchStart === null) return
    const diff = touchStart - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) {
      if (diff > 0 && step < 2) goTo(step + 1)
      if (diff < 0 && step > 0) goTo(step - 1)
    }
    setTouchStart(null)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #f0a6b8 0%, #d4708a 35%, #b09cf7 100%)',
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Decorative circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10" />
        <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full bg-white/8" />
        <div className="absolute top-1/3 right-10 w-24 h-24 rounded-full bg-white/5" />
      </div>

      {/* Content */}
      <div
        className="relative z-10 max-w-md w-full px-6 text-center"
        style={{
          animation: entering ? `onboardSlideIn 0.4s ease-out` : `onboardSlideOut 0.2s ease-in forwards`,
        }}
      >
        {step === 0 && <StepWelcome />}
        {step === 1 && <StepExamInfo />}
        {step === 2 && <StepMethod />}
      </div>

      {/* Dots indicator */}
      <div className="relative z-10 flex gap-2 mt-8">
        {[0, 1, 2].map(i => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="transition-all duration-300"
            style={{
              width: i === step ? 24 : 8,
              height: 8,
              borderRadius: 4,
              background: i === step ? 'white' : 'rgba(255,255,255,0.4)',
            }}
          />
        ))}
      </div>

      {/* Button */}
      <div className="relative z-10 mt-8 px-6 w-full max-w-md">
        <button
          onClick={() => step < 2 ? goTo(step + 1) : handleFinish()}
          className="w-full py-4 rounded-2xl text-base font-semibold transition-all active:scale-95"
          style={{
            background: 'rgba(255,255,255,0.95)',
            color: '#d4708a',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          }}
        >
          {step === 0 && '了解考试 →'}
          {step === 1 && '学习方法 →'}
          {step === 2 && '开始刷题！🚀'}
        </button>
      </div>

      <style>{`
        @keyframes onboardSlideIn {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes onboardSlideOut {
          from { opacity: 1; transform: translateX(0); }
          to { opacity: 0; transform: translateX(-40px); }
        }
        @keyframes charBounceIn {
          0% { opacity: 0; transform: translateY(30px) scale(0.5); }
          60% { opacity: 1; transform: translateY(-8px) scale(1.05); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  )
}

function StepWelcome() {
  return (
    <>
      {/* Character row */}
      <div className="flex items-end justify-center gap-2 mb-8">
        {CHARACTERS.map((char, i) => (
          <div
            key={char.name}
            className="flex flex-col items-center"
            style={{
              animation: `charBounceIn 0.5s ease-out ${i * 0.1}s both`,
            }}
          >
            <img
              src={char.src}
              alt={char.name}
              className="w-14 h-14 object-contain drop-shadow-lg"
            />
            <span className="text-[9px] text-white/70 mt-1 font-medium">{char.name}</span>
          </div>
        ))}
      </div>

      <h1 className="font-display text-2xl font-semibold text-white leading-relaxed mb-3">
        泉泉，欢迎来到你的<br />专属备考基地！🎀
      </h1>
      <p className="text-sm text-white/80 leading-relaxed">
        他们会陪你一起学习，给你加油打气！
      </p>
    </>
  )
}

function StepExamInfo() {
  return (
    <>
      <h1 className="font-display text-2xl font-semibold text-white mb-6">
        4月8日，你将连考两场
      </h1>

      <div className="space-y-3">
        <div className="rounded-2xl p-4 text-left" style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)' }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🕐</span>
            <span className="text-sm font-semibold text-white">14:00 卷三 · 长期保险</span>
          </div>
          <div className="flex gap-3 text-xs text-white/70">
            <span>50题</span>
            <span>75分钟</span>
            <span>及格70%</span>
          </div>
        </div>

        <div className="rounded-2xl p-4 text-left" style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)' }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🕐</span>
            <span className="text-sm font-semibold text-white">15:45 卷一 · 保险原理</span>
          </div>
          <div className="flex gap-3 text-xs text-white/70">
            <span>75题</span>
            <span>120分钟</span>
            <span>及格70%</span>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.15)' }}>
        <p className="text-sm text-white/90">
          💡 建议先从卷三开始——它先考，题目少，更容易拿下！
        </p>
      </div>
    </>
  )
}

function StepMethod() {
  const steps = [
    { num: '①', text: '做1-2个章节（每轮20题）' },
    { num: '②', text: '仔细看错题解析，理解为什么错' },
    { num: '③', text: '第二天先复习昨天的错题' },
  ]

  return (
    <>
      <h1 className="font-display text-2xl font-semibold text-white mb-6">
        每天这样练最有效 🎯
      </h1>

      <div className="space-y-3">
        {steps.map((s, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-2xl px-5 py-4 text-left"
            style={{
              background: 'rgba(255,255,255,0.18)',
              backdropFilter: 'blur(8px)',
              animation: `charBounceIn 0.4s ease-out ${i * 0.12}s both`,
            }}
          >
            <span className="text-2xl font-display font-bold text-white/90 shrink-0">{s.num}</span>
            <span className="text-sm text-white/90 font-medium">{s.text}</span>
          </div>
        ))}
      </div>

      <p className="mt-6 text-sm text-white/80 leading-relaxed">
        2,000+道真题在等你，我们相信你！💪
      </p>
    </>
  )
}

import { useState, useEffect, useCallback } from 'react'
import { useStats } from './hooks/useStats'
import { useErrorBook } from './hooks/useErrorBook'
import { useQuestionBank } from './hooks/useQuestionBank'
import { checkNewAchievements } from './lib/achievements'
import Onboarding from './components/Onboarding'
import Home from './components/Home'
import ChapterList from './components/ChapterList'
import Practice from './components/Practice'
import ExamMode from './components/ExamMode'
import ErrorBook from './components/ErrorBook'
import ReviewMode from './components/ReviewMode'
import WeaknessAnalysis from './components/WeaknessAnalysis'
import AchievementToast from './components/AchievementToast'
import Settings from './components/Settings'

const NAV_ICONS = {
  home: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  errorbook: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  analysis: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  ),
  settings: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
}

const NAV_ITEMS = [
  { id: 'home', label: '首页' },
  { id: 'errorbook', label: '错题' },
  { id: 'analysis', label: '分析' },
  { id: 'settings', label: '设置' },
]

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState(
    () => !localStorage.getItem('iiqe_onboarding_done')
  )
  const [view, setView] = useState('home')
  const [viewData, setViewData] = useState({})
  const [toastQueue, setToastQueue] = useState([])
  const [transitioning, setTransitioning] = useState(false)

  const stats = useStats()
  const errorBook = useErrorBook()
  const questionBank = useQuestionBank()

  // Check for new achievements whenever stats change
  useEffect(() => {
    const achievementStats = stats.getAchievementStats()
    const newOnes = checkNewAchievements(achievementStats, stats.achievements)
    newOnes.forEach(a => {
      stats.unlockAchievement(a.id)
      setToastQueue(q => [...q, a])
    })
  }, [stats.stats, stats.streak, stats.daily])

  const navigate = useCallback((v, data = {}) => {
    setTransitioning(true)
    setTimeout(() => {
      setView(v)
      setViewData(data)
      setTransitioning(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 150)
  }, [])

  const handleStartExam = useCallback((paperId) => {
    navigate('exam', { paperId })
  }, [navigate])

  const dismissToast = useCallback(() => {
    setToastQueue(q => q.slice(1))
  }, [])

  const handleOnboardingComplete = useCallback(() => {
    setShowOnboarding(false)
    // Navigate to Paper 3 chapter list (先考的先练)
    navigate('chapters', { paperId: 'paper3' })
  }, [navigate])

  const showBottomNav = ['home', 'errorbook', 'analysis', 'settings'].includes(view)

  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />
  }

  const renderView = () => {
    switch (view) {
      case 'home':
        return (
          <Home
            stats={stats}
            errorBook={errorBook}
            onNavigate={navigate}
            onStartExam={handleStartExam}
          />
        )
      case 'chapters':
        return (
          <ChapterList
            paperId={viewData.paperId}
            stats={stats}
            onBack={() => navigate('home')}
            onSelectChapter={(ch) => navigate('practice', { paperId: viewData.paperId, chapter: ch })}
          />
        )
      case 'practice':
        return (
          <Practice
            paperId={viewData.paperId}
            chapter={viewData.chapter}
            stats={stats}
            errorBook={errorBook}
            questionBank={questionBank}
            onBack={() => navigate('chapters', { paperId: viewData.paperId })}
          />
        )
      case 'exam':
        return (
          <ExamMode
            paperId={viewData.paperId}
            stats={stats}
            errorBook={errorBook}
            questionBank={questionBank}
            onBack={() => navigate('home')}
          />
        )
      case 'errorbook':
        return (
          <ErrorBook
            errorBook={errorBook}
            onBack={() => navigate('home')}
            onStartReview={() => navigate('review-errors')}
          />
        )
      case 'review':
        return (
          <ReviewMode
            errorBook={errorBook}
            onBack={() => navigate('home')}
            mode="review"
          />
        )
      case 'review-errors':
        return (
          <ReviewMode
            errorBook={errorBook}
            onBack={() => navigate('errorbook')}
            mode="redo"
          />
        )
      case 'analysis':
        return (
          <WeaknessAnalysis
            stats={stats}
            errorBook={errorBook}
            onBack={() => navigate('home')}
          />
        )
      case 'settings':
        return (
          <Settings
            stats={stats}
            errorBook={errorBook}
            onBack={() => navigate('home')}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 min-h-screen" style={{ paddingBottom: showBottomNav ? 'calc(80px + env(safe-area-inset-bottom, 0px))' : 16 }}>
      {toastQueue.length > 0 && (
        <AchievementToast achievement={toastQueue[0]} onDone={dismissToast} />
      )}
      <div
        className="transition-opacity duration-150"
        style={{ opacity: transitioning ? 0 : 1 }}
      >
        {renderView()}
      </div>

      {/* Bottom Navigation */}
      {showBottomNav && (
        <nav className="fixed bottom-0 left-0 right-0 bottom-nav z-40 animate-slide-up">
          <div className="max-w-xl mx-auto flex justify-around items-center py-2 px-4">
            {NAV_ITEMS.map(item => {
              const isActive = view === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => view !== item.id && navigate(item.id)}
                  className={`flex flex-col items-center gap-0.5 py-2 px-5 rounded-xl transition-all ${
                    isActive
                      ? 'text-pink-500'
                      : 'text-charcoal-light/50 hover:text-pink-400'
                  }`}
                >
                  <span className={`transition-transform ${isActive ? 'scale-110' : ''}`}>
                    {NAV_ICONS[item.id]}
                  </span>
                  <span className={`text-[10px] font-semibold ${isActive ? 'text-pink-500' : ''}`}>
                    {item.label}
                  </span>
                  {isActive && (
                    <div className="w-4 h-1 rounded-full gradient-pink-purple mt-0.5" />
                  )}
                </button>
              )
            })}
          </div>
        </nav>
      )}
    </div>
  )
}

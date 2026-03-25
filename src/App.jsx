import { useState, useEffect, useCallback } from 'react'
import { useStats } from './hooks/useStats'
import { useErrorBook } from './hooks/useErrorBook'
import { useQuestionBank } from './hooks/useQuestionBank'
import { checkNewAchievements } from './lib/achievements'
import Home from './components/Home'
import ChapterList from './components/ChapterList'
import Practice from './components/Practice'
import ExamMode from './components/ExamMode'
import ErrorBook from './components/ErrorBook'
import ReviewMode from './components/ReviewMode'
import WeaknessAnalysis from './components/WeaknessAnalysis'
import AchievementToast from './components/AchievementToast'

const NAV_ITEMS = [
  { id: 'home', icon: '🏠', label: '首页' },
  { id: 'errorbook', icon: '📝', label: '错题' },
  { id: 'analysis', icon: '📊', label: '分析' },
]

export default function App() {
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

  const showBottomNav = ['home', 'errorbook', 'analysis'].includes(view)

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
      default:
        return null
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 min-h-screen" style={{ paddingBottom: showBottomNav ? 80 : 16 }}>
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
                  className={`flex flex-col items-center gap-0.5 py-1.5 px-5 rounded-xl transition-all ${
                    isActive
                      ? 'text-pink-500'
                      : 'text-gray-400 hover:text-pink-400'
                  }`}
                >
                  <span className={`text-xl transition-transform ${isActive ? 'scale-110' : ''}`}>
                    {item.icon}
                  </span>
                  <span className={`text-[10px] font-medium ${isActive ? 'text-pink-500' : ''}`}>
                    {item.label}
                  </span>
                  {isActive && (
                    <div className="w-1 h-1 rounded-full gradient-pink-purple mt-0.5" />
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

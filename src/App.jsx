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

export default function App() {
  const [view, setView] = useState('home')
  const [viewData, setViewData] = useState({})
  const [toastQueue, setToastQueue] = useState([])

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
    setView(v)
    setViewData(data)
  }, [])

  const handleStartExam = useCallback((paperId) => {
    navigate('exam', { paperId })
  }, [navigate])

  const dismissToast = useCallback(() => {
    setToastQueue(q => q.slice(1))
  }, [])

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
    <div className="max-w-xl mx-auto px-4 pb-16 min-h-screen">
      {toastQueue.length > 0 && (
        <AchievementToast achievement={toastQueue[0]} onDone={dismissToast} />
      )}
      {renderView()}
    </div>
  )
}

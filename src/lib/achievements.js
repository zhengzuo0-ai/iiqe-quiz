export const ACHIEVEMENTS = [
  { id: 'first_correct', name: '初试牛刀', desc: '答对第一道题', icon: '⭐', check: (s) => s.totalCorrect >= 1 },
  { id: 'ten_questions', name: '勤学好问', desc: '累计做满10题', icon: '📝', check: (s) => s.totalAnswered >= 10 },
  { id: 'fifty_questions', name: '半百之功', desc: '累计做满50题', icon: '📚', check: (s) => s.totalAnswered >= 50 },
  { id: 'hundred_questions', name: '百题斩', desc: '累计做满100题', icon: '💯', check: (s) => s.totalAnswered >= 100 },
  { id: 'two_hundred', name: '刷题达人', desc: '累计做满200题', icon: '🏆', check: (s) => s.totalAnswered >= 200 },
  { id: 'streak_3', name: '小试身手', desc: '连续答对3题', icon: '🔥', check: (s) => s.maxStreak >= 3 },
  { id: 'streak_5', name: '势如破竹', desc: '连续答对5题', icon: '💪', check: (s) => s.maxStreak >= 5 },
  { id: 'streak_10', name: '十全十美', desc: '连续答对10题', icon: '🌟', check: (s) => s.maxStreak >= 10 },
  { id: 'streak_20', name: '无人能挡', desc: '连续答对20题', icon: '👑', check: (s) => s.maxStreak >= 20 },
  { id: 'pass_exam', name: '模拟通过', desc: '模拟考试达到70%', icon: '🎓', check: (s) => s.examPassed >= 1 },
  { id: 'perfect_exam', name: '完美发挥', desc: '模拟考试100%正确', icon: '💎', check: (s) => s.perfectExam >= 1 },
  { id: 'all_chapters', name: '全面覆盖', desc: '每个章节都做过题', icon: '🗺️', check: (s) => s.chaptersStarted >= 12 },
  { id: 'error_master', name: '知错能改', desc: '从错题本掌握10道题', icon: '🦋', check: (s) => s.errorsMastered >= 10 },
  { id: 'daily_30', name: '日练30题', desc: '一天内做满30题', icon: '🌸', check: (s) => s.dailyMax >= 30 },
  { id: 'high_acc', name: '准确率80%', desc: '总正确率达到80%', icon: '🎯', check: (s) => s.totalAnswered >= 20 && (s.totalCorrect / s.totalAnswered) >= 0.8 },
]

export function checkNewAchievements(stats, unlockedIds) {
  return ACHIEVEMENTS.filter(a => !unlockedIds.includes(a.id) && a.check(stats))
}

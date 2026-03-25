import { PAPERS } from '../data/chapters'

const CHAPTER_EMOJI = {
  // Paper 1
  '1-1': '🛡️', '1-2': '⚖️', '1-3': '📋', '1-4': '⚙️', '1-5': '🏷️', '1-6': '🏛️', '1-7': '🤝',
  // Paper 3
  '3-1': '💰', '3-2': '📄', '3-3': '🔍', '3-4': '📊', '3-5': '📏',
}

export default function ChapterList({ paperId, stats, onBack, onSelectChapter }) {
  const paper = PAPERS[paperId]
  const { getStat, getAcc } = stats

  return (
    <div className="animate-fade-in">
      <button onClick={onBack} className="text-pink-400 text-sm mb-4 hover:text-pink-500 transition-colors font-medium">
        ← 返回首页
      </button>

      <div className="gradient-banner rounded-2xl px-5 py-5 mb-5 text-white">
        <h2 className="font-display text-2xl font-semibold mb-1">{paper.name}</h2>
        <p className="text-xs text-white/70">{paper.examDate} · 及格线 {paper.passRate}</p>
      </div>

      <div className="stagger-children space-y-2.5">
        {paper.chapters.map(ch => {
          const acc = getAcc(ch.id)
          const s = getStat(ch.id)
          const emoji = CHAPTER_EMOJI[ch.id] || '📖'
          return (
            <button
              key={ch.id}
              onClick={() => onSelectChapter(ch)}
              className="w-full glass-card-solid rounded-xl p-4 text-left card-hover"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-start gap-3">
                  <span className="text-lg mt-0.5">{emoji}</span>
                  <div>
                    <div className="text-[15px] text-charcoal font-medium">{ch.name}</div>
                    <div className="text-xs text-charcoal-light/45 mt-1">{ch.nameEn} · 占比{ch.weight}%</div>
                  </div>
                </div>
                <div className="text-right">
                  {s.total > 0 ? (
                    <>
                      <div className={`font-display text-lg font-semibold ${acc >= 70 ? 'text-mint-600' : acc >= 50 ? 'text-warm-500' : 'text-coral-500'}`}>
                        {acc}%
                      </div>
                      <div className="text-[10px] text-charcoal-light/40">{s.total}题</div>
                    </>
                  ) : (
                    <div className="text-xs text-charcoal-light/25">未开始</div>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

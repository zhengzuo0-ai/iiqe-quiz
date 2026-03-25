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
      <button onClick={onBack} className="text-pink-400 text-sm mb-4 hover:text-pink-500 transition-colors">
        ← 返回首页
      </button>

      <div className="gradient-banner rounded-2xl px-5 py-4 mb-5 text-white">
        <h2 className="text-xl font-normal mb-1">{paper.name}</h2>
        <p className="text-xs text-white/80">{paper.examDate} · 及格线 {paper.passRate}</p>
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
              className="w-full glass-card-solid rounded-xl p-4 text-left card-hover border-l-4 border-l-transparent"
              style={{
                borderLeftColor: s.total > 0
                  ? (acc >= 70 ? '#4ade80' : acc >= 50 ? '#d4a574' : '#fb7185')
                  : '#e5e7eb',
              }}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-start gap-3">
                  <span className="text-lg mt-0.5">{emoji}</span>
                  <div>
                    <div className="text-[15px] text-gray-800">{ch.name}</div>
                    <div className="text-xs text-gray-400 mt-1">{ch.nameEn} · 占比{ch.weight}%</div>
                  </div>
                </div>
                <div className="text-right">
                  {s.total > 0 ? (
                    <>
                      <div className={`text-lg font-light ${acc >= 70 ? 'text-mint-600' : acc >= 50 ? 'text-warm-500' : 'text-coral-500'}`}>
                        {acc}%
                      </div>
                      <div className="text-[10px] text-gray-400">{s.total}题</div>
                    </>
                  ) : (
                    <div className="text-xs text-gray-300">未开始</div>
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

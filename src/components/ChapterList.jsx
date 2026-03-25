import { PAPERS } from '../data/chapters'

export default function ChapterList({ paperId, stats, onBack, onSelectChapter }) {
  const paper = PAPERS[paperId]
  const { getStat, getAcc } = stats

  return (
    <div className="animate-fade-in">
      <button onClick={onBack} className="text-pink-400 text-sm mb-4 hover:text-pink-500 transition-colors">
        ← 返回首页
      </button>
      <h2 className="text-xl font-normal text-gray-800 mb-1">{paper.name}</h2>
      <p className="text-xs text-gray-400 mb-5">{paper.examDate} · 及格线 {paper.passRate}</p>

      <div className="space-y-2.5">
        {paper.chapters.map(ch => {
          const acc = getAcc(ch.id)
          const s = getStat(ch.id)
          return (
            <button
              key={ch.id}
              onClick={() => onSelectChapter(ch)}
              className="w-full bg-white rounded-xl p-4 border border-pink-100 text-left hover:border-pink-200 hover:shadow-sm active:scale-[0.99] transition-all"
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-[15px] text-gray-800">{ch.name}</div>
                  <div className="text-xs text-gray-400 mt-1">{ch.nameEn} · 占比{ch.weight}%</div>
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

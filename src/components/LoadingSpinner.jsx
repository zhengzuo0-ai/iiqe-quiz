export default function LoadingSpinner({ text = 'AI 正在出题...' }) {
  return (
    <div className="text-center py-16">
      <div className="inline-block text-4xl animate-pencil mb-4">✏️</div>
      <div className="animate-shimmer h-1.5 w-32 mx-auto rounded-full mb-4" />
      <p className="text-pink-400 text-sm font-medium">{text}</p>
      <p className="text-xs text-charcoal-light/30 mt-2">请稍等，马上就好~</p>
    </div>
  )
}

export function PageLoading({ text = '加载中...' }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <div className="text-5xl animate-float mb-4">📚</div>
      <div className="animate-shimmer h-1.5 w-40 rounded-full mb-4" />
      <p className="text-pink-400 text-sm font-medium">{text}</p>
    </div>
  )
}

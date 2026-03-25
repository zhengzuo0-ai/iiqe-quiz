export default function LoadingSpinner({ text = 'AI 正在出题...' }) {
  return (
    <div className="text-center py-16">
      <div className="inline-block text-4xl animate-bounce mb-4">📝</div>
      <div className="animate-shimmer h-1 w-32 mx-auto rounded-full mb-4" />
      <p className="text-pink-400 text-sm">{text}</p>
    </div>
  )
}

export function PageLoading({ text = '加载中...' }) {
  return (
    <div className="min-h-screen bg-pink-50 flex flex-col items-center justify-center">
      <div className="text-5xl animate-bounce mb-4">📚</div>
      <div className="animate-shimmer h-1 w-40 rounded-full mb-4" />
      <p className="text-pink-400 text-sm">{text}</p>
    </div>
  )
}

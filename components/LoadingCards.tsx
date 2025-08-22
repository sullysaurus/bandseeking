export default function LoadingCards({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
          <div className="aspect-square bg-gray-200" />
          <div className="p-3 sm:p-4 space-y-3">
            <div className="h-6 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded" />
              <div className="h-3 bg-gray-200 rounded" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
            </div>
            <div className="flex gap-2">
              <div className="h-8 bg-gray-200 rounded flex-1" />
              <div className="h-8 bg-gray-200 rounded w-8" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
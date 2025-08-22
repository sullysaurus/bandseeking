export default function SearchLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation skeleton */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="flex space-x-4">
            <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Header Skeleton */}
        <div className="mb-8">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-4"></div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-12 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>

        {/* Results Count Skeleton */}
        <div className="mb-4">
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Results Grid Skeleton */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Image skeleton */}
              <div className="aspect-square bg-gray-200 animate-pulse"></div>
              
              {/* Content skeleton */}
              <div className="p-4 space-y-3">
                <div className="space-y-2">
                  <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
                </div>
                
                <div className="space-y-2">
                  <div className="h-3 w-full bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 w-2/3 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse"></div>
                </div>

                <div className="flex flex-wrap gap-1">
                  <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-6 w-12 bg-gray-200 rounded animate-pulse"></div>
                </div>

                <div className="space-y-2">
                  <div className="h-8 w-full bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-8 w-full bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
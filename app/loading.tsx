import { Music } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center">
        <div className="relative">
          <Music className="w-12 h-12 text-black animate-pulse mx-auto mb-4" />
          <div className="absolute inset-0 w-12 h-12 border-2 border-gray-200 border-t-black rounded-full animate-spin mx-auto"></div>
        </div>
        <h2 className="text-xl font-semibold mb-2">BandSeeking</h2>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  )
}
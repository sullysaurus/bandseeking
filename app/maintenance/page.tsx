import { Construction, Clock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import Button from '@/components/ui/Button'

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-6">
            <Construction className="w-8 h-8 text-yellow-600" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Under Maintenance</h1>
          <p className="text-gray-600 mb-6">
            BandSeeking is currently undergoing scheduled maintenance to improve your experience.
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-center mb-4">
            <Clock className="w-5 h-5 text-gray-500 mr-2" />
            <span className="font-medium">Expected Duration</span>
          </div>
          <p className="text-2xl font-bold mb-2">30 minutes</p>
          <p className="text-sm text-gray-600">
            We&apos;ll be back online shortly. Thank you for your patience!
          </p>
        </div>

        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            <p className="mb-2">What we&apos;re working on:</p>
            <ul className="text-left space-y-1">
              <li>• Performance improvements</li>
              <li>• Database optimizations</li>
              <li>• New feature deployment</li>
              <li>• Security updates</li>
            </ul>
          </div>

          <Link href="/">
            <Button variant="ghost" className="flex items-center mx-auto">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="mt-8 text-xs text-gray-500">
          <p>Follow us for updates:</p>
          <div className="mt-2 space-x-4">
            <span className="hover:text-black cursor-pointer">Twitter</span>
            <span className="hover:text-black cursor-pointer">Instagram</span>
            <span className="hover:text-black cursor-pointer">Status Page</span>
          </div>
        </div>
      </div>
    </div>
  )
}
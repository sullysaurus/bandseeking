import Link from 'next/link'
import { Music, MapPin, Users, Settings, Home, Flag } from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white border-b-4 border-black shadow-[0_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-8">
              <Link href="/admin" className="text-2xl font-black text-gray-900">
                BANDSEEKING ADMIN
              </Link>
              
              <nav className="hidden md:flex items-center gap-6">
                <Link 
                  href="/admin/venues" 
                  className="flex items-center gap-2 px-4 py-2 font-bold text-gray-700 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <MapPin className="w-4 h-4" />
                  VENUES
                </Link>
                
                <Link 
                  href="/admin/users" 
                  className="flex items-center gap-2 px-4 py-2 font-bold text-gray-700 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Users className="w-4 h-4" />
                  USERS
                </Link>

                <Link 
                  href="/admin/reports" 
                  className="flex items-center gap-2 px-4 py-2 font-bold text-gray-700 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Flag className="w-4 h-4" />
                  REPORTS
                </Link>
                
                <Link 
                  href="/admin/settings" 
                  className="flex items-center gap-2 px-4 py-2 font-bold text-gray-700 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  SETTINGS
                </Link>
              </nav>
            </div>
            
            <div className="flex items-center gap-4">
              <Link 
                href="/" 
                className="flex items-center gap-2 px-4 py-2 bg-blue-400 border-2 border-black font-black text-black hover:bg-blue-500 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                <Home className="w-4 h-4" />
                VIEW SITE
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  )
}
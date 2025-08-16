'use client'

import { Users, Music, User, MessageSquare, Plus, Home, Briefcase } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

const navigationItems = [
  {
    name: 'Home',
    href: '/dashboard',
    icon: Home
  },
  {
    name: 'Musicians',
    href: '/find-musicians', 
    icon: Users
  },
  {
    name: 'Menu',
    href: '#',
    icon: Plus,
    isAction: true
  },
  {
    name: 'Messages',
    href: '/messages',
    icon: MessageSquare,
    badge: true
  },
  {
    name: 'Profile',
    href: '/profile',
    icon: User
  }
]

export default function MobileNavigation() {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const [showCreateMenu, setShowCreateMenu] = useState(false)

  // Don't show mobile navigation if user is not logged in or still loading
  if (loading || !user) {
    return null
  }

  const handleCreateClick = () => {
    setShowCreateMenu(!showCreateMenu)
  }

  return (
    <>
      {/* Create Menu Overlay */}
      {showCreateMenu && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setShowCreateMenu(false)}
        >
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-card rounded-2xl p-4 shadow-2xl max-w-xs w-full mx-4">
            <div className="flex flex-col gap-2">
              {/* Create Actions */}
              <div className="text-xs text-medium uppercase tracking-wider mb-2 px-4">Create</div>
              <a 
                href="/bands/create"
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-background transition-colors text-left"
                onClick={() => setShowCreateMenu(false)}
              >
                <div className="w-10 h-10 bg-accent-teal rounded-full flex items-center justify-center">
                  <Plus className="w-5 h-5 text-black" />
                </div>
                <div>
                  <div className="text-white font-medium">Start a Band</div>
                  <div className="text-secondary text-xs">Create your band profile</div>
                </div>
              </a>
              <a 
                href="/opportunities/create"
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-background transition-colors text-left"
                onClick={() => setShowCreateMenu(false)}
              >
                <div className="w-10 h-10 bg-accent-purple rounded-full flex items-center justify-center">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-white font-medium">Post Opportunity</div>
                  <div className="text-secondary text-xs">List a gig or collaboration</div>
                </div>
              </a>
              
              {/* Quick Access */}
              <div className="text-xs text-medium uppercase tracking-wider mt-2 mb-2 px-4 pt-2 border-t border-border">Quick Access</div>
              <a 
                href="/bands"
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-background transition-colors text-left"
                onClick={() => setShowCreateMenu(false)}
              >
                <div className="w-10 h-10 bg-background rounded-full flex items-center justify-center">
                  <Music className="w-5 h-5 text-accent-teal" />
                </div>
                <div>
                  <div className="text-white font-medium">My Bands</div>
                  <div className="text-secondary text-xs">Manage your bands</div>
                </div>
              </a>
              <a 
                href="/find-bands"
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-background transition-colors text-left"
                onClick={() => setShowCreateMenu(false)}
              >
                <div className="w-10 h-10 bg-background rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-accent-purple" />
                </div>
                <div>
                  <div className="text-white font-medium">Find Bands</div>
                  <div className="text-secondary text-xs">Discover bands to join</div>
                </div>
              </a>
              <a 
                href="/opportunities"
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-background transition-colors text-left"
                onClick={() => setShowCreateMenu(false)}
              >
                <div className="w-10 h-10 bg-background rounded-full flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-success" />
                </div>
                <div>
                  <div className="text-white font-medium">Opportunities</div>
                  <div className="text-secondary text-xs">Browse gigs & collabs</div>
                </div>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-sidebar/95 backdrop-blur-md border-t border-card z-30 md:hidden">
        <div className="flex items-center justify-around py-2 px-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href === '/dashboard' && pathname === '/') ||
              (item.href === '/find-musicians' && pathname.startsWith('/find-musicians'))
            
            if (item.isAction) {
              return (
                <button
                  key={item.name}
                  onClick={handleCreateClick}
                  className="flex flex-col items-center py-2 px-2 min-w-[64px] relative"
                >
                  <div className="w-12 h-12 bg-accent-teal rounded-full flex items-center justify-center mb-1 shadow-lg transform -translate-y-1">
                    <item.icon className="w-6 h-6 text-black" />
                  </div>
                  <span className="text-xs text-white font-medium">Menu</span>
                </button>
              )
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center py-2 px-2 min-w-[64px] transition-colors ${
                  isActive 
                    ? 'text-accent-teal' 
                    : 'text-secondary hover:text-white'
                }`}
              >
                <div className="relative mb-1">
                  <item.icon className="w-6 h-6" />
                  {item.badge && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                  )}
                </div>
                <span className="text-xs font-medium">{item.name}</span>
              </Link>
            )
          })}
        </div>
        
        {/* Safe area padding for devices with home indicator */}
        <div style={{ height: 'env(safe-area-inset-bottom, 0px)' }} className="bg-sidebar/95"></div>
      </nav>
    </>
  )
}
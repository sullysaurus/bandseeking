'use client'

import { Users, Music, User, MessageSquare, Plus, Home } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const navigationItems = [
  {
    name: 'Home',
    href: '/find-bands',
    icon: Home
  },
  {
    name: 'Musicians',
    href: '/find-musicians', 
    icon: Users
  },
  {
    name: 'Create',
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
  const pathname = usePathname()
  const [showCreateMenu, setShowCreateMenu] = useState(false)

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
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-card rounded-2xl p-4 shadow-2xl">
            <div className="flex flex-col gap-3 min-w-[200px]">
              <a 
                href="/bands/create"
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-background transition-colors text-left"
                onClick={() => setShowCreateMenu(false)}
              >
                <div className="w-10 h-10 bg-accent-teal rounded-full flex items-center justify-center">
                  <Music className="w-5 h-5 text-black" />
                </div>
                <div>
                  <div className="text-white font-medium">Start a Band</div>
                  <div className="text-secondary text-sm">Create your band profile</div>
                </div>
              </a>
              <button className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-background transition-colors text-left">
                <div className="w-10 h-10 bg-accent-purple rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-white font-medium">Post Opportunity</div>
                  <div className="text-secondary text-sm">Find musicians to join</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-sidebar border-t border-card z-30 md:hidden">
        <div className="flex items-center justify-around py-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href === '/find-bands' && pathname === '/') ||
              (item.href === '/find-musicians' && pathname.startsWith('/find-musicians'))
            
            if (item.isAction) {
              return (
                <button
                  key={item.name}
                  onClick={handleCreateClick}
                  className="flex flex-col items-center py-2 px-3 min-w-[60px]"
                >
                  <div className="w-11 h-11 bg-accent-teal rounded-full flex items-center justify-center mb-1 shadow-lg">
                    <item.icon className="w-6 h-6 text-black" />
                  </div>
                  <span className="text-xs text-white font-medium">Create</span>
                </button>
              )
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center py-2 px-3 min-w-[60px] transition-colors ${
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
        <div style={{ height: 'env(safe-area-inset-bottom, 0px)' }} className="bg-sidebar"></div>
      </nav>
    </>
  )
}
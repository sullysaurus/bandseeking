'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Menu, X, User, MessageSquare, Search, LogOut } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function Navigation() {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        // Get user profile for username
        const { data: userData } = await supabase
          .from('users')
          .select('username')
          .eq('id', user.id)
          .single()
        
        setUserProfile(userData)
      }
      setIsLoading(false)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setUserProfile(null) // Reset profile when user changes
      setIsLoading(false) // Auth state has been determined
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold text-black hover:text-blue-600 transition-colors">
            BandSeeking
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/search" className="flex items-center space-x-1 text-gray-600 hover:text-black transition-colors">
              <Search className="w-4 h-4" />
              <span>Search</span>
            </Link>

            {isLoading ? (
              // Show placeholder while loading to prevent flash
              <div className="flex items-center space-x-4">
                <div className="w-16 h-7 bg-gray-200 rounded animate-pulse" />
                <div className="w-20 h-7 bg-gray-200 rounded animate-pulse" />
              </div>
            ) : user ? (
              <>
                <Link href="/dashboard/messages" className="flex items-center space-x-1 text-gray-600 hover:text-black transition-colors">
                  <MessageSquare className="w-4 h-4" />
                  <span>Messages</span>
                </Link>
                <Link href="/dashboard" className="flex items-center space-x-1 text-gray-600 hover:text-black transition-colors">
                  <User className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-1 text-gray-600 hover:text-black transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-black hover:bg-gray-100">Sign In</Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-300 hover:text-white"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-4 space-y-2">
            <Link
              href="/search"
              className="block px-4 py-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg"
              onClick={() => setIsMenuOpen(false)}
            >
              Search Musicians
            </Link>

            {isLoading ? (
              // Mobile loading state
              <div className="space-y-2">
                <div className="h-10 bg-gray-200 rounded-lg animate-pulse" />
                <div className="h-10 bg-gray-200 rounded-lg animate-pulse" />
              </div>
            ) : user ? (
              <>
                <Link
                  href="/dashboard/messages"
                  className="block px-4 py-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Messages
                </Link>
                <Link
                  href="/dashboard"
                  className="block px-4 py-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    handleSignOut()
                    setIsMenuOpen(false)
                  }}
                  className="block w-full text-left px-4 py-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="block px-4 py-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="block px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
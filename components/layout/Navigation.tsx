'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Search, MapPin, MessageSquare, Home, LogOut, UserPlus, LogIn } from 'lucide-react'

export default function Navigation() {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setIsLoading(false)
      
      if (user) {
        await fetchUnreadCount(user.id)
        subscribeToMessages(user.id)
      }
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setIsLoading(false)
      
      if (session?.user) {
        fetchUnreadCount(session.user.id)
        subscribeToMessages(session.user.id)
      } else {
        setUnreadCount(0)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUnreadCount = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('id')
        .eq('receiver_id', userId)
        .eq('read', false)

      if (error) throw error
      setUnreadCount(data?.length || 0)
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  }

  const subscribeToMessages = (userId: string) => {
    const subscription = supabase
      .channel('navigation_messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId}`
        },
        () => {
          fetchUnreadCount(userId)
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b-4 border-black">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href={user ? "/dashboard" : "/"} className="text-2xl font-black hover:text-pink-400 transition-colors">
            BANDSEEKING
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <Link href="/search" className="px-3 py-1 bg-pink-400 border-2 border-black font-black text-sm hover:bg-pink-500 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              MUSICIANS
            </Link>
            <Link href="/venues" className="px-3 py-1 bg-orange-400 border-2 border-black font-black text-sm hover:bg-orange-500 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              VENUES
            </Link>
         
            {isLoading ? (
              <span className="px-3 py-1 font-black text-sm">LOADING...</span>
            ) : user ? (
              <>
                <Link href="/dashboard/messages" className="relative px-3 py-1 bg-cyan-300 border-2 border-black font-black text-sm hover:bg-cyan-400 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  MESSAGES
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-black min-w-[20px] h-5 rounded-full flex items-center justify-center border-2 border-black">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>
                <Link href="/dashboard" className="px-3 py-1 bg-lime-300 border-2 border-black font-black text-sm hover:bg-lime-400 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  DASHBOARD
                </Link>
                <button onClick={handleSignOut} className="px-3 py-1 bg-white border-2 border-black font-black text-sm hover:bg-red-400 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  SIGN OUT
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="px-3 py-1 bg-white border-2 border-black font-black text-sm hover:bg-cyan-300 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  SIGN IN
                </Link>
                <Link href="/auth/register" className="px-3 py-1 bg-pink-400 border-2 border-black font-black text-sm hover:bg-pink-500 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  JOIN
                </Link>
              </>
            )}
          </div>

          {/* Mobile Icon Navigation */}
          <div className="flex md:hidden items-center gap-2">
            <Link href="/search" className="p-2 bg-pink-400 border-2 border-black hover:bg-pink-500 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Search className="w-5 h-5 text-black" />
            </Link>
            <Link href="/venues" className="p-2 bg-orange-400 border-2 border-black hover:bg-orange-500 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <MapPin className="w-5 h-5 text-black" />
            </Link>
            
            {isLoading ? (
              <div className="p-2 bg-gray-200 border-2 border-black">
                <div className="w-5 h-5"></div>
              </div>
            ) : user ? (
              <>
                <Link href="/dashboard/messages" className="relative p-2 bg-cyan-300 border-2 border-black hover:bg-cyan-400 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <MessageSquare className="w-5 h-5 text-black" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-black min-w-[16px] h-4 rounded-full flex items-center justify-center border border-black">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
                <Link href="/dashboard" className="p-2 bg-lime-300 border-2 border-black hover:bg-lime-400 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <Home className="w-5 h-5 text-black" />
                </Link>
                <button onClick={handleSignOut} className="p-2 bg-white border-2 border-black hover:bg-red-400 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <LogOut className="w-5 h-5 text-black" />
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="p-2 bg-white border-2 border-black hover:bg-cyan-300 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <LogIn className="w-5 h-5 text-black" />
                </Link>
                <Link href="/auth/register" className="p-2 bg-pink-400 border-2 border-black hover:bg-pink-500 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <UserPlus className="w-5 h-5 text-black" />
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
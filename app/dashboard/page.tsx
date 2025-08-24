'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { ensureUserRecord } from '@/lib/auth-helpers'
import Navigation from '@/components/layout/Navigation'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [savedCount, setSavedCount] = useState(0)
  const [messageCount, setMessageCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const userData = await ensureUserRecord()
      
      // Allow access to dashboard even without completed profile

      setUser(userData)

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userData.id)
        .single()

      setProfile(profileData)

      const { count: savedProfilesCount } = await supabase
        .from('saved_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userData.id)

      setSavedCount(savedProfilesCount || 0)

      const { count: unreadCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', userData.id)
        .eq('read', false)

      setMessageCount(unreadCount || 0)
    } catch (error) {
      console.error('Error loading dashboard:', error)
      router.push('/auth/login')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-lime-300 flex items-center justify-center">
          <div className="font-black text-2xl">LOADING...</div>
        </div>
      </>
    )
  }

  if (!user) return null

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-lime-300">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-black mb-2">WELCOME BACK!</h1>
            <p className="font-bold text-xl">{user.full_name.toUpperCase()}</p>
            {user.email === 'dsully15@gmail.com' && (
              <Link href="/admin" className="inline-block mt-4 px-4 py-2 bg-red-500 border-4 border-black font-black text-white hover:bg-red-600 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                ADMIN PANEL →
              </Link>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
              <p className="font-black text-sm mb-1">STATUS</p>
              <p className="text-2xl font-black text-pink-400">
                {profile?.is_published ? 'LIVE' : 'DRAFT'}
              </p>
            </div>

            <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
              <p className="font-black text-sm mb-1">SAVED</p>
              <p className="text-2xl font-black text-cyan-500">{savedCount}</p>
            </div>

            <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
              <p className="font-black text-sm mb-1">MESSAGES</p>
              <p className="text-2xl font-black text-yellow-500">{messageCount}</p>
            </div>

            <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
              <p className="font-black text-sm mb-1">VIEWS</p>
              <p className="text-2xl font-black">-</p>
            </div>
          </div>

          {/* Main Actions */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <Link href="/dashboard/profile" className="block">
              <div className="bg-pink-400 border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
                <h2 className="text-2xl font-black mb-4">EDIT PROFILE</h2>
                <p className="font-bold mb-4">
                  Update your info, add photos, set your vibe.
                </p>
                <div className="bg-black text-white px-4 py-2 font-black text-center hover:bg-white hover:text-black border-2 border-black transition-colors">
                  MANAGE →
                </div>
              </div>
            </Link>

            {/* Messages Card */}
            <Link href="/dashboard/messages" className="block">
              <div className="bg-cyan-300 border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-black">MESSAGES</h2>
                  {messageCount > 0 && (
                    <span className="px-2 py-1 bg-red-500 text-white font-black text-xs">
                      {messageCount}
                    </span>
                  )}
                </div>
                <p className="font-bold mb-4">
                  Chat with other musicians.
                </p>
                <div className="bg-black text-white px-4 py-2 font-black text-center hover:bg-white hover:text-black border-2 border-black transition-colors">
                  VIEW →
                </div>
              </div>
            </Link>

            {/* Saved Musicians Card */}
            <Link href="/dashboard/saved" className="block">
              <div className="bg-yellow-300 border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
                <h2 className="text-2xl font-black mb-4">SAVED</h2>
                <p className="font-bold mb-4">
                  Musicians you&apos;ve bookmarked.
                </p>
                <div className="bg-black text-white px-4 py-2 font-black text-center hover:bg-white hover:text-black border-2 border-black transition-colors">
                  VIEW ({savedCount}) →
                </div>
              </div>
            </Link>

            {/* Settings Card */}
            <Link href="/dashboard/profile" className="block">
              <div className="bg-white border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
                <h2 className="text-2xl font-black mb-4">SETTINGS</h2>
                <p className="font-bold mb-4">
                  Account and privacy settings.
                </p>
                <div className="bg-black text-white px-4 py-2 font-black text-center hover:bg-white hover:text-black border-2 border-black transition-colors">
                  MANAGE →
                </div>
              </div>
            </Link>

            {/* View Public Profile */}
            {user && (
              <Link href={`/profile/${user.username}`} className="block">
                <div className="bg-lime-400 border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
                  <h2 className="text-2xl font-black mb-4">YOUR PROFILE</h2>
                  <p className="font-bold mb-4">
                    See your public profile.
                  </p>
                  <div className="bg-black text-white px-4 py-2 font-black text-center hover:bg-white hover:text-black border-2 border-black transition-colors">
                    VIEW →
                  </div>
                </div>
              </Link>
            )}

            {/* Browse Musicians */}
            <Link href="/search" className="block">
              <div className="bg-black text-white border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] transition-all">
                <h2 className="text-2xl font-black mb-4 text-yellow-300">FIND MUSICIANS</h2>
                <p className="font-bold mb-4">
                  Connect with local talent.
                </p>
                <div className="bg-white text-black px-4 py-2 font-black text-center hover:bg-yellow-300 border-2 border-white transition-colors">
                  BROWSE →
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
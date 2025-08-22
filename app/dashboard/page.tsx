'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { ensureUserRecord } from '@/lib/auth-helpers'
import Navigation from '@/components/layout/Navigation'
import Button from '@/components/ui/Button'
import { User, MessageSquare, Heart, Settings, Edit, Eye } from 'lucide-react'

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
      // Ensure user record exists and get user data
      const userData = await ensureUserRecord()
      
      // Check if user has completed profile setup
      if (!userData.profile_completed) {
        router.push('/onboarding')
        return
      }

      setUser(userData)

      // Get profile data
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userData.id)
        .single()

      setProfile(profileData)

      // Get saved profiles count
      const { count: savedProfilesCount } = await supabase
        .from('saved_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userData.id)

      setSavedCount(savedProfilesCount || 0)

      // Get unread messages count
      const { count: unreadCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', userData.id)
        .eq('read', false)

      setMessageCount(unreadCount || 0)
    } catch (error) {
      console.error('Error loading dashboard:', error)
      // If there's an auth error, redirect to login
      router.push('/auth/login')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse">Loading dashboard...</div>
        </div>
      </>
    )
  }

  if (!user) {
    return null
  }

  return (
    <>
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user.full_name}!</h1>
          <p className="text-gray-600">Manage your profile and connections</p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Profile Status</p>
                <p className="text-2xl font-bold">
                  {profile?.is_published ? 'Published' : 'Draft'}
                </p>
              </div>
              <Eye className="w-8 h-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Saved Musicians</p>
                <p className="text-2xl font-bold">{savedCount}</p>
              </div>
              <Heart className="w-8 h-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unread Messages</p>
                <p className="text-2xl font-bold">{messageCount}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Profile Views</p>
                <p className="text-2xl font-bold">-</p>
              </div>
              <User className="w-8 h-8 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Main Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Link href="/dashboard/profile" className="block">
            <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <Edit className="w-6 h-6 mr-2" />
                <h2 className="text-xl font-semibold">Edit Profile</h2>
              </div>
              <p className="text-gray-600 mb-4">
                Update your information, add new photos, and manage your musical preferences.
              </p>
              <Button variant="secondary" className="w-full">
                Manage Profile
              </Button>
            </div>
          </Link>

          {/* Messages Card */}
          <Link href="/dashboard/messages" className="block">
            <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <MessageSquare className="w-6 h-6 mr-2" />
                <h2 className="text-xl font-semibold">Messages</h2>
                {messageCount > 0 && (
                  <span className="ml-2 px-2 py-1 bg-black text-white text-xs rounded-full">
                    {messageCount} new
                  </span>
                )}
              </div>
              <p className="text-gray-600 mb-4">
                Connect with other musicians and manage your conversations.
              </p>
              <Button variant="secondary" className="w-full">
                View Messages
              </Button>
            </div>
          </Link>

          {/* Saved Musicians Card */}
          <Link href="/dashboard/saved" className="block">
            <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <Heart className="w-6 h-6 mr-2" />
                <h2 className="text-xl font-semibold">Saved Musicians</h2>
              </div>
              <p className="text-gray-600 mb-4">
                View and manage musicians you&apos;ve saved for future collaboration.
              </p>
              <Button variant="secondary" className="w-full">
                View Saved ({savedCount})
              </Button>
            </div>
          </Link>

          {/* Settings Card */}
          <Link href="/dashboard/profile" className="block">
            <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <Settings className="w-6 h-6 mr-2" />
                <h2 className="text-xl font-semibold">Settings</h2>
              </div>
              <p className="text-gray-600 mb-4">
                Manage your account settings, privacy, and notifications.
              </p>
              <Button variant="secondary" className="w-full">
                Account Settings
              </Button>
            </div>
          </Link>

          {/* View Public Profile */}
          {user && (
            <Link href={`/profile/${user.username}`} className="block">
              <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <Eye className="w-6 h-6 mr-2" />
                  <h2 className="text-xl font-semibold">View Public Profile</h2>
                </div>
                <p className="text-gray-600 mb-4">
                  See how your profile appears to other musicians.
                </p>
                <Button variant="secondary" className="w-full">
                  View Profile
                </Button>
              </div>
            </Link>
          )}

          {/* Browse Musicians */}
          <Link href="/search" className="block">
            <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <User className="w-6 h-6 mr-2" />
                <h2 className="text-xl font-semibold">Browse Musicians</h2>
              </div>
              <p className="text-gray-600 mb-4">
                Discover and connect with musicians in your area.
              </p>
              <Button className="w-full">
                Start Browsing
              </Button>
            </div>
          </Link>
        </div>

        {/* Sign Out Button */}
        <div className="mt-8 flex justify-center">
          <Button variant="ghost" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </div>
    </>
  )
}
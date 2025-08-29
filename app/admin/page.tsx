'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Button from '@/components/ui/Button'
import { Users, Shield, BarChart3, Settings, AlertTriangle, Database, MapPin, Flag } from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProfiles: 0,
    publishedProfiles: 0,
    totalMessages: 0,
    totalVenues: 0
  })

  useEffect(() => {
    checkAdminAccess()
  }, [])

  const checkAdminAccess = async () => {
    try {
      const { data: { user: authUser }, error } = await supabase.auth.getUser()
      
      if (error || !authUser) {
        router.push('/auth/login')
        return
      }

      // Check if user is admin (dsully15@gmail.com)
      if (authUser.email !== 'dsully15@gmail.com') {
        router.push('/dashboard')
        return
      }

      setUser(authUser)
      await fetchStats()
    } catch (error) {
      console.error('Error checking admin access:', error)
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      // Get total users
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

      // Get total profiles
      const { count: totalProfiles } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      // Get published profiles
      const { count: publishedProfiles } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true)

      // Get total messages
      const { count: totalMessages } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })

      // Get total venues
      const { count: totalVenues } = await supabase
        .from('venues')
        .select('*', { count: 'exact', head: true })

      setStats({
        totalUsers: totalUsers || 0,
        totalProfiles: totalProfiles || 0,
        publishedProfiles: publishedProfiles || 0,
        totalMessages: totalMessages || 0,
        totalVenues: totalVenues || 0
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-purple-400 flex items-center justify-center">
        <div className="bg-white border-8 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-black border-t-transparent animate-spin mx-auto mb-4"></div>
            <p className="font-black text-xl">CHECKING ADMIN ACCESS...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-lime-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8 text-center">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
              <div className="bg-red-500 border-4 border-black p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black">ADMIN DASHBOARD</h1>
            </div>
            <p className="font-bold text-base sm:text-xl">SYSTEM ADMINISTRATION AND USER MANAGEMENT</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white border-4 border-black p-4 sm:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-black text-xs sm:text-sm mb-1">TOTAL USERS</p>
                  <p className="text-2xl sm:text-4xl font-black text-blue-600">{stats.totalUsers}</p>
                </div>
                <div className="bg-blue-400 border-2 border-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <Users className="w-6 h-6 sm:w-8 sm:h-8 text-black" />
                </div>
              </div>
            </div>

            <div className="bg-white border-4 border-black p-4 sm:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-black text-xs sm:text-sm mb-1">TOTAL PROFILES</p>
                  <p className="text-2xl sm:text-4xl font-black text-green-600">{stats.totalProfiles}</p>
                </div>
                <div className="bg-green-400 border-2 border-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <Database className="w-6 h-6 sm:w-8 sm:h-8 text-black" />
                </div>
              </div>
            </div>

            <div className="bg-white border-4 border-black p-4 sm:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-black text-xs sm:text-sm mb-1">PUBLISHED</p>
                  <p className="text-2xl sm:text-4xl font-black text-purple-600">{stats.publishedProfiles}</p>
                </div>
                <div className="bg-purple-400 border-2 border-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-black" />
                </div>
              </div>
            </div>

            <div className="bg-white border-4 border-black p-4 sm:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-black text-xs sm:text-sm mb-1">TOTAL VENUES</p>
                  <p className="text-2xl sm:text-4xl font-black text-orange-600">{stats.totalVenues}</p>
                </div>
                <div className="bg-orange-400 border-2 border-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-black" />
                </div>
              </div>
            </div>
          </div>

          {/* Admin Actions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* User Management */}
            <Link href="/admin/users" className="block group">
              <div className="bg-white border-4 border-black p-4 sm:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-blue-400 border-2 border-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-black">USER MANAGEMENT</h3>
                </div>
                <p className="font-bold text-sm text-gray-700 mb-4">View, edit, and delete user accounts</p>
                <div className="px-4 py-2 bg-yellow-400 border-2 border-black font-black text-sm text-center hover:bg-yellow-500 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  MANAGE USERS →
                </div>
              </div>
            </Link>

            {/* Venue Management */}
            <Link href="/admin/venues" className="block group">
              <div className="bg-white border-4 border-black p-4 sm:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-purple-400 border-2 border-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-black">VENUE MGMT</h3>
                </div>
                <p className="font-bold text-sm text-gray-700 mb-4">Add, edit, and delete venue listings</p>
                <div className="px-4 py-2 bg-pink-400 border-2 border-black font-black text-sm text-center hover:bg-pink-500 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  MANAGE VENUES →
                </div>
              </div>
            </Link>

            {/* Profile Management */}
            <Link href="/admin/profiles" className="block group">
              <div className="bg-white border-4 border-black p-4 sm:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-green-400 border-2 border-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <Database className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-black">PROFILES</h3>
                </div>
                <p className="font-bold text-sm text-gray-700 mb-4">Moderate and manage user profiles</p>
                <div className="px-4 py-2 bg-cyan-400 border-2 border-black font-black text-sm text-center hover:bg-cyan-500 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  MANAGE PROFILES →
                </div>
              </div>
            </Link>

            {/* System Analytics */}
            <Link href="/admin/analytics" className="block group">
              <div className="bg-white border-4 border-black p-4 sm:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-orange-400 border-2 border-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-black">ANALYTICS</h3>
                </div>
                <p className="font-bold text-sm text-gray-700 mb-4">View system usage and statistics</p>
                <div className="px-4 py-2 bg-lime-400 border-2 border-black font-black text-sm text-center hover:bg-lime-500 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  VIEW ANALYTICS →
                </div>
              </div>
            </Link>

            {/* Message Management */}
            <Link href="/admin/messages" className="block group">
              <div className="bg-white border-4 border-black p-4 sm:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-amber-400 border-2 border-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-black">MESSAGES</h3>
                </div>
                <p className="font-bold text-sm text-gray-700 mb-4">Monitor and moderate user messages</p>
                <div className="px-4 py-2 bg-teal-400 border-2 border-black font-black text-sm text-center hover:bg-teal-500 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  MODERATE →
                </div>
              </div>
            </Link>

            {/* Venue Reports */}
            <Link href="/admin/reports" className="block group">
              <div className="bg-white border-4 border-black p-4 sm:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-red-400 border-2 border-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <Flag className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-black">REPORTS</h3>
                </div>
                <p className="font-bold text-sm text-gray-700 mb-4">Review user-submitted venue reports</p>
                <div className="px-4 py-2 bg-rose-400 border-2 border-black font-black text-sm text-center hover:bg-rose-500 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  VIEW REPORTS →
                </div>
              </div>
            </Link>

            {/* System Settings */}
            <Link href="/admin/settings" className="block group">
              <div className="bg-white border-4 border-black p-4 sm:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-gray-400 border-2 border-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-black">SETTINGS</h3>
                </div>
                <p className="font-bold text-sm text-gray-700 mb-4">Configure application settings</p>
                <div className="px-4 py-2 bg-indigo-400 border-2 border-black font-black text-sm text-center hover:bg-indigo-500 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  SETTINGS →
                </div>
              </div>
            </Link>

            {/* Emergency Actions */}
            <div className="bg-white border-4 border-black p-4 sm:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 group">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-red-500 border-2 border-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-black text-black">EMERGENCY</h3>
              </div>
              <p className="font-bold text-sm text-gray-700 mb-4">System maintenance and emergency controls</p>
              <div className="px-4 py-2 bg-red-500 text-white border-2 border-black font-black text-sm text-center hover:bg-red-600 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                EMERGENCY PANEL →
              </div>
            </div>
          </div>

          {/* Warning Notice */}
          <div className="mt-6 sm:mt-8 bg-yellow-400 border-4 border-black p-4 sm:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-3">
              <div className="bg-black border-2 border-black p-2">
                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 flex-shrink-0" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-black text-black">⚠️ ADMIN ACCESS WARNING</p>
                <p className="text-xs sm:text-sm font-bold text-black">YOU HAVE ELEVATED PRIVILEGES. USE ADMIN FUNCTIONS RESPONSIBLY.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
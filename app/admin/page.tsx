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
      <div className="min-h-screen bg-purple-400">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="bg-red-500 border-4 border-black p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-6xl font-black">ADMIN DASHBOARD</h1>
            </div>
            <p className="font-bold text-xl">SYSTEM ADMINISTRATION AND USER MANAGEMENT</p>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-black text-sm mb-1">TOTAL USERS</p>
                  <p className="text-4xl font-black text-blue-600">{stats.totalUsers}</p>
                </div>
                <div className="bg-blue-300 border-2 border-black p-2">
                  <Users className="w-8 h-8 text-black" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Profiles</p>
                  <p className="text-3xl font-bold text-black">{stats.totalProfiles}</p>
                </div>
                <Database className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Published Profiles</p>
                  <p className="text-3xl font-bold text-black">{stats.publishedProfiles}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-white border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-black text-sm mb-1">TOTAL VENUES</p>
                  <p className="text-4xl font-black text-purple-600">{stats.totalVenues}</p>
                </div>
                <div className="bg-purple-300 border-2 border-black p-2">
                  <MapPin className="w-8 h-8 text-black" />
                </div>
              </div>
            </div>
          </div>

          {/* Admin Actions Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* User Management */}
            <Link href="/admin/users" className="block">
              <div className="bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-500/50 hover:shadow-lg transition-all duration-300 group">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-black mb-2">User Management</h3>
                <p className="text-gray-600 mb-4">View, edit, and delete user accounts</p>
                <Button variant="secondary" className="w-full">
                  Manage Users
                </Button>
              </div>
            </Link>

            {/* Venue Management */}
            <Link href="/admin/venues" className="block">
              <div className="bg-white rounded-xl border border-gray-200 p-6 hover:border-purple-500/50 hover:shadow-lg transition-all duration-300 group">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                  <MapPin className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-black mb-2">Venue Management</h3>
                <p className="text-gray-600 mb-4">Add, edit, and delete venue listings</p>
                <Button variant="secondary" className="w-full">
                  Manage Venues
                </Button>
              </div>
            </Link>

            {/* Profile Management */}
            <Link href="/admin/profiles" className="block">
              <div className="bg-white rounded-xl border border-gray-200 p-6 hover:border-green-500/50 hover:shadow-lg transition-all duration-300 group">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                  <Database className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-black mb-2">Profile Management</h3>
                <p className="text-gray-600 mb-4">Moderate and manage user profiles</p>
                <Button variant="secondary" className="w-full">
                  Manage Profiles
                </Button>
              </div>
            </Link>

            {/* System Analytics */}
            <Link href="/admin/analytics" className="block">
              <div className="bg-white rounded-xl border border-gray-200 p-6 hover:border-purple-500/50 hover:shadow-lg transition-all duration-300 group">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-black mb-2">Analytics</h3>
                <p className="text-gray-600 mb-4">View system usage and statistics</p>
                <Button variant="secondary" className="w-full">
                  View Analytics
                </Button>
              </div>
            </Link>

            {/* Message Management */}
            <Link href="/admin/messages" className="block">
              <div className="bg-white rounded-xl border border-gray-200 p-6 hover:border-orange-500/50 hover:shadow-lg transition-all duration-300 group">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-orange-200 transition-colors">
                  <Settings className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-black mb-2">Message Moderation</h3>
                <p className="text-gray-600 mb-4">Monitor and moderate user messages</p>
                <Button variant="secondary" className="w-full">
                  Moderate Messages
                </Button>
              </div>
            </Link>

            {/* Venue Reports */}
            <Link href="/admin/reports" className="block">
              <div className="bg-white rounded-xl border border-gray-200 p-6 hover:border-red-500/50 hover:shadow-lg transition-all duration-300 group">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-red-200 transition-colors">
                  <Flag className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-black mb-2">Venue Reports</h3>
                <p className="text-gray-600 mb-4">Review user-submitted venue reports</p>
                <Button variant="secondary" className="w-full">
                  View Reports
                </Button>
              </div>
            </Link>

            {/* System Settings */}
            <Link href="/admin/settings" className="block">
              <div className="bg-white rounded-xl border border-gray-200 p-6 hover:border-gray-500/50 hover:shadow-lg transition-all duration-300 group">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-gray-200 transition-colors">
                  <Settings className="w-6 h-6 text-gray-600" />
                </div>
                <h3 className="text-xl font-semibold text-black mb-2">System Settings</h3>
                <p className="text-gray-600 mb-4">Configure application settings</p>
                <Button variant="secondary" className="w-full">
                  Settings
                </Button>
              </div>
            </Link>

            {/* Emergency Actions */}
            <div className="bg-white rounded-xl border border-red-200 p-6 hover:border-red-500/50 hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-red-200 transition-colors">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-2">Emergency Actions</h3>
              <p className="text-gray-600 mb-4">System maintenance and emergency controls</p>
              <Button variant="secondary" className="w-full border-red-300 text-red-700 hover:bg-red-50">
                Emergency Panel
              </Button>
            </div>
          </div>

          {/* Warning Notice */}
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Admin Access</p>
                <p className="text-sm text-yellow-700">You have elevated privileges. Use admin functions responsibly.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
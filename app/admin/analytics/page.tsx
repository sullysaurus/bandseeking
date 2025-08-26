'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { BarChart3, ArrowLeft, Users, Database, MessageSquare, TrendingUp } from 'lucide-react'
import Link from 'next/link'

interface AnalyticsData {
  totalUsers: number
  totalProfiles: number
  publishedProfiles: number
  totalMessages: number
  usersThisWeek: number
  profilesThisWeek: number
  messagesThisWeek: number
  topInstruments: { instrument: string; count: number }[]
  topGenres: { genre: string; count: number }[]
  usersByMonth: { month: string; count: number }[]
}

export default function AdminAnalyticsPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAdminAccess()
  }, [])

  const checkAdminAccess = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user || user.email !== 'dsully15@gmail.com') {
        router.push('/dashboard')
        return
      }

      setCurrentUser(user)
      await fetchAnalytics()
    } catch (error) {
      console.error('Error checking admin access:', error)
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const fetchAnalytics = async () => {
    try {
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

      // Get total counts
      const [
        { count: totalUsers },
        { count: totalProfiles },
        { count: publishedProfiles },
        { count: totalMessages },
        { count: usersThisWeek },
        { count: profilesThisWeek },
        { count: messagesThisWeek }
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_published', true),
        supabase.from('messages').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', oneWeekAgo.toISOString()),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', oneWeekAgo.toISOString()),
        supabase.from('messages').select('*', { count: 'exact', head: true }).gte('created_at', oneWeekAgo.toISOString())
      ])

      // Get top instruments
      const { data: profiles } = await supabase
        .from('profiles')
        .select('main_instrument')
        .not('main_instrument', 'is', null)

      const instrumentCounts: { [key: string]: number } = {}
      profiles?.forEach(profile => {
        const instrument = profile.main_instrument
        instrumentCounts[instrument] = (instrumentCounts[instrument] || 0) + 1
      })

      const topInstruments = Object.entries(instrumentCounts)
        .map(([instrument, count]) => ({ instrument, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      // Get top genres
      const { data: profilesWithGenres } = await supabase
        .from('profiles')
        .select('genres')
        .not('genres', 'is', null)

      const genreCounts: { [key: string]: number } = {}
      profilesWithGenres?.forEach(profile => {
        profile.genres?.forEach((genre: string) => {
          genreCounts[genre] = (genreCounts[genre] || 0) + 1
        })
      })

      const topGenres = Object.entries(genreCounts)
        .map(([genre, count]) => ({ genre, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      // Get users by month (last 6 months)
      const { data: usersByMonth } = await supabase
        .from('users')
        .select('created_at')
        .gte('created_at', new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString())

      const monthCounts: { [key: string]: number } = {}
      usersByMonth?.forEach(user => {
        const month = new Date(user.created_at).toLocaleString('default', { month: 'short', year: 'numeric' })
        monthCounts[month] = (monthCounts[month] || 0) + 1
      })

      const usersByMonthArray = Object.entries(monthCounts)
        .map(([month, count]) => ({ month, count }))
        .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())

      setAnalytics({
        totalUsers: totalUsers || 0,
        totalProfiles: totalProfiles || 0,
        publishedProfiles: publishedProfiles || 0,
        totalMessages: totalMessages || 0,
        usersThisWeek: usersThisWeek || 0,
        profilesThisWeek: profilesThisWeek || 0,
        messagesThisWeek: messagesThisWeek || 0,
        topInstruments,
        topGenres,
        usersByMonth: usersByMonthArray
      })
    } catch (error) {
      console.error('Error fetching analytics:', error)
    }
  }

  if (loading) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </>
    )
  }

  if (!analytics) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Failed to load analytics data</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Link href="/admin" className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Admin</span>
              </Link>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-8 h-8 text-purple-600" />
              <h1 className="text-3xl font-bold text-black">Analytics Dashboard</h1>
            </div>
            <p className="text-gray-600">System usage statistics and insights</p>
          </div>

          {/* Overview Stats */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-3xl font-bold text-black">{analytics.totalUsers}</p>
                  <p className="text-sm text-green-600">+{analytics.usersThisWeek} this week</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Profiles</p>
                  <p className="text-3xl font-bold text-black">{analytics.totalProfiles}</p>
                  <p className="text-sm text-green-600">+{analytics.profilesThisWeek} this week</p>
                </div>
                <Database className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Published Profiles</p>
                  <p className="text-3xl font-bold text-black">{analytics.publishedProfiles}</p>
                  <p className="text-sm text-gray-600">
                    {Math.round((analytics.publishedProfiles / analytics.totalProfiles) * 100) || 0}% of total
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Messages</p>
                  <p className="text-3xl font-bold text-black">{analytics.totalMessages}</p>
                  <p className="text-sm text-green-600">+{analytics.messagesThisWeek} this week</p>
                </div>
                <MessageSquare className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Charts and Lists */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Top Instruments */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-black mb-4">Top Instruments</h3>
              <div className="space-y-3">
                {analytics.topInstruments.map((item, index) => (
                  <div key={item.instrument} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
                      </div>
                      <span className="font-medium text-gray-900">{item.instrument}</span>
                    </div>
                    <span className="text-gray-600">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Genres */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-black mb-4">Top Genres</h3>
              <div className="space-y-3">
                {analytics.topGenres.map((item, index) => (
                  <div key={item.genre} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-semibold text-purple-600">{index + 1}</span>
                      </div>
                      <span className="font-medium text-gray-900">{item.genre}</span>
                    </div>
                    <span className="text-gray-600">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Users by Month */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-black mb-4">New Users by Month</h3>
              <div className="space-y-3">
                {analytics.usersByMonth.slice(-6).map((item) => (
                  <div key={item.month} className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{item.month}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-2 bg-green-500 rounded-full"
                          style={{ 
                            width: `${Math.max(10, (item.count / Math.max(...analytics.usersByMonth.map(m => m.count))) * 100)}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-gray-600 text-sm w-8">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
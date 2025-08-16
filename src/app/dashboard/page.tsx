'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Users, 
  Music, 
  MessageSquare, 
  Plus, 
  Eye, 
  Calendar,
  TrendingUp,
  Star,
  MapPin,
  Clock,
  User,
  Briefcase,
  ChevronRight
} from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import ProtectedRoute from '@/components/ProtectedRoute'
import { bandService, Band } from '@/lib/bands'
import { profileService, Profile } from '@/lib/profiles'
// Removed old messaging import
import { useAuth } from '@/contexts/AuthContext'
import { getProfileCompletionPercentage } from '@/lib/profile-utils'

interface DashboardStats {
  totalBands: number
  ownedBands: number
  memberBands: number
  unreadMessages: number
  pendingApplications: number
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [recentBands, setRecentBands] = useState<Band[]>([])
  const [ownedBands, setOwnedBands] = useState<Band[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalBands: 0,
    ownedBands: 0,
    memberBands: 0,
    unreadMessages: 0,
    pendingApplications: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    setLoading(true)
    
    try {
      // Load all data in parallel
      const [
        userProfile,
        allBands,
        myBands,
        memberBands
      ] = await Promise.all([
        profileService.getProfile(),
        bandService.getAllBands(),
        bandService.getMyBands(),
        bandService.getBandsAsMember()
      ])

      setProfile(userProfile)
      setRecentBands(allBands.slice(0, 6)) // Show 6 most recent bands
      setOwnedBands(myBands)

      // Calculate stats
      setStats({
        totalBands: allBands.length,
        ownedBands: myBands.length,
        memberBands: memberBands.length,
        unreadMessages: 0, // Will be implemented with real chat
        pendingApplications: 0 // Will implement when applications are loaded
      })

    } catch (error) {
      console.error('Error loading dashboard data:', error)
      // If it's a database setup issue, we'll continue with empty data
      // and the UI will handle it gracefully
    } finally {
      setLoading(false)
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const getDisplayName = () => {
    return profile?.username || 
           user?.user_metadata?.username || 
           user?.email?.split('@')[0] || 
           'Musician'
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen bg-background">
          <Sidebar />
          <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 flex items-center justify-center">
            <div className="text-white">Loading dashboard...</div>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        
        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                    {getGreeting()}, {getDisplayName()}!
                  </h1>
                  <p className="text-secondary text-lg">
                    Welcome back to your music community. Here's what's happening today.
                  </p>
                </div>
                
                {/* Subtle Profile Completion */}
                {(!profile || getProfileCompletionPercentage(profile) < 100) && (
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 text-accent-teal hover:text-white transition-all group text-sm bg-accent-teal/5 hover:bg-accent-teal/10 px-4 py-2 rounded-lg border border-accent-teal/20"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-background rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-accent-teal to-accent-teal/80 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${getProfileCompletionPercentage(profile)}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold min-w-[2rem]">
                        {Math.round(getProfileCompletionPercentage(profile))}%
                      </span>
                    </div>
                    <span className="font-medium">Complete profile</span>
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
              <div className="bg-card rounded-lg p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-accent-teal/20 p-3 rounded-lg">
                    <Music className="w-6 h-6 text-accent-teal" />
                  </div>
                  <span className="text-2xl font-bold text-white">{stats.totalBands}</span>
                </div>
                <h3 className="text-white font-semibold mb-1">Total Bands</h3>
                <p className="text-secondary text-sm">In your area</p>
              </div>

              <div className="bg-card rounded-lg p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-accent-purple/20 p-3 rounded-lg">
                    <Users className="w-6 h-6 text-accent-purple" />
                  </div>
                  <span className="text-2xl font-bold text-white">{stats.ownedBands}</span>
                </div>
                <h3 className="text-white font-semibold mb-1">My Bands</h3>
                <p className="text-secondary text-sm">Bands you own</p>
              </div>

              <div className="bg-card rounded-lg p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-success/20 p-3 rounded-lg">
                    <MessageSquare className="w-6 h-6 text-success" />
                  </div>
                  <span className="text-2xl font-bold text-white">{stats.unreadMessages}</span>
                </div>
                <h3 className="text-white font-semibold mb-1">Messages</h3>
                <p className="text-secondary text-sm">Unread messages</p>
              </div>

              <div className="bg-card rounded-lg p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-orange-500/20 p-3 rounded-lg">
                    <Briefcase className="w-6 h-6 text-orange-500" />
                  </div>
                  <span className="text-2xl font-bold text-white">{stats.memberBands}</span>
                </div>
                <h3 className="text-white font-semibold mb-1">Member Of</h3>
                <p className="text-secondary text-sm">Bands you've joined</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              {/* Recent Activity */}
              <div className="lg:col-span-2 space-y-6">
                {/* Quick Actions */}
                <div className="bg-card rounded-lg p-4 md:p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
                    <Link
                      href="/bands/create"
                      className="bg-accent-teal hover:bg-opacity-90 text-black p-3 md:p-4 rounded-lg transition-colors text-center"
                    >
                      <Plus className="w-5 h-5 md:w-6 md:h-6 mx-auto mb-2" />
                      <span className="text-xs md:text-sm font-medium">Start a Band</span>
                    </Link>
                    
                    <Link
                      href="/find-bands"
                      className="bg-accent-purple hover:bg-opacity-90 text-white p-3 md:p-4 rounded-lg transition-colors text-center"
                    >
                      <Music className="w-5 h-5 md:w-6 md:h-6 mx-auto mb-2" />
                      <span className="text-xs md:text-sm font-medium">Find Bands</span>
                    </Link>
                    
                    <Link
                      href="/find-musicians"
                      className="bg-success hover:bg-opacity-90 text-white p-3 md:p-4 rounded-lg transition-colors text-center"
                    >
                      <Users className="w-5 h-5 md:w-6 md:h-6 mx-auto mb-2" />
                      <span className="text-xs md:text-sm font-medium">Find Musicians</span>
                    </Link>
                    
                    <Link
                      href="/profile"
                      className="bg-card hover:bg-opacity-80 border border-border text-white p-3 md:p-4 rounded-lg transition-colors text-center"
                    >
                      <User className="w-5 h-5 md:w-6 md:h-6 mx-auto mb-2" />
                      <span className="text-xs md:text-sm font-medium">Edit Profile</span>
                    </Link>
                  </div>
                </div>

                {/* My Bands */}
                {ownedBands.length > 0 && (
                  <div className="bg-card rounded-lg p-4 md:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold text-white">My Bands</h2>
                      <Link
                        href="/bands"
                        className="text-accent-teal hover:text-opacity-80 text-sm font-medium flex items-center gap-1"
                      >
                        View All <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                    <div className="space-y-3">
                      {ownedBands.slice(0, 3).map((band) => (
                        <div key={band.id} className="flex items-center justify-between p-3 bg-background rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-accent-teal rounded-full flex items-center justify-center text-black font-bold">
                              {band.avatar_url ? (
                                <img src={band.avatar_url} alt={band.name} className="w-full h-full object-cover rounded-full" />
                              ) : (
                                'B'
                              )}
                            </div>
                            <div>
                              <h3 className="text-white font-medium">{band.name}</h3>
                              <div className="flex items-center gap-2 text-sm text-secondary">
                                {band.genre && (
                                  <span>{band.genre}</span>
                                )}
                                {band.location && (
                                  <>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                      <MapPin className="w-3 h-3" />
                                      {band.location}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`px-2 py-1 rounded-full text-xs ${
                              band.status === 'recruiting' 
                                ? 'bg-success/20 text-success' 
                                : band.status === 'complete'
                                ? 'bg-complete/20 text-complete'
                                : 'bg-orange-500/20 text-orange-400'
                            }`}>
                              {band.status === 'recruiting' ? 'Recruiting' : band.status === 'complete' ? 'Complete' : 'On Hold'}
                            </div>
                            <Link
                              href={`/bands/${band.slug}/edit`}
                              className="text-secondary hover:text-white transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Bands */}
                <div className="bg-card rounded-lg p-4 md:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-white">Recent Bands</h2>
                    <Link
                      href="/find-bands"
                      className="text-accent-teal hover:text-opacity-80 text-sm font-medium flex items-center gap-1"
                    >
                      View All <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recentBands.map((band) => (
                      <div key={band.id} className="p-4 bg-background rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-white font-medium">{band.name}</h3>
                          <div className={`px-2 py-1 rounded-full text-xs ${
                            band.status === 'recruiting' 
                              ? 'bg-success/20 text-success' 
                              : 'bg-complete/20 text-complete'
                          }`}>
                            {band.status === 'recruiting' ? 'Recruiting' : 'Complete'}
                          </div>
                        </div>
                        {band.genre && (
                          <p className="text-sm text-secondary mb-2">{band.genre}</p>
                        )}
                        {band.looking_for && band.looking_for.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {band.looking_for.slice(0, 2).map((role, index) => (
                              <span key={index} className="bg-success/20 text-success px-2 py-1 rounded-full text-xs">
                                {role}
                              </span>
                            ))}
                            {band.looking_for.length > 2 && (
                              <span className="text-medium text-xs px-2 py-1">
                                +{band.looking_for.length - 2} more
                              </span>
                            )}
                          </div>
                        )}
                        <Link
                          href={`/bands/${band.slug}`}
                          className="text-accent-teal hover:text-opacity-80 text-sm font-medium"
                        >
                          View Band →
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar Content */}
              <div className="space-y-6">
                {/* Chat Room */}
                <div className="bg-card rounded-lg p-4 md:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white">Community Chat</h2>
                    <Link
                      href="/messages"
                      className="text-accent-teal hover:text-opacity-80 text-sm font-medium"
                    >
                      Join Chat
                    </Link>
                  </div>
                  <div className="text-center py-4">
                    <MessageSquare className="w-8 h-8 text-medium mx-auto mb-2" />
                    <p className="text-secondary text-sm mb-3">Connect with musicians in real-time</p>
                    <Link
                      href="/messages"
                      className="bg-accent-teal hover:bg-opacity-90 text-black text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                    >
                      Open Chat
                    </Link>
                  </div>
                </div>


                {/* Tips */}
                <div className="bg-card rounded-lg p-4 md:p-6">
                  <h2 className="text-lg font-semibold text-white mb-4">Pro Tips</h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="bg-accent-teal/20 p-1 rounded">
                        <Star className="w-4 h-4 text-accent-teal" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">Complete your profile</p>
                        <p className="text-secondary text-xs">Get 3x more band invitations</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-success/20 p-1 rounded">
                        <TrendingUp className="w-4 h-4 text-success" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">Be active</p>
                        <p className="text-secondary text-xs">Apply to bands regularly</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-accent-purple/20 p-1 rounded">
                        <MessageSquare className="w-4 h-4 text-accent-purple" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">Network</p>
                        <p className="text-secondary text-xs">Message other musicians</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
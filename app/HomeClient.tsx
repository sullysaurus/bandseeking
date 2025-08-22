'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navigation from '@/components/layout/Navigation'
import ProfileCard from '@/components/ProfileCard'
import Button from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'
import { Search, Users, MessageSquare, Music, Plus } from 'lucide-react'

interface HomeClientProps {
  initialProfiles: any[]
}

export default function HomeClient({ initialProfiles }: HomeClientProps) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const profiles = initialProfiles

  useEffect(() => {
    getCurrentUser()
  }, [])

  const getCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    } catch (error) {
      console.error('Error getting user:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </>
    )
  }

  // Show different content for logged-in users
  if (user) {
    return (
      <>
        <Navigation />
        
        {/* Dashboard-style Homepage for Logged-in Users */}
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Welcome Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-black mb-2">Welcome back!</h1>
              <p className="text-gray-600">Discover new musicians and manage your connections</p>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Link href="/search" className="block">
                <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-500/50 hover:shadow-lg transition-all duration-300 group">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                    <Search className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-black mb-2">Find Musicians</h3>
                  <p className="text-gray-600">Search for musicians in your area</p>
                </div>
              </Link>
              
              <Link href="/dashboard/messages" className="block">
                <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-500/50 hover:shadow-lg transition-all duration-300 group">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                    <MessageSquare className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-black mb-2">Messages</h3>
                  <p className="text-gray-600">Connect with other musicians</p>
                </div>
              </Link>
              
              <Link href="/dashboard/profile" className="block">
                <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-500/50 hover:shadow-lg transition-all duration-300 group">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                    <Plus className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-black mb-2">Update Profile</h3>
                  <p className="text-gray-600">Keep your profile up to date</p>
                </div>
              </Link>
            </div>

            {/* Recent Musicians */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-black mb-2">Recent Musicians</h2>
                  <p className="text-gray-600">Check out the latest members of our community</p>
                </div>
                <Link href="/search">
                  <Button variant="secondary" className="bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200 px-6 rounded-lg">
                    View All
                  </Button>
                </Link>
              </div>

              {profiles.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {profiles.slice(0, 8).map((profile) => (
                    <ProfileCard key={profile.id} profile={profile} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-black mb-2">No musicians yet</h3>
                  <p className="text-gray-600 mb-6">Be the first to create a profile!</p>
                  <Link href="/dashboard/profile">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-lg">
                      Create Profile
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    )
  }

  // Show landing page for non-logged-in users
  return (
    <>
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-white text-black relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-20 md:py-32 relative">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-black leading-tight">
              Find Your Musical Match Today
            </h1>
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-blue-600">
              Connect to like-minded musicians
            </h2>
            <p className="text-xl md:text-2xl text-gray-700 mb-4 max-w-3xl mx-auto leading-relaxed">
              BandSeeking is the premier musician connection platform.
            </p>
            <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
              Discover talented musicians in your area, form bands, collaborate on projects, and bring your musical vision to life.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white border-0 px-8 py-3 rounded-lg">
                  Start your project
                </Button>
              </Link>
              <Link href="/search">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200 px-8 py-3 rounded-lg">
                  Browse musicians
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Trusted by section */}
        <div className="border-t border-gray-200 py-12">
          <div className="max-w-7xl mx-auto px-4">
            <p className="text-center text-gray-500 mb-8">Trusted by musicians worldwide</p>
            <div className="flex justify-center items-center space-x-12 opacity-50">
              <div className="text-gray-500 font-medium">Local Bands</div>
              <div className="text-gray-500 font-medium">Solo Artists</div>
              <div className="text-gray-500 font-medium">Studios</div>
              <div className="text-gray-500 font-medium">Producers</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">
              Everything you need to find your sound
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From discovering musicians to forming bands, we've built the tools to help you create meaningful musical connections.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="relative p-8 bg-white rounded-2xl border border-gray-200 hover:border-blue-500/50 hover:shadow-lg transition-all duration-300 group">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-gray-200 transition-colors">
                <Users className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-3">Showcase Your Sound</h3>
              <p className="text-gray-600 leading-relaxed">
                Build a profile that highlights your musical style, influences, and what makes you unique as a musician.
              </p>
            </div>
            
            <div className="relative p-8 bg-white rounded-2xl border border-gray-200 hover:border-blue-500/50 hover:shadow-lg transition-all duration-300 group">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-gray-200 transition-colors">
                <Search className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-3">Find Your Match</h3>
              <p className="text-gray-600 leading-relaxed">
                Search for musicians by location, instrument, genre, and vibe to find the perfect collaborators for your project.
              </p>
            </div>
            
            <div className="relative p-8 bg-white rounded-2xl border border-gray-200 hover:border-blue-500/50 hover:shadow-lg transition-all duration-300 group">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-gray-200 transition-colors">
                <MessageSquare className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-3">Start the Conversation</h3>
              <p className="text-gray-600 leading-relaxed">
                Connect instantly with musicians through our messaging system and turn ideas into collaborations.
              </p>
            </div>
            
            <div className="relative p-8 bg-white rounded-2xl border border-gray-200 hover:border-blue-500/50 hover:shadow-lg transition-all duration-300 group">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-gray-200 transition-colors">
                <Music className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-3">Create Something Amazing</h3>
              <p className="text-gray-600 leading-relaxed">
                From weekend jams to recording projects, build the musical connections that bring your creative vision to life.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Profiles Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-12 gap-4">
            <div>
              <h2 className="text-4xl font-bold text-black mb-2">Meet Our Music Community</h2>
              <p className="text-lg text-gray-600">Connect with talented musicians ready to collaborate and create</p>
            </div>
            <Link href="/search">
              <Button variant="secondary" className="bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200 px-6 rounded-lg">
                View All Musicians
              </Button>
            </Link>
          </div>

          {profiles.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {profiles.map((profile) => (
                <ProfileCard key={profile.id} profile={profile} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="text-2xl font-semibold text-black mb-3">Join the movement!</h3>
              <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                Be part of a growing community where musicians connect, collaborate, and create incredible music together.
              </p>
              <Link href="/auth/register">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-lg">
                  Create Your Profile
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
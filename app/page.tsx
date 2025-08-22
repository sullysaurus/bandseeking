'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Navigation from '@/components/layout/Navigation'
import ProfileCard from '@/components/ProfileCard'
import Button from '@/components/ui/Button'
import { Search, Users, MessageSquare, Music } from 'lucide-react'

export default function HomePage() {
  const [profiles, setProfiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfiles()
  }, [])

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user:users(*)
        `)
        .eq('is_published', true)
        .limit(12)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProfiles(data || [])
    } catch (error) {
      console.error('Error fetching profiles:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Find Your Perfect Musical Match
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Connect with musicians in your area for bands, collaborations, and music projects
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/search">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  Browse Musicians
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            How BandSeeking Works
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-black text-white rounded-full mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">Create Your Profile</h3>
              <p className="text-gray-600 text-sm">
                Showcase your skills, experience, and what you&apos;re looking for
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-black text-white rounded-full mb-4">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">Discover Musicians</h3>
              <p className="text-gray-600 text-sm">
                Search and filter by instrument, genre, location, and more
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-black text-white rounded-full mb-4">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">Connect & Chat</h3>
              <p className="text-gray-600 text-sm">
                Message musicians directly and start collaborating
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-black text-white rounded-full mb-4">
                <Music className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">Make Music</h3>
              <p className="text-gray-600 text-sm">
                Form bands, collaborate, and create amazing music together
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Profiles Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Recently Joined Musicians</h2>
            <Link href="/search">
              <Button variant="ghost">View All</Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 h-64 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : profiles.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {profiles.map((profile) => (
                <ProfileCard key={profile.id} profile={profile} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No musicians have joined yet. Be the first!</p>
              <Link href="/auth/register">
                <Button className="mt-4">Create Your Profile</Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
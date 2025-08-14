'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Music, Users, Calendar, Search, ArrowRight, Star, MapPin, Guitar, Mic, Headphones } from 'lucide-react'
import Logo from '@/components/Logo'
import Link from 'next/link'
import { profileService } from '@/lib/profiles'
import { bandService } from '@/lib/bands'
import { opportunityService } from '@/lib/opportunities'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({
    musicians: 0,
    bands: 0,
    opportunities: 0
  })
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const [musiciansCount, bandsCount, opportunitiesCount] = await Promise.all([
        profileService.getMusiciansCount(),
        bandService.getBandsCount(),
        opportunityService.getOpportunitiesCount()
      ])
      
      setStats({
        musicians: musiciansCount,
        bands: bandsCount,
        opportunities: opportunitiesCount
      })
    } catch (error) {
      console.error('Error loading homepage stats:', error)
    } finally {
      setStatsLoading(false)
    }
  }

  const handleGetStarted = () => {
    if (user) {
      router.push('/find-bands')
    } else {
      router.push('/auth/signin')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-card border-b border-card px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Logo size="lg" />
          <div className="flex items-center gap-4">
            {user ? (
              <Link 
                href="/find-bands"
                className="bg-accent-teal hover:bg-opacity-90 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Go to Dashboard
              </Link>
            ) : (
              <div className="flex gap-3">
                <Link 
                  href="/auth/signin"
                  className="text-secondary hover:text-white transition-colors px-4 py-2"
                >
                  Sign In
                </Link>
                <Link 
                  href="/auth/signup"
                  className="bg-accent-teal hover:bg-opacity-90 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Find Your Perfect
            <span className="text-accent-teal block">Musical Match</span>
          </h1>
          <p className="text-xl md:text-2xl text-secondary mb-8 max-w-3xl mx-auto">
            Connect with musicians, join bands, discover opportunities, and make music together. 
            The ultimate platform for the music community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handleGetStarted}
              className="bg-accent-teal hover:bg-opacity-90 text-white px-8 py-4 rounded-lg text-lg font-medium transition-colors flex items-center gap-2"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </button>
            <Link
              href="#features"
              className="text-secondary hover:text-white transition-colors px-8 py-4 text-lg"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-card">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-4">
            Everything You Need to Make Music
          </h2>
          <p className="text-secondary text-center mb-16 max-w-2xl mx-auto">
            From finding bandmates to booking gigs, BandSeeking has all the tools musicians need to succeed.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Find Musicians */}
            <div className="bg-background rounded-lg p-6 hover:bg-opacity-80 transition-colors">
              <div className="bg-accent-teal/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-accent-teal" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Find Musicians</h3>
              <p className="text-secondary">
                Search and discover talented musicians by instrument, genre, experience level, and location.
              </p>
            </div>

            {/* Join Bands */}
            <div className="bg-background rounded-lg p-6 hover:bg-opacity-80 transition-colors">
              <div className="bg-accent-purple/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-accent-purple" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Join Bands</h3>
              <p className="text-secondary">
                Browse bands looking for new members and apply to join the ones that match your style.
              </p>
            </div>

            {/* Discover Opportunities */}
            <div className="bg-background rounded-lg p-6 hover:bg-opacity-80 transition-colors">
              <div className="bg-success/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-success" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Discover Opportunities</h3>
              <p className="text-secondary">
                Find gigs, recording sessions, collaborations, and other musical opportunities in your area.
              </p>
            </div>

            {/* Build Your Profile */}
            <div className="bg-background rounded-lg p-6 hover:bg-opacity-80 transition-colors">
              <div className="bg-accent-teal/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-accent-teal" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Build Your Profile</h3>
              <p className="text-secondary">
                Showcase your musical skills, experience, and what you're looking for in a comprehensive profile.
              </p>
            </div>

            {/* Connect & Network */}
            <div className="bg-background rounded-lg p-6 hover:bg-opacity-80 transition-colors">
              <div className="bg-accent-purple/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Music className="w-6 h-6 text-accent-purple" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Connect & Network</h3>
              <p className="text-secondary">
                Send connection requests, message other musicians, and build your music network.
              </p>
            </div>

            {/* Location Based */}
            <div className="bg-background rounded-lg p-6 hover:bg-opacity-80 transition-colors">
              <div className="bg-success/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-success" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Location Based</h3>
              <p className="text-secondary">
                Find musicians and opportunities in your local area or expand your search globally.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="bg-accent-teal/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-accent-teal" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">
                {statsLoading ? '...' : `${stats.musicians}+`}
              </h3>
              <p className="text-secondary">Musicians Connected</p>
            </div>
            <div>
              <div className="bg-accent-purple/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Music className="w-8 h-8 text-accent-purple" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">
                {statsLoading ? '...' : `${stats.bands}+`}
              </h3>
              <p className="text-secondary">Bands Formed</p>
            </div>
            <div>
              <div className="bg-success/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">
                {statsLoading ? '...' : `${stats.opportunities}+`}
              </h3>
              <p className="text-secondary">Opportunities Posted</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-accent-teal/10 to-accent-purple/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Start Your Musical Journey?
          </h2>
          <p className="text-xl text-secondary mb-8">
            Join thousands of musicians who have found their perfect match on BandSeeking.
          </p>
          <button
            onClick={handleGetStarted}
            className="bg-accent-teal hover:bg-opacity-90 text-white px-8 py-4 rounded-lg text-lg font-medium transition-colors flex items-center gap-2 mx-auto"
          >
            {user ? 'Go to Dashboard' : 'Sign Up Now'}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-card py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Logo size="md" className="mb-4" />
              <p className="text-secondary">
                The ultimate platform for musicians to connect, collaborate, and create music together.
              </p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Platform</h4>
              <ul className="space-y-2">
                <li><Link href="/find-musicians" className="text-secondary hover:text-white transition-colors">Find Musicians</Link></li>
                <li><Link href="/find-bands" className="text-secondary hover:text-white transition-colors">Find Bands</Link></li>
                <li><Link href="/opportunities" className="text-secondary hover:text-white transition-colors">Opportunities</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Community</h4>
              <ul className="space-y-2">
                <li><Link href="/connections" className="text-secondary hover:text-white transition-colors">Connections</Link></li>
                <li><Link href="/messages" className="text-secondary hover:text-white transition-colors">Messages</Link></li>
                <li><Link href="/profile" className="text-secondary hover:text-white transition-colors">Profile</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Support</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-secondary hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="#" className="text-secondary hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="#" className="text-secondary hover:text-white transition-colors">Privacy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-card mt-12 pt-8 text-center">
            <p className="text-secondary">© 2025 BandSeeking. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

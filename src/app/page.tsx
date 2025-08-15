'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Music, Users, Calendar, Search, ArrowRight, CheckCircle, MessageSquare, DollarSign, Clock, Target, Filter } from 'lucide-react'
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
          <div className="mb-6">
            <span className="bg-accent-teal/20 text-accent-teal px-4 py-2 rounded-full text-sm font-medium">
              Connect • Create • Collaborate
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Where Musicians
            <span className="text-accent-teal block">Find Each Other</span>
          </h1>
          <p className="text-xl md:text-2xl text-secondary mb-8 max-w-4xl mx-auto">
            Connect with musicians who share your passion, create bands that click, discover opportunities, 
            and see who's actually available to play. <span className="text-white font-semibold">Building your musical community has never been easier</span>.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button
              onClick={handleGetStarted}
              className="bg-accent-teal hover:bg-opacity-90 text-white px-8 py-4 rounded-lg text-lg font-medium transition-colors flex items-center gap-2"
            >
              Start Connecting Now
              <ArrowRight className="w-5 h-5" />
            </button>
            <Link
              href="#core-features"
              className="text-secondary hover:text-white transition-colors px-8 py-4 text-lg"
            >
              See What Makes Us Different
            </Link>
          </div>

          {/* Key Differentiators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-card/50 rounded-lg p-6 border border-success/20">
              <DollarSign className="w-8 h-8 text-success mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-2">Free to Use</h3>
              <p className="text-sm text-secondary">All the essential features you need, with optional upgrades available.</p>
            </div>
            <div className="bg-card/50 rounded-lg p-6 border border-accent-teal/20">
              <MessageSquare className="w-8 h-8 text-accent-teal mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-2">Instant Messaging</h3>
              <p className="text-sm text-secondary">Real-time chat with response tracking and availability status.</p>
            </div>
            <div className="bg-card/50 rounded-lg p-6 border border-accent-purple/20">
              <Filter className="w-8 h-8 text-accent-purple mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-2">Smart Filters</h3>
              <p className="text-sm text-secondary">Find exactly who you need with intelligent search and matching.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section id="core-features" className="py-20 px-6 bg-card">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-4">
            Everything You Need to Connect
          </h2>
          <p className="text-secondary text-center mb-16 max-w-3xl mx-auto">
            All the essential features to find musicians, create bands, and grow your music career - 
            <span className="text-white font-semibold">designed to help you make real connections</span>.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Instant Messaging */}
            <div className="bg-background rounded-lg p-6 border border-accent-teal/20">
              <div className="bg-accent-teal/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-accent-teal" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Instant Messaging</h3>
              <p className="text-secondary mb-3">
                Real-time chat with response tracking and availability status. See who's online and ready to collaborate.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-secondary">Response rate tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-secondary">Availability indicators</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-secondary">Group conversations</span>
                </li>
              </ul>
            </div>

            {/* Create & Join Bands */}
            <div className="bg-background rounded-lg p-6 border border-accent-purple/20">
              <div className="bg-accent-purple/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-accent-purple" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Create & Join Bands</h3>
              <p className="text-secondary mb-3">
                Start your own band or join existing ones. Manage members, set availability, and coordinate practice sessions.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-secondary">Band creation tools</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-secondary">Member management</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-secondary">Role assignments</span>
                </li>
              </ul>
            </div>

            {/* Opportunities Board */}
            <div className="bg-background rounded-lg p-6 border border-success/20">
              <div className="bg-success/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-success" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Opportunities Board</h3>
              <p className="text-secondary mb-3">
                Discover gigs, session work, recording opportunities, and collaborations posted by venues and artists.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-secondary">Gig listings</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-secondary">Session opportunities</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-secondary">Collaboration requests</span>
                </li>
              </ul>
            </div>

            {/* Intelligent Filters */}
            <div className="bg-background rounded-lg p-6 border border-accent-teal/20">
              <div className="bg-accent-teal/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Filter className="w-6 h-6 text-accent-teal" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Intelligent Filters</h3>
              <p className="text-secondary mb-3">
                Smart search that finds exactly who you need based on instrument, genre, skill level, location, and availability.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-secondary">Genre compatibility</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-secondary">Skill level matching</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-secondary">Location-based search</span>
                </li>
              </ul>
            </div>

            {/* Create Openings */}
            <div className="bg-background rounded-lg p-6 border border-accent-purple/20">
              <div className="bg-accent-purple/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-accent-purple" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Create Openings</h3>
              <p className="text-secondary mb-3">
                Post specific positions you need to fill in your band or project. Set requirements and attract the right musicians.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-secondary">Position posting</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-secondary">Requirement setting</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-secondary">Application management</span>
                </li>
              </ul>
            </div>

            {/* Always Free */}
            <div className="bg-background rounded-lg p-6 border border-success/20">
              <div className="bg-success/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6 text-success" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Start Free</h3>
              <p className="text-secondary mb-3">
                Get started with all the core features you need, with optional upgrades to enhance your visibility.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-secondary">Free core features</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-secondary">Optional profile boosts</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-secondary">Fair pricing model</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose BandSeeking */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-4">
            Why BandSeeking is Different
          </h2>
          <p className="text-secondary text-center mb-16 max-w-3xl mx-auto">
            Built by musicians, for musicians. We understand what you really need.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* No Subscriptions */}
            <div className="bg-card rounded-lg p-6 text-center">
              <div className="bg-success/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Fair Pricing</h3>
              <p className="text-secondary text-lg mb-4">
                Start connecting for free, with optional upgrades to boost your profile or band visibility.
              </p>
              <div className="text-sm text-secondary space-y-1">
                <div>✓ Free core features</div>
                <div>✓ Optional profile boosts</div>
                <div>✓ No auto-renewals</div>
              </div>
            </div>

            {/* Real-Time Features */}
            <div className="bg-card rounded-lg p-6 text-center">
              <div className="bg-accent-teal/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-accent-teal" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Live Connections</h3>
              <p className="text-secondary text-lg mb-4">
                See who's online, track response rates, and know who's actually available to play.
              </p>
              <div className="text-sm text-secondary space-y-1">
                <div>✓ Real-time availability</div>
                <div>✓ Response tracking</div>
                <div>✓ Active status indicators</div>
              </div>
            </div>

            {/* Smart Matching */}
            <div className="bg-card rounded-lg p-6 text-center">
              <div className="bg-accent-purple/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-accent-purple" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Find Your Match</h3>
              <p className="text-secondary text-lg mb-4">
                Advanced filters help you find exactly who you need, not just random musicians.
              </p>
              <div className="text-sm text-secondary space-y-1">
                <div>✓ Genre-specific search</div>
                <div>✓ Skill level matching</div>
                <div>✓ Location-based results</div>
              </div>
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

      {/* Success Stories */}
      <section className="py-20 px-6 bg-card">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-4">
            Musicians Are Already Connecting
          </h2>
          <p className="text-secondary text-center mb-16 max-w-3xl mx-auto">
            Real stories from musicians who found their perfect match on BandSeeking
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-background rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-accent-teal/20 rounded-full flex items-center justify-center">
                  <Music className="w-5 h-5 text-accent-teal" />
                </div>
                <div>
                  <div className="text-white font-medium">Sarah M.</div>
                  <div className="text-secondary text-sm">Vocalist</div>
                </div>
              </div>
              <p className="text-secondary italic">
                "Found my band in 2 days! The availability tracking meant I connected with people who were actually serious about playing."
              </p>
            </div>

            <div className="bg-background rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-accent-purple/20 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-accent-purple" />
                </div>
                <div>
                  <div className="text-white font-medium">Mike D.</div>
                  <div className="text-secondary text-sm">Drummer</div>
                </div>
              </div>
              <p className="text-secondary italic">
                "The smart filters saved me hours. Instead of scrolling through hundreds of profiles, I found exactly the jazz fusion project I wanted."
              </p>
            </div>

            <div className="bg-background rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-success/20 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-success" />
                </div>
                <div>
                  <div className="text-white font-medium">Alex R.</div>
                  <div className="text-secondary text-sm">Guitarist</div>
                </div>
              </div>
              <p className="text-secondary italic">
                "Booked 3 gigs in my first week through the opportunities board. Finally, a platform that actually helps you find work!"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-accent-teal/10 to-accent-purple/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Find Your People?
          </h2>
          <p className="text-xl text-secondary mb-4">
            Join thousands of musicians already connecting on BandSeeking.
          </p>
          <p className="text-xl text-white font-semibold mb-8">
            Start building your musical community today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <button
              onClick={handleGetStarted}
              className="bg-accent-teal hover:bg-opacity-90 text-white px-10 py-4 rounded-lg text-xl font-semibold transition-colors flex items-center gap-2"
            >
              {user ? 'Go to Dashboard' : 'Start Connecting Now'}
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 text-sm text-secondary">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success" />
              <span>Set up in 2 minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success" />
              <span>Cancel anytime (but why would you?)</span>
            </div>
          </div>
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

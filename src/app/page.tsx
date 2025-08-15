'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { ArrowRight, MessageSquare, Clock, Users, CheckCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

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

  // If user is logged in, redirect to dashboard
  if (user) {
    router.push('/find-bands')
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Simple Header */}
      <nav className="px-6 py-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex justify-center">
            <Image
              src="/logo-eyes.png"
              alt="BandSeeking Logo"
              width={96}
              height={96}
              className="w-auto h-7 max-w-none"
              priority
            />
          </div>
          <div className="flex gap-4">
            <Link 
              href="/auth/signin"
              className="text-secondary hover:text-white transition-colors px-4 py-2"
            >
              Sign In
            </Link>
            <Link 
              href="/auth/signup"
              className="bg-accent-teal hover:bg-opacity-90 text-black font-medium px-6 py-2 rounded-lg transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Find Musicians.
            <span className="text-accent-teal block">Start Playing.</span>
          </h1>
          <p className="text-xl md:text-2xl text-secondary mb-12 max-w-3xl mx-auto">
            Connect with local musicians, form amazing bands, and bring your musical vision to life.
          </p>
          
          <button
            onClick={handleGetStarted}
            className="bg-accent-teal hover:bg-opacity-90 text-black px-10 py-4 rounded-lg text-xl font-semibold transition-colors inline-flex items-center gap-3 mb-16"
          >
            Get Started Free
            <ArrowRight className="w-6 h-6" />
          </button>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
            <div className="bg-card/50 rounded-xl p-6 border border-accent-teal/20 flex flex-col h-full">
              <div className="bg-accent-teal/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto md:mx-0">
                <MessageSquare className="w-6 h-6 text-accent-teal" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 text-center md:text-left">Instant Messaging</h3>
              <p className="text-secondary mb-4 text-center md:text-left flex-grow">Chat directly with musicians. See who's online and get real-time responses.</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 justify-center md:justify-start">
                  <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                  <span className="text-secondary">Response rate tracking</span>
                </li>
                <li className="flex items-center gap-2 justify-center md:justify-start">
                  <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                  <span className="text-secondary">Online status indicators</span>
                </li>
              </ul>
            </div>

            <div className="bg-card/50 rounded-xl p-6 border border-accent-purple/20 flex flex-col h-full">
              <div className="bg-accent-purple/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto md:mx-0">
                <Clock className="w-6 h-6 text-accent-purple" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 text-center md:text-left">Availability Signals</h3>
              <p className="text-secondary mb-4 text-center md:text-left flex-grow">See who's ready to connect and collaborate. Build meaningful musical relationships.</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 justify-center md:justify-start">
                  <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                  <span className="text-secondary">Average response time</span>
                </li>
                <li className="flex items-center gap-2 justify-center md:justify-start">
                  <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                  <span className="text-secondary">Activity status</span>
                </li>
              </ul>
            </div>

            <div className="bg-card/50 rounded-xl p-6 border border-success/20 flex flex-col h-full">
              <div className="bg-success/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto md:mx-0">
                <Users className="w-6 h-6 text-success" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 text-center md:text-left">Smart Matching</h3>
              <p className="text-secondary mb-4 text-center md:text-left flex-grow">Find exactly who you need with intelligent filters and compatibility matching.</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 justify-center md:justify-start">
                  <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                  <span className="text-secondary">Genre & skill matching</span>
                </li>
                <li className="flex items-center gap-2 justify-center md:justify-start">
                  <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                  <span className="text-secondary">Location-based search</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Simple tagline */}
          <p className="text-lg text-secondary max-w-2xl mx-auto">
            <span className="text-white font-semibold">Always free to use.</span> Connect with passionate musicians who share your love for music.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-card py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div>
              <div className="flex justify-center md:justify-start mb-4">
                <Image
                  src="/logo-eyes.png"
                  alt="BandSeeking Logo"
                  width={80}
                  height={80}
                  className="w-auto h-8 max-w-none"
                />
              </div>
              <p className="text-secondary">
                Find musicians, create bands, start playing.
              </p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Platform</h4>
              <ul className="space-y-2">
                <li><Link href="/auth/signin" className="text-secondary hover:text-white transition-colors">Find Musicians</Link></li>
                <li><Link href="/auth/signin" className="text-secondary hover:text-white transition-colors">Create Bands</Link></li>
                <li><Link href="/auth/signin" className="text-secondary hover:text-white transition-colors">Opportunities</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Get Started</h4>
              <ul className="space-y-2">
                <li><Link href="/auth/signup" className="text-secondary hover:text-white transition-colors">Sign Up Free</Link></li>
                <li><Link href="/auth/signin" className="text-secondary hover:text-white transition-colors">Sign In</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-card mt-8 pt-8 text-center">
            <p className="text-secondary">© 2025 BandSeeking. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
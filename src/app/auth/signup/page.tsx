'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    // Clean and validate inputs
    const cleanEmail = email.trim().toLowerCase()
    const cleanFullName = fullName.trim()
    const cleanUsername = (username.trim() || cleanEmail.split('@')[0]).replace(/[^a-zA-Z0-9_-]/g, '')

    if (!cleanEmail || !cleanFullName) {
      setError('Please fill in all required fields')
      setLoading(false)
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(cleanEmail)) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }

    // Validate name length and characters
    if (cleanFullName.length > 100) {
      setError('Full name must be less than 100 characters')
      setLoading(false)
      return
    }

    if (cleanUsername.length > 50) {
      setError('Username must be less than 50 characters')
      setLoading(false)
      return
    }

    try {
      // Create a fresh Supabase client for signup to avoid any existing session headers
      const signupClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          }
        }
      )
      
      const { error } = await signupClient.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: cleanFullName,
            username: cleanUsername,
          }
        }
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess('Account created successfully! Please check your email and click the confirmation link before signing in.')
        // Don't auto-redirect - let user read the message and go to email
      }
    } catch (err: any) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="mb-6 flex justify-center">
            <Image
              src="/logo-eyes-bottom.png"
              alt="BandSeeking Logo"
              width={120}
              height={120}
              className="w-auto h-16 md:h-20 max-w-none"
              priority
            />
          </div>
          <p className="text-secondary">Create your account to find bands and musicians</p>
        </div>

        {/* Sign Up Form */}
        <div className="bg-card rounded-lg p-8">
          {!success ? (
          <>
          <form onSubmit={handleSignUp} className="space-y-6">
            {/* Full Name Field */}
            <div>
              <label htmlFor="fullName" className="block text-white font-medium mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-medium w-5 h-5" />
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full bg-background border border-card rounded-lg pl-12 pr-4 py-3 text-white placeholder-medium focus:outline-none focus:ring-2 focus:ring-accent-teal"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-white font-medium mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-medium w-5 h-5" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  className="w-full bg-background border border-card rounded-lg pl-12 pr-4 py-3 text-white placeholder-medium focus:outline-none focus:ring-2 focus:ring-accent-teal"
                  placeholder="Choose a username (optional)"
                />
              </div>
              <p className="text-xs text-medium mt-1">Leave blank to use part of your email</p>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-white font-medium mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-medium w-5 h-5" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-background border border-card rounded-lg pl-12 pr-4 py-3 text-white placeholder-medium focus:outline-none focus:ring-2 focus:ring-accent-teal"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-white font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-medium w-5 h-5" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-background border border-card rounded-lg pl-12 pr-12 py-3 text-white placeholder-medium focus:outline-none focus:ring-2 focus:ring-accent-teal"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-medium hover:text-secondary"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-medium mt-1">Must be at least 6 characters</p>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-white font-medium mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-medium w-5 h-5" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full bg-background border border-card rounded-lg pl-12 pr-12 py-3 text-white placeholder-medium focus:outline-none focus:ring-2 focus:ring-accent-teal"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-medium hover:text-secondary"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>


            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent-teal hover:bg-opacity-90 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

            <div className="mt-6 text-center pt-6 border-t border-card">
              <p className="text-secondary text-sm mb-2">Already have an account?</p>
              <Link 
                href="/auth/signin" 
                className="text-accent-teal hover:text-opacity-80 font-medium"
              >
                Sign In
              </Link>
            </div>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-success" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Check Your Email!</h3>
              <p className="text-secondary mb-6">
                We've sent a confirmation email to <strong className="text-white">{email}</strong>. 
                Click the link in the email to activate your account.
              </p>
              <div className="space-y-4">
                <Link
                  href="/auth/signin"
                  className="block w-full bg-accent-teal hover:bg-opacity-90 text-black font-medium py-3 rounded-lg transition-colors"
                >
                  Go to Sign In
                </Link>
                <p className="text-xs text-secondary">
                  Didn't receive the email? Check your spam folder or contact support.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
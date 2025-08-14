'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { StylizedLogo } from '@/components/Logo'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [sessionError, setSessionError] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if we have a valid session from the email link
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (!session || error) {
        setSessionError(true)
      }
    }
    
    checkSession()
  }, [])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    // Validate password strength
    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
        // Redirect to sign in after a short delay
        setTimeout(() => {
          router.push('/auth/signin')
        }, 3000)
      }
    } catch (err: any) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (sessionError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="mb-6">
              <StylizedLogo size="lg" className="justify-center" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Invalid or Expired Link</h1>
            <p className="text-secondary">This password reset link is invalid or has expired</p>
          </div>

          <div className="bg-card rounded-lg p-8">
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6">
              <p className="text-sm">
                The password reset link you followed is no longer valid. Please request a new one.
              </p>
            </div>

            <Link 
              href="/auth/forgot-password" 
              className="block w-full bg-accent-teal hover:bg-opacity-90 text-white font-medium py-3 rounded-lg transition-colors text-center"
            >
              Request New Reset Link
            </Link>

            <div className="mt-4 text-center">
              <Link 
                href="/auth/signin" 
                className="text-secondary hover:text-white transition-colors text-sm"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="mb-6">
              <StylizedLogo size="lg" className="justify-center" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Password Reset Successful</h1>
            <p className="text-secondary">Your password has been updated</p>
          </div>

          <div className="bg-card rounded-lg p-8">
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-lg mb-6">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                <div>
                  <h3 className="font-medium">Success!</h3>
                  <p className="text-sm mt-1">
                    Your password has been reset. Redirecting to sign in...
                  </p>
                </div>
              </div>
            </div>

            <Link 
              href="/auth/signin" 
              className="block w-full bg-accent-teal hover:bg-opacity-90 text-white font-medium py-3 rounded-lg transition-colors text-center"
            >
              Go to Sign In
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="mb-6">
            <StylizedLogo size="lg" className="justify-center" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Create New Password</h1>
          <p className="text-secondary">Enter your new password below</p>
        </div>

        {/* Reset Form */}
        <div className="bg-card rounded-lg p-8">
          <form onSubmit={handleResetPassword} className="space-y-6">
            {/* New Password Field */}
            <div>
              <label htmlFor="password" className="block text-white font-medium mb-2">
                New Password
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
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-medium hover:text-secondary"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-white font-medium mb-2">
                Confirm New Password
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
                  placeholder="Confirm new password"
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

            {/* Password Requirements */}
            <div className="bg-background rounded-lg p-3">
              <p className="text-secondary text-sm">Password requirements:</p>
              <ul className="mt-2 space-y-1 text-sm">
                <li className={`flex items-center ${password.length >= 6 ? 'text-green-400' : 'text-medium'}`}>
                  <span className="mr-2">•</span>
                  At least 6 characters
                </li>
                <li className={`flex items-center ${password && password === confirmPassword ? 'text-green-400' : 'text-medium'}`}>
                  <span className="mr-2">•</span>
                  Passwords match
                </li>
              </ul>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !password || !confirmPassword}
              className="w-full bg-accent-teal hover:bg-opacity-90 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>

          {/* Cancel Link */}
          <div className="mt-6 text-center pt-6 border-t border-card">
            <Link 
              href="/auth/signin" 
              className="text-secondary hover:text-white transition-colors text-sm"
            >
              Cancel and return to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
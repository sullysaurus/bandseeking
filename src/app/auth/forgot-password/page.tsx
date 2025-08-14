'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { StylizedLogo } from '@/components/Logo'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
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
          <div className="mb-6">
            <StylizedLogo size="lg" className="justify-center" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
          <p className="text-secondary">Enter your email to receive a reset link</p>
        </div>

        {/* Reset Form */}
        <div className="bg-card rounded-lg p-8">
          {!success ? (
            <>
              <form onSubmit={handleResetPassword} className="space-y-6">
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-white font-medium mb-2">
                    Email Address
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
                  <p className="mt-2 text-secondary text-sm">
                    We'll send you an email with a link to reset your password.
                  </p>
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
                  disabled={loading}
                  className="w-full bg-accent-teal hover:bg-opacity-90 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>

              {/* Back to Sign In Link */}
              <div className="mt-6 text-center pt-6 border-t border-card">
                <Link 
                  href="/auth/signin" 
                  className="inline-flex items-center text-secondary hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Sign In
                </Link>
              </div>
            </>
          ) : (
            <>
              {/* Success Message */}
              <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-lg">
                <h3 className="font-medium mb-1">Check your email!</h3>
                <p className="text-sm">
                  We've sent a password reset link to <strong>{email}</strong>
                </p>
              </div>

              <div className="mt-6 space-y-4">
                <p className="text-secondary text-sm text-center">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
                
                <button
                  onClick={() => {
                    setSuccess(false)
                    setEmail('')
                  }}
                  className="w-full bg-button-secondary hover:bg-opacity-80 text-white font-medium py-3 rounded-lg transition-colors"
                >
                  Try Again
                </button>

                <Link 
                  href="/auth/signin" 
                  className="inline-flex items-center justify-center w-full text-secondary hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
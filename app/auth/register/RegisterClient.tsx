'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { trackRegistration } from '@/components/FacebookPixel'
import Navigation from '@/components/layout/Navigation'
import MagicLinkInfo from '@/components/auth/MagicLinkInfo'

export default function RegisterClient() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [emailSent, setEmailSent] = useState(false)

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      setError('Please enter your email')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true
        }
      })

      if (error) throw error

      // Track successful registration
      trackRegistration('email')
      setEmailSent(true)
    } catch (err: any) {
      setError(err.message || 'An error occurred while sending the magic link')
    } finally {
      setIsLoading(false)
    }
  }

  if (emailSent) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-pink-300 flex items-center justify-center px-4 py-8 md:py-12">
          <div className="w-full max-w-md">
            <div className="bg-white border-4 md:border-8 border-black p-6 md:p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="text-center">
                <h1 className="text-3xl md:text-4xl font-black mb-4">CHECK YOUR EMAIL!</h1>
                <div className="mb-6">
                  <div className="text-6xl mb-4">📧</div>
                  <p className="font-bold text-base md:text-lg mb-2">
                    WE&apos;VE SENT A MAGIC LINK TO:
                  </p>
                  <p className="font-black text-lg bg-yellow-300 px-4 py-2 inline-block border-2 border-black">
                    {email}
                  </p>
                </div>
                <p className="font-bold text-sm text-gray-600 mb-4">
                  CLICK THE LINK IN YOUR EMAIL TO COMPLETE REGISTRATION
                </p>
                <MagicLinkInfo />
                <button
                  onClick={() => {
                    setEmailSent(false)
                    setEmail('')
                  }}
                  className="w-full px-4 md:px-6 py-3 bg-black text-white border-4 border-black font-black text-base md:text-lg hover:bg-yellow-400 hover:text-black transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  ← TRY A DIFFERENT EMAIL
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-pink-300 flex items-center justify-center px-4 py-8 md:py-12">
        <div className="w-full max-w-md">
          <div className="bg-white border-4 md:border-8 border-black p-6 md:p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="text-center mb-6 md:mb-8">
              <h1 className="text-3xl md:text-4xl font-black mb-2">JOIN THE BAND!</h1>
              <p className="font-bold text-base md:text-lg">NO PASSWORD REQUIRED</p>
            </div>

            <form onSubmit={handleMagicLink} className="space-y-4">
                <div>
                  <label className="block font-black mb-2 text-sm">EMAIL ADDRESS</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="YOUR@EMAIL.COM"
                    className="w-full px-4 py-3 border-4 border-black font-bold text-base placeholder:text-gray-400 focus:outline-none focus:bg-yellow-100 transition-colors"
                    required
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-400 border-4 border-black">
                    <p className="font-black text-sm">{error.toUpperCase()}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-4 md:px-6 py-3 bg-black text-white border-4 border-black font-black text-base md:text-lg hover:bg-lime-400 hover:text-black transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50"
                >
                  {isLoading ? 'SENDING MAGIC LINK...' : 'SEND MAGIC LINK →'}
                </button>
              </form>

              <p className="text-center font-bold text-sm text-gray-600">
                WE&apos;LL EMAIL YOU A MAGIC LINK TO SIGN IN INSTANTLY
              </p>

            <div className="mt-8 pt-6 border-t-4 border-black">
              <p className="text-center font-bold">
                ALREADY A MEMBER?
              </p>
              <Link 
                href="/auth/login" 
                className="block mt-2 px-4 md:px-6 py-3 bg-yellow-300 border-4 border-black font-black text-center hover:bg-yellow-400 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                SIGN IN →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
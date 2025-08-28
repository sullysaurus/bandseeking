'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navigation from '@/components/layout/Navigation'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check if we have a code parameter (Magic Link)
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        
        if (code) {
          // Exchange the code for a session (Magic Link)
          const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)
          
          if (error) {
            console.error('Error exchanging code for session:', error)
            router.push('/auth/login')
            return
          }
          
          if (session) {
            // Get the user's profile to redirect to their profile page
            const { data: profile } = await supabase
              .from('profiles')
              .select('username')
              .eq('user_id', session.user.id)
              .single()

            if (profile?.username) {
              // Redirect to their profile page
              router.push(`/profile/${profile.username}`)
            } else {
              // Fallback to dashboard if no profile found
              router.push('/dashboard')
            }
            return
          }
        }
        
        // Fallback: Check for existing session
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          router.push('/auth/login')
          return
        }

        if (session) {
          // Get the user's profile to redirect to their profile page
          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('user_id', session.user.id)
            .single()

          if (profile?.username) {
            // Redirect to their profile page
            router.push(`/profile/${profile.username}`)
          } else {
            // Fallback to dashboard if no profile found
            router.push('/dashboard')
          }
        } else {
          router.push('/auth/login')
        }
      } catch (error) {
        console.error('Error in auth callback:', error)
        router.push('/auth/login')
      }
    }

    handleCallback()
  }, [router])

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-cyan-300 to-pink-300 flex items-center justify-center px-4">
        <div className="bg-white border-4 border-black p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="text-center">
            <div className="text-6xl mb-4">🎸</div>
            <h1 className="text-2xl font-black mb-2">SIGNING YOU IN...</h1>
            <p className="font-bold text-gray-600">PLEASE WAIT A MOMENT</p>
          </div>
        </div>
      </div>
    </>
  )
}
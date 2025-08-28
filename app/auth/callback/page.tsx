'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

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
            // Always redirect to dashboard for new users to complete profile
            router.push('/dashboard')
            return
          }
        }
        
        // Fallback: Check for existing session
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error || !session) {
          router.push('/auth/login')
          return
        }

        // User has session, go to dashboard
        router.push('/dashboard')
      } catch (error) {
        console.error('Error in auth callback:', error)
        router.push('/auth/login')
      }
    }

    handleCallback()
  }, [router])

  // Minimal loading screen to reduce flashing
  return (
    <div className="min-h-screen bg-pink-300 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4 animate-pulse">🎸</div>
      </div>
    </div>
  )
}
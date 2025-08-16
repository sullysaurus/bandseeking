'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { profileService } from '@/lib/profiles'
import { isProfileComplete } from '@/lib/profile-utils'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)

        // Handle sign in - redirect to profile for onboarding
        if (event === 'SIGNED_IN' && session?.user) {
          try {
            console.log('User signed in, checking profile...')
            // Try to get profile with timeout (increased to 10 seconds)
            const profilePromise = profileService.getProfile()
            const timeoutPromise = new Promise((_, reject) => {
              setTimeout(() => reject(new Error('PROFILE_TIMEOUT')), 10000)
            })
            
            const profile = await Promise.race([profilePromise, timeoutPromise])
            
            if (!profile) {
              console.log('No profile found, creating one...')
              await profileService.createProfile({
                username: session.user.email?.split('@')[0] || `user_${Date.now()}`,
                full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User'
              })
            }
            
            console.log('Redirecting to dashboard...')
            router.push('/dashboard')
          } catch (error: any) {
            if (error.message === 'PROFILE_TIMEOUT') {
              console.log('Profile check timed out, proceeding anyway...')
            } else {
              console.error('Error handling sign in:', error)
            }
            // Still redirect to dashboard even if there's an error
            console.log('Redirecting to dashboard...')
            router.push('/dashboard')
          }
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
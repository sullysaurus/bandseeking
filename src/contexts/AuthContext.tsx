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
            // Get or create profile
            let profile = await profileService.getProfile()
            if (!profile) {
              profile = await profileService.createProfile({
                username: session.user.email?.split('@')[0] || `user_${Date.now()}`,
                full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User'
              })
            }
            
            // Always redirect to dashboard on sign in
            router.push('/dashboard')
          } catch (error) {
            console.error('Error handling sign in:', error)
            // Still redirect to dashboard even if there's an error
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
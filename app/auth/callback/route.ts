import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { ensureUserRecord } from '@/lib/auth-helpers'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth callback error:', error)
        return NextResponse.redirect(new URL('/auth/error', request.url))
      }
      
      // Ensure user record exists and get user data
      const userData = await ensureUserRecord()
      
      if (userData.profile_completed) {
        // If profile is completed, go to dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url))
      } else {
        // If profile not completed or new user, go to onboarding
        return NextResponse.redirect(new URL('/onboarding', request.url))
      }
    } catch (error) {
      console.error('Error in auth callback:', error)
      return NextResponse.redirect(new URL('/auth/error', request.url))
    }
  }

  // If no code or error, redirect to login
  return NextResponse.redirect(new URL('/auth/login', request.url))
}
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

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
      
      // Get the authenticated user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Check if user has completed their profile
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('profile_completed')
          .eq('id', user.id)
          .single()
        
        // If no user record exists (email confirmation) or profile not completed, go to onboarding
        if (userError || !userData || !userData.profile_completed) {
          return NextResponse.redirect(new URL('/onboarding', request.url))
        } else {
          // If profile is completed, go to dashboard
          return NextResponse.redirect(new URL('/dashboard', request.url))
        }
      }
    } catch (error) {
      console.error('Error in auth callback:', error)
      return NextResponse.redirect(new URL('/auth/error', request.url))
    }
  }

  // If no code or error, redirect to login
  return NextResponse.redirect(new URL('/auth/login', request.url))
}
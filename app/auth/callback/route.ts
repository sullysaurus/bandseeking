import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  console.log('Auth callback called with code:', code ? 'present' : 'missing')

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    try {
      console.log('Exchanging code for session...')
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth exchange error:', error)
        return NextResponse.redirect(new URL('/auth/error', request.url))
      }

      if (!data.user) {
        console.error('No user data after exchange')
        return NextResponse.redirect(new URL('/auth/error', request.url))
      }

      console.log('User authenticated:', {
        id: data.user.id,
        email: data.user.email,
        metadata: data.user.user_metadata
      })

      // Simple approach: just redirect to onboarding for now
      // The onboarding flow will handle user creation
      console.log('Redirecting to onboarding...')
      return NextResponse.redirect(new URL('/onboarding', request.url))

    } catch (error) {
      console.error('Unexpected error in auth callback:', error)
      return NextResponse.redirect(new URL('/auth/error', request.url))
    }
  }

  console.log('No code provided, redirecting to login')
  return NextResponse.redirect(new URL('/auth/login', request.url))
}
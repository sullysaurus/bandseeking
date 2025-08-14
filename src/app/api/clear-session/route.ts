import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  // Clear all Supabase cookies
  const cookieStore = cookies()
  
  // Clear common Supabase cookie names
  const supabaseCookies = [
    'sb-access-token',
    'sb-refresh-token',
    'sb-auth-token',
    'supabase-auth-token'
  ]
  
  supabaseCookies.forEach(cookieName => {
    cookieStore.delete(cookieName)
  })
  
  return NextResponse.json({ 
    message: 'Session cleared. Please sign in again.',
    redirect: '/auth/signin'
  })
}
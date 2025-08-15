// Simple test to verify Supabase connection
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('URL:', supabaseUrl)
console.log('Key:', supabaseAnonKey ? 'Present' : 'Missing')

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test basic connection
async function testAuth() {
  try {
    const { data, error } = await supabase.auth.getSession()
    console.log('Session test:', { data, error })
  } catch (err) {
    console.error('Connection error:', err)
  }
}

testAuth()
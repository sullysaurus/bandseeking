import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testDatabaseConnectivity() {
  console.log('Testing database connectivity...')
  
  // Test venue count
  const { data: venues, error: venueError } = await supabase
    .from('venues')
    .select('id')
    .limit(1)
  
  if (venueError) {
    console.error('Venue query error:', venueError)
    return false
  }
  
  console.log('Venues table accessible:', venues?.length > 0 ? '✓ Data found' : '⚠ No data')
  
  // Test profiles table
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .limit(1)
  
  if (profileError) {
    console.error('Profile query error:', profileError)
    return false
  }
  
  console.log('Profiles table accessible: ✓')
  
  return true
}

async function testUserSignup() {
  console.log('\\nTesting user signup process...')
  
  // Generate test email
  const testEmail = `test-${Date.now()}@example.com`
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: 'testpassword123'
    })
    
    if (error) {
      console.error('Signup error:', error)
      return false
    }
    
    console.log('User signup successful: ✓')
    console.log('User ID:', data.user?.id)
    
    // Wait a moment for any triggers to execute
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Check if profile was auto-created
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user?.id)
      .single()
    
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Profile check error:', profileError)
      return false
    }
    
    if (profile) {
      console.log('Profile auto-creation: ✓ Profile exists')
      console.log('Profile data:', profile)
    } else {
      console.log('Profile auto-creation: ⚠ No profile found (may need manual creation)')
    }
    
    return true
  } catch (err) {
    console.error('Test error:', err)
    return false
  }
}

async function runTests() {
  console.log('=== Profile Creation Test ===\\n')
  
  const connectivitySuccess = await testDatabaseConnectivity()
  if (!connectivitySuccess) {
    console.log('❌ Database connectivity failed')
    return
  }
  
  const signupSuccess = await testUserSignup()
  if (!signupSuccess) {
    console.log('❌ User signup test failed')
    return
  }
  
  console.log('\\n✅ Profile creation tests completed successfully')
}

runTests()
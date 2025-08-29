import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testManualProfileCreation() {
  console.log('=== Manual Profile Creation Test ===\\n')
  
  // Create a test user
  const testEmail = `manual-test-${Date.now()}@example.com`
  
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'testpassword123'
    })
    
    if (authError) {
      console.error('Auth error:', authError)
      return false
    }
    
    console.log('User created: ✓')
    const userId = authData.user?.id
    
    if (!userId) {
      console.error('No user ID returned')
      return false
    }
    
    // Manually create profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        full_name: 'Test User',
        email: testEmail,
        is_published: false,
        profile_type: 'musician',
        city: 'Durham',
        state: 'NC',
        bio: 'Test bio for profile creation',
        instruments: ['Guitar'],
        genres: ['Rock'],
        seeking: ['Band members']
      })
      .select()
      .single()
    
    if (profileError) {
      console.error('Profile creation error:', profileError)
      return false
    }
    
    console.log('Manual profile creation: ✓')
    console.log('Profile data:', profileData)
    
    // Test profile retrieval
    const { data: retrievedProfile, error: retrievalError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (retrievalError) {
      console.error('Profile retrieval error:', retrievalError)
      return false
    }
    
    console.log('Profile retrieval: ✓')
    
    return true
  } catch (err) {
    console.error('Test error:', err)
    return false
  }
}

testManualProfileCreation().then(success => {
  if (success) {
    console.log('\\n✅ Manual profile creation works correctly')
  } else {
    console.log('\\n❌ Manual profile creation failed')
  }
})
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testAutoProfileCreation() {
  console.log('=== Automatic Profile Creation Test ===\\n')
  
  // Create a test user
  const testEmail = `auto-test-${Date.now()}@example.com`
  
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
    console.log('User ID:', authData.user?.id)
    
    if (!authData.user?.id) {
      console.error('No user ID returned')
      return false
    }
    
    // Wait for trigger to execute
    console.log('Waiting for trigger to execute...')
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Check if profile was auto-created
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', authData.user.id)
      .single()
    
    if (profileError) {
      console.error('Profile retrieval error:', profileError)
      return false
    }
    
    if (profile) {
      console.log('✅ Profile auto-creation successful!')
      console.log('Auto-created profile:', {
        id: profile.id,
        username: profile.username,
        full_name: profile.full_name,
        email: profile.email,
        main_instrument: profile.main_instrument,
        bio: profile.bio,
        city: profile.city,
        state: profile.state,
        is_published: profile.is_published,
        seeking: profile.seeking
      })
      return true
    } else {
      console.log('❌ No profile was auto-created')
      return false
    }
    
  } catch (err) {
    console.error('Test error:', err)
    return false
  }
}

testAutoProfileCreation().then(success => {
  if (success) {
    console.log('\\n🎉 Automatic profile creation is working correctly!')
  } else {
    console.log('\\n💥 Automatic profile creation failed')
  }
})
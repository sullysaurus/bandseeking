import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testCorrectProfileCreation() {
  console.log('=== Correct Schema Profile Creation Test ===\\n')
  
  // Create a test user
  const testEmail = `schema-test-${Date.now()}@example.com`
  
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
    
    // Create profile with correct schema
    const profileData = {
      id: userId,
      user_id: userId,
      email: testEmail,
      username: `testuser${Date.now()}`,
      full_name: 'Test User Schema',
      city: 'Durham',
      state: 'NC',
      profile_completed: false,
      bio: 'Test bio for schema verification',
      main_instrument: 'Guitar',
      secondary_instruments: ['Bass'],
      experience_level: 'intermediate',
      seeking: ['Band members'],
      genres: ['Rock'],
      has_transportation: true,
      has_own_equipment: true,
      willing_to_travel_miles: 25,
      is_published: false
    }
    
    console.log('Attempting profile creation with data:', profileData)
    
    const { data: createdProfile, error: profileError } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single()
    
    if (profileError) {
      console.error('Profile creation error:', profileError)
      return false
    }
    
    console.log('Schema-correct profile creation: ✓')
    console.log('Created profile:', createdProfile)
    
    return true
  } catch (err) {
    console.error('Test error:', err)
    return false
  }
}

testCorrectProfileCreation().then(success => {
  if (success) {
    console.log('\\n✅ Schema-correct profile creation works!')
  } else {
    console.log('\\n❌ Schema-correct profile creation failed')
  }
})
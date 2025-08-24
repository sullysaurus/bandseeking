import { createClient } from '@supabase/supabase-js'

// Create a server-side Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false
  }
})

export async function getRecentProfiles(limit = 12) {
  try {
    console.log('Fetching recent profiles with limit:', limit)
    const { data, error } = await supabaseServer
      .from('profiles')
      .select(`
        *,
        user:users(*)
      `)
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching profiles:', error)
      return []
    }

    console.log('Found profiles:', data?.length || 0)
    return data || []
  } catch (error) {
    console.error('Error in getRecentProfiles:', error)
    return []
  }
}

export async function getProfileByUsername(username: string) {
  try {
    const { data: userData } = await supabaseServer
      .from('users')
      .select('*')
      .eq('username', username)
      .single()

    if (!userData) return null

    const { data: profileData } = await supabaseServer
      .from('profiles')
      .select('*')
      .eq('user_id', userData.id)
      .single()

    return {
      user: userData,
      profile: profileData
    }
  } catch (error) {
    console.error('Error in getProfileByUsername:', error)
    return null
  }
}

export async function getAllPublishedProfiles() {
  try {
    const { data, error } = await supabaseServer
      .from('profiles')
      .select(`
        *,
        user:users(*)
      `)
      .eq('is_published', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching all profiles:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getAllPublishedProfiles:', error)
    return []
  }
}
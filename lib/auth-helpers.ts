import { supabase } from './supabase'

export async function ensureUserRecord() {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      throw new Error('User not authenticated')
    }

    console.log('Checking user record for:', user.id)

    // Check if user record exists in database
    const { data: userRecord, error: userRecordError } = await supabase
      .from('users')
      .select('id, profile_completed, username, full_name')
      .eq('id', user.id)
      .single()

    if (userRecordError && userRecordError.code === 'PGRST116') {
      // User record doesn't exist, create it
      console.log('Creating missing user record...')
      
      const userData = {
        id: user.id,
        email: user.email || '',
        username: user.user_metadata?.username || user.email?.split('@')[0] || `user_${user.id.substring(0, 8)}`,
        full_name: user.user_metadata?.full_name || user.user_metadata?.username || 'User',
        zip_code: user.user_metadata?.zip_code || null,
        profile_completed: false
      }

      const { error: createUserError } = await supabase
        .from('users')
        .insert(userData)

      if (createUserError) {
        console.error('Failed to create user record:', createUserError)
        throw createUserError
      }

      console.log('User record created successfully:', userData)
      return { ...userData, isNewUser: true }
    } else if (userRecordError) {
      console.error('Error checking user record:', userRecordError)
      throw userRecordError
    }

    console.log('User record exists:', userRecord)
    return { ...userRecord, isNewUser: false }
  } catch (error) {
    console.error('Error in ensureUserRecord:', error)
    throw error
  }
}

export async function getUserProfile() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return profile
  } catch (error) {
    console.error('Error getting user profile:', error)
    return null
  }
}
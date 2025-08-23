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
        city: user.user_metadata?.city || null,
        state: user.user_metadata?.state || null,
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
    // Update last_active for existing user
    await updateUserLastActive(user.id)
    
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

export async function updateUserLastActive(userId: string) {
  try {
    const { error } = await supabase
      .from('users')
      .update({ last_active: new Date().toISOString() })
      .eq('id', userId)

    if (error) {
      console.error('Error updating last_active:', error)
    }
  } catch (error) {
    console.error('Error in updateUserLastActive:', error)
  }
}

export function getLastActiveStatus(lastActive: string) {
  const now = new Date()
  const lastActiveDate = new Date(lastActive)
  const diffInMinutes = Math.floor((now.getTime() - lastActiveDate.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 5) {
    return { status: 'online', text: 'ONLINE' }
  } else if (diffInMinutes < 30) {
    return { status: 'recent', text: `${diffInMinutes}M AGO` }
  } else if (diffInMinutes < 60) {
    return { status: 'recent', text: 'RECENTLY ACTIVE' }
  } else if (diffInMinutes < 1440) { // 24 hours
    const hours = Math.floor(diffInMinutes / 60)
    return { status: 'hours', text: `${hours}H AGO` }
  } else {
    const days = Math.floor(diffInMinutes / 1440)
    if (days < 30) {
      return { status: 'days', text: `${days}D AGO` }
    } else {
      return { status: 'inactive', text: 'INACTIVE' }
    }
  }
}
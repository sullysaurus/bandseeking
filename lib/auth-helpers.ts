import { supabase } from './supabase'

export async function ensureUserRecord() {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      throw new Error('User not authenticated')
    }

    console.log('Ensuring user record for:', user.id)

    // First try to get existing user record
    const { data: existingUser, error: selectError } = await supabase
      .from('users')
      .select('id, profile_completed, username, full_name')
      .eq('id', user.id)
      .single()

    if (existingUser) {
      console.log('User record found:', existingUser)
      await updateUserLastActive(user.id)
      return { ...existingUser, isNewUser: false }
    }

    // If user doesn't exist, create them
    if (selectError && selectError.code === 'PGRST116') {
      console.log('Creating new user record...')
      
      // Generate safe username
      let username = user.user_metadata?.full_name?.toLowerCase().replace(/[^a-z0-9]/g, '') || 
                    user.email?.split('@')[0]?.replace(/[^a-z0-9]/g, '') || 
                    `user${user.id.substring(0, 8)}`
      
      if (username.length < 3) {
        username = `user${user.id.substring(0, 8)}`
      }

      const userData = {
        id: user.id,
        email: user.email || '',
        username: username,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || 'User',
        profile_completed: false
      }

      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert(userData)
        .select('id, profile_completed, username, full_name')
        .single()

      if (insertError) {
        console.error('Failed to create user record:', insertError)
        throw insertError
      }

      console.log('New user created:', newUser)
      await updateUserLastActive(user.id)
      return { ...newUser, isNewUser: true }
    }

    // If there was a different error
    console.error('Error fetching user record:', selectError)
    throw selectError

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
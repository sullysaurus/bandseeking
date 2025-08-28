import { supabase } from './supabase'

export async function ensureUserProfile() {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      throw new Error('User not authenticated')
    }

    console.log('Ensuring profile for user:', user.id)

    // Check if profile exists
    const { data: existingProfile, error: selectError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (existingProfile) {
      console.log('Profile found:', existingProfile)
      await updateUserLastActive(user.id)
      return { ...existingProfile, isNewUser: false }
    }

    // Profile should be created by trigger, but handle if missing
    if (selectError && selectError.code === 'PGRST116') {
      console.log('Profile not found, will be created on first update')
      return { 
        user_id: user.id,
        email: user.email || '',
        profile_completed: false,
        isNewUser: true 
      }
    }

    // If there was a different error
    console.error('Error fetching profile:', selectError)
    throw selectError

  } catch (error) {
    console.error('Error in ensureUserProfile:', error)
    throw error
  }
}

// Alias for backwards compatibility
export const ensureUserRecord = ensureUserProfile

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
      .from('profiles')
      .update({ last_active: new Date().toISOString() })
      .eq('user_id', userId)

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
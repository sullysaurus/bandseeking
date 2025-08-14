import { supabase } from './supabase'

export interface Profile {
  id: string
  username: string
  full_name: string | null
  bio: string | null
  location: string | null
  instruments: string[]
  genres: string[]
  experience_level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Professional' | null
  looking_for: string[]
  website: string | null
  instagram: string | null
  twitter: string | null
  github: string | null
  phone: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
  last_active_at?: string | null
  response_time_type?: 'quick' | 'standard' | 'slow' | null
  avg_response_minutes?: number | null
}

export interface ProfileUpdate {
  username?: string
  full_name?: string
  bio?: string
  location?: string
  instruments?: string[]
  genres?: string[]
  experience_level?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Professional'
  looking_for?: string[]
  website?: string
  instagram?: string
  twitter?: string
  github?: string
  phone?: string
  avatar_url?: string
}

class ProfileService {
  // Get current user's profile
  async getProfile(userId?: string): Promise<Profile | null> {
    try {
      let targetUserId = userId
      
      if (!targetUserId) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return null
        targetUserId = user.id
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetUserId)
        .limit(1)

      if (error) {
        // Don't log if user is not authenticated
        if (!error.message?.includes('JWT')) {
          console.error('Error fetching profile:', error.message || 'Unknown error')
        }
        return null
      }

      // Handle multiple profiles by taking the first one
      if (data && data.length > 1) {
        console.warn(`Found ${data.length} profiles for user ${targetUserId}, using the first one`)
        return data[0]
      }

      if (!data || data.length === 0) {
        return null
      }

      return data[0]
    } catch (error) {
      console.error('Error in getProfile:', error)
      return null
    }
  }

  // Update current user's profile
  async updateProfile(updates: ProfileUpdate): Promise<Profile | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No authenticated user')

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating profile:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error in updateProfile:', error)
      throw error
    }
  }

  // Create a new profile (usually called automatically via trigger)
  async createProfile(profileData: Partial<ProfileUpdate>): Promise<Profile | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No authenticated user')

      // Check if profile already exists first
      const existing = await this.getProfile()
      if (existing) {
        console.log('Profile already exists, returning existing profile')
        return existing
      }

      const { data, error } = await supabase
        .from('profiles')
        .upsert([
          {
            id: user.id,
            ...profileData
          }
        ])
        .select()
        .single()

      if (error) {
        console.error('Error creating profile:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error in createProfile:', error)
      throw error
    }
  }

  // Delete current user's profile
  async deleteProfile(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No authenticated user')

      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id)

      if (error) {
        console.error('Error deleting profile:', error)
        throw error
      }

      return true
    } catch (error) {
      console.error('Error in deleteProfile:', error)
      throw error
    }
  }

  // Search profiles by username or other criteria
  async searchProfiles(query: string): Promise<Profile[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
        .limit(20)

      if (error) {
        console.error('Error searching profiles:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in searchProfiles:', error)
      return []
    }
  }

  // Get all musicians for discovery
  async getAllMusicians(): Promise<Profile[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching musicians:', error)
      return []
    }
  }

  // Get count of all musicians
  async getMusiciansCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
      
      if (error) throw error
      return count || 0
    } catch (error) {
      console.error('Error fetching musicians count:', error)
      return 0
    }
  }

  // Get profile by ID
  async getProfileById(userId: string): Promise<Profile | null> {
    return this.getProfile(userId)
  }

  // Get profile by username
  async getProfileByUsername(username: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single()

      if (error) {
        console.error('Error fetching profile by username:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in getProfileByUsername:', error)
      return null
    }
  }

  // Upload avatar image
  async uploadAvatar(file: File): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No authenticated user')

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image')
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB')
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`

      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Error uploading avatar:', error)
        throw error
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      // Update profile with new avatar URL
      await this.updateProfile({ avatar_url: publicUrl })

      return publicUrl
    } catch (error) {
      console.error('Error in uploadAvatar:', error)
      throw error
    }
  }

  // Remove avatar
  async removeAvatar(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No authenticated user')

      // Get current profile to find avatar URL
      const profile = await this.getProfile()
      if (!profile?.avatar_url) return true

      // Extract file path from URL
      const url = profile.avatar_url
      const path = url.split('/').slice(-2).join('/')

      // Delete from storage
      const { error } = await supabase.storage
        .from('avatars')
        .remove([path])

      if (error) {
        console.error('Error removing avatar:', error)
        throw error
      }

      // Update profile to remove avatar URL
      await this.updateProfile({ avatar_url: null })

      return true
    } catch (error) {
      console.error('Error in removeAvatar:', error)
      throw error
    }
  }
}

export const profileService = new ProfileService()
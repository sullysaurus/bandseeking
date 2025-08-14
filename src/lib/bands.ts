import { supabase } from './supabase'

export interface Band {
  id: string
  name: string
  slug: string
  owner_id: string
  description: string | null
  location: string | null
  genre: string | null
  status: 'recruiting' | 'complete' | 'on_hold'
  formed_year: number | null
  website: string | null
  instagram: string | null
  twitter: string | null
  youtube: string | null
  spotify: string | null
  avatar_url: string | null
  looking_for: string[]
  created_at: string
  updated_at: string
}

export interface BandMember {
  id: string
  band_id: string
  user_id: string
  role: string | null
  joined_at: string
  is_active: boolean
}

export interface BandApplication {
  id: string
  band_id: string
  user_id: string
  message: string | null
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  updated_at: string
}

export interface BandCreate {
  name: string
  description?: string
  location?: string
  genre?: string
  status?: 'recruiting' | 'complete' | 'on_hold'
  formed_year?: number
  website?: string
  instagram?: string
  twitter?: string
  youtube?: string
  spotify?: string
  looking_for?: string[]
}

export interface BandUpdate extends Partial<BandCreate> {
  avatar_url?: string
}

class BandService {
  // Generate a URL-friendly slug from band name
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 100)
  }

  // Ensure slug is unique by appending numbers if needed
  private async ensureUniqueSlug(baseSlug: string): Promise<string> {
    let slug = baseSlug
    let counter = 1
    
    try {
      while (true) {
        const { data, error } = await supabase
          .from('bands')
          .select('id')
          .eq('slug', slug)
          .single()
        
        // If table doesn't exist, just return the base slug
        if (error?.code === '42P01') {
          return slug
        }
        
        if (!data) return slug
        
        slug = `${baseSlug}-${counter}`
        counter++
      }
    } catch (error) {
      // If there's any error, just return the base slug
      console.warn('Error checking slug uniqueness:', error)
      return baseSlug
    }
  }

  // Create a new band
  async createBand(bandData: BandCreate): Promise<Band | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const baseSlug = this.generateSlug(bandData.name)
      const slug = await this.ensureUniqueSlug(baseSlug)

      const { data, error } = await supabase
        .from('bands')
        .insert({
          ...bandData,
          slug,
          owner_id: user.id,
          looking_for: bandData.looking_for || []
        })
        .select()
        .single()

      if (error) {
        // Handle case where table doesn't exist yet
        if (error.code === '42P01') {
          console.warn('Bands table does not exist yet. Please run database migrations.')
          throw new Error('Database not set up yet. Please run migrations when Docker is available.')
        }
        throw error
      }

      // Automatically add the creator as the first member
      if (data) {
        try {
          await this.addMember(data.id, user.id, 'Founder')
        } catch (memberError) {
          // If adding member fails, that's okay - the band was still created
          console.warn('Could not add creator as member:', memberError)
        }
      }

      return data
    } catch (error: any) {
      console.error('Error creating band:', error)
      // Re-throw database setup errors for frontend to handle
      if (error.message?.includes('Database not set up yet')) {
        throw error
      }
      return null
    }
  }

  // Get all bands
  async getAllBands(): Promise<Band[]> {
    try {
      const { data, error } = await supabase
        .from('bands')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        // Handle case where table doesn't exist yet
        if (error.code === '42P01') {
          console.warn('Bands table does not exist yet. Please run database migrations.')
          return []
        }
        throw error
      }
      return data || []
    } catch (error: any) {
      // Don't log table missing errors as they're expected
      if (error && error.code !== '42P01' && !error.message?.includes('does not exist')) {
        console.error('Error fetching bands:', error)
      }
      return []
    }
  }

  // Get bands owned by current user
  async getMyBands(): Promise<Band[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data, error } = await supabase
        .from('bands')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        // Handle case where table doesn't exist yet
        if (error.code === '42P01') {
          console.warn('Bands table does not exist yet. Please run database migrations.')
          return []
        }
        throw error
      }
      return data || []
    } catch (error: any) {
      // Don't log table missing errors as they're expected
      if (error.code !== '42P01' && !error.message?.includes('does not exist')) {
        console.error('Error fetching my bands:', error)
      }
      return []
    }
  }

  // Get bands where user is a member
  async getBandsAsMember(): Promise<Band[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data, error } = await supabase
        .from('band_members')
        .select('band_id')
        .eq('user_id', user.id)
        .eq('is_active', true)

      if (error) {
        // Handle case where table doesn't exist yet
        if (error.code === '42P01') {
          console.warn('Band members table does not exist yet. Please run database migrations.')
          return []
        }
        throw error
      }
      if (!data || data.length === 0) return []

      const bandIds = data.map(m => m.band_id)
      
      const { data: bands, error: bandsError } = await supabase
        .from('bands')
        .select('*')
        .in('id', bandIds)
        .order('created_at', { ascending: false })

      if (bandsError) {
        // Handle case where table doesn't exist yet
        if (bandsError.code === '42P01') {
          console.warn('Bands table does not exist yet. Please run database migrations.')
          return []
        }
        throw bandsError
      }
      return bands || []
    } catch (error: any) {
      // Don't log table missing errors as they're expected
      if (error.code !== '42P01' && !error.message?.includes('does not exist')) {
        console.error('Error fetching bands as member:', error)
      }
      return []
    }
  }

  // Get band by ID
  async getBandById(id: string): Promise<Band | null> {
    try {
      const { data, error } = await supabase
        .from('bands')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching band:', error)
      return null
    }
  }

  // Get band by slug
  async getBandBySlug(slug: string): Promise<Band | null> {
    try {
      const { data, error } = await supabase
        .from('bands')
        .select('*')
        .eq('slug', slug)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching band by slug:', error)
      return null
    }
  }

  // Update band
  async updateBand(id: string, updates: BandUpdate): Promise<Band | null> {
    try {
      const { data, error } = await supabase
        .from('bands')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating band:', error)
      return null
    }
  }

  // Delete band
  async deleteBand(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('bands')
        .delete()
        .eq('id', id)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting band:', error)
      return false
    }
  }

  // Add member to band
  async addMember(bandId: string, userId: string, role?: string): Promise<BandMember | null> {
    try {
      const { data, error } = await supabase
        .from('band_members')
        .insert({
          band_id: bandId,
          user_id: userId,
          role
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error adding band member:', error)
      return null
    }
  }

  // Get band members
  async getBandMembers(bandId: string): Promise<BandMember[]> {
    try {
      const { data, error } = await supabase
        .from('band_members')
        .select('*')
        .eq('band_id', bandId)
        .eq('is_active', true)
        .order('joined_at', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching band members:', error)
      return []
    }
  }

  // Remove member from band
  async removeMember(bandId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('band_members')
        .update({ is_active: false })
        .eq('band_id', bandId)
        .eq('user_id', userId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error removing band member:', error)
      return false
    }
  }

  // Apply to join a band
  async applyToBand(bandId: string, message?: string): Promise<BandApplication | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('band_applications')
        .insert({
          band_id: bandId,
          user_id: user.id,
          message
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error applying to band:', error)
      return null
    }
  }

  // Get applications for a band (owner only)
  async getBandApplications(bandId: string): Promise<BandApplication[]> {
    try {
      const { data, error } = await supabase
        .from('band_applications')
        .select('*')
        .eq('band_id', bandId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching band applications:', error)
      return []
    }
  }

  // Update application status
  async updateApplicationStatus(
    applicationId: string, 
    status: 'accepted' | 'rejected'
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('band_applications')
        .update({ status })
        .eq('id', applicationId)

      if (error) throw error

      // If accepted, add user as a band member
      if (status === 'accepted') {
        const { data: application } = await supabase
          .from('band_applications')
          .select('band_id, user_id')
          .eq('id', applicationId)
          .single()

        if (application) {
          await this.addMember(application.band_id, application.user_id)
        }
      }

      return true
    } catch (error) {
      console.error('Error updating application status:', error)
      return false
    }
  }

  // Upload band avatar
  async uploadAvatar(bandId: string, file: File): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${bandId}-${Math.random()}.${fileExt}`
      const filePath = `band-avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Update band with new avatar URL
      await this.updateBand(bandId, { avatar_url: data.publicUrl })

      return data.publicUrl
    } catch (error) {
      console.error('Error uploading band avatar:', error)
      return null
    }
  }

  // Remove band avatar
  async removeAvatar(bandId: string, avatarUrl: string): Promise<boolean> {
    try {
      // Extract file path from URL
      const urlParts = avatarUrl.split('/')
      const fileName = urlParts[urlParts.length - 1]
      const filePath = `band-avatars/${fileName}`

      const { error: deleteError } = await supabase.storage
        .from('avatars')
        .remove([filePath])

      if (deleteError) throw deleteError

      // Update band to remove avatar URL
      await this.updateBand(bandId, { avatar_url: null })

      return true
    } catch (error) {
      console.error('Error removing band avatar:', error)
      return false
    }
  }
}

export const bandService = new BandService()
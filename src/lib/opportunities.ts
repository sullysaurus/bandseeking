import { supabase } from './supabase'

export interface Opportunity {
  id: string
  creator_id: string
  title: string
  description: string
  type: 'gig' | 'session' | 'audition' | 'collaboration' | 'teaching' | 'recording' | 'other'
  location?: string | null
  is_remote: boolean
  is_paid: boolean
  payment_amount?: string | null
  date_time?: string | null
  deadline?: string | null
  requirements: string[]
  genres: string[]
  instruments_needed: string[]
  experience_level?: string | null
  contact_method: 'platform' | 'email' | 'phone' | 'external'
  contact_info?: string | null
  status: 'active' | 'filled' | 'cancelled' | 'expired'
  views_count: number
  applications_count: number
  created_at: string
  updated_at: string
  creator_username?: string
  creator_name?: string
  creator_avatar?: string
  creator_location?: string
  application_count?: number
  saved_count?: number
}

export interface OpportunityApplication {
  id: string
  opportunity_id: string
  applicant_id: string
  message?: string | null
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
  created_at: string
  updated_at: string
}

export interface CreateOpportunityData {
  title: string
  description: string
  type: Opportunity['type']
  location?: string
  is_remote?: boolean
  is_paid?: boolean
  payment_amount?: string
  date_time?: string
  deadline?: string
  requirements?: string[]
  genres?: string[]
  instruments_needed?: string[]
  experience_level?: string
  contact_method?: Opportunity['contact_method']
  contact_info?: string
}

class OpportunityService {
  // Get all opportunities with filters
  async getOpportunities(filters?: {
    type?: string
    location?: string
    is_remote?: boolean
    is_paid?: boolean
    genres?: string[]
    instruments?: string[]
    search?: string
  }): Promise<Opportunity[]> {
    try {
      let query = supabase
        .from('opportunities_with_profiles')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (filters?.type) {
        query = query.eq('type', filters.type)
      }

      if (filters?.is_remote !== undefined) {
        query = query.eq('is_remote', filters.is_remote)
      }

      if (filters?.is_paid !== undefined) {
        query = query.eq('is_paid', filters.is_paid)
      }

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }

      const { data, error } = await query

      if (error) throw error

      let opportunities = data || []

      // Filter by genres
      if (filters?.genres && filters.genres.length > 0) {
        opportunities = opportunities.filter(opp => 
          opp.genres && opp.genres.some((genre: string) => 
            filters.genres!.includes(genre)
          )
        )
      }

      // Filter by instruments
      if (filters?.instruments && filters.instruments.length > 0) {
        opportunities = opportunities.filter(opp => 
          opp.instruments_needed && opp.instruments_needed.some((instrument: string) => 
            filters.instruments!.includes(instrument)
          )
        )
      }

      return opportunities
    } catch (error) {
      console.error('Error fetching opportunities:', error)
      return []
    }
  }

  // Get user's own opportunities
  async getMyOpportunities(): Promise<Opportunity[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('opportunities_with_profiles')
        .select('*')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching my opportunities:', error)
      return []
    }
  }

  // Get saved opportunities
  async getSavedOpportunities(): Promise<Opportunity[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('saved_opportunities')
        .select(`
          opportunity:opportunities_with_profiles(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data?.map(item => item.opportunity).filter(Boolean) || []
    } catch (error) {
      console.error('Error fetching saved opportunities:', error)
      return []
    }
  }

  // Get opportunity by ID
  async getOpportunity(id: string): Promise<Opportunity | null> {
    try {
      const { data, error } = await supabase
        .from('opportunities_with_profiles')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      // Increment view count
      await supabase.rpc('increment_opportunity_views', { opp_id: id })

      return data
    } catch (error) {
      console.error('Error fetching opportunity:', error)
      return null
    }
  }

  // Create opportunity
  async createOpportunity(data: CreateOpportunityData): Promise<Opportunity | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: opportunity, error } = await supabase
        .from('opportunities')
        .insert({
          creator_id: user.id,
          ...data,
          requirements: data.requirements || [],
          genres: data.genres || [],
          instruments_needed: data.instruments_needed || [],
          contact_method: data.contact_method || 'platform'
        })
        .select()
        .single()

      if (error) throw error
      return opportunity
    } catch (error) {
      console.error('Error creating opportunity:', error)
      throw error
    }
  }

  // Update opportunity
  async updateOpportunity(id: string, data: Partial<CreateOpportunityData>): Promise<Opportunity | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: opportunity, error } = await supabase
        .from('opportunities')
        .update(data)
        .eq('id', id)
        .eq('creator_id', user.id)
        .select()
        .single()

      if (error) throw error
      return opportunity
    } catch (error) {
      console.error('Error updating opportunity:', error)
      throw error
    }
  }

  // Delete opportunity
  async deleteOpportunity(id: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('opportunities')
        .delete()
        .eq('id', id)
        .eq('creator_id', user.id)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting opportunity:', error)
      return false
    }
  }

  // Apply to opportunity
  async applyToOpportunity(opportunityId: string, message?: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('opportunity_applications')
        .insert({
          opportunity_id: opportunityId,
          applicant_id: user.id,
          message: message || null
        })

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error applying to opportunity:', error)
      return false
    }
  }

  // Get applications for an opportunity (creator only)
  async getApplications(opportunityId: string): Promise<OpportunityApplication[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('opportunity_applications')
        .select(`
          *,
          applicant:profiles!opportunity_applications_applicant_id_fkey(
            id,
            username,
            full_name,
            avatar_url,
            location,
            instruments,
            genres,
            experience_level
          )
        `)
        .eq('opportunity_id', opportunityId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching applications:', error)
      return []
    }
  }

  // Update application status (creator only)
  async updateApplicationStatus(applicationId: string, status: 'accepted' | 'rejected'): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('opportunity_applications')
        .update({ status })
        .eq('id', applicationId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error updating application status:', error)
      return false
    }
  }

  // Save opportunity
  async saveOpportunity(opportunityId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('saved_opportunities')
        .insert({
          user_id: user.id,
          opportunity_id: opportunityId
        })

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error saving opportunity:', error)
      return false
    }
  }

  // Unsave opportunity
  async unsaveOpportunity(opportunityId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('saved_opportunities')
        .delete()
        .eq('user_id', user.id)
        .eq('opportunity_id', opportunityId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error unsaving opportunity:', error)
      return false
    }
  }

  // Check if opportunity is saved
  async isOpportunitySaved(opportunityId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      const { data } = await supabase
        .from('saved_opportunities')
        .select('id')
        .eq('user_id', user.id)
        .eq('opportunity_id', opportunityId)
        .single()

      return !!data
    } catch (error) {
      return false
    }
  }

  // Get count of all opportunities
  async getOpportunitiesCount(): Promise<number> {
    try {
      // Check authentication first
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        console.log('User not authenticated, returning 0 for opportunities count')
        return 0
      }

      const { count, error } = await supabase
        .from('opportunities')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')

      if (error) throw error
      return count || 0
    } catch (error) {
      console.error('Error fetching opportunities count:', error)
      return 0
    }
  }
}

export const opportunityService = new OpportunityService()
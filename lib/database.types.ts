export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          username: string
          full_name: string
          zip_code: string | null
          latitude: number | null
          longitude: number | null
          profile_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          username: string
          full_name: string
          zip_code?: string | null
          latitude?: number | null
          longitude?: number | null
          profile_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string
          full_name?: string
          zip_code?: string | null
          latitude?: number | null
          longitude?: number | null
          profile_completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          bio: string | null
          main_instrument: string
          secondary_instruments: string[] | null
          experience_level: 'beginner' | 'intermediate' | 'advanced' | 'professional'
          seeking: string[] | null
          genres: string[] | null
          influences: string | null
          availability: ('weekdays' | 'weekends' | 'evenings' | 'flexible')[] | null
          has_transportation: boolean
          has_own_equipment: boolean
          willing_to_travel_miles: number
          social_links: Json | null
          profile_image_url: string | null
          audio_samples: string[] | null
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          bio?: string | null
          main_instrument: string
          secondary_instruments?: string[] | null
          experience_level: 'beginner' | 'intermediate' | 'advanced' | 'professional'
          seeking?: string[] | null
          genres?: string[] | null
          influences?: string | null
          availability?: ('weekdays' | 'weekends' | 'evenings' | 'flexible')[] | null
          has_transportation?: boolean
          has_own_equipment?: boolean
          willing_to_travel_miles?: number
          social_links?: Json | null
          profile_image_url?: string | null
          audio_samples?: string[] | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          bio?: string | null
          main_instrument?: string
          secondary_instruments?: string[] | null
          experience_level?: 'beginner' | 'intermediate' | 'advanced' | 'professional'
          seeking?: string[] | null
          genres?: string[] | null
          influences?: string | null
          availability?: ('weekdays' | 'weekends' | 'evenings' | 'flexible')[] | null
          has_transportation?: boolean
          has_own_equipment?: boolean
          willing_to_travel_miles?: number
          social_links?: Json | null
          profile_image_url?: string | null
          audio_samples?: string[] | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      saved_profiles: {
        Row: {
          id: string
          user_id: string
          saved_user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          saved_user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          saved_user_id?: string
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          content: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          content: string
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          content?: string
          read?: boolean
          created_at?: string
        }
      }
      venues: {
        Row: {
          id: string
          name: string
          address: string
          city: string
          state: string
          zip_code: string
          capacity: number | null
          venue_type: 'music_venue' | 'brewery' | 'coffee_shop' | 'restaurant' | 'bar' | 'event_space' | 'amphitheater' | 'theater' | 'arena'
          website: string | null
          social_platform: string | null
          social_handle: string | null
          contact_email: string | null
          description: string | null
          genres: string[] | null
          booking_info: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address: string
          city: string
          state?: string
          zip_code: string
          capacity_min?: number | null
          capacity_max?: number | null
          venue_type: 'music_venue' | 'brewery' | 'coffee_shop' | 'restaurant' | 'bar' | 'event_space' | 'amphitheater' | 'theater' | 'arena'
          website?: string | null
          social_platform?: string | null
          social_handle?: string | null
          contact_email?: string | null
          description?: string | null
          genres?: string[] | null
          booking_info?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string
          city?: string
          state?: string
          zip_code?: string
          capacity_min?: number | null
          capacity_max?: number | null
          venue_type?: 'music_venue' | 'brewery' | 'coffee_shop' | 'restaurant' | 'bar' | 'event_space' | 'amphitheater' | 'theater'
          website?: string | null
          social_platform?: string | null
          social_handle?: string | null
          contact_email?: string | null
          description?: string | null
          genres?: string[] | null
          booking_info?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      venue_reports: {
        Row: {
          id: string
          venue_id: string
          reporter_id: string | null
          reason: 'incorrect_info' | 'closed_permanently' | 'wrong_location' | 'inappropriate_content' | 'duplicate' | 'other'
          description: string | null
          status: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
          admin_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          venue_id: string
          reporter_id?: string | null
          reason: 'incorrect_info' | 'closed_permanently' | 'wrong_location' | 'inappropriate_content' | 'duplicate' | 'other'
          description?: string | null
          status?: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          venue_id?: string
          reporter_id?: string | null
          reason?: 'incorrect_info' | 'closed_permanently' | 'wrong_location' | 'inappropriate_content' | 'duplicate' | 'other'
          description?: string | null
          status?: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      saved_venues: {
        Row: {
          id: string
          user_id: string
          saved_venue_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          saved_venue_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          saved_venue_id?: string
          created_at?: string
        }
      }
    }
  }
}
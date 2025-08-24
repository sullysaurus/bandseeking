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
    }
  }
}
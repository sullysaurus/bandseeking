-- Clean consolidated migration
-- This consolidates all necessary schema changes

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create or update profiles table with all required columns
DO $$ 
BEGIN
  -- Add missing columns to profiles if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'seeking') THEN
    ALTER TABLE public.profiles ADD COLUMN seeking TEXT[];
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'genres') THEN
    ALTER TABLE public.profiles ADD COLUMN genres TEXT[];
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'secondary_instruments') THEN
    ALTER TABLE public.profiles ADD COLUMN secondary_instruments TEXT[];
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'experience_level') THEN
    ALTER TABLE public.profiles ADD COLUMN experience_level TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'city') THEN
    ALTER TABLE public.profiles ADD COLUMN city TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'state') THEN
    ALTER TABLE public.profiles ADD COLUMN state TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'zip_code') THEN
    ALTER TABLE public.profiles ADD COLUMN zip_code TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'main_instrument') THEN
    ALTER TABLE public.profiles ADD COLUMN main_instrument TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_published') THEN
    ALTER TABLE public.profiles ADD COLUMN is_published BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'last_active') THEN
    ALTER TABLE public.profiles ADD COLUMN last_active TIMESTAMPTZ DEFAULT now();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'full_name') THEN
    ALTER TABLE public.profiles ADD COLUMN full_name TEXT;
  END IF;
END $$;

-- Add full-text search column to profiles if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'fts') THEN
    ALTER TABLE public.profiles ADD COLUMN fts tsvector;
  END IF;
END $$;

-- Create or update the FTS update function for profiles
CREATE OR REPLACE FUNCTION update_profiles_fts() RETURNS trigger AS $$
BEGIN
  NEW.fts := to_tsvector('english',
    COALESCE(NEW.username, '') || ' ' ||
    COALESCE(NEW.full_name, '') || ' ' ||
    COALESCE(NEW.bio, '') || ' ' ||
    COALESCE(NEW.main_instrument, '') || ' ' ||
    COALESCE(NEW.city, '') || ' ' ||
    COALESCE(NEW.state, '') || ' ' ||
    COALESCE(array_to_string(NEW.secondary_instruments, ' '), '') || ' ' ||
    COALESCE(array_to_string(NEW.genres, ' '), '') || ' ' ||
    COALESCE(array_to_string(NEW.seeking, ' '), '') || ' ' ||
    COALESCE(NEW.experience_level, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for profiles FTS
DROP TRIGGER IF EXISTS update_profiles_fts_trigger ON public.profiles;
CREATE TRIGGER update_profiles_fts_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_profiles_fts();

-- Create GIN index for profiles FTS
DROP INDEX IF EXISTS profiles_fts_idx;
CREATE INDEX profiles_fts_idx ON public.profiles USING gin(fts);

-- Update existing profiles to populate FTS
UPDATE public.profiles SET fts = to_tsvector('english',
  COALESCE(username, '') || ' ' ||
  COALESCE(full_name, '') || ' ' ||
  COALESCE(bio, '') || ' ' ||
  COALESCE(main_instrument, '') || ' ' ||
  COALESCE(city, '') || ' ' ||
  COALESCE(state, '') || ' ' ||
  COALESCE(array_to_string(secondary_instruments, ' '), '') || ' ' ||
  COALESCE(array_to_string(genres, ' '), '') || ' ' ||
  COALESCE(array_to_string(seeking, ' '), '') || ' ' ||
  COALESCE(experience_level, '')
) WHERE fts IS NULL;

-- Add full-text search column to venues if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'venues' AND column_name = 'fts') THEN
    ALTER TABLE public.venues ADD COLUMN fts tsvector;
  END IF;
END $$;

-- Create or update the FTS update function for venues
CREATE OR REPLACE FUNCTION update_venues_fts() RETURNS trigger AS $$
BEGIN
  NEW.fts := to_tsvector('english',
    COALESCE(NEW.name, '') || ' ' ||
    COALESCE(NEW.description, '') || ' ' ||
    COALESCE(NEW.city, '') || ' ' ||
    COALESCE(NEW.state, '') || ' ' ||
    COALESCE(NEW.venue_type::text, '') || ' ' ||
    COALESCE(NEW.address, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for venues FTS
DROP TRIGGER IF EXISTS update_venues_fts_trigger ON public.venues;
CREATE TRIGGER update_venues_fts_trigger
  BEFORE INSERT OR UPDATE ON public.venues
  FOR EACH ROW EXECUTE FUNCTION update_venues_fts();

-- Create GIN index for venues FTS
DROP INDEX IF EXISTS venues_fts_idx;
CREATE INDEX venues_fts_idx ON public.venues USING gin(fts);

-- Update existing venues to populate FTS
UPDATE public.venues SET fts = to_tsvector('english',
  COALESCE(name, '') || ' ' ||
  COALESCE(description, '') || ' ' ||
  COALESCE(city, '') || ' ' ||
  COALESCE(state, '') || ' ' ||
  COALESCE(venue_type::text, '') || ' ' ||
  COALESCE(address, '')
) WHERE fts IS NULL;

-- Create saved_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.saved_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  saved_profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, saved_profile_id)
);

-- Create saved_venues table if it doesn't exist  
CREATE TABLE IF NOT EXISTS public.saved_venues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, venue_id)
);

-- Enable RLS on saved tables
ALTER TABLE public.saved_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_venues ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for saved_profiles
DROP POLICY IF EXISTS "Users can view own saved profiles" ON public.saved_profiles;
CREATE POLICY "Users can view own saved profiles" ON public.saved_profiles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own saved profiles" ON public.saved_profiles;
CREATE POLICY "Users can insert own saved profiles" ON public.saved_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own saved profiles" ON public.saved_profiles;
CREATE POLICY "Users can delete own saved profiles" ON public.saved_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for saved_venues
DROP POLICY IF EXISTS "Users can view own saved venues" ON public.saved_venues;
CREATE POLICY "Users can view own saved venues" ON public.saved_venues
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own saved venues" ON public.saved_venues;
CREATE POLICY "Users can insert own saved venues" ON public.saved_venues
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own saved venues" ON public.saved_venues;
CREATE POLICY "Users can delete own saved venues" ON public.saved_venues
  FOR DELETE USING (auth.uid() = user_id);
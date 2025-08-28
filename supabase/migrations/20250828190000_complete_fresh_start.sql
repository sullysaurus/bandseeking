-- Complete Fresh Start - Single Clean Migration
-- This completely replaces all previous migrations

-- Drop everything first
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS saved_profiles CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS venues CASCADE;
DROP TABLE IF EXISTS saved_venues CASCADE;
DROP TABLE IF EXISTS venue_reports CASCADE;
DROP FUNCTION IF EXISTS handle_new_user CASCADE;
DROP FUNCTION IF EXISTS generate_smart_username CASCADE;
DROP FUNCTION IF EXISTS update_profiles_fts CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
DROP TYPE IF EXISTS venue_type_enum CASCADE;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create venue type enum
CREATE TYPE venue_type_enum AS ENUM (
  'music_venue',
  'brewery', 
  'coffee_shop',
  'restaurant',
  'bar',
  'event_space',
  'amphitheater',
  'theater',
  'arena'
);

-- Create venues table
CREATE TABLE venues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT DEFAULT 'NC',
  zip_code TEXT NOT NULL,
  capacity INTEGER,
  venue_type venue_type_enum NOT NULL,
  website TEXT,
  social_platform TEXT,
  social_handle TEXT,
  contact_email TEXT,
  description TEXT,
  genres TEXT[],
  booking_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  fts tsvector
);

-- Create profiles table with final structure
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  zip_code TEXT,
  profile_completed BOOLEAN DEFAULT false,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  bio TEXT,
  main_instrument TEXT NOT NULL DEFAULT 'Guitar',
  secondary_instrument TEXT,
  experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'advanced', 'professional')),
  genres TEXT[],
  social_links JSONB,
  profile_image_url TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  fts tsvector
);

-- Create saved_profiles table
CREATE TABLE saved_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  saved_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, saved_profile_id)
);

-- Create messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create other tables
CREATE TABLE saved_venues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  saved_venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, saved_venue_id)
);

CREATE TABLE venue_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Smart username generation function
CREATE OR REPLACE FUNCTION generate_smart_username()
RETURNS TEXT AS $$
DECLARE
  instruments TEXT[] := ARRAY['guitarist', 'drummer', 'vocalist', 'bassist', 'keyboardist', 'producer', 'songwriter'];
  random_instrument TEXT;
  random_number INTEGER;
  generated_username TEXT;
  attempts INTEGER := 0;
BEGIN
  random_instrument := instruments[floor(random() * array_length(instruments, 1)) + 1];
  random_number := floor(random() * 9999) + 1;
  generated_username := random_instrument || '_' || random_number;
  
  WHILE EXISTS (SELECT 1 FROM profiles WHERE username = generated_username) AND attempts < 10 LOOP
    random_number := floor(random() * 9999) + 1;
    generated_username := random_instrument || '_' || random_number;
    attempts := attempts + 1;
  END LOOP;
  
  -- If we still have a conflict after 10 attempts, add timestamp
  IF EXISTS (SELECT 1 FROM profiles WHERE username = generated_username) THEN
    generated_username := random_instrument || '_' || extract(epoch from now())::bigint;
  END IF;
  
  RETURN generated_username;
END;
$$ LANGUAGE plpgsql;

-- FTS update function
CREATE OR REPLACE FUNCTION update_profiles_fts()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fts := to_tsvector('english',
    COALESCE(NEW.username, '') || ' ' ||
    COALESCE(NEW.bio, '') || ' ' ||
    COALESCE(NEW.main_instrument, '') || ' ' ||
    COALESCE(NEW.secondary_instrument, '') || ' ' ||
    COALESCE(NEW.experience_level, '') || ' ' ||
    COALESCE(array_to_string(NEW.genres, ' '), '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- New user handler with smart defaults
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  generated_username TEXT;
  default_instrument TEXT;
  default_bio TEXT;
  default_experience TEXT;
  default_genres TEXT[];
BEGIN
  -- Generate username
  generated_username := generate_smart_username();
  
  -- Set default instrument based on username
  default_instrument := CASE 
    WHEN generated_username LIKE 'guitarist%' THEN 'Guitar'
    WHEN generated_username LIKE 'drummer%' THEN 'Drums'
    WHEN generated_username LIKE 'vocalist%' THEN 'Vocals'
    WHEN generated_username LIKE 'bassist%' THEN 'Bass'
    WHEN generated_username LIKE 'keyboardist%' THEN 'Keyboard'
    WHEN generated_username LIKE 'producer%' THEN 'Production'
    WHEN generated_username LIKE 'songwriter%' THEN 'Songwriting'
    ELSE 'Guitar'
  END;
  
  -- Set defaults
  default_bio := 'Super cool person looking to collaborate. Shoot me a dm!';
  default_experience := 'intermediate';
  default_genres := ARRAY['Rock'];
  
  -- Insert profile
  INSERT INTO profiles (
    user_id, 
    email, 
    username, 
    main_instrument,
    bio,
    zip_code,
    experience_level,
    genres,
    profile_image_url,
    is_published
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    generated_username,
    default_instrument,
    default_bio,
    '27601',
    default_experience,
    default_genres,
    '/social.png',
    true
  );
  
  RETURN NEW;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW; -- Don't fail the user creation if profile creation fails
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_zip_code ON profiles(zip_code);
CREATE INDEX idx_profiles_last_active ON profiles(last_active);
CREATE INDEX idx_profiles_is_published ON profiles(is_published);
CREATE INDEX idx_profiles_main_instrument ON profiles(main_instrument);
CREATE INDEX idx_profiles_fts ON profiles USING gin(fts);

-- Create triggers
CREATE TRIGGER update_profiles_fts_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_profiles_fts();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (is_published = true OR user_id = auth.uid());

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile" ON profiles
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own saved profiles" ON saved_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved profiles" ON saved_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved profiles" ON saved_profiles
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update own received messages" ON messages
  FOR UPDATE USING (auth.uid() = receiver_id);
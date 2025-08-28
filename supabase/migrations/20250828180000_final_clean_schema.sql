-- Final Clean Schema - Consolidates all changes
-- This replaces the conflicting migrations with a single clean schema

-- Drop and recreate profiles table with final structure
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS saved_profiles CASCADE;

-- Recreate profiles table with clean structure
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
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

-- Recreate saved_profiles table
CREATE TABLE saved_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  saved_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, saved_profile_id)
);

-- Smart username generation function
CREATE OR REPLACE FUNCTION generate_smart_username()
RETURNS TEXT AS $$
DECLARE
  instruments TEXT[] := ARRAY['guitarist', 'drummer', 'vocalist', 'bassist', 'keyboardist', 'producer', 'songwriter'];
  random_instrument TEXT;
  random_number INTEGER;
  generated_username TEXT;
BEGIN
  -- Pick random instrument and number
  random_instrument := instruments[floor(random() * array_length(instruments, 1) + 1)];
  random_number := floor(random() * 9999) + 1;
  generated_username := random_instrument || '_' || random_number;
  
  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM profiles WHERE username = generated_username) LOOP
    random_number := floor(random() * 9999) + 1;
    generated_username := random_instrument || '_' || random_number;
  END LOOP;
  
  RETURN generated_username;
END;
$$ LANGUAGE plpgsql;

-- Updated FTS function for final schema
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

-- Smart defaults new user handler
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  generated_username TEXT;
  default_instrument TEXT;
  default_bio TEXT;
  default_experience TEXT;
  default_genres TEXT[];
BEGIN
  -- Generate smart username
  generated_username := generate_smart_username();
  
  -- Extract instrument from username for consistency
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
  
  -- Smart defaults that encourage editing
  default_bio := 'Super cool person looking to collaborate. Shoot me a dm!';
  default_experience := 'intermediate'; -- Most common, encourages correction
  default_genres := ARRAY['Rock']; -- Popular default
  
  INSERT INTO profiles (
    user_id, 
    email, 
    username, 
    main_instrument,
    bio,
    zip_code,
    experience_level,
    genres,
    is_published
  )
  VALUES (
    NEW.id,
    NEW.email,
    generated_username,
    default_instrument,
    default_bio,
    '27601', -- Raleigh, NC default
    default_experience,
    default_genres,
    true -- Auto-publish with smart defaults
  );
  
  RETURN NEW;
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

CREATE INDEX idx_saved_profiles_user_id ON saved_profiles(user_id);
CREATE INDEX idx_saved_profiles_saved_profile_id ON saved_profiles(saved_profile_id);

-- Create triggers (with DROP IF EXISTS to avoid conflicts)
DROP TRIGGER IF EXISTS update_profiles_fts_trigger ON profiles;
CREATE TRIGGER update_profiles_fts_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_profiles_fts();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (is_published = true OR user_id = auth.uid());

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile" ON profiles
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for saved_profiles
CREATE POLICY "Users can view own saved profiles" ON saved_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved profiles" ON saved_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved profiles" ON saved_profiles
  FOR DELETE USING (auth.uid() = user_id);
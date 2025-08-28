-- Complete Streamlined Schema for BandSeeking
-- Single migration file with proper ordering

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

-- Create venues table first (since other tables depend on it)
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

-- Create profiles table (contains all user data)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  zip_code TEXT,
  latitude FLOAT,
  longitude FLOAT,
  city TEXT,
  state TEXT,
  profile_completed BOOLEAN DEFAULT false,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  bio TEXT,
  main_instrument TEXT NOT NULL DEFAULT 'Not specified',
  secondary_instruments TEXT[],
  experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'advanced', 'professional')),
  seeking TEXT[],
  genres TEXT[],
  influences TEXT,
  availability TEXT[],
  has_transportation BOOLEAN DEFAULT false,
  has_own_equipment BOOLEAN DEFAULT false,
  willing_to_travel_miles INTEGER DEFAULT 25,
  social_links JSONB,
  profile_image_url TEXT,
  audio_samples TEXT[],
  is_published BOOLEAN DEFAULT false,
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

-- Create saved_venues table
CREATE TABLE saved_venues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  saved_venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, saved_venue_id)
);

-- Create venue_reports table
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

-- Create FTS update functions
CREATE OR REPLACE FUNCTION update_profiles_fts()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fts := to_tsvector('english',
    COALESCE(NEW.full_name, '') || ' ' ||
    COALESCE(NEW.username, '') || ' ' ||
    COALESCE(NEW.bio, '') || ' ' ||
    COALESCE(NEW.main_instrument, '') || ' ' ||
    COALESCE(array_to_string(NEW.secondary_instruments, ' '), '') || ' ' ||
    COALESCE(array_to_string(NEW.seeking, ' '), '') || ' ' ||
    COALESCE(array_to_string(NEW.genres, ' '), '') || ' ' ||
    COALESCE(NEW.influences, '') || ' ' ||
    COALESCE(NEW.city, '') || ' ' ||
    COALESCE(NEW.state, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_venue_fts()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fts := to_tsvector('english',
    COALESCE(NEW.name, '') || ' ' ||
    COALESCE(NEW.address, '') || ' ' ||
    COALESCE(NEW.city, '') || ' ' ||
    COALESCE(NEW.venue_type::text, '') || ' ' ||
    COALESCE(NEW.description, '') || ' ' ||
    COALESCE(array_to_string(NEW.genres, ' '), '') || ' ' ||
    COALESCE(NEW.booking_info, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  generated_username TEXT;
BEGIN
  -- Generate username from email if not provided
  generated_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    LOWER(REPLACE(split_part(NEW.email, '@', 1), '.', '_'))
  );
  
  -- Ensure username is unique
  WHILE EXISTS (SELECT 1 FROM profiles WHERE username = generated_username) LOOP
    generated_username := generated_username || '_' || floor(random() * 1000)::text;
  END LOOP;

  INSERT INTO profiles (
    user_id, 
    email, 
    username, 
    full_name,
    main_instrument,
    is_published
  )
  VALUES (
    NEW.id,
    NEW.email,
    generated_username,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'Not specified',
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes
CREATE INDEX idx_venues_city ON venues(city);
CREATE INDEX idx_venues_type ON venues(venue_type);
CREATE INDEX idx_venues_fts ON venues USING gin(fts);

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

CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_read ON messages(read);

CREATE INDEX idx_saved_venues_user_id ON saved_venues(user_id);
CREATE INDEX idx_saved_venues_venue_id ON saved_venues(saved_venue_id);

CREATE INDEX idx_venue_reports_reporter_id ON venue_reports(reporter_id);
CREATE INDEX idx_venue_reports_venue_id ON venue_reports(venue_id);
CREATE INDEX idx_venue_reports_status ON venue_reports(status);

-- Create triggers
CREATE TRIGGER update_profiles_fts_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_profiles_fts();

CREATE TRIGGER update_venue_fts_trigger
  BEFORE INSERT OR UPDATE ON venues
  FOR EACH ROW EXECUTE FUNCTION update_venue_fts();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_venues_updated_at
  BEFORE UPDATE ON venues
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_venue_reports_updated_at
  BEFORE UPDATE ON venue_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_reports ENABLE ROW LEVEL SECURITY;

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

-- RLS Policies for messages
CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update own received messages" ON messages
  FOR UPDATE USING (auth.uid() = receiver_id);

-- RLS Policies for venues
CREATE POLICY "Venues are viewable by everyone" ON venues
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert venues" ON venues
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Admin policy for venues (for admin email)
CREATE POLICY "Admin can manage all venues" ON venues
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() 
      AND email = 'dsully15@gmail.com'
    )
  );

-- RLS Policies for saved_venues  
CREATE POLICY "Users can view own saved venues" ON saved_venues
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can save venues" ON saved_venues
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved venues" ON saved_venues
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for venue_reports
CREATE POLICY "Users can view their own venue reports" ON venue_reports
  FOR SELECT USING (auth.uid() = reporter_id);

CREATE POLICY "Users can create venue reports" ON venue_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Admin policy for venue reports
CREATE POLICY "Admin can manage all venue reports" ON venue_reports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() 
      AND email = 'dsully15@gmail.com'
    )
  );
-- Fix profiles schema to match TypeScript types

-- Add missing columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS latitude NUMERIC,
ADD COLUMN IF NOT EXISTS longitude NUMERIC,
ADD COLUMN IF NOT EXISTS seeking TEXT[],
ADD COLUMN IF NOT EXISTS influences TEXT,
ADD COLUMN IF NOT EXISTS availability TEXT[],
ADD COLUMN IF NOT EXISTS has_transportation BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS has_own_equipment BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS willing_to_travel_miles INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS audio_samples TEXT[],
ADD COLUMN IF NOT EXISTS secondary_instruments TEXT[];

-- Rename secondary_instrument to match TypeScript types
ALTER TABLE profiles RENAME COLUMN secondary_instrument TO secondary_instruments_old;
-- secondary_instruments already added above

-- Update the FTS function to include new fields
CREATE OR REPLACE FUNCTION update_profiles_fts()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fts := to_tsvector('english',
    COALESCE(NEW.username, '') || ' ' ||
    COALESCE(NEW.full_name, '') || ' ' ||
    COALESCE(NEW.bio, '') || ' ' ||
    COALESCE(NEW.main_instrument, '') || ' ' ||
    COALESCE(array_to_string(NEW.secondary_instruments, ' '), '') || ' ' ||
    COALESCE(NEW.experience_level, '') || ' ' ||
    COALESCE(array_to_string(NEW.genres, ' '), '') || ' ' ||
    COALESCE(NEW.influences, '') || ' ' ||
    COALESCE(NEW.city, '') || ' ' ||
    COALESCE(NEW.state, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update the new user handler to use correct fields
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
  
  -- Insert profile with complete schema
  INSERT INTO profiles (
    user_id, 
    email, 
    username, 
    full_name,
    main_instrument,
    bio,
    zip_code,
    city,
    state,
    experience_level,
    genres,
    seeking,
    has_transportation,
    has_own_equipment,
    willing_to_travel_miles,
    profile_image_url,
    is_published
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    generated_username,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'New User'),
    default_instrument,
    default_bio,
    '27601',
    'Raleigh',
    'NC',
    default_experience,
    default_genres,
    ARRAY['Band members'],
    true,
    true,
    25,
    '/social.png',
    false
  );
  
  RETURN NEW;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW; -- Don't fail the user creation if profile creation fails
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
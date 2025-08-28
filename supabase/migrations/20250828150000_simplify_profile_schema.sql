-- Simplify Profile Schema - Ultra Minimal
-- Remove full_name and complex fields, keep only essentials

-- Remove columns we no longer need
ALTER TABLE profiles 
DROP COLUMN IF EXISTS full_name,
DROP COLUMN IF EXISTS city,
DROP COLUMN IF EXISTS state,
DROP COLUMN IF EXISTS latitude,
DROP COLUMN IF EXISTS longitude,
DROP COLUMN IF EXISTS experience_level,
DROP COLUMN IF EXISTS seeking,
DROP COLUMN IF EXISTS genres,
DROP COLUMN IF EXISTS influences,
DROP COLUMN IF EXISTS availability,
DROP COLUMN IF EXISTS has_transportation,
DROP COLUMN IF EXISTS has_own_equipment,
DROP COLUMN IF EXISTS willing_to_travel_miles,
DROP COLUMN IF EXISTS audio_samples;

-- Update the FTS function for simplified schema
CREATE OR REPLACE FUNCTION update_profiles_fts()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fts := to_tsvector('english',
    COALESCE(NEW.username, '') || ' ' ||
    COALESCE(NEW.bio, '') || ' ' ||
    COALESCE(NEW.main_instrument, '') || ' ' ||
    COALESCE(array_to_string(NEW.secondary_instruments, ' '), '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update the new user trigger to not use full_name
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
    main_instrument,
    is_published
  )
  VALUES (
    NEW.id,
    NEW.email,
    generated_username,
    'Not specified',
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update all existing profiles to regenerate FTS
UPDATE profiles SET updated_at = NOW();
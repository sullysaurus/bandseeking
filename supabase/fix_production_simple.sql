-- Fix Production Database - Simplified Version
-- Run this in Supabase SQL Editor

-- First, check existing users without profiles
SELECT id, email FROM auth.users WHERE id NOT IN (SELECT user_id FROM profiles);

-- Drop and recreate functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user CASCADE;
DROP FUNCTION IF EXISTS generate_smart_username CASCADE;

-- Create the smart username generation function
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
  
  IF EXISTS (SELECT 1 FROM profiles WHERE username = generated_username) THEN
    generated_username := random_instrument || '_' || extract(epoch from now())::bigint;
  END IF;
  
  RETURN generated_username;
END;
$$ LANGUAGE plpgsql;

-- Create the new user handler function
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
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update RLS policy
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

-- Create profiles for ALL existing users without profiles
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
SELECT 
  id,
  COALESCE(email, ''),
  'musician_' || substr(md5(random()::text), 1, 8),
  'Guitar',
  'Super cool person looking to collaborate. Shoot me a dm!',
  '27601',
  'intermediate',
  ARRAY['Rock'],
  '/social.png',
  true
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM profiles);

-- Check the results
SELECT COUNT(*) as total_users FROM auth.users;
SELECT COUNT(*) as total_profiles FROM profiles;
SELECT user_id, username, email FROM profiles ORDER BY created_at DESC LIMIT 10;
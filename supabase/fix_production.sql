-- Fix Production Database - Run this in Supabase SQL Editor

-- First, check if the trigger exists
DO $$
BEGIN
    -- Drop the existing trigger if it exists
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    
    -- Drop existing functions if they exist
    DROP FUNCTION IF EXISTS handle_new_user CASCADE;
    DROP FUNCTION IF EXISTS generate_smart_username CASCADE;
END $$;

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
  
  -- If we still have a conflict after 10 attempts, add timestamp
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
    RETURN NEW; -- Don't fail the user creation if profile creation fails
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update the RLS policy to allow trigger to insert
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

-- Now create a profile for the existing user who has no profile
-- First check if the user exists in auth.users
DO $$
DECLARE
  v_user_id UUID := '7942c2d1-393e-4aae-b345-1209c661460a';
  v_user_email TEXT;
  v_username TEXT;
  v_user_exists BOOLEAN;
BEGIN
  -- Check if user exists in auth.users
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE id = v_user_id) INTO v_user_exists;
  
  IF v_user_exists THEN
    -- Check if profile already exists
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE user_id = v_user_id) THEN
      -- Get user email
      SELECT email INTO v_user_email FROM auth.users WHERE id = v_user_id;
      
      -- Generate username
      v_username := generate_smart_username();
      
      -- Create profile with defaults
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
        v_user_id,
        COALESCE(v_user_email, ''),
        v_username,
        'Guitar',
        'Super cool person looking to collaborate. Shoot me a dm!',
        '27601',
        'intermediate',
        ARRAY['Rock'],
        '/social.png',
        true
      );
      
      RAISE NOTICE 'Created profile for user %', v_user_id;
    ELSE
      RAISE NOTICE 'Profile already exists for user %', v_user_id;
    END IF;
  ELSE
    RAISE NOTICE 'User % does not exist in auth.users', v_user_id;
  END IF;
END $$;

-- Create profiles for ALL existing users who don't have profiles yet
DO $$
DECLARE
  user_record RECORD;
  v_username TEXT;
  created_count INTEGER := 0;
BEGIN
  FOR user_record IN 
    SELECT id, email 
    FROM auth.users 
    WHERE id NOT IN (SELECT user_id FROM profiles)
  LOOP
    -- Generate username for this user
    v_username := generate_smart_username();
    
    -- Create profile with defaults
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
      user_record.id,
      COALESCE(user_record.email, ''),
      v_username,
      'Guitar',
      'Super cool person looking to collaborate. Shoot me a dm!',
      '27601',
      'intermediate',
      ARRAY['Rock'],
      '/social.png',
      true
    );
    
    created_count := created_count + 1;
    RAISE NOTICE 'Created profile for user % with username %', user_record.id, v_username;
  END LOOP;
  
  RAISE NOTICE 'Created % new profiles for existing users', created_count;
END $$;

-- Check all profiles
SELECT user_id, username, email, is_published FROM profiles ORDER BY created_at DESC;
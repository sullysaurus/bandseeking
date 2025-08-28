-- Comprehensive trigger fix for production
-- This will completely rebuild the trigger system

-- Step 1: Clean up any existing broken triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.generate_smart_username();

-- Step 2: Create the username generation function
CREATE OR REPLACE FUNCTION public.generate_smart_username()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  random_number INTEGER;
  proposed_username TEXT;
  username_exists BOOLEAN;
BEGIN
  -- Loop until we find a unique username
  LOOP
    -- Generate random number and create rockstar username
    random_number := FLOOR(RANDOM() * 9000) + 1000;
    proposed_username := 'rockstar_' || random_number::TEXT;
    
    -- Check if this username already exists
    SELECT EXISTS(
      SELECT 1 FROM public.profiles WHERE username = proposed_username
    ) INTO username_exists;
    
    -- If it doesn't exist, we found our username
    IF NOT username_exists THEN
      RETURN proposed_username;
    END IF;
  END LOOP;
END;
$$;

-- Step 3: Create the main trigger function with detailed logging
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_username TEXT;
  profile_created BOOLEAN := FALSE;
BEGIN
  -- Log that the trigger fired
  RAISE LOG 'Trigger fired for user: %', NEW.id;
  
  -- Generate a unique username
  new_username := generate_smart_username();
  RAISE LOG 'Generated username: % for user: %', new_username, NEW.id;
  
  -- Insert the new profile with a BEGIN/EXCEPTION block for better error handling
  BEGIN
    INSERT INTO public.profiles (
      user_id,
      email,
      username,
      main_instrument,
      bio,
      zip_code,
      experience_level,
      genres,
      seeking,
      influences,
      profile_image_url,
      is_published
    ) VALUES (
      NEW.id,
      COALESCE(NEW.email, ''),
      new_username,
      'guitar',
      'Hey! I''m a musician looking to connect with other artists. Let''s make some music together!',
      '10956',
      'intermediate',
      ARRAY['Rock'],
      ARRAY['Band members', 'Collaborators'],
      'The Beatles, Led Zeppelin, Pink Floyd',
      '/social.png',
      true
    );
    
    profile_created := TRUE;
    RAISE LOG 'Successfully created profile for user: % with username: %', NEW.id, new_username;
    
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Error creating profile for user: %. Error: %', NEW.id, SQLERRM;
    -- Don't fail the user creation, just log the error
  END;
  
  RETURN NEW;
END;
$$;

-- Step 4: Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 5: Fix RLS policies to allow the trigger to work
-- Drop existing policies first
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Create new policies that work with triggers
CREATE POLICY "Users can insert their own profile or system can create" ON public.profiles
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR auth.uid() IS NULL
  );

CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (is_published = true);

-- Step 6: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.profiles TO postgres, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.generate_smart_username() TO postgres, anon, authenticated, service_role;

-- Step 7: Verify the trigger was created
SELECT 
  t.tgname as trigger_name,
  p.proname as function_name,
  t.tgenabled as enabled,
  c.relname as table_name
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
JOIN pg_class c ON t.tgrelid = c.oid
WHERE t.tgname = 'on_auth_user_created';

-- Step 8: Create profiles for any existing users without profiles
INSERT INTO public.profiles (
  user_id,
  email,
  username,
  main_instrument,
  bio,
  zip_code,
  experience_level,
  genres,
  seeking,
  influences,
  profile_image_url,
  is_published
)
SELECT 
  u.id,
  COALESCE(u.email, ''),
  'rockstar_' || FLOOR(RANDOM() * 9000 + 1000)::TEXT,
  'guitar',
  'Hey! I''m a musician looking to connect with other artists. Let''s make some music together!',
  '10956',
  'intermediate',
  ARRAY['Rock'],
  ARRAY['Band members', 'Collaborators'],
  'The Beatles, Led Zeppelin, Pink Floyd',
  '/social.png',
  true
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
WHERE p.id IS NULL;

-- Final verification
SELECT 
  u.id,
  u.email,
  p.username,
  p.created_at as profile_created
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
ORDER BY u.created_at DESC
LIMIT 10;
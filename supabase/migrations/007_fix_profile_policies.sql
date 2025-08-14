-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Create comprehensive policies for profiles table
-- Allow users to view all profiles (for discovery features)
CREATE POLICY "Anyone can view profiles" ON profiles
  FOR SELECT USING (true);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow users to delete their own profile
CREATE POLICY "Users can delete own profile" ON profiles
  FOR DELETE USING (auth.uid() = id);

-- Fix the profile creation function to handle email-only signups better
CREATE OR REPLACE FUNCTION create_profile_for_user()
RETURNS TRIGGER AS $$
DECLARE
  default_username TEXT;
  base_username TEXT;
  suffix INTEGER := 0;
BEGIN
  -- Extract base username from email or metadata
  base_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    split_part(NEW.email, '@', 1)
  );
  
  -- Clean the username (remove special characters, lowercase)
  base_username := lower(regexp_replace(base_username, '[^a-zA-Z0-9_]', '', 'g'));
  
  -- If empty after cleaning, use a default
  IF base_username = '' OR base_username IS NULL THEN
    base_username := 'user';
  END IF;
  
  default_username := base_username;
  
  -- Check if username exists and add suffix if needed
  WHILE EXISTS (SELECT 1 FROM profiles WHERE username = default_username) LOOP
    suffix := suffix + 1;
    default_username := base_username || suffix::text;
  END LOOP;

  -- Insert the profile
  INSERT INTO profiles (id, username, full_name)
  VALUES (
    NEW.id,
    default_username,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO UPDATE SET
    -- Update if profile somehow already exists (shouldn't happen but safety measure)
    username = COALESCE(profiles.username, EXCLUDED.username),
    full_name = COALESCE(profiles.full_name, EXCLUDED.full_name);
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the signup
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger (drop and recreate to ensure it's properly attached)
DROP TRIGGER IF EXISTS create_profile_on_signup ON auth.users;
CREATE TRIGGER create_profile_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_profile_for_user();
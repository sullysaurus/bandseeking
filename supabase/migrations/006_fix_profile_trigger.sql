-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS create_profile_on_signup ON auth.users;
DROP FUNCTION IF EXISTS create_profile_for_user();

-- Create an improved function to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION create_profile_for_user()
RETURNS TRIGGER AS $$
DECLARE
  default_username TEXT;
BEGIN
  -- Generate a default username from email if not provided
  default_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    split_part(NEW.email, '@', 1) || '_' || substr(gen_random_uuid()::text, 1, 4)
  );

  -- Insert the profile with proper error handling
  INSERT INTO profiles (id, username, full_name)
  VALUES (
    NEW.id,
    default_username,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING; -- Prevent duplicate key errors
  
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- If username already exists, add a random suffix
    INSERT INTO profiles (id, username, full_name)
    VALUES (
      NEW.id,
      split_part(NEW.email, '@', 1) || '_' || substr(gen_random_uuid()::text, 1, 8),
      COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log the error but don't fail the signup
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER create_profile_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_profile_for_user();

-- Also add a policy so any authenticated user can view other profiles (for band member search)
CREATE POLICY "Authenticated users can view all profiles" ON profiles
  FOR SELECT USING (auth.uid() IS NOT NULL);
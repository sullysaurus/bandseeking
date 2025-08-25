-- Add city and state information to the full-text search
-- We'll need to update the trigger to include location data

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS update_profile_fts_trigger ON profiles;
DROP FUNCTION IF EXISTS update_profile_fts();

-- Create new function that includes location data from users table
CREATE OR REPLACE FUNCTION update_profile_fts()
RETURNS TRIGGER AS $$
DECLARE
  user_location TEXT := '';
BEGIN
  -- Get location info from the users table
  SELECT COALESCE(u.zip_code, '') || ' ' || COALESCE(u.city, '') || ' ' || COALESCE(u.state, '')
  INTO user_location
  FROM users u 
  WHERE u.id = NEW.user_id;

  -- Create full-text search vector including location
  NEW.fts := to_tsvector('english',
    coalesce(NEW.bio, '') || ' ' ||
    coalesce(NEW.main_instrument, '') || ' ' ||
    coalesce(array_to_string(NEW.secondary_instruments, ' '), '') || ' ' ||
    coalesce(array_to_string(NEW.seeking, ' '), '') || ' ' ||
    coalesce(array_to_string(NEW.genres, ' '), '') || ' ' ||
    coalesce(NEW.influences, '') || ' ' ||
    coalesce(user_location, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER update_profile_fts_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_profile_fts();

-- Also create a trigger on users table to update profile fts when user location changes
CREATE OR REPLACE FUNCTION update_profile_fts_on_user_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Update all profiles for this user
  UPDATE profiles 
  SET fts = to_tsvector('english',
    coalesce(bio, '') || ' ' ||
    coalesce(main_instrument, '') || ' ' ||
    coalesce(array_to_string(secondary_instruments, ' '), '') || ' ' ||
    coalesce(array_to_string(seeking, ' '), '') || ' ' ||
    coalesce(array_to_string(genres, ' '), '') || ' ' ||
    coalesce(influences, '') || ' ' ||
    coalesce(NEW.zip_code, '') || ' ' || 
    coalesce(NEW.city, '') || ' ' || 
    coalesce(NEW.state, '')
  )
  WHERE user_id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on users table
CREATE TRIGGER update_profile_fts_on_user_change_trigger
  AFTER UPDATE ON users
  FOR EACH ROW 
  WHEN (OLD.zip_code IS DISTINCT FROM NEW.zip_code OR OLD.city IS DISTINCT FROM NEW.city OR OLD.state IS DISTINCT FROM NEW.state)
  EXECUTE FUNCTION update_profile_fts_on_user_change();

-- Update existing records to include location data
UPDATE profiles SET fts = to_tsvector('english',
  coalesce(bio, '') || ' ' ||
  coalesce(main_instrument, '') || ' ' ||
  coalesce(array_to_string(secondary_instruments, ' '), '') || ' ' ||
  coalesce(array_to_string(seeking, ' '), '') || ' ' ||
  coalesce(array_to_string(genres, ' '), '') || ' ' ||
  coalesce(influences, '') || ' ' ||
  coalesce((SELECT u.zip_code FROM users u WHERE u.id = profiles.user_id), '') || ' ' ||
  coalesce((SELECT u.city FROM users u WHERE u.id = profiles.user_id), '') || ' ' ||
  coalesce((SELECT u.state FROM users u WHERE u.id = profiles.user_id), '')
);
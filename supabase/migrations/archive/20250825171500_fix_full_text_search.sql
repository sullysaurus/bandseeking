-- Remove the previous implementation if it exists
DROP TRIGGER IF EXISTS profiles_search_vector_trigger ON profiles;
DROP TRIGGER IF EXISTS users_search_vector_trigger ON users;
DROP FUNCTION IF EXISTS update_profiles_search_vector();
DROP FUNCTION IF EXISTS update_users_search_vector();
DROP INDEX IF EXISTS idx_profiles_search_vector;
DROP INDEX IF EXISTS idx_users_search_vector;
ALTER TABLE IF EXISTS profiles DROP COLUMN IF EXISTS search_vector;
ALTER TABLE IF EXISTS users DROP COLUMN IF EXISTS search_vector;

-- Create proper full-text search column for profiles
-- We'll use a trigger approach since array_to_string is not immutable for generated columns
ALTER TABLE profiles ADD COLUMN fts tsvector;

-- Create function to update the fts column
CREATE OR REPLACE FUNCTION update_profile_fts()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fts := to_tsvector('english',
    coalesce(NEW.bio, '') || ' ' ||
    coalesce(NEW.main_instrument, '') || ' ' ||
    coalesce(array_to_string(NEW.secondary_instruments, ' '), '') || ' ' ||
    coalesce(array_to_string(NEW.seeking, ' '), '') || ' ' ||
    coalesce(array_to_string(NEW.genres, ' '), '') || ' ' ||
    coalesce(NEW.influences, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create trigger to automatically update fts column
CREATE TRIGGER update_profile_fts_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_profile_fts();

-- Update existing records
UPDATE profiles SET fts = to_tsvector('english',
  coalesce(bio, '') || ' ' ||
  coalesce(main_instrument, '') || ' ' ||
  coalesce(array_to_string(secondary_instruments, ' '), '') || ' ' ||
  coalesce(array_to_string(seeking, ' '), '') || ' ' ||
  coalesce(array_to_string(genres, ' '), '') || ' ' ||
  coalesce(influences, '')
);

-- Create GIN index for fast full-text search
CREATE INDEX profiles_fts_idx ON profiles USING GIN (fts);

-- Also create a search column for users (names/usernames)
ALTER TABLE users ADD COLUMN fts tsvector;

-- Create function to update users fts column
CREATE OR REPLACE FUNCTION update_user_fts()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fts := to_tsvector('english',
    coalesce(NEW.full_name, '') || ' ' ||
    coalesce(NEW.username, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create trigger for users fts column
CREATE TRIGGER update_user_fts_trigger
  BEFORE INSERT OR UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_user_fts();

-- Update existing user records
UPDATE users SET fts = to_tsvector('english',
  coalesce(full_name, '') || ' ' ||
  coalesce(username, '')
);

-- Create GIN index for users search
CREATE INDEX users_fts_idx ON users USING GIN (fts);
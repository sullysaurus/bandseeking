-- Add full-text search support to profiles
-- This creates a tsvector column that combines searchable text fields

-- Add search vector column to profiles table
ALTER TABLE profiles ADD COLUMN search_vector tsvector;

-- Create function to update search vector
CREATE OR REPLACE FUNCTION update_profiles_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  -- Combine searchable fields into search vector
  NEW.search_vector := 
    setweight(to_tsvector('english', coalesce(NEW.bio, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.main_instrument, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(array_to_string(NEW.secondary_instruments, ' '), '')), 'A') ||
    setweight(to_tsvector('english', coalesce(array_to_string(NEW.seeking, ' '), '')), 'B') ||
    setweight(to_tsvector('english', coalesce(array_to_string(NEW.genres, ' '), '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.influences, '')), 'C');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update search vector on insert/update
CREATE TRIGGER profiles_search_vector_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profiles_search_vector();

-- Update existing records with search vector
UPDATE profiles SET search_vector = 
  setweight(to_tsvector('english', coalesce(bio, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(main_instrument, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(array_to_string(secondary_instruments, ' '), '')), 'A') ||
  setweight(to_tsvector('english', coalesce(array_to_string(seeking, ' '), '')), 'B') ||
  setweight(to_tsvector('english', coalesce(array_to_string(genres, ' '), '')), 'B') ||
  setweight(to_tsvector('english', coalesce(influences, '')), 'C');

-- Create GIN index for fast full-text search
CREATE INDEX idx_profiles_search_vector ON profiles USING GIN (search_vector);

-- Add search vector column to users table for name/username search
ALTER TABLE users ADD COLUMN search_vector tsvector;

-- Create function to update users search vector
CREATE OR REPLACE FUNCTION update_users_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', coalesce(NEW.full_name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.username, '')), 'A');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for users search vector
CREATE TRIGGER users_search_vector_trigger
  BEFORE INSERT OR UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_users_search_vector();

-- Update existing users with search vector
UPDATE users SET search_vector = 
  setweight(to_tsvector('english', coalesce(full_name, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(username, '')), 'A');

-- Create GIN index for users search
CREATE INDEX idx_users_search_vector ON users USING GIN (search_vector);
-- Ensure city and state are properly indexed in full-text search for both profiles and venues

-- Update profiles FTS function to ensure city and state are included
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
    COALESCE(NEW.state, '') || ' ' ||
    -- Add city and state again with common variations
    CASE 
      WHEN NEW.city IS NOT NULL AND NEW.state IS NOT NULL 
      THEN COALESCE(NEW.city, '') || ' ' || COALESCE(NEW.state, '') || ' ' ||
           COALESCE(NEW.city, '') || ', ' || COALESCE(NEW.state, '')
      ELSE ''
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Force update all existing profiles to rebuild FTS with city/state
UPDATE profiles 
SET fts = to_tsvector('english',
  COALESCE(username, '') || ' ' ||
  COALESCE(full_name, '') || ' ' ||
  COALESCE(bio, '') || ' ' ||
  COALESCE(main_instrument, '') || ' ' ||
  COALESCE(array_to_string(secondary_instruments, ' '), '') || ' ' ||
  COALESCE(experience_level, '') || ' ' ||
  COALESCE(array_to_string(genres, ' '), '') || ' ' ||
  COALESCE(influences, '') || ' ' ||
  COALESCE(city, '') || ' ' ||
  COALESCE(state, '') || ' ' ||
  -- Add city and state again with common variations
  CASE 
    WHEN city IS NOT NULL AND state IS NOT NULL 
    THEN COALESCE(city, '') || ' ' || COALESCE(state, '') || ' ' ||
         COALESCE(city, '') || ', ' || COALESCE(state, '')
    ELSE ''
  END
);

-- Ensure venues FTS function includes city and state properly
CREATE OR REPLACE FUNCTION update_venues_fts()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fts := to_tsvector('english',
    COALESCE(NEW.name, '') || ' ' ||
    COALESCE(NEW.description, '') || ' ' ||
    COALESCE(NEW.city, '') || ' ' ||
    COALESCE(NEW.state, '') || ' ' ||
    COALESCE(NEW.venue_type::text, '') || ' ' ||
    COALESCE(array_to_string(NEW.genres, ' '), '') || ' ' ||
    COALESCE(NEW.contact_email, '') || ' ' ||
    COALESCE(NEW.address, '') || ' ' ||
    -- Add city and state again with common variations
    CASE 
      WHEN NEW.city IS NOT NULL AND NEW.state IS NOT NULL 
      THEN COALESCE(NEW.city, '') || ' ' || COALESCE(NEW.state, '') || ' ' ||
           COALESCE(NEW.city, '') || ', ' || COALESCE(NEW.state, '')
      ELSE ''
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Force update all existing venues to rebuild FTS with city/state
UPDATE venues 
SET fts = to_tsvector('english',
  COALESCE(name, '') || ' ' ||
  COALESCE(description, '') || ' ' ||
  COALESCE(city, '') || ' ' ||
  COALESCE(state, '') || ' ' ||
  COALESCE(venue_type::text, '') || ' ' ||
  COALESCE(array_to_string(genres, ' '), '') || ' ' ||
  COALESCE(contact_email, '') || ' ' ||
  COALESCE(address, '') || ' ' ||
  -- Add city and state again with common variations
  CASE 
    WHEN city IS NOT NULL AND state IS NOT NULL 
    THEN COALESCE(city, '') || ' ' || COALESCE(state, '') || ' ' ||
         COALESCE(city, '') || ', ' || COALESCE(state, '')
    ELSE ''
  END
);

-- Create indexes on city and state columns for faster filtering
CREATE INDEX IF NOT EXISTS idx_profiles_city ON profiles(city);
CREATE INDEX IF NOT EXISTS idx_profiles_state ON profiles(state);
CREATE INDEX IF NOT EXISTS idx_profiles_city_state ON profiles(city, state);

-- Add a function to search profiles by location (for future use)
CREATE OR REPLACE FUNCTION search_profiles_by_location(search_city TEXT, search_state TEXT DEFAULT NULL)
RETURNS SETOF profiles AS $$
BEGIN
  IF search_state IS NOT NULL THEN
    RETURN QUERY
    SELECT * FROM profiles
    WHERE is_published = true
      AND LOWER(city) = LOWER(search_city)
      AND LOWER(state) = LOWER(search_state);
  ELSE
    RETURN QUERY
    SELECT * FROM profiles
    WHERE is_published = true
      AND LOWER(city) = LOWER(search_city);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Add a function to search venues by location (for future use)
CREATE OR REPLACE FUNCTION search_venues_by_location(search_city TEXT, search_state TEXT DEFAULT NULL)
RETURNS SETOF venues AS $$
BEGIN
  IF search_state IS NOT NULL THEN
    RETURN QUERY
    SELECT * FROM venues
    WHERE LOWER(city) = LOWER(search_city)
      AND LOWER(state) = LOWER(search_state);
  ELSE
    RETURN QUERY
    SELECT * FROM venues
    WHERE LOWER(city) = LOWER(search_city);
  END IF;
END;
$$ LANGUAGE plpgsql;
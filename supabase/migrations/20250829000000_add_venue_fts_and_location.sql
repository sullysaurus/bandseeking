-- Add FTS and location features to venues table

-- Add FTS column to venues
ALTER TABLE venues 
ADD COLUMN IF NOT EXISTS fts TSVECTOR,
ADD COLUMN IF NOT EXISTS latitude NUMERIC,
ADD COLUMN IF NOT EXISTS longitude NUMERIC;

-- Create function to update FTS
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
    COALESCE(NEW.address, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update FTS
CREATE TRIGGER update_venues_fts_trigger
BEFORE INSERT OR UPDATE ON venues
FOR EACH ROW
EXECUTE FUNCTION update_venues_fts();

-- Create index on FTS column for fast searching
CREATE INDEX IF NOT EXISTS venues_fts_idx ON venues USING gin(fts);

-- Create index on location columns for geographic queries
CREATE INDEX IF NOT EXISTS venues_location_idx ON venues(latitude, longitude);
CREATE INDEX IF NOT EXISTS venues_city_state_idx ON venues(city, state);

-- Update existing venues to populate FTS
UPDATE venues SET fts = to_tsvector('english',
  COALESCE(name, '') || ' ' ||
  COALESCE(description, '') || ' ' ||
  COALESCE(city, '') || ' ' ||
  COALESCE(state, '') || ' ' ||
  COALESCE(venue_type::text, '') || ' ' ||
  COALESCE(array_to_string(genres, ' '), '') || ' ' ||
  COALESCE(contact_email, '') || ' ' ||
  COALESCE(address, '')
);

-- Function to calculate distance between two points (in miles)
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 NUMERIC,
  lon1 NUMERIC,
  lat2 NUMERIC,
  lon2 NUMERIC
) RETURNS NUMERIC AS $$
DECLARE
  R CONSTANT NUMERIC := 3959; -- Earth's radius in miles
  dlat NUMERIC;
  dlon NUMERIC;
  a NUMERIC;
  c NUMERIC;
BEGIN
  IF lat1 IS NULL OR lon1 IS NULL OR lat2 IS NULL OR lon2 IS NULL THEN
    RETURN NULL;
  END IF;
  
  dlat := RADIANS(lat2 - lat1);
  dlon := RADIANS(lon2 - lon1);
  
  a := SIN(dlat/2) * SIN(dlat/2) + 
       COS(RADIANS(lat1)) * COS(RADIANS(lat2)) * 
       SIN(dlon/2) * SIN(dlon/2);
  
  c := 2 * ATAN2(SQRT(a), SQRT(1-a));
  
  RETURN R * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add RLS policies for venues if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'venues' AND policyname = 'Venues are viewable by everyone'
  ) THEN
    CREATE POLICY "Venues are viewable by everyone" ON venues
      FOR SELECT USING (true);
  END IF;
END $$;
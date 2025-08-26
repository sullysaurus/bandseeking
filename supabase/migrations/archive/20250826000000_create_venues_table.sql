-- Create venue type enum
CREATE TYPE venue_type_enum AS ENUM (
  'music_venue',
  'brewery',
  'coffee_shop',
  'restaurant',
  'bar',
  'event_space',
  'amphitheater',
  'theater'
);

-- Create venues table
CREATE TABLE venues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT DEFAULT 'NC',
  zip_code TEXT NOT NULL,
  capacity_min INTEGER,
  capacity_max INTEGER,
  venue_type venue_type_enum NOT NULL,
  website TEXT,
  social_platform TEXT,
  social_handle TEXT,
  contact_email TEXT,
  description TEXT,
  genres TEXT[],
  booking_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  fts tsvector
);

-- Create function to update the fts column for venues
CREATE OR REPLACE FUNCTION update_venue_fts()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fts := to_tsvector('english',
    coalesce(NEW.name, '') || ' ' ||
    coalesce(NEW.address, '') || ' ' ||
    coalesce(NEW.city, '') || ' ' ||
    coalesce(NEW.venue_type::text, '') || ' ' ||
    coalesce(NEW.description, '') || ' ' ||
    coalesce(array_to_string(NEW.genres, ' '), '') || ' ' ||
    coalesce(NEW.booking_info, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update fts column
CREATE TRIGGER update_venue_fts_trigger
  BEFORE INSERT OR UPDATE ON venues
  FOR EACH ROW EXECUTE FUNCTION update_venue_fts();

-- Create GIN index for fast full-text search
CREATE INDEX venues_fts_idx ON venues USING GIN (fts);

-- Create index on city for location-based queries
CREATE INDEX venues_city_idx ON venues (city);

-- Create index on venue_type for filtering
CREATE INDEX venues_type_idx ON venues (venue_type);

-- Enable RLS
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Venues are viewable by everyone" ON venues
  FOR SELECT USING (true);

-- Create policy for authenticated users to suggest venues (future feature)
CREATE POLICY "Authenticated users can insert venues" ON venues
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_venues_updated_at BEFORE UPDATE ON venues
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
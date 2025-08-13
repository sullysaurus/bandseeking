-- Create bands table
CREATE TABLE bands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  description TEXT,
  location VARCHAR(255),
  genre VARCHAR(100),
  status VARCHAR(50) DEFAULT 'recruiting' CHECK (status IN ('recruiting', 'complete', 'on_hold')),
  formed_year INTEGER,
  website VARCHAR(255),
  instagram VARCHAR(255),
  twitter VARCHAR(255),
  youtube VARCHAR(255),
  spotify VARCHAR(255),
  avatar_url VARCHAR(500),
  looking_for TEXT[], -- Array of instruments/roles they're looking for
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create band_members junction table
CREATE TABLE band_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  band_id UUID REFERENCES bands(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role VARCHAR(100), -- e.g., "Lead Guitar", "Vocals", "Drums"
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(band_id, user_id)
);

-- Create band_applications table for managing join requests
CREATE TABLE band_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  band_id UUID REFERENCES bands(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(band_id, user_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_bands_owner_id ON bands(owner_id);
CREATE INDEX idx_bands_status ON bands(status);
CREATE INDEX idx_bands_location ON bands(location);
CREATE INDEX idx_band_members_band_id ON band_members(band_id);
CREATE INDEX idx_band_members_user_id ON band_members(user_id);
CREATE INDEX idx_band_applications_band_id ON band_applications(band_id);
CREATE INDEX idx_band_applications_user_id ON band_applications(user_id);

-- Enable Row Level Security
ALTER TABLE bands ENABLE ROW LEVEL SECURITY;
ALTER TABLE band_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE band_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bands table
-- Anyone can view bands
CREATE POLICY "Bands are viewable by everyone" 
  ON bands FOR SELECT 
  USING (true);

-- Users can create bands
CREATE POLICY "Users can create bands" 
  ON bands FOR INSERT 
  WITH CHECK (auth.uid() = owner_id);

-- Band owners can update their bands
CREATE POLICY "Band owners can update their bands" 
  ON bands FOR UPDATE 
  USING (auth.uid() = owner_id);

-- Band owners can delete their bands
CREATE POLICY "Band owners can delete their bands" 
  ON bands FOR DELETE 
  USING (auth.uid() = owner_id);

-- RLS Policies for band_members table
-- Anyone can view band members
CREATE POLICY "Band members are viewable by everyone" 
  ON band_members FOR SELECT 
  USING (true);

-- Band owners can add members
CREATE POLICY "Band owners can add members" 
  ON band_members FOR INSERT 
  WITH CHECK (
    auth.uid() IN (
      SELECT owner_id FROM bands WHERE id = band_id
    )
  );

-- Band owners can update members
CREATE POLICY "Band owners can update members" 
  ON band_members FOR UPDATE 
  USING (
    auth.uid() IN (
      SELECT owner_id FROM bands WHERE id = band_id
    )
  );

-- Band owners can remove members
CREATE POLICY "Band owners can remove members" 
  ON band_members FOR DELETE 
  USING (
    auth.uid() IN (
      SELECT owner_id FROM bands WHERE id = band_id
    )
  );

-- RLS Policies for band_applications table
-- Applicants and band owners can view applications
CREATE POLICY "Applications viewable by applicant and band owner" 
  ON band_applications FOR SELECT 
  USING (
    auth.uid() = user_id OR 
    auth.uid() IN (
      SELECT owner_id FROM bands WHERE id = band_id
    )
  );

-- Users can apply to bands
CREATE POLICY "Users can apply to bands" 
  ON band_applications FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Band owners can update application status
CREATE POLICY "Band owners can update applications" 
  ON band_applications FOR UPDATE 
  USING (
    auth.uid() IN (
      SELECT owner_id FROM bands WHERE id = band_id
    )
  );

-- Applicants can delete their applications
CREATE POLICY "Applicants can delete their applications" 
  ON band_applications FOR DELETE 
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_bands_updated_at BEFORE UPDATE ON bands
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_band_applications_updated_at BEFORE UPDATE ON band_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
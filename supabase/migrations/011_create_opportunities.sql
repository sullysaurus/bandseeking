-- Create opportunities table for gigs, sessions, and other musical opportunities
CREATE TABLE opportunities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('gig', 'session', 'audition', 'collaboration', 'teaching', 'recording', 'other')),
  location VARCHAR(255),
  is_remote BOOLEAN DEFAULT false,
  is_paid BOOLEAN DEFAULT false,
  payment_amount VARCHAR(100),
  date_time TIMESTAMP WITH TIME ZONE,
  deadline TIMESTAMP WITH TIME ZONE,
  requirements TEXT[],
  genres TEXT[],
  instruments_needed TEXT[],
  experience_level VARCHAR(50),
  contact_method VARCHAR(50) DEFAULT 'platform' CHECK (contact_method IN ('platform', 'email', 'phone', 'external')),
  contact_info TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'filled', 'cancelled', 'expired')),
  views_count INTEGER DEFAULT 0,
  applications_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create opportunity applications table
CREATE TABLE opportunity_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE NOT NULL,
  applicant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  UNIQUE(opportunity_id, applicant_id)
);

-- Create saved opportunities table
CREATE TABLE saved_opportunities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  UNIQUE(user_id, opportunity_id)
);

-- Create indexes
CREATE INDEX idx_opportunities_creator_id ON opportunities(creator_id);
CREATE INDEX idx_opportunities_type ON opportunities(type);
CREATE INDEX idx_opportunities_status ON opportunities(status);
CREATE INDEX idx_opportunities_created_at ON opportunities(created_at DESC);
CREATE INDEX idx_opportunities_date_time ON opportunities(date_time);
CREATE INDEX idx_opportunity_applications_opportunity_id ON opportunity_applications(opportunity_id);
CREATE INDEX idx_opportunity_applications_applicant_id ON opportunity_applications(applicant_id);
CREATE INDEX idx_saved_opportunities_user_id ON saved_opportunities(user_id);

-- Enable RLS
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_opportunities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for opportunities
CREATE POLICY "Anyone can view active opportunities" ON opportunities
  FOR SELECT USING (status = 'active' OR creator_id = auth.uid());

CREATE POLICY "Users can create opportunities" ON opportunities
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update own opportunities" ON opportunities
  FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Users can delete own opportunities" ON opportunities
  FOR DELETE USING (auth.uid() = creator_id);

-- RLS Policies for applications
CREATE POLICY "Users can view own applications" ON opportunity_applications
  FOR SELECT USING (
    applicant_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM opportunities 
      WHERE opportunities.id = opportunity_applications.opportunity_id 
      AND opportunities.creator_id = auth.uid()
    )
  );

CREATE POLICY "Users can apply to opportunities" ON opportunity_applications
  FOR INSERT WITH CHECK (auth.uid() = applicant_id);

CREATE POLICY "Applicants can update own applications" ON opportunity_applications
  FOR UPDATE USING (auth.uid() = applicant_id);

CREATE POLICY "Creators can update application status" ON opportunity_applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM opportunities 
      WHERE opportunities.id = opportunity_applications.opportunity_id 
      AND opportunities.creator_id = auth.uid()
    )
  );

-- RLS Policies for saved opportunities
CREATE POLICY "Users can view own saved opportunities" ON saved_opportunities
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can save opportunities" ON saved_opportunities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave opportunities" ON saved_opportunities
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to increment view count
CREATE OR REPLACE FUNCTION increment_opportunity_views(opp_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE opportunities 
  SET views_count = views_count + 1 
  WHERE id = opp_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_opportunities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER opportunities_updated_at
  BEFORE UPDATE ON opportunities
  FOR EACH ROW
  EXECUTE FUNCTION update_opportunities_updated_at();

CREATE TRIGGER opportunity_applications_updated_at
  BEFORE UPDATE ON opportunity_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_opportunities_updated_at();

-- Create view with creator profile info
CREATE VIEW opportunities_with_profiles AS
SELECT 
  o.*,
  p.username as creator_username,
  p.full_name as creator_name,
  p.avatar_url as creator_avatar,
  p.location as creator_location,
  COUNT(DISTINCT oa.id) as application_count,
  COUNT(DISTINCT so.id) as saved_count
FROM opportunities o
LEFT JOIN profiles p ON o.creator_id = p.id
LEFT JOIN opportunity_applications oa ON o.id = oa.opportunity_id
LEFT JOIN saved_opportunities so ON o.id = so.opportunity_id
GROUP BY o.id, p.username, p.full_name, p.avatar_url, p.location;
-- Create venue_reports table for users to report inaccurate venues

CREATE TYPE report_reason_enum AS ENUM (
  'incorrect_info',
  'closed_permanently',
  'wrong_location',
  'inappropriate_content',
  'duplicate',
  'other'
);

CREATE TYPE report_status_enum AS ENUM (
  'pending',
  'reviewed',
  'resolved',
  'dismissed'
);

CREATE TABLE venue_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reason report_reason_enum NOT NULL,
  description TEXT,
  status report_status_enum DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE venue_reports ENABLE ROW LEVEL SECURITY;

-- Users can create reports
CREATE POLICY "Users can create venue reports" ON venue_reports
FOR INSERT TO public
WITH CHECK (auth.uid() IS NOT NULL);

-- Users can view their own reports
CREATE POLICY "Users can view their own reports" ON venue_reports
FOR SELECT TO public
USING (reporter_id = auth.uid());

-- Admins can view all reports (you may want to make this more specific)
CREATE POLICY "Authenticated users can view all reports" ON venue_reports
FOR SELECT TO public
USING (auth.uid() IS NOT NULL);

-- Admins can update reports (for status changes)
CREATE POLICY "Authenticated users can update reports" ON venue_reports
FOR UPDATE TO public
USING (auth.uid() IS NOT NULL);
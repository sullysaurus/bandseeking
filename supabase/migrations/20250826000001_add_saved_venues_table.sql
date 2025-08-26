-- Create saved_venues table
CREATE TABLE saved_venues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    saved_venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, saved_venue_id)
);

-- Add RLS policies
ALTER TABLE saved_venues ENABLE ROW LEVEL SECURITY;

-- Users can only see their own saved venues
CREATE POLICY "Users can view their own saved venues" ON saved_venues
    FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own saved venues
CREATE POLICY "Users can insert their own saved venues" ON saved_venues
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own saved venues
CREATE POLICY "Users can delete their own saved venues" ON saved_venues
    FOR DELETE USING (auth.uid() = user_id);

-- Add indexes for better performance
CREATE INDEX idx_saved_venues_user_id ON saved_venues(user_id);
CREATE INDEX idx_saved_venues_venue_id ON saved_venues(saved_venue_id);
CREATE INDEX idx_saved_venues_created_at ON saved_venues(created_at);
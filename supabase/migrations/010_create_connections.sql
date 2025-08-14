-- Create connections table for musician-to-musician connections
CREATE TABLE connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(requester_id, recipient_id),
  CHECK (requester_id != recipient_id)
);

-- Create indexes for better performance
CREATE INDEX idx_connections_requester_id ON connections(requester_id);
CREATE INDEX idx_connections_recipient_id ON connections(recipient_id);
CREATE INDEX idx_connections_status ON connections(status);
CREATE INDEX idx_connections_created_at ON connections(created_at DESC);

-- Enable RLS
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own connections (sent or received)
CREATE POLICY "Users can view own connections" ON connections
  FOR SELECT USING (
    auth.uid() = requester_id OR 
    auth.uid() = recipient_id
  );

-- Users can send connection requests
CREATE POLICY "Users can send connection requests" ON connections
  FOR INSERT WITH CHECK (
    auth.uid() = requester_id AND
    status = 'pending'
  );

-- Recipients can update connection status
CREATE POLICY "Recipients can respond to requests" ON connections
  FOR UPDATE USING (
    auth.uid() = recipient_id AND
    status = 'pending'
  )
  WITH CHECK (
    auth.uid() = recipient_id AND
    status IN ('accepted', 'rejected', 'blocked')
  );

-- Requesters can cancel pending requests
CREATE POLICY "Requesters can cancel pending requests" ON connections
  FOR DELETE USING (
    auth.uid() = requester_id AND
    status = 'pending'
  );

-- Both parties can remove accepted connections
CREATE POLICY "Both can remove connections" ON connections
  FOR DELETE USING (
    (auth.uid() = requester_id OR auth.uid() = recipient_id) AND
    status = 'accepted'
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_connections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    NEW.accepted_at = CURRENT_TIMESTAMP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER connections_updated_at
  BEFORE UPDATE ON connections
  FOR EACH ROW
  EXECUTE FUNCTION update_connections_updated_at();

-- Create a view for connection with profile data
CREATE VIEW connections_with_profiles AS
SELECT 
  c.*,
  rp.username as requester_username,
  rp.full_name as requester_name,
  rp.avatar_url as requester_avatar,
  rp.location as requester_location,
  rp.instruments as requester_instruments,
  rp.genres as requester_genres,
  rcp.username as recipient_username,
  rcp.full_name as recipient_name,
  rcp.avatar_url as recipient_avatar,
  rcp.location as recipient_location,
  rcp.instruments as recipient_instruments,
  rcp.genres as recipient_genres
FROM connections c
JOIN profiles rp ON c.requester_id = rp.id
JOIN profiles rcp ON c.recipient_id = rcp.id;
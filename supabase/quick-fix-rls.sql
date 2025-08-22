-- QUICK FIX: Run this to immediately fix the user registration RLS issue
-- This replaces the problematic user policies with correct ones

-- Drop the problematic existing policies
DROP POLICY IF EXISTS "Users can view all users" ON users;
DROP POLICY IF EXISTS "Users can update own record" ON users;

-- Add the correct policies for user registration
CREATE POLICY "Anyone can view users with published profiles" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = users.id 
      AND profiles.is_published = true
    )
  );

CREATE POLICY "Users can view own record" ON users
  FOR SELECT USING (auth.uid() = id);

-- This is the KEY FIX: Allow authenticated users to insert their own record
CREATE POLICY "Authenticated users can insert user record" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own record" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Verify RLS is still enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
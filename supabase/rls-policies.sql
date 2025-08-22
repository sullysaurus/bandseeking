-- This file contains the correct RLS policies for BandSeeking
-- Run this AFTER creating the tables from schema.sql

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (in case they exist)
DROP POLICY IF EXISTS "Users can view all users" ON users;
DROP POLICY IF EXISTS "Users can update own record" ON users;
DROP POLICY IF EXISTS "Users can insert during registration" ON users;

DROP POLICY IF EXISTS "Published profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

DROP POLICY IF EXISTS "Users can view own saved profiles" ON saved_profiles;
DROP POLICY IF EXISTS "Users can save profiles" ON saved_profiles;
DROP POLICY IF EXISTS "Users can delete own saved profiles" ON saved_profiles;

DROP POLICY IF EXISTS "Users can view own messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can update own sent messages" ON messages;

-- ================================================
-- USERS TABLE POLICIES
-- ================================================

-- Allow users to view all published user profiles (needed for discovery)
CREATE POLICY "Anyone can view users with published profiles" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = users.id 
      AND profiles.is_published = true
    )
  );

-- Allow users to view their own profile
CREATE POLICY "Users can view own record" ON users
  FOR SELECT USING (auth.uid() = id);

-- Allow authenticated users to insert during registration
-- This is the key fix - we need to allow INSERT for authenticated users
CREATE POLICY "Authenticated users can insert user record" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to update their own record
CREATE POLICY "Users can update own record" ON users
  FOR UPDATE USING (auth.uid() = id);

-- ================================================
-- PROFILES TABLE POLICIES
-- ================================================

-- Allow everyone to view published profiles
CREATE POLICY "Anyone can view published profiles" ON profiles
  FOR SELECT USING (is_published = true);

-- Allow users to view their own profile (even if unpublished)
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to create their own profile
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- ================================================
-- SAVED_PROFILES TABLE POLICIES
-- ================================================

-- Allow users to view their own saved profiles
CREATE POLICY "Users can view own saved profiles" ON saved_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to save profiles (but not their own)
CREATE POLICY "Users can save other profiles" ON saved_profiles
  FOR INSERT WITH CHECK (
    auth.uid() = user_id 
    AND auth.uid() != saved_user_id
  );

-- Allow users to delete their own saved profiles
CREATE POLICY "Users can delete own saved profiles" ON saved_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- ================================================
-- MESSAGES TABLE POLICIES
-- ================================================

-- Allow users to view messages they sent or received
CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
  );

-- Allow users to send messages (but only if both users have published profiles)
CREATE POLICY "Users can send messages to published profiles" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id 
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = sender_id 
      AND profiles.is_published = true
    )
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = receiver_id 
      AND profiles.is_published = true
    )
  );

-- Allow users to update read status on messages they received
CREATE POLICY "Users can update received messages" ON messages
  FOR UPDATE USING (auth.uid() = receiver_id);

-- ================================================
-- HELPFUL FUNCTIONS FOR RLS
-- ================================================

-- Function to check if a user has a published profile
CREATE OR REPLACE FUNCTION has_published_profile(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = user_uuid 
    AND is_published = true
  );
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION has_published_profile(uuid) TO authenticated;

-- ================================================
-- TRIGGERS FOR AUTOMATIC CLEANUP
-- ================================================

-- Function to delete saved_profiles when a profile becomes unpublished
CREATE OR REPLACE FUNCTION cleanup_saved_profiles_on_unpublish()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- If profile was unpublished, remove it from all saved_profiles
  IF OLD.is_published = true AND NEW.is_published = false THEN
    DELETE FROM saved_profiles WHERE saved_user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to cleanup saved profiles when a profile is unpublished
DROP TRIGGER IF EXISTS cleanup_saved_profiles_trigger ON profiles;
CREATE TRIGGER cleanup_saved_profiles_trigger
  AFTER UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_saved_profiles_on_unpublish();

-- ================================================
-- INDEXES FOR PERFORMANCE
-- ================================================

-- These indexes help RLS policies perform better
CREATE INDEX IF NOT EXISTS idx_profiles_published_user ON profiles(user_id, is_published);
CREATE INDEX IF NOT EXISTS idx_messages_participants ON messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_saved_profiles_lookup ON saved_profiles(user_id, saved_user_id);

-- ================================================
-- VERIFICATION QUERIES
-- ================================================

-- Use these queries to test your RLS policies:

/*
-- Test 1: Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'profiles', 'saved_profiles', 'messages');

-- Test 2: List all policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Test 3: Test user creation (run as authenticated user)
-- This should work now:
-- INSERT INTO users (id, email, username, full_name) 
-- VALUES (auth.uid(), 'test@example.com', 'testuser', 'Test User');
*/
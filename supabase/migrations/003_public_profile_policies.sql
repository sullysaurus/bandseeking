-- Add policy to allow users to view other users' profiles (public viewing)
CREATE POLICY "Users can view other profiles" ON profiles
  FOR SELECT USING (true);

-- Note: This replaces the more restrictive "Users can view their own profile" policy
-- Users can now view any profile, but can still only edit their own due to other policies
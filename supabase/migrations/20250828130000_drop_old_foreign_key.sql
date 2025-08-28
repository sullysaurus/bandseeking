-- Drop the old foreign key constraint that references the users table
-- This is needed because we consolidated into a single profiles table

-- Drop the foreign key constraint if it exists
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

-- The user_id column now references auth.users directly, not a custom users table
-- Add proper foreign key to auth.users
ALTER TABLE profiles 
ADD CONSTRAINT profiles_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;
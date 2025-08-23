-- COMPLETE USER CLEANUP - Removes users from both Auth and Database
-- Run this in Supabase SQL Editor

-- Step 1: See all users in your database
SELECT id, email, username, created_at FROM users ORDER BY created_at DESC;

-- Step 2: See all auth users
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC;

-- Step 3: Delete specific user by email from BOTH places
-- Replace 'your-email@gmail.com' with the actual email
DO $$
DECLARE
    user_email TEXT := 'your-email@gmail.com';
    user_id UUID;
BEGIN
    -- Get the user ID from the email
    SELECT id INTO user_id FROM users WHERE email = user_email;
    
    IF user_id IS NOT NULL THEN
        -- Delete from your tables (in order to avoid foreign key constraints)
        DELETE FROM profiles WHERE user_id = user_id;
        DELETE FROM messages WHERE sender_id = user_id OR receiver_id = user_id;
        DELETE FROM saved_profiles WHERE user_id = user_id OR saved_user_id = user_id;
        DELETE FROM users WHERE id = user_id;
        
        -- Delete from auth
        DELETE FROM auth.users WHERE id = user_id;
        
        RAISE NOTICE 'User % with ID % has been completely removed', user_email, user_id;
    ELSE
        RAISE NOTICE 'No user found with email %', user_email;
    END IF;
END $$;

-- Alternative: DELETE ALL USERS (DANGER - Only for development!)
-- Uncomment the lines below if you want to delete ALL users

-- TRUNCATE TABLE profiles CASCADE;
-- TRUNCATE TABLE messages CASCADE;
-- TRUNCATE TABLE saved_profiles CASCADE;
-- TRUNCATE TABLE users CASCADE;
-- DELETE FROM auth.users;

-- Step 4: Verify deletion
SELECT COUNT(*) as user_count FROM users;
SELECT COUNT(*) as auth_user_count FROM auth.users;
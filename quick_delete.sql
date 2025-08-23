-- Quick delete for testing - removes ALL data
-- WARNING: This will delete ALL users from your database!

-- Delete from all tables in correct order (to avoid foreign key violations)
DELETE FROM profiles;
DELETE FROM messages;
DELETE FROM saved_profiles;
DELETE FROM users;

-- Also delete from Supabase Auth
DELETE FROM auth.users;

-- Verify everything is clean
SELECT 'Users table count: ' || COUNT(*) FROM users
UNION ALL
SELECT 'Auth users count: ' || COUNT(*) FROM auth.users
UNION ALL  
SELECT 'Profiles count: ' || COUNT(*) FROM profiles;
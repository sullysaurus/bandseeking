-- NUCLEAR OPTION: Clean ALL data from database (use with caution!)
-- This will remove ALL users, profiles, bands, opportunities, etc.
-- Only use this if you want to completely reset the database

-- Delete all dependent records first
DELETE FROM band_applications;
DELETE FROM band_members;  
DELETE FROM bands;
DELETE FROM opportunities;
DELETE FROM profiles;
DELETE FROM connections;
DELETE FROM messages;
DELETE FROM conversations;
DELETE FROM conversation_participants;

-- Delete all auth users (except system users)
DELETE FROM auth.users 
WHERE email NOT LIKE '%@supabase%' 
  AND email NOT LIKE '%@system%';

-- Reset sequences if needed
-- ALTER SEQUENCE profiles_id_seq RESTART WITH 1;
-- ALTER SEQUENCE bands_id_seq RESTART WITH 1;
-- ALTER SEQUENCE opportunities_id_seq RESTART WITH 1;

-- Show results
SELECT 'Complete database reset successful' as message;
SELECT 'Total profiles:', count(*) FROM profiles;
SELECT 'Total opportunities:', count(*) FROM opportunities;
SELECT 'Total bands:', count(*) FROM bands;
SELECT 'Total auth users:', count(*) FROM auth.users;
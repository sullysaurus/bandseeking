-- Debug script to check production database state
-- Run this to see what's actually installed in production

-- 1. Check if the trigger exists
SELECT 
  t.tgname as trigger_name,
  p.proname as function_name,
  t.tgenabled as enabled,
  c.relname as table_name
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
JOIN pg_class c ON t.tgrelid = c.oid
WHERE t.tgname = 'on_auth_user_created';

-- 2. Check if the function exists
SELECT 
  p.proname as function_name,
  p.prosrc as function_body
FROM pg_proc p
WHERE p.proname = 'handle_new_user';

-- 3. Check RLS policies on profiles table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- 4. Test the function manually with a fake user ID
-- DO NOT RUN THIS - just shows what we could test
-- SELECT handle_new_user();

-- 5. Check recent auth.users entries that don't have profiles
SELECT 
  u.id,
  u.email,
  u.created_at,
  p.id as profile_exists
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
WHERE u.created_at > NOW() - INTERVAL '24 hours'
AND p.id IS NULL
ORDER BY u.created_at DESC
LIMIT 10;

-- 6. Check if there are any error logs in pg_stat_statements (if available)
-- SELECT query, calls, mean_exec_time, rows, 100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
-- FROM pg_stat_statements 
-- WHERE query LIKE '%handle_new_user%' 
-- ORDER BY mean_exec_time DESC 
-- LIMIT 5;
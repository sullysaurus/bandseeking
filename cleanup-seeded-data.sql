-- Cleanup script to remove all seeded data from BandSeeking database
-- Run this in your Supabase SQL Editor to clean up all test data

-- Delete band applications first (references bands and users)
DELETE FROM band_applications 
WHERE band_id IN (
    SELECT id FROM bands 
    WHERE owner_id IN (
        '550e8400-e29b-41d4-a716-446655440001',
        '550e8400-e29b-41d4-a716-446655440002', 
        '550e8400-e29b-41d4-a716-446655440003',
        '550e8400-e29b-41d4-a716-446655440004',
        '550e8400-e29b-41d4-a716-446655440005'
    )
);

-- Delete band members (references bands and users)
DELETE FROM band_members 
WHERE band_id IN (
    SELECT id FROM bands 
    WHERE owner_id IN (
        '550e8400-e29b-41d4-a716-446655440001',
        '550e8400-e29b-41d4-a716-446655440002', 
        '550e8400-e29b-41d4-a716-446655440003',
        '550e8400-e29b-41d4-a716-446655440004',
        '550e8400-e29b-41d4-a716-446655440005'
    )
);

-- Delete bands owned by seeded users
DELETE FROM bands 
WHERE owner_id IN (
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440002', 
    '550e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440004',
    '550e8400-e29b-41d4-a716-446655440005'
);

-- Delete opportunities created by seeded users
DELETE FROM opportunities 
WHERE creator_id IN (
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440002', 
    '550e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440004',
    '550e8400-e29b-41d4-a716-446655440005'
);

-- Delete profiles for seeded users
DELETE FROM profiles 
WHERE id IN (
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440002', 
    '550e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440004',
    '550e8400-e29b-41d4-a716-446655440005'
);

-- Delete seeded auth users (this might fail if you don't have permission - that's okay)
DELETE FROM auth.users 
WHERE id IN (
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440002', 
    '550e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440004',
    '550e8400-e29b-41d4-a716-446655440005'
);

-- Also delete any records with @example.com emails (backup cleanup)
-- Note: profiles table doesn't have email column, so we skip that
DELETE FROM opportunities WHERE creator_id IN (
    SELECT id FROM auth.users WHERE email LIKE '%@example.com'
);
DELETE FROM bands WHERE owner_id IN (
    SELECT id FROM auth.users WHERE email LIKE '%@example.com'
);

-- Final cleanup: delete any remaining auth users with @example.com emails
DELETE FROM auth.users WHERE email LIKE '%@example.com';

-- Show cleanup results
SELECT 'Cleanup completed successfully' as message;
SELECT 'Remaining profiles:', count(*) FROM profiles;
SELECT 'Remaining opportunities:', count(*) FROM opportunities;
SELECT 'Remaining bands:', count(*) FROM bands;
SELECT 'Remaining auth users:', count(*) FROM auth.users;
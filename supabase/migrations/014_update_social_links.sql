-- Update social links schema for music platforms
-- Migration 014: Replace Github/Twitter with music streaming platforms

-- Add new music platform columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS apple_music TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS spotify TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS soundcloud TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bandcamp TEXT;

-- Remove old social platform columns (if they exist)
ALTER TABLE profiles DROP COLUMN IF EXISTS twitter;
ALTER TABLE profiles DROP COLUMN IF EXISTS github;

-- Update any existing RLS policies if needed (profiles table should already have proper policies)

SELECT 'Migration 014: Social links schema updated successfully!' as status;
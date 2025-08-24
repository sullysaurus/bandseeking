-- Migration to fix availability field to support multi-select
-- This converts availability from single VARCHAR with CHECK constraint to TEXT[] array

-- First, drop the existing check constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_availability_check;

-- Change the column type to TEXT[] to support arrays
ALTER TABLE profiles ALTER COLUMN availability TYPE TEXT[] USING 
  CASE 
    WHEN availability IS NULL THEN NULL
    ELSE ARRAY[availability]
  END;

-- Update any existing single values to arrays in our seed data
-- This handles the case where availability was stored as a string array representation
UPDATE profiles 
SET availability = string_to_array(trim(both '{}' from availability::text), ',')
WHERE availability IS NOT NULL;

-- Clean up any empty strings in arrays
UPDATE profiles 
SET availability = array_remove(availability, '')
WHERE availability IS NOT NULL;
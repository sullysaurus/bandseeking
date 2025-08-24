-- Migration to fix availability field to support multi-select
-- This converts availability from single VARCHAR with CHECK constraint to TEXT[] array

-- Find and drop the check constraint (PostgreSQL automatically names them)
DO $$ 
DECLARE 
    constraint_name TEXT;
BEGIN
    -- Find the constraint name
    SELECT conname INTO constraint_name
    FROM pg_constraint 
    WHERE conrelid = 'profiles'::regclass 
    AND contype = 'c' 
    AND pg_get_constraintdef(oid) LIKE '%availability%';
    
    -- Drop it if found
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE profiles DROP CONSTRAINT ' || constraint_name;
    END IF;
END $$;

-- Change the column type to TEXT[] to support arrays
ALTER TABLE profiles ALTER COLUMN availability TYPE TEXT[] USING 
  CASE 
    WHEN availability IS NULL THEN NULL
    WHEN availability = '' THEN NULL
    ELSE ARRAY[availability]
  END;
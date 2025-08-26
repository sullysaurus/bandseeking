-- Simplify venue capacity to single column
-- This migration adds a single capacity column and migrates existing min/max data

-- Add the new capacity column
ALTER TABLE venues ADD COLUMN capacity INTEGER;

-- Migrate existing data: use max capacity if available, otherwise min capacity
UPDATE venues 
SET capacity = COALESCE(capacity_max, capacity_min);

-- Drop the old columns
ALTER TABLE venues DROP COLUMN capacity_min;
ALTER TABLE venues DROP COLUMN capacity_max;
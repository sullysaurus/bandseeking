-- Add last_active column to users table
ALTER TABLE users 
ADD COLUMN last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing users to have current timestamp
UPDATE users 
SET last_active = NOW() 
WHERE last_active IS NULL;

-- Create an index for better query performance
CREATE INDEX idx_users_last_active ON users(last_active DESC);

-- Create a function to automatically update last_active
CREATE OR REPLACE FUNCTION update_last_active()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_active = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update last_active on any user update
CREATE TRIGGER trigger_update_last_active
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_last_active();
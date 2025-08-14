-- Add activity tracking fields to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS response_time_type TEXT CHECK (response_time_type IN ('quick', 'standard', 'slow')) DEFAULT 'standard';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avg_response_minutes INTEGER DEFAULT 60;
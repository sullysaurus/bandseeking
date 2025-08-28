-- Add seeking and influences columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS seeking TEXT[],
ADD COLUMN IF NOT EXISTS influences TEXT;

-- Update existing profiles to have some default values
UPDATE public.profiles 
SET 
  seeking = ARRAY['Band members', 'Collaborators'],
  influences = 'The Beatles, Led Zeppelin, Pink Floyd'
WHERE seeking IS NULL OR influences IS NULL;
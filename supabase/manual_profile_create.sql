-- Manually create profile for the user that just signed up
-- User ID: 6a0462be-5136-4282-86ae-e585eb0feb86

-- First, let's see if this user exists in auth.users
SELECT id, email, created_at FROM auth.users WHERE id = '6a0462be-5136-4282-86ae-e585eb0feb86';

-- Check if profile already exists (it shouldn't)
SELECT * FROM public.profiles WHERE user_id = '6a0462be-5136-4282-86ae-e585eb0feb86';

-- Manually create the profile with smart defaults
INSERT INTO public.profiles (
  user_id,
  username,
  bio,
  zip_code,
  main_instrument,
  experience_level,
  genres,
  seeking,
  is_published
) VALUES (
  '6a0462be-5136-4282-86ae-e585eb0feb86',
  'musician_' || FLOOR(RANDOM() * 9000 + 1000)::TEXT,
  'Hey! I''m a musician looking to connect with other artists. Let''s make some music together!',
  '27601',
  'guitar',
  'intermediate',
  ARRAY['Rock'],
  ARRAY['Band members', 'Collaborators'],
  false
);

-- Verify the profile was created
SELECT * FROM public.profiles WHERE user_id = '6a0462be-5136-4282-86ae-e585eb0feb86';
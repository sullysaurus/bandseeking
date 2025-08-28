-- Add smart defaults for new user profiles
-- This creates a better UX by giving users defaults they'll want to correct

CREATE OR REPLACE FUNCTION generate_smart_username()
RETURNS TEXT AS $$
DECLARE
  instruments TEXT[] := ARRAY['guitarist', 'drummer', 'vocalist', 'bassist', 'keyboardist', 'producer', 'songwriter'];
  random_instrument TEXT;
  random_number INTEGER;
  generated_username TEXT;
BEGIN
  -- Pick random instrument and number
  random_instrument := instruments[floor(random() * array_length(instruments, 1) + 1)];
  random_number := floor(random() * 9999) + 1;
  generated_username := random_instrument || '_' || random_number;
  
  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM profiles WHERE username = generated_username) LOOP
    random_number := floor(random() * 9999) + 1;
    generated_username := random_instrument || '_' || random_number;
  END LOOP;
  
  RETURN generated_username;
END;
$$ LANGUAGE plpgsql;

-- Update the new user handler with smart defaults
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  generated_username TEXT;
  default_instrument TEXT;
  default_bio TEXT;
BEGIN
  -- Generate smart username
  generated_username := generate_smart_username();
  
  -- Extract instrument from username for consistency
  default_instrument := CASE 
    WHEN generated_username LIKE 'guitarist%' THEN 'Guitar'
    WHEN generated_username LIKE 'drummer%' THEN 'Drums'
    WHEN generated_username LIKE 'vocalist%' THEN 'Vocals'
    WHEN generated_username LIKE 'bassist%' THEN 'Bass'
    WHEN generated_username LIKE 'keyboardist%' THEN 'Keyboard'
    WHEN generated_username LIKE 'producer%' THEN 'Production'
    WHEN generated_username LIKE 'songwriter%' THEN 'Songwriting'
    ELSE 'Guitar'
  END;
  
  -- Create engaging default bio
  default_bio := 'Super cool person looking to collaborate. Shoot me a dm!';

  INSERT INTO profiles (
    user_id, 
    email, 
    username, 
    main_instrument,
    bio,
    zip_code,
    is_published
  )
  VALUES (
    NEW.id,
    NEW.email,
    generated_username,
    default_instrument,
    default_bio,
    '27601', -- Raleigh, NC default
    true -- Auto-publish with smart defaults
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
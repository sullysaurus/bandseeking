-- Fix handle_new_user function to handle missing full_name
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  generated_username TEXT;
  user_full_name TEXT;
BEGIN
  -- Generate username from email if not provided
  generated_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    LOWER(REPLACE(split_part(NEW.email, '@', 1), '.', '_'))
  );
  
  -- Ensure username is unique
  WHILE EXISTS (SELECT 1 FROM profiles WHERE username = generated_username) LOOP
    generated_username := generated_username || '_' || floor(random() * 1000)::text;
  END LOOP;

  -- Get full name, provide fallback if missing
  user_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );

  INSERT INTO profiles (
    user_id, 
    email, 
    username, 
    full_name,
    main_instrument,
    is_published
  )
  VALUES (
    NEW.id,
    NEW.email,
    generated_username,
    user_full_name,
    'Not specified',
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
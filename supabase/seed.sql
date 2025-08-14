-- Seed data for BandSeeking app
-- We'll create opportunities and bands for demonstration without user foreign keys

-- First create some dummy user records directly (this is just for seeding)
-- In production, users are created via Supabase Auth
INSERT INTO auth.users (
    id, 
    email, 
    created_at, 
    updated_at, 
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data
) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'alex@example.com', now(), now(), now(), '{}', '{"username": "alex_guitarist", "full_name": "Alex Rivera"}'),
('550e8400-e29b-41d4-a716-446655440002', 'sarah@example.com', now(), now(), now(), '{}', '{"username": "sarah_beats", "full_name": "Sarah Chen"}'),
('550e8400-e29b-41d4-a716-446655440003', 'mike@example.com', now(), now(), now(), '{}', '{"username": "mike_bass", "full_name": "Mike Johnson"}'),
('550e8400-e29b-41d4-a716-446655440004', 'emma@example.com', now(), now(), now(), '{}', '{"username": "emma_vocals", "full_name": "Emma Wilson"}'),
('550e8400-e29b-41d4-a716-446655440005', 'carlos@example.com', now(), now(), now(), '{}', '{"username": "carlos_keys", "full_name": "Carlos Martinez"}');

-- Now create profiles for these users (the trigger should handle this, but let's be explicit)
INSERT INTO profiles (id, username, full_name, bio, location, instruments, genres, experience_level, looking_for, website, instagram, phone, avatar_url) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'alex_guitarist', 'Alex Rivera', 'Passionate lead guitarist with 8 years of experience. Love playing blues, rock, and jazz.', 'Los Angeles, CA', ARRAY['Guitar', 'Vocals'], ARRAY['Rock', 'Blues', 'Jazz'], 'Advanced', ARRAY['Band to Join', 'Recording Projects'], 'https://alexguitar.com', '@alexrivera_music', '555-0101', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400'),

('550e8400-e29b-41d4-a716-446655440002', 'sarah_beats', 'Sarah Chen', 'Professional drummer and percussionist with 15+ years experience.', 'Nashville, TN', ARRAY['Drums', 'Percussion'], ARRAY['Rock', 'Pop', 'Electronic'], 'Professional', ARRAY['Session Work', 'Tour Opportunities'], NULL, '@sarahbeats', '555-0102', 'https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?w=400'),

('550e8400-e29b-41d4-a716-446655440003', 'mike_bass', 'Mike Johnson', 'Versatile bass player with a groove that locks in tight.', 'New York, NY', ARRAY['Bass', 'Double Bass'], ARRAY['Funk', 'R&B', 'Jazz'], 'Advanced', ARRAY['Jam Sessions', 'Recording Projects'], NULL, NULL, '555-0103', NULL),

('550e8400-e29b-41d4-a716-446655440004', 'emma_vocals', 'Emma Wilson', 'Singer-songwriter with a passion for indie folk and alternative music.', 'Portland, OR', ARRAY['Vocals', 'Guitar', 'Piano'], ARRAY['Indie', 'Folk', 'Alternative'], 'Intermediate', ARRAY['Songwriting Partner', 'Band to Join'], 'https://emmawilsonmusic.com', '@emmawilson_music', '555-0104', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400'),

('550e8400-e29b-41d4-a716-446655440005', 'carlos_keys', 'Carlos Martinez', 'Keyboardist, producer, and electronic music enthusiast.', 'Miami, FL', ARRAY['Keyboard', 'Piano', 'Electronic/Production'], ARRAY['Electronic', 'Ambient', 'Hip Hop'], 'Advanced', ARRAY['Producer', 'Recording Projects'], 'https://carlosbeats.com', '@carloskeys', '555-0105', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400')
ON CONFLICT (id) DO UPDATE SET
    bio = EXCLUDED.bio,
    location = EXCLUDED.location,
    instruments = EXCLUDED.instruments,
    genres = EXCLUDED.genres,
    experience_level = EXCLUDED.experience_level,
    looking_for = EXCLUDED.looking_for,
    website = EXCLUDED.website,
    instagram = EXCLUDED.instagram,
    phone = EXCLUDED.phone,
    avatar_url = EXCLUDED.avatar_url;

-- Insert sample opportunities
INSERT INTO opportunities (title, description, type, location, is_remote, is_paid, payment_amount, date_time, deadline, requirements, genres, instruments_needed, experience_level, contact_method, creator_id, views_count) VALUES
('Wedding Band Drummer Needed', 'Local wedding band seeking a reliable drummer for weekend gigs. Must have own equipment and transportation. Professional attitude and diverse repertoire required. Great pay and fun atmosphere!', 'gig', 'Nashville, TN', false, true, '$200-300 per gig', '2025-03-01 19:00:00+00', '2025-02-15 23:59:59+00', ARRAY['Own drum kit', 'Transportation', 'Weekend availability'], ARRAY['Pop', 'Rock', 'Country'], ARRAY['Drums'], 'Intermediate', 'platform', '550e8400-e29b-41d4-a716-446655440002', 45),

('Session Guitarist for EP Recording', 'Looking for a skilled guitarist to record lead and rhythm parts for my upcoming 5-song EP. Alternative/indie rock style. Studio is in Miami, but we can work remotely if needed.', 'recording', 'Miami, FL', true, true, '$500 for full EP', '2025-02-20 10:00:00+00', '2025-02-10 23:59:59+00', ARRAY['Professional recording experience', 'Own guitar and amp'], ARRAY['Alternative', 'Indie', 'Rock'], ARRAY['Guitar'], 'Advanced', 'platform', '550e8400-e29b-41d4-a716-446655440005', 32),

('Indie Folk Songwriting Partner', 'Singer-songwriter looking for a creative partner to co-write songs for an upcoming album. Looking for someone who plays guitar or piano and has experience with melody and lyrics.', 'collaboration', 'Portland, OR', true, false, NULL, NULL, '2025-03-01 23:59:59+00', ARRAY['Songwriting experience', 'Collaborative mindset'], ARRAY['Indie', 'Folk', 'Alternative'], ARRAY['Guitar', 'Piano'], 'Intermediate', 'platform', '550e8400-e29b-41d4-a716-446655440004', 28),

('Jazz Saxophone Instructor', 'Music school seeking part-time saxophone instructor for beginner to intermediate students. Experience with jazz theory and improvisation required. Flexible schedule.', 'teaching', 'Chicago, IL', false, true, '$40/hour', NULL, '2025-02-28 23:59:59+00', ARRAY['Teaching experience', 'Jazz theory knowledge', 'Patience with students'], ARRAY['Jazz'], ARRAY['Saxophone'], 'Professional', 'email', '550e8400-e29b-41d4-a716-446655440001', 19),

('Live Session Musician - Multiple Instruments', 'Established artist seeking versatile musicians for upcoming tour. Need players who can handle multiple instruments and genres. Tour starts in June, rehearsals begin in May.', 'session', 'Los Angeles, CA', false, true, '$2000/week + expenses', '2025-06-01 09:00:00+00', '2025-04-01 23:59:59+00', ARRAY['Tour experience', 'Multiple instruments', 'Professional equipment'], ARRAY['Pop', 'Rock', 'R&B'], ARRAY['Guitar', 'Bass', 'Keyboard'], 'Professional', 'platform', '550e8400-e29b-41d4-a716-446655440001', 67),

('Blues Jam Session - Weekly', 'Join our weekly blues jam session every Thursday night! Open to all skill levels. Bring your instruments and let''s create some magic together.', 'session', 'Austin, TX', false, false, NULL, '2025-02-20 20:00:00+00', NULL, ARRAY['Bring your own instrument', 'Positive attitude'], ARRAY['Blues', 'Rock'], ARRAY['Guitar', 'Bass', 'Drums', 'Harmonica'], 'Intermediate', 'platform', '550e8400-e29b-41d4-a716-446655440003', 23);

-- Insert sample bands
INSERT INTO bands (name, slug, description, genre, location, status, looking_for, website, instagram, owner_id) VALUES
('Midnight Electric', 'midnight-electric', 'High-energy rock band looking for a permanent bassist to complete our lineup. We have several original songs and are planning to record an EP this year.', 'Rock', 'Los Angeles, CA', 'recruiting', ARRAY['Bass Player'], 'https://midnightelectric.com', '@midnightelectric', '550e8400-e29b-41d4-a716-446655440001'),

('Acoustic Harmony', 'acoustic-harmony', 'Indie folk duo expanding to a full band. We focus on storytelling through music with beautiful harmonies and acoustic arrangements.', 'Folk', 'Portland, OR', 'recruiting', ARRAY['Lead Guitar', 'Violin', 'Cello'], 'https://acousticharmonyband.com', '@acousticharmony', '550e8400-e29b-41d4-a716-446655440004'),

('Fusion Collective', 'fusion-collective', 'Jazz fusion group that blends traditional jazz with electronic elements. We regularly perform at local venues and jazz festivals.', 'Jazz', 'New York, NY', 'complete', ARRAY[]::text[], 'https://fusioncollective.nyc', '@fusioncollective', '550e8400-e29b-41d4-a716-446655440003'),

('Electronic Dreams', 'electronic-dreams', 'Electronic music production duo looking to expand into live performances. Seeking live musicians who can adapt electronic sounds to acoustic instruments.', 'Electronic', 'Los Angeles, CA', 'recruiting', ARRAY['Drums', 'Bass', 'Guitar'], 'https://electronicdreams.io', '@electronicdreams', '550e8400-e29b-41d4-a716-446655440005');

-- Insert band members
INSERT INTO band_members (band_id, user_id, role) VALUES
-- Get the band IDs and add members
((SELECT id FROM bands WHERE slug = 'midnight-electric'), '550e8400-e29b-41d4-a716-446655440001', 'Lead Guitar'),
((SELECT id FROM bands WHERE slug = 'midnight-electric'), '550e8400-e29b-41d4-a716-446655440002', 'Drums'),
((SELECT id FROM bands WHERE slug = 'acoustic-harmony'), '550e8400-e29b-41d4-a716-446655440004', 'Vocals/Guitar'),
((SELECT id FROM bands WHERE slug = 'fusion-collective'), '550e8400-e29b-41d4-a716-446655440003', 'Bass'),
((SELECT id FROM bands WHERE slug = 'fusion-collective'), '550e8400-e29b-41d4-a716-446655440005', 'Keys'),
((SELECT id FROM bands WHERE slug = 'electronic-dreams'), '550e8400-e29b-41d4-a716-446655440005', 'Producer/Keys');
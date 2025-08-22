-- Seed file: 10 Musicians for BandSeeking Demo
-- Run this AFTER setting up your database schema and RLS policies

-- Note: These are demo users with fake data for testing purposes
-- In production, you'd create these through the normal registration flow

-- First, let's create some demo auth users (you may need to do this through Supabase Auth UI)
-- These IDs are UUIDs that we'll reference in our seed data

-- Insert demo users (basic info)
INSERT INTO users (id, email, username, full_name, zip_code, latitude, longitude, profile_completed, created_at, updated_at) VALUES
  -- Musician 1: Rock Guitarist
  ('550e8400-e29b-41d4-a716-446655440001', 'alex.strings@email.com', 'alexstrings', 'Alex Rodriguez', '10001', 40.7831, -73.9712, true, NOW() - INTERVAL '30 days', NOW() - INTERVAL '5 days'),
  
  -- Musician 2: Jazz Drummer  
  ('550e8400-e29b-41d4-a716-446655440002', 'maya.beats@email.com', 'mayabeats', 'Maya Chen', '90210', 34.0901, -118.4065, true, NOW() - INTERVAL '25 days', NOW() - INTERVAL '3 days'),
  
  -- Musician 3: Folk Vocalist
  ('550e8400-e29b-41d4-a716-446655440003', 'sam.voice@email.com', 'folksingersam', 'Sam Williams', '37201', 36.1716, -86.7842, true, NOW() - INTERVAL '20 days', NOW() - INTERVAL '2 days'),
  
  -- Musician 4: Electronic Producer
  ('550e8400-e29b-41d4-a716-446655440004', 'dj.nova@email.com', 'djnova', 'Nova Thompson', '60601', 41.8816, -87.6231, true, NOW() - INTERVAL '18 days', NOW() - INTERVAL '1 day'),
  
  -- Musician 5: Classical Violinist
  ('550e8400-e29b-41d4-a716-446655440005', 'elena.violin@email.com', 'elenastrings', 'Elena Petrov', '02101', 42.3554, -71.0640, true, NOW() - INTERVAL '15 days', NOW() - INTERVAL '4 hours'),
  
  -- Musician 6: Blues Bass Player
  ('550e8400-e29b-41d4-a716-446655440006', 'marcus.bass@email.com', 'bluesbass', 'Marcus Johnson', '30309', 33.7901, -84.3889, true, NOW() - INTERVAL '12 days', NOW() - INTERVAL '2 hours'),
  
  -- Musician 7: Indie Keyboardist
  ('550e8400-e29b-41d4-a716-446655440007', 'zoe.keys@email.com', 'indiekeys', 'Zoe Martinez', '78701', 30.2711, -97.7437, true, NOW() - INTERVAL '10 days', NOW() - INTERVAL '1 hour'),
  
  -- Musician 8: Metal Drummer
  ('550e8400-e29b-41d4-a716-446655440008', 'thunder.drums@email.com', 'thunderdrums', 'Jake Wilson', '98101', 47.6205, -122.3493, true, NOW() - INTERVAL '8 days', NOW() - INTERVAL '30 minutes'),
  
  -- Musician 9: Pop Vocalist/Songwriter
  ('550e8400-e29b-41d4-a716-446655440009', 'aria.pop@email.com', 'ariapop', 'Aria Kim', '33101', 25.7933, -80.2906, true, NOW() - INTERVAL '6 days', NOW() - INTERVAL '15 minutes'),
  
  -- Musician 10: Versatile Multi-instrumentalist  
  ('550e8400-e29b-41d4-a716-446655440010', 'river.music@email.com', 'rivermusic', 'River Davis', '97201', 45.5372, -122.6506, true, NOW() - INTERVAL '3 days', NOW() - INTERVAL '5 minutes');

-- Insert musician profiles with detailed information
INSERT INTO profiles (id, user_id, bio, main_instrument, secondary_instruments, experience_level, seeking, genres, influences, availability, has_transportation, has_own_equipment, willing_to_travel_miles, social_links, is_published, created_at, updated_at) VALUES

-- Alex Rodriguez - Rock Guitarist
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440001', 
 'Passionate rock guitarist with 8 years of experience. Looking to form an original band that pushes boundaries and creates memorable music. I have a home studio and love collaborating on new material.',
 'Guitar', 
 ARRAY['Vocals'], 
 'advanced',
 ARRAY['Original Band Formation', 'Recording Projects', 'Live Performance'],
 ARRAY['Rock', 'Alternative', 'Indie'],
 'Influenced by The White Stripes, Arctic Monkeys, and Queens of the Stone Age. Love the energy of garage rock mixed with modern production.',
 'evenings',
 true, true, 30,
 '{"instagram": "@alexstrings_music", "youtube": "youtube.com/alexstringsmusic", "soundcloud": "", "spotify": ""}',
 true, NOW() - INTERVAL '30 days', NOW() - INTERVAL '5 days'),

-- Maya Chen - Jazz Drummer  
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440002',
 'Professional jazz drummer with conservatory training. Available for session work and looking to join an established jazz trio or quartet. Comfortable with everything from bebop to fusion.',
 'Drums',
 ARRAY['Keyboards/Piano'],
 'professional',
 ARRAY['Session Work', 'Live Performance', 'Jazz Ensemble'],
 ARRAY['Jazz', 'Blues', 'R&B/Soul'],
 'Studied under Tony Williams disciples. Love the approach of Elvin Jones, Brian Blade, and Chris Dave. Always working on my brush technique.',
 'flexible',
 true, true, 50,
 '{"instagram": "@mayabeats", "youtube": "", "soundcloud": "soundcloud.com/mayabeats", "spotify": "open.spotify.com/artist/mayabeats"}',
 true, NOW() - INTERVAL '25 days', NOW() - INTERVAL '3 days'),

-- Sam Williams - Folk Vocalist
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440003',
 'Storytelling folk singer-songwriter. I write about life experiences and love performing intimate acoustic shows. Looking for gentle accompaniment - maybe violin, cello, or light percussion.',
 'Vocals',
 ARRAY['Guitar'],
 'intermediate', 
 ARRAY['Songwriting Collaboration', 'Live Performance', 'Recording Projects'],
 ARRAY['Folk', 'Country', 'Indie'],
 'Bob Dylan, Joni Mitchell, and Phoebe Bridgers shape my writing. I believe in the power of honest lyrics and simple melodies.',
 'weekends',
 false, false, 25,
 '{"instagram": "@folksingersam", "youtube": "youtube.com/samwilliamsmusic", "soundcloud": "", "spotify": ""}',
 true, NOW() - INTERVAL '20 days', NOW() - INTERVAL '2 days'),

-- Nova Thompson - Electronic Producer
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440004',
 'Electronic music producer and live performer. I create atmospheric soundscapes and dance-floor ready tracks. Looking for vocalists and live musicians to collaborate with on hybrid electronic/organic projects.',
 'Production/DAW',
 ARRAY['DJ/Turntables', 'Keyboards/Piano'],
 'advanced',
 ARRAY['Music Production', 'Live Performance', 'Songwriting Collaboration'],
 ARRAY['Electronic/EDM', 'Experimental', 'Pop'],
 'Inspired by Burial, Four Tet, and Fred again... I love blending organic instruments with electronic textures.',
 'evenings',
 true, true, 40,
 '{"instagram": "@djnova", "youtube": "", "soundcloud": "soundcloud.com/djnova", "spotify": "open.spotify.com/artist/djnova"}',
 true, NOW() - INTERVAL '18 days', NOW() - INTERVAL '1 day'),

-- Elena Petrov - Classical Violinist
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440005',
 'Classically trained violinist open to crossover projects. I have experience in orchestras but want to explore folk, indie, and world music. Perfect for adding strings to your recordings or live shows.',
 'Violin',
 ARRAY['Keyboards/Piano'],
 'professional',
 ARRAY['Session Work', 'Recording Projects', 'Live Performance', 'Music Lessons/Teaching'],
 ARRAY['Classical', 'Folk', 'World', 'Indie'],
 'Trained in Russian classical tradition but love the freedom of Celtic fiddle and the innovation of artists like Owen Pallett.',
 'flexible',
 true, true, 35,
 '{"instagram": "@elenastrings", "youtube": "youtube.com/elenapetrovoviolin", "soundcloud": "", "spotify": ""}',
 true, NOW() - INTERVAL '15 days', NOW() - INTERVAL '4 hours'),

-- Marcus Johnson - Blues Bass Player
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440006',
 'Groove-first bass player with deep blues roots. I can lay down a solid foundation for any style but my heart is in the blues. Looking for musicians who understand that less is more.',
 'Bass',
 ARRAY['Vocals'],
 'professional',
 ARRAY['Cover Band', 'Live Performance', 'Session Work'],
 ARRAY['Blues', 'R&B/Soul', 'Rock'],
 'Learned from the masters: James Jamerson, Duck Dunn, and Willie Dixon. Every note has to serve the song.',
 'weekends',
 true, true, 45,
 '{"instagram": "@bluesbass", "youtube": "", "soundcloud": "", "spotify": ""}',
 true, NOW() - INTERVAL '12 days', NOW() - INTERVAL '2 hours'),

-- Zoe Martinez - Indie Keyboardist  
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440007',
 'Indie rock keyboardist and synth enthusiast. I love creating atmospheric textures and catchy melodic hooks. Always excited to experiment with new sounds and vintage equipment.',
 'Keyboards/Piano',
 ARRAY['Vocals'],
 'intermediate',
 ARRAY['Original Band Formation', 'Recording Projects', 'Jam Sessions'],
 ARRAY['Indie', 'Alternative', 'Electronic/EDM'],
 'Love the dreamy sounds of Beach House, the energy of LCD Soundsystem, and the innovation of Grimes.',
 'evenings',
 true, true, 20,
 '{"instagram": "@indiekeys", "youtube": "", "soundcloud": "soundcloud.com/indiekeys", "spotify": ""}',
 true, NOW() - INTERVAL '10 days', NOW() - INTERVAL '1 hour'),

-- Jake Wilson - Metal Drummer
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440008',
 'Heavy-hitting metal drummer seeking serious musicians for original metal project. I have double bass pedals, can play blast beats, but also love groove-based metal. Ready to tour!',
 'Drums',
 ARRAY[]::text[],
 'advanced', 
 ARRAY['Original Band Formation', 'Live Performance', 'Recording Projects'],
 ARRAY['Metal', 'Rock', 'Punk'],
 'Danny Carey, Neil Peart, and Dave Lombardo taught me that metal drumming is about power AND precision.',
 'flexible',
 true, true, 100,
 '{"instagram": "@thunderdrums", "youtube": "youtube.com/thunderdrums", "soundcloud": "", "spotify": ""}',
 true, NOW() - INTERVAL '8 days', NOW() - INTERVAL '30 minutes'),

-- Aria Kim - Pop Vocalist/Songwriter
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440009',
 'Pop vocalist and songwriter with a focus on catchy melodies and relatable lyrics. Looking for producers and musicians to help bring my songs to life. I have several finished songs ready to record.',
 'Vocals',
 ARRAY['Keyboards/Piano', 'Guitar'],
 'intermediate',
 ARRAY['Songwriting Collaboration', 'Recording Projects', 'Music Production'],
 ARRAY['Pop', 'R&B/Soul', 'Electronic/EDM'],
 'Taylor Swift''s songwriting, Billie Eilish''s innovation, and Ariana Grande''s vocals inspire my approach to modern pop music.',
 'weekdays',
 false, false, 25,
 '{"instagram": "@ariapop", "youtube": "youtube.com/ariakimmusic", "soundcloud": "", "spotify": "open.spotify.com/artist/ariakim"}',
 true, NOW() - INTERVAL '6 days', NOW() - INTERVAL '15 minutes'),

-- River Davis - Multi-instrumentalist
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440010',
 'Multi-instrumentalist who loves genre-blending projects. I can play guitar, bass, drums, and keys depending on what the song needs. Always up for creative challenges and collaborative songwriting.',
 'Guitar',
 ARRAY['Bass', 'Drums', 'Keyboards/Piano'],
 'advanced',
 ARRAY['Songwriting Collaboration', 'Recording Projects', 'Original Band Formation', 'Session Work'],
 ARRAY['Indie', 'Folk', 'Rock', 'Electronic/EDM'],
 'Radiohead, Bon Iver, and Tame Impala show me that great music transcends genre boundaries. Every instrument is a tool for expression.',
 'flexible',
 true, true, 60,
 '{"instagram": "@rivermusic", "youtube": "", "soundcloud": "soundcloud.com/rivermusic", "spotify": ""}',
 true, NOW() - INTERVAL '3 days', NOW() - INTERVAL '5 minutes');

-- Add some saved profiles (musicians saving each other)
INSERT INTO saved_profiles (id, user_id, saved_user_id, created_at) VALUES
  -- Alex (guitarist) saves Maya (drummer) and Marcus (bass) for potential rock trio
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', NOW() - INTERVAL '2 days'),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440006', NOW() - INTERVAL '1 day'),
  
  -- Maya (drummer) saves Elena (violin) and Sam (folk singer) for jazz crossover
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440005', NOW() - INTERVAL '3 days'),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', NOW() - INTERVAL '2 days'),
  
  -- Nova (producer) saves Aria (pop vocalist) and Zoe (keys) for electronic project
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440009', NOW() - INTERVAL '1 day'),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440007', NOW() - INTERVAL '6 hours'),
  
  -- River (multi-instrumentalist) saves everyone for potential collaborations
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '2 days'),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440003', NOW() - INTERVAL '1 day'),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440005', NOW() - INTERVAL '12 hours');

-- Add some sample messages between musicians
INSERT INTO messages (id, sender_id, receiver_id, content, read, created_at) VALUES
  -- Alex reaching out to Maya about forming a band
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 
   'Hi Maya! I checked out your profile and your jazz background is impressive. I''m working on some rock songs that could really benefit from your rhythmic approach. Would you be interested in jamming sometime?', 
   true, NOW() - INTERVAL '1 day 6 hours'),
   
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001',
   'Hey Alex! Thanks for reaching out. I''d love to hear your material. I''m always interested in exploring how jazz rhythms can work in rock contexts. Do you have any demos I could check out?',
   false, NOW() - INTERVAL '1 day 2 hours'),

  -- Nova contacting Aria about collaboration
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440009',
   'Hi Aria! Your pop sensibilities caught my attention. I''ve been working on some electronic tracks that need strong vocals and melodies. Would you be open to a collaboration?',
   true, NOW() - INTERVAL '6 hours'),
   
  -- Sam reaching out to Elena about folk crossover
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440005',
   'Elena, I love your classical background! I''m working on some folk songs that would be beautiful with violin arrangements. Would you be interested in adding strings to a recording project?',
   false, NOW() - INTERVAL '3 hours'),
   
  -- River reaching out to multiple people
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440008',
   'Jake, your metal drumming is intense! I''ve been experimenting with some heavier material and think we could create something unique together. Up for experimenting?',
   false, NOW() - INTERVAL '2 hours');

-- Verification: Show what we've created
SELECT 'Users created:' as info, count(*) as count FROM users WHERE profile_completed = true
UNION ALL
SELECT 'Profiles created:', count(*) FROM profiles WHERE is_published = true  
UNION ALL
SELECT 'Saved connections:', count(*) FROM saved_profiles
UNION ALL  
SELECT 'Messages sent:', count(*) FROM messages;

-- Show the musicians we created
SELECT 
  u.username,
  u.full_name,
  p.main_instrument,
  p.experience_level,
  u.zip_code,
  array_length(p.genres, 1) as genre_count,
  array_length(p.seeking, 1) as seeking_count
FROM users u
JOIN profiles p ON u.id = p.user_id  
WHERE p.is_published = true
ORDER BY u.created_at;
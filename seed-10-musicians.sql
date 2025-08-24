-- Seed 10 musicians for testing
-- Run this after the main schema is created

-- Insert test users first
INSERT INTO users (id, email, username, full_name, zip_code, profile_completed) VALUES
('11111111-1111-1111-1111-111111111111', 'alex.rocks@example.com', 'alexrocks', 'Alex Rodriguez', '90210', true),
('22222222-2222-2222-2222-222222222222', 'maya.drums@example.com', 'maya_beats', 'Maya Thompson', '10001', true),
('33333333-3333-3333-3333-333333333333', 'jake.bass@example.com', 'jakebass', 'Jake Morrison', '60601', true),
('44444444-4444-4444-4444-444444444444', 'sara.vocals@example.com', 'sarasings', 'Sara Chen', '30309', true),
('55555555-5555-5555-5555-555555555555', 'mike.guitar@example.com', 'mikeshreds', 'Mike Johnson', '98101', true),
('66666666-6666-6666-6666-666666666666', 'luna.keys@example.com', 'lunakeys', 'Luna Davis', '02101', true),
('77777777-7777-7777-7777-777777777777', 'chris.drums@example.com', 'chrisbeats', 'Chris Wilson', '33101', true),
('88888888-8888-8888-8888-888888888888', 'zoe.violin@example.com', 'zoestrings', 'Zoe Martinez', '78701', true),
('99999999-9999-9999-9999-999999999999', 'ryan.sax@example.com', 'ryansax', 'Ryan Lee', '97201', true),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'emma.cello@example.com', 'emmacello', 'Emma Garcia', '80201', true);

-- Insert profiles for these users
INSERT INTO profiles (user_id, bio, main_instrument, secondary_instruments, experience_level, seeking, genres, influences, availability, has_transportation, has_own_equipment, willing_to_travel_miles, is_published) VALUES

-- Alex Rodriguez - Guitarist
('11111111-1111-1111-1111-111111111111', 
'Lead guitarist with 8 years experience. Love creating heavy riffs and melodic solos. Looking for serious musicians to start a band and gig regularly.',
'guitar',
ARRAY['vocals'],
'advanced',
ARRAY['bassist', 'drummer', 'band to join'],
ARRAY['rock', 'metal', 'alternative'],
'Led Zeppelin, Metallica, Foo Fighters',
ARRAY['weekends', 'evenings'],
true,
true,
30,
true),

-- Maya Thompson - Drummer
('22222222-2222-2222-2222-222222222222',
'Professional drummer with studio and live experience. Tight rhythm, great timing, and tons of energy. Ready to rock!',
'drums',
ARRAY['percussion'],
'professional', 
ARRAY['guitarist', 'bassist', 'band to join'],
ARRAY['rock', 'funk', 'jazz', 'fusion'],
'Dave Grohl, Neil Peart, Bonham',
ARRAY['flexible'],
true,
true,
50,
true),

-- Jake Morrison - Bassist
('33333333-3333-3333-3333-333333333333',
'Solid bassist who locks in with the drums and holds down the low end. 5 years playing, love groove-based music.',
'bass',
ARRAY[]::text[],
'intermediate',
ARRAY['drummer', 'guitarist', 'band to join'],
ARRAY['rock', 'funk', 'blues', 'indie'],
'Flea, John Paul Jones, Geddy Lee',
ARRAY['weekends'],
false,
true,
25,
true),

-- Sara Chen - Vocalist  
('44444444-4444-4444-4444-444444444444',
'Powerful female vocalist with 3-octave range. Experience in multiple genres from pop to metal. Looking for a band that writes original music.',
'vocals',
ARRAY['piano', 'guitar'],
'advanced',
ARRAY['guitarist', 'drummer', 'bassist'],
ARRAY['pop', 'rock', 'alternative', 'indie'],
'Paramore, Evanescence, Adele',
ARRAY['evenings', 'weekends'], 
true,
false,
40,
true),

-- Mike Johnson - Guitarist
('55555555-5555-5555-5555-555555555555',
'Rhythm and lead guitarist. Love both acoustic and electric. Into songwriting and collaboration. Chill vibe but serious about music.',
'guitar',
ARRAY['vocals', 'harmonica'],
'intermediate',
ARRAY['drummer', 'bassist', 'jamming partner'],
ARRAY['folk', 'rock', 'country', 'blues'],
'Johnny Cash, Neil Young, Tom Petty',
ARRAY['flexible'],
true,
true,
35,
true),

-- Luna Davis - Keyboardist
('66666666-6666-6666-6666-666666666666',
'Classical trained pianist transitioning to modern music. Love synths, organs, and creating atmospheric sounds.',
'keyboard',
ARRAY['piano', 'synthesizer'],
'intermediate',
ARRAY['guitarist', 'drummer', 'band to join'],
ARRAY['indie', 'electronic', 'alternative', 'ambient'],
'Radiohead, Portishead, Björk',
ARRAY['weekdays', 'evenings'],
false,
false,
20,
true),

-- Chris Wilson - Drummer
('77777777-7777-7777-7777-777777777777',
'High-energy drummer who loves punk and hardcore. Fast, aggressive style but can adapt to any genre. DIY ethic.',
'drums',
ARRAY[]::text[],
'advanced',
ARRAY['guitarist', 'bassist', 'vocalist'],
ARRAY['punk', 'hardcore', 'metal', 'grunge'],
'Travis Barker, Dave Grohl, Keith Moon',
ARRAY['weekends', 'evenings'],
true,
true,
15,
true),

-- Zoe Martinez - Violinist
('88888888-8888-8888-8888-888888888888',
'Electric violin player bringing classical training to modern music. Love experimenting with effects and unconventional sounds.',
'violin',
ARRAY['vocals'],
'professional',
ARRAY['guitarist', 'drummer', 'experimental musicians'],
ARRAY['experimental', 'electronic', 'folk', 'classical'],
'Lindsey Stirling, Boyd Tinsley, Jean-Luc Ponty',
ARRAY['flexible'],
true,
true,
45,
true),

-- Ryan Lee - Saxophonist  
('99999999-9999-9999-9999-999999999999',
'Tenor sax player with jazz background looking to branch into rock and funk. Love improvisation and adding horn sections to bands.',
'saxophone',
ARRAY['flute', 'clarinet'],
'advanced',
ARRAY['guitarist', 'drummer', 'bassist'],
ARRAY['jazz', 'funk', 'rock', 'blues'],
'John Coltrane, Clarence Clemons, Maceo Parker',
ARRAY['weekdays', 'weekends'],
false,
true,
30,
true),

-- Emma Garcia - Cellist
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
'Cellist with orchestral background interested in joining rock/metal bands. Love the contrast of strings with heavy guitars.',
'cello', 
ARRAY[]::text[],
'advanced',
ARRAY['guitarist', 'drummer', 'metal musicians'],
ARRAY['metal', 'symphonic', 'classical', 'alternative'],
'Apocalyptica, Trans-Siberian Orchestra, Yo-Yo Ma',
ARRAY['evenings'],
true,
false,
25,
true);

-- Update last_active timestamps to recent dates (within last few days)
UPDATE users SET 
  last_active = NOW() - INTERVAL '1 hour' 
WHERE username IN ('alexrocks', 'maya_beats');

UPDATE users SET 
  last_active = NOW() - INTERVAL '6 hours'
WHERE username IN ('jakebass', 'sarasings');

UPDATE users SET 
  last_active = NOW() - INTERVAL '1 day'
WHERE username IN ('mikeshreds', 'lunakeys');

UPDATE users SET 
  last_active = NOW() - INTERVAL '2 days'
WHERE username IN ('chrisbeats', 'zoestrings');

UPDATE users SET 
  last_active = NOW() - INTERVAL '3 days'
WHERE username IN ('ryansax', 'emmacello');
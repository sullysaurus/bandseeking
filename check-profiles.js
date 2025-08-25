const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkProfiles() {
  console.log('Checking all profiles in database...\n');
  
  // Check all profiles
  const { data: allProfiles, error: profilesError } = await supabase
    .from('profiles')
    .select(`
      id,
      is_published,
      created_at,
      main_instrument,
      bio,
      user:users(username, full_name)
    `)
    .order('created_at', { ascending: false });
    
  if (profilesError) {
    console.error('Error fetching profiles:', profilesError);
    return;
  }
  
  console.log(`📊 PROFILE SUMMARY:`);
  console.log(`Total profiles: ${allProfiles.length}`);
  console.log(`Published: ${allProfiles.filter(p => p.is_published).length}`);
  console.log(`Unpublished: ${allProfiles.filter(p => !p.is_published).length}\n`);
  
  console.log(`📋 ALL PROFILES:`);
  allProfiles.forEach((profile, index) => {
    console.log(`${index + 1}. ${profile.user?.username || 'NO_USERNAME'} (${profile.user?.full_name || 'NO_NAME'})`);
    console.log(`   Published: ${profile.is_published ? '✅' : '❌'}`);
    console.log(`   Instrument: ${profile.main_instrument || 'None'}`);
    console.log(`   Created: ${profile.created_at}`);
    console.log(`   Bio: ${profile.bio ? profile.bio.substring(0, 50) + '...' : 'No bio'}\n`);
  });
  
  // Check all users (in case profiles were deleted but users remain)
  const { data: allUsers, error: usersError } = await supabase
    .from('users')
    .select('id, username, full_name, created_at')
    .order('created_at', { ascending: false });
    
  if (usersError) {
    console.error('Error fetching users:', usersError);
    return;
  }
  
  console.log(`👥 USER SUMMARY:`);
  console.log(`Total users: ${allUsers.length}\n`);
  
  console.log(`👤 ALL USERS:`);
  allUsers.forEach((user, index) => {
    const hasProfile = allProfiles.some(p => p.user?.username === user.username);
    console.log(`${index + 1}. ${user.username} (${user.full_name})`);
    console.log(`   Has Profile: ${hasProfile ? '✅' : '❌ MISSING PROFILE'}`);
    console.log(`   Created: ${user.created_at}\n`);
  });
}

checkProfiles().catch(console.error);
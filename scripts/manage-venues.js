/**
 * Venue Management Script
 * 
 * This script manages venues in your Supabase database.
 * 
 * Usage:
 *   node scripts/manage-venues.js seed    # Seed all venues from data/venues.js
 *   node scripts/manage-venues.js clear   # Clear all venues
 *   node scripts/manage-venues.js count   # Count venues in database
 * 
 */

const { createClient } = require('@supabase/supabase-js')
const { venues, validateVenue } = require('../data/venues.js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  console.log('Make sure your .env.local file contains:')
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_url')
  console.log('SUPABASE_SERVICE_ROLE_KEY=your_key')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function seedVenues() {
  console.log('🚀 Seeding venues to database...')
  
  try {
    // Validate all venues first
    console.log('✅ Validating venue data...')
    venues.forEach((venue, index) => {
      try {
        validateVenue(venue)
      } catch (error) {
        console.error(`❌ Venue ${index + 1} (${venue.name || 'Unknown'}) validation failed:`, error.message)
        process.exit(1)
      }
    })
    
    // Clear existing venues
    console.log('🗑️  Clearing existing venues...')
    const { error: deleteError } = await supabase
      .from('venues')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all
    
    if (deleteError) {
      console.error('❌ Error clearing venues:', deleteError)
      process.exit(1)
    }
    
    // Insert venues in batches
    const batchSize = 10
    let insertedCount = 0
    
    for (let i = 0; i < venues.length; i += batchSize) {
      const batch = venues.slice(i, i + batchSize)
      
      console.log(`📝 Inserting venues ${i + 1} to ${Math.min(i + batchSize, venues.length)}...`)
      
      const { data, error } = await supabase
        .from('venues')
        .insert(batch)
        .select()
      
      if (error) {
        console.error('❌ Error inserting batch:', error)
        process.exit(1)
      }
      
      insertedCount += data.length
    }
    
    console.log(`\n✅ Successfully seeded ${insertedCount} venues!`)
    console.log('🎉 You can now visit /venues to see all venues.')
    
  } catch (error) {
    console.error('❌ Error seeding venues:', error)
    process.exit(1)
  }
}

async function clearVenues() {
  console.log('🗑️  Clearing all venues from database...')
  
  try {
    const { error } = await supabase
      .from('venues')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all
    
    if (error) {
      console.error('❌ Error clearing venues:', error)
      process.exit(1)
    }
    
    console.log('✅ All venues cleared successfully!')
    
  } catch (error) {
    console.error('❌ Error clearing venues:', error)
    process.exit(1)
  }
}

async function countVenues() {
  console.log('📊 Counting venues in database...')
  
  try {
    const { count, error } = await supabase
      .from('venues')
      .select('*', { count: 'exact', head: true })
    
    if (error) {
      console.error('❌ Error counting venues:', error)
      process.exit(1)
    }
    
    console.log(`📈 Total venues in database: ${count}`)
    console.log(`📋 Total venues in data file: ${venues.length}`)
    
  } catch (error) {
    console.error('❌ Error counting venues:', error)
    process.exit(1)
  }
}

// Command line interface
const command = process.argv[2]

switch (command) {
  case 'seed':
    seedVenues()
    break
  case 'clear':
    clearVenues()
    break
  case 'count':
    countVenues()
    break
  default:
    console.log('🎵 Venue Management Script')
    console.log('')
    console.log('Usage:')
    console.log('  node scripts/manage-venues.js seed    # Seed all venues')
    console.log('  node scripts/manage-venues.js clear   # Clear all venues')
    console.log('  node scripts/manage-venues.js count   # Count venues')
    console.log('')
    console.log('To add new venues:')
    console.log('  1. Edit data/venues.js')
    console.log('  2. Run: node scripts/manage-venues.js seed')
    break
}
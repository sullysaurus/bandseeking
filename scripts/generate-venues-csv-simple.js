/**
 * Generate simplified CSV file from venues data for Supabase import
 * Only includes columns that exist in the venues table
 */

const { venues } = require('../data/venues.js')
const fs = require('fs')
const path = require('path')

// Convert array to PostgreSQL array format
const toPostgresArray = (arr) => {
  if (!arr || arr.length === 0) return '{}'
  return '{' + arr.map(item => `"${item.replace(/"/g, '\\"')}"`).join(',') + '}'
}

// Escape CSV field
const escapeCSV = (field) => {
  if (field === null || field === undefined) return ''
  const str = String(field)
  // If field contains comma, quote, or newline, wrap in quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

// Generate CSV
const generateCSV = () => {
  // Define headers matching ONLY existing Supabase table columns
  const headers = [
    'name',
    'address',
    'city',
    'state',
    'zip_code',
    'website',
    'contact_email',
    'description',
    'venue_type',
    'capacity',
    'genres',
    'latitude',
    'longitude'
  ]

  // Create CSV content
  let csv = headers.join(',') + '\n'

  venues.forEach(venue => {
    const row = [
      escapeCSV(venue.name),
      escapeCSV(venue.address),
      escapeCSV(venue.city),
      escapeCSV(venue.state || 'NC'),
      escapeCSV(venue.zip_code),
      escapeCSV(venue.website),
      escapeCSV(venue.contact_email || venue.booking_email), // Use contact_email or fallback to booking_email
      escapeCSV(venue.description),
      escapeCSV(venue.venue_type),
      escapeCSV(venue.capacity),
      escapeCSV(toPostgresArray(venue.genres)),
      escapeCSV(venue.latitude),
      escapeCSV(venue.longitude)
    ]
    
    csv += row.join(',') + '\n'
  })

  // Write to file
  const outputPath = path.join(__dirname, '..', 'data', 'venues-simple.csv')
  fs.writeFileSync(outputPath, csv)
  
  console.log(`✅ Simplified CSV file generated successfully!`)
  console.log(`📁 File saved to: ${outputPath}`)
  console.log(`📊 Total venues: ${venues.length}`)
  console.log(`\n📋 To import to Supabase:`)
  console.log(`1. Go to your Supabase dashboard`)
  console.log(`2. Navigate to Table Editor > venues`)
  console.log(`3. Click "Import data from CSV"`)
  console.log(`4. Upload the venues-simple.csv file`)
  console.log(`5. Map columns and import`)
  console.log(`\n⚠️  This CSV only includes columns that exist in your table`)
}

// Run the script
generateCSV()
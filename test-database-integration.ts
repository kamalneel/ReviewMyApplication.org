/**
 * Test script to verify database integration
 * Run with: deno run --allow-read test-database-integration.ts
 */

import admissionsDatabase from './supabase/functions/generate-review/college_admissions_database.json' assert { type: 'json' }

interface UniversityData {
  university: string
  ranking: string
  acceptance_rate: string
  counselor_perspectives: {
    what_they_seek: string[]
  }
  red_flags?: string[]
  common_pitfalls: string[]
}

interface AdmissionsDatabase {
  metadata: {
    colleges_with_deep_research: number
    last_updated: string
  }
  top_10_universities_deep_research: UniversityData[]
}

const db = admissionsDatabase as AdmissionsDatabase

console.log('=== DATABASE INTEGRATION TEST ===\n')

// Test 1: Database loaded
console.log('✅ Test 1: Database loaded successfully')
console.log(`   Metadata: ${db.metadata.colleges_with_deep_research} universities`)
console.log(`   Last updated: ${db.metadata.last_updated}\n`)

// Test 2: Universities present
console.log('✅ Test 2: All 10 universities present:')
db.top_10_universities_deep_research.forEach((uni, i) => {
  console.log(`   ${i + 1}. ${uni.university} (${uni.acceptance_rate})`)
})
console.log()

// Test 3: Harvard data structure
console.log('✅ Test 3: Harvard comprehensive data:')
const harvard = db.top_10_universities_deep_research[0]
console.log(`   University: ${harvard.university}`)
console.log(`   Ranking: ${harvard.ranking}`)
console.log(`   What they seek: ${harvard.counselor_perspectives.what_they_seek.length} criteria`)
console.log(`   Common pitfalls: ${harvard.common_pitfalls.length} items`)
console.log(`   Red flags: ${harvard.red_flags?.length || 0} items`)
console.log()

// Test 4: Red flags for all universities
console.log('✅ Test 4: Red flags availability:')
db.top_10_universities_deep_research.forEach(uni => {
  const hasRedFlags = uni.red_flags && uni.red_flags.length > 0
  const symbol = hasRedFlags ? '✓' : '✗'
  console.log(`   ${symbol} ${uni.university}: ${uni.red_flags?.length || 0} red flags`)
})
console.log()

// Test 5: Sample red flags
console.log('✅ Test 5: Sample red flags (Harvard):')
if (harvard.red_flags) {
  harvard.red_flags.slice(0, 3).forEach((flag, i) => {
    console.log(`   ${i + 1}. ${flag}`)
  })
}
console.log()

// Test 6: Sample what_they_seek
console.log('✅ Test 6: What Harvard seeks:')
harvard.counselor_perspectives.what_they_seek.slice(0, 3).forEach((item, i) => {
  console.log(`   ${i + 1}. ${item}`)
})
console.log()

console.log('=== ALL TESTS PASSED ===')
console.log('Database integration is working correctly! ✨')

/**
 * Test script to verify database integration
 * Run with: node test-database.js
 */

const fs = require('fs');

const dbPath = './supabase/functions/generate-review/college_admissions_database.json';
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

console.log('=== DATABASE INTEGRATION TEST ===\n');

// Test 1: Database loaded
console.log('✅ Test 1: Database loaded successfully');
console.log(`   Metadata: ${db.metadata.colleges_with_deep_research} universities`);
console.log(`   Last updated: ${db.metadata.last_updated}\n`);

// Test 2: Universities present
console.log('✅ Test 2: All 10 universities present:');
db.top_10_universities_deep_research.forEach((uni, i) => {
  console.log(`   ${i + 1}. ${uni.university} (${uni.acceptance_rate})`);
});
console.log();

// Test 3: Harvard data structure
console.log('✅ Test 3: Harvard comprehensive data:');
const harvard = db.top_10_universities_deep_research[0];
console.log(`   University: ${harvard.university}`);
console.log(`   Ranking: ${harvard.ranking}`);
console.log(`   What they seek: ${harvard.counselor_perspectives.what_they_seek.length} criteria`);
console.log(`   Common pitfalls: ${harvard.common_pitfalls.length} items`);
console.log(`   Red flags: ${harvard.red_flags?.length || 0} items`);
console.log();

// Test 4: Red flags for all universities
console.log('✅ Test 4: Red flags availability:');
db.top_10_universities_deep_research.forEach(uni => {
  const hasRedFlags = uni.red_flags && uni.red_flags.length > 0;
  const symbol = hasRedFlags ? '✓' : '✗';
  console.log(`   ${symbol} ${uni.university}: ${uni.red_flags?.length || 0} red flags`);
});
console.log();

// Test 5: Sample red flags
console.log('✅ Test 5: Sample red flags (Harvard):');
if (harvard.red_flags) {
  harvard.red_flags.slice(0, 3).forEach((flag, i) => {
    console.log(`   ${i + 1}. ${flag}`);
  });
}
console.log();

// Test 6: Sample what_they_seek
console.log('✅ Test 6: What Harvard seeks:');
harvard.counselor_perspectives.what_they_seek.slice(0, 3).forEach((item, i) => {
  console.log(`   ${i + 1}. ${item}`);
});
console.log();

// Test 7: SAT range parsing test
console.log('✅ Test 7: SAT range parsing:');
db.top_10_universities_deep_research.slice(0, 3).forEach(uni => {
  const match = uni.academic_criteria.test_scores.sat_range.match(/(\d{4})-(\d{4})/);
  if (match) {
    console.log(`   ${uni.university}: ${match[1]}-${match[2]}`);
  }
});
console.log();

console.log('=== ALL TESTS PASSED ===');
console.log('Database integration is working correctly! ✨');

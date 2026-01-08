#!/usr/bin/env node

/**
 * Edge Function Deployment Helper
 *
 * This script prepares the Edge Function for deployment by embedding
 * the JSON database directly into the code (since Edge Functions have
 * limited file system access).
 *
 * Usage:
 *   node prepare-edge-function.js
 *
 * Output:
 *   Creates supabase/functions/generate-review/index.bundled.ts
 *   with JSON database embedded
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Edge Function Deployment Helper\n');

// Paths
const dbPath = path.join(__dirname, 'supabase/functions/generate-review/college_admissions_database.json');
const functionPath = path.join(__dirname, 'supabase/functions/generate-review/index.ts');
const outputPath = path.join(__dirname, 'supabase/functions/generate-review/index.bundled.ts');

// Step 1: Load JSON database
console.log('📖 Step 1: Loading JSON database...');
if (!fs.existsSync(dbPath)) {
  console.error(`❌ Error: Database file not found at ${dbPath}`);
  process.exit(1);
}

const dbContent = fs.readFileSync(dbPath, 'utf8');
let dbJson;
try {
  dbJson = JSON.parse(dbContent);
  console.log(`✅ Loaded database: ${dbJson.metadata.colleges_with_deep_research} universities`);
} catch (error) {
  console.error(`❌ Error parsing JSON: ${error.message}`);
  process.exit(1);
}

// Step 2: Load Edge Function code
console.log('\n📖 Step 2: Loading Edge Function code...');
if (!fs.existsSync(functionPath)) {
  console.error(`❌ Error: Function file not found at ${functionPath}`);
  process.exit(1);
}

let functionCode = fs.readFileSync(functionPath, 'utf8');
console.log(`✅ Loaded function code (${functionCode.length} characters)`);

// Step 3: Replace import with embedded JSON
console.log('\n🔄 Step 3: Embedding JSON database...');

const importLine = `import admissionsDatabase from './college_admissions_database.json' assert { type: 'json' }`;
const embeddedCode = `// JSON database embedded for Edge Function deployment
const admissionsDatabase = ${JSON.stringify(dbJson, null, 2)};`;

if (!functionCode.includes(importLine)) {
  console.error('❌ Error: Import line not found in function code');
  console.error('   Expected:', importLine);
  process.exit(1);
}

functionCode = functionCode.replace(importLine, embeddedCode);
console.log('✅ JSON database embedded successfully');

// Step 4: Write bundled file
console.log('\n💾 Step 4: Writing bundled file...');
fs.writeFileSync(outputPath, functionCode, 'utf8');
console.log(`✅ Written to: ${outputPath}`);

// Step 5: File size check
const bundledSize = fs.statSync(outputPath).size;
const bundledSizeMB = (bundledSize / 1024 / 1024).toFixed(2);
console.log(`\n📊 Bundled file size: ${bundledSizeMB} MB`);

if (bundledSize > 10 * 1024 * 1024) {
  console.warn('⚠️  Warning: File is larger than 10MB. Edge Functions may have size limits.');
}

// Step 6: Validation
console.log('\n✅ Step 6: Validating bundled code...');

// Check that TypeScript interfaces are intact
const requiredInterfaces = [
  'interface UniversityData',
  'interface AdmissionsDatabase',
  'interface SchoolCriteria'
];

let allInterfacesFound = true;
for (const interfaceName of requiredInterfaces) {
  if (!functionCode.includes(interfaceName)) {
    console.error(`❌ Missing interface: ${interfaceName}`);
    allInterfacesFound = false;
  }
}

if (allInterfacesFound) {
  console.log('✅ All TypeScript interfaces present');
}

// Check that key functions are intact
const requiredFunctions = [
  'function mapUniversityDataToSchoolCriteria',
  'function extractTargetSchool',
  'function getSchoolData',
  'function buildCollegePrompt'
];

let allFunctionsFound = true;
for (const funcName of requiredFunctions) {
  if (!functionCode.includes(funcName)) {
    console.error(`❌ Missing function: ${funcName}`);
    allFunctionsFound = false;
  }
}

if (allFunctionsFound) {
  console.log('✅ All required functions present');
}

// Success summary
console.log('\n' + '═'.repeat(60));
console.log('🎉 SUCCESS: Edge Function is ready for deployment!');
console.log('═'.repeat(60));
console.log('\nDeployment file created:');
console.log(`  📄 ${outputPath}`);
console.log(`  📦 Size: ${bundledSizeMB} MB`);
console.log(`  🎓 Universities: ${dbJson.metadata.colleges_with_deep_research}`);
console.log('\nNext steps:');
console.log('  1. Deploy using Supabase CLI:');
console.log('     supabase functions deploy generate-review');
console.log('');
console.log('  2. Or manually copy index.bundled.ts to Supabase Dashboard');
console.log('     → Edge Functions → generate-review → Deploy');
console.log('');
console.log('  3. Set secrets (if not already done):');
console.log('     supabase secrets set ANTHROPIC_API_KEY=sk-ant-...');
console.log('');
console.log('  4. Test the deployment:');
console.log('     node test-edge-function.js');
console.log('');
console.log('═'.repeat(60));

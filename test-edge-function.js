#!/usr/bin/env node

/**
 * Edge Function Testing Script
 *
 * Tests the deployed Edge Function with various scenarios
 * to validate university-specific feedback is working
 *
 * Usage:
 *   SUPABASE_URL=https://xxx.supabase.co SUPABASE_ANON_KEY=xxx node test-edge-function.js
 */

const https = require('https');
const http = require('http');

// Configuration from environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://afxqhokwlhbqhpcpzxur.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

if (!SUPABASE_ANON_KEY) {
  console.error('❌ Error: SUPABASE_ANON_KEY environment variable not set');
  console.error('Usage: SUPABASE_URL=xxx SUPABASE_ANON_KEY=xxx node test-edge-function.js');
  process.exit(1);
}

console.log('🧪 Edge Function Testing Suite\n');
console.log(`📍 Supabase URL: ${SUPABASE_URL}`);
console.log(`🔑 Using anon key: ${SUPABASE_ANON_KEY.substring(0, 20)}...`);
console.log('');

// Helper function to make HTTP requests
function makeRequest(url, options, data) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    const req = protocol.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: JSON.parse(body)
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

// Test cases
const tests = [
  {
    name: 'TEST 1: Harvard Application',
    description: 'High-achieving applicant to Harvard',
    application: {
      program_type: 'college',
      form_data: {
        targetSchool: 'Harvard University',
        firstName: 'Test',
        lastName: 'Student',
        gpa: '3.95',
        sat: '1550',
        courseRigor: 'Most rigorous available (10 APs)',
        activity1: 'Founded nonprofit serving 500+ students',
        activity2: 'State champion debate team captain',
        activity3: 'Published research in peer-reviewed journal',
        personalStatement: 'Thoughtful essay about overcoming adversity and pursuing scientific research with clear narrative arc...',
        whyCollege: 'Harvard\'s specific research opportunities in molecular biology, mentioning Professor X and Y...'
      }
    },
    expectedResults: {
      schoolDetected: 'Harvard University',
      scoreRange: [70, 90],
      hasFitAnalysis: true,
      hasWeaknesses: true,
      usesHarvardCriteria: true
    }
  },
  {
    name: 'TEST 2: Stanford - Weak Application',
    description: 'Well-rounded but not distinguished applicant',
    application: {
      program_type: 'college',
      form_data: {
        targetSchool: 'Stanford University',
        firstName: 'Test',
        lastName: 'Student',
        gpa: '3.7',
        sat: '1450',
        courseRigor: 'Regular courses',
        activity1: 'Chess club member',
        activity2: 'Volunteer at library',
        activity3: 'Math club member',
        activity4: 'Science club member',
        activity5: 'Drama club member',
        activity6: 'Debate club member',
        activity7: 'Robotics club member',
        activity8: 'Student council member',
        personalStatement: 'I am very passionate about learning and enjoy many different subjects...',
        whyCollege: 'Stanford is a great school with excellent academics...'
      }
    },
    expectedResults: {
      schoolDetected: 'Stanford University',
      scoreRange: [50, 65],
      hasFitAnalysis: true,
      hasWeaknesses: true,
      hasRedFlags: true,
      expectedWeakness: 'Well-rounded but not distinguished',
      expectedRedFlag: 'No evidence of innovation'
    }
  },
  {
    name: 'TEST 3: MIT Application',
    description: 'STEM student with hands-on projects',
    application: {
      program_type: 'college',
      form_data: {
        targetSchool: 'MIT',
        firstName: 'Test',
        lastName: 'Student',
        gpa: '3.9',
        sat: '1530',
        courseRigor: 'Most rigorous STEM courses',
        activity1: 'Built functioning robot that won regional competition',
        activity2: 'Created app with 10,000+ downloads',
        activity3: 'Founded school\'s first hackathon',
        personalStatement: 'Essay about building and creating things, collaborative problem-solving...',
        whyCollege: 'MIT\'s maker culture and collaborative environment, specific labs and programs...'
      }
    },
    expectedResults: {
      schoolDetected: 'MIT' || 'Massachusetts Institute of Technology',
      scoreRange: [75, 90],
      hasFitAnalysis: true,
      expectedStrength: 'Hands-on making'
    }
  }
];

// Run tests
async function runTests() {
  const results = [];

  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    console.log(`${'═'.repeat(60)}`);
    console.log(`${test.name}: ${test.description}`);
    console.log(`${'═'.repeat(60)}\n`);

    try {
      // Step 1: Create application
      console.log('📝 Step 1: Creating application...');
      const createAppUrl = `${SUPABASE_URL}/rest/v1/applications`;
      const createRes = await makeRequest(createAppUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'return=representation'
        }
      }, test.application);

      if (createRes.statusCode !== 201) {
        console.error(`❌ Failed to create application: ${createRes.statusCode}`);
        console.error(createRes.body);
        results.push({ test: test.name, status: 'FAILED', error: 'Application creation failed' });
        continue;
      }

      const applicationId = createRes.body[0]?.id;
      console.log(`✅ Application created: ${applicationId}\n`);

      // Step 2: Call Edge Function
      console.log('🤖 Step 2: Generating review...');
      const functionUrl = `${SUPABASE_URL}/functions/v1/generate-review`;
      const startTime = Date.now();

      const reviewRes = await makeRequest(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      }, { applicationId });

      const duration = Date.now() - startTime;

      if (reviewRes.statusCode !== 200) {
        console.error(`❌ Edge Function failed: ${reviewRes.statusCode}`);
        console.error(reviewRes.body);
        results.push({ test: test.name, status: 'FAILED', error: 'Edge Function error' });
        continue;
      }

      console.log(`✅ Review generated in ${(duration / 1000).toFixed(1)}s\n`);

      // Step 3: Validate results
      console.log('✔️  Step 3: Validating results...');
      const review = reviewRes.body;

      // Check if v2 format
      if (review.target_school_analysis) {
        console.log(`✅ V2 format detected`);
        console.log(`   School: ${review.target_school_analysis.school}`);
        console.log(`   Score: ${review.overall_assessment.score}/100`);
        console.log(`   Rating: ${review.overall_assessment.rating}`);

        // Validate expected results
        const expected = test.expectedResults;
        let allPassed = true;

        if (expected.schoolDetected) {
          const schoolMatch = review.target_school_analysis.school.toLowerCase().includes(expected.schoolDetected.toLowerCase());
          console.log(`   ${schoolMatch ? '✅' : '❌'} School detection: ${review.target_school_analysis.school}`);
          if (!schoolMatch) allPassed = false;
        }

        if (expected.scoreRange) {
          const [min, max] = expected.scoreRange;
          const scoreInRange = review.overall_assessment.score >= min && review.overall_assessment.score <= max;
          console.log(`   ${scoreInRange ? '✅' : '❌'} Score in range [${min}, ${max}]: ${review.overall_assessment.score}`);
          if (!scoreInRange) allPassed = false;
        }

        if (expected.hasFitAnalysis) {
          const hasFit = review.component_scores?.university_fit?.alignment_with_what_school_seeks?.length > 0;
          console.log(`   ${hasFit ? '✅' : '❌'} Fit analysis present: ${hasFit ? review.component_scores.university_fit.alignment_with_what_school_seeks.length + ' criteria' : 'No'}`);
          if (!hasFit) allPassed = false;
        }

        if (expected.hasWeaknesses) {
          const hasWeaknesses = review.weaknesses && review.weaknesses.length > 0;
          console.log(`   ${hasWeaknesses ? '✅' : '❌'} Weaknesses detected: ${hasWeaknesses ? review.weaknesses.length : 0}`);
        }

        if (expected.hasRedFlags) {
          const hasRedFlags = review.red_flags && review.red_flags.length > 0;
          console.log(`   ${hasRedFlags ? '✅' : '❌'} Red flags detected: ${hasRedFlags ? review.red_flags.length : 0}`);
        }

        results.push({
          test: test.name,
          status: allPassed ? 'PASSED' : 'PARTIAL',
          school: review.target_school_analysis.school,
          score: review.overall_assessment.score,
          duration: duration
        });

      } else {
        console.log(`⚠️  Legacy format (v1) - upgrade recommended`);
        results.push({
          test: test.name,
          status: 'LEGACY_FORMAT',
          score: review.overall_score || review.overallScore
        });
      }

    } catch (error) {
      console.error(`❌ Test failed with error: ${error.message}`);
      results.push({ test: test.name, status: 'ERROR', error: error.message });
    }

    console.log('');
  }

  // Print summary
  console.log(`${'═'.repeat(60)}`);
  console.log('📊 TEST SUMMARY');
  console.log(`${'═'.repeat(60)}\n`);

  results.forEach(r => {
    const statusEmoji = r.status === 'PASSED' ? '✅' : r.status === 'PARTIAL' ? '⚠️' : '❌';
    console.log(`${statusEmoji} ${r.test}: ${r.status}`);
    if (r.school) console.log(`   School: ${r.school}, Score: ${r.score}/100`);
    if (r.duration) console.log(`   Duration: ${(r.duration / 1000).toFixed(1)}s`);
    if (r.error) console.log(`   Error: ${r.error}`);
    console.log('');
  });

  const passedCount = results.filter(r => r.status === 'PASSED').length;
  const totalCount = results.length;

  console.log(`${'═'.repeat(60)}`);
  console.log(`Result: ${passedCount}/${totalCount} tests passed`);
  console.log(`${'═'.repeat(60)}`);

  if (passedCount === totalCount) {
    console.log('\n🎉 All tests passed! Deployment is successful.');
  } else {
    console.log('\n⚠️  Some tests failed. Review the output above.');
  }
}

// Run the tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

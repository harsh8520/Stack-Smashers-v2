/**
 * Live API Testing Suite for ContentLens AI
 * Tests real backend with actual content samples
 */

const axios = require('axios');
const fs = require('fs');

const API_URL = 'https://contentlens-backend.onrender.com';

// Test content samples
const testSamples = [
  {
    name: 'Twitter - Persuasive',
    content: 'Check out our new product! Amazing features await. Buy now and save 50%! Limited time offer! #sale #deals',
    targetPlatform: 'twitter',
    contentIntent: 'persuade'
  },
  {
    name: 'LinkedIn - Informational',
    content: `Excited to share insights from our latest project on sustainable technology. Our team developed an innovative solution that reduces carbon emissions by 40% while maintaining peak performance. Key achievements: Enhanced efficiency, Cost-effective implementation, Scalable architecture. Looking forward to discussing this at the upcoming tech conference.`,
    targetPlatform: 'linkedin',
    contentIntent: 'inform'
  },
  {
    name: 'Blog - Educational',
    content: `Understanding Artificial Intelligence in Modern Healthcare

Artificial intelligence is transforming healthcare delivery worldwide. From diagnostic imaging to personalized treatment plans, AI technologies enhance patient outcomes and operational efficiency.

Current Applications:
Medical imaging analysis has improved dramatically with AI-powered systems achieving 95% accuracy in detecting early-stage cancers. These systems analyze thousands of scans quickly, providing detailed insights to radiologists.

Drug discovery has accelerated significantly. AI algorithms screen millions of molecular compounds in days rather than years, identifying promising candidates for clinical trials.

Future Outlook:
The integration of AI in healthcare will continue expanding. Emerging applications include virtual health assistants, robotic surgery, and genomic medicine. As technologies mature, we anticipate more personalized and accessible healthcare for all.`,
    targetPlatform: 'blog',
    contentIntent: 'educate'
  }
];

const results = {
  timestamp: new Date().toISOString(),
  tests: [],
  summary: {
    total: 0,
    successful: 0,
    failed: 0,
    avgResponseTime: 0,
    avgScore: 0
  }
};

async function testAPI() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║           ContentLens AI - Live API Test Suite                 ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');
  console.log(`🌐 Testing API: ${API_URL}`);
  console.log(`📅 Timestamp: ${new Date().toLocaleString()}\n`);

  // Test 1: Health Check
  console.log('═'.repeat(70));
  console.log('TEST 1: API Health Check');
  console.log('═'.repeat(70));
  try {
    const start = Date.now();
    const response = await axios.get(`${API_URL}/`);
    const time = Date.now() - start;
    console.log(`✅ API is online - Response time: ${time}ms`);
    console.log(`   Message: ${response.data.message || 'OK'}\n`);
  } catch (error) {
    console.log(`❌ API health check failed: ${error.message}\n`);
  }

  // Test 2: Authentication
  console.log('═'.repeat(70));
  console.log('TEST 2: Authentication System');
  console.log('═'.repeat(70));
  
  let authToken = null;
  const testEmail = `test_${Date.now()}@contentlens.ai`;
  const testPassword = 'TestPass123!';

  try {
    const start = Date.now();
    const signupResponse = await axios.post(`${API_URL}/api/auth/signup`, {
      email: testEmail,
      password: testPassword
    });
    const time = Date.now() - start;
    
    authToken = signupResponse.data.token;
    console.log(`✅ Signup successful - Response time: ${time}ms`);
    console.log(`   Email: ${testEmail}`);
    console.log(`   Token received: ${authToken ? 'Yes' : 'No'}\n`);
  } catch (error) {
    console.log(`❌ Signup failed: ${error.response?.data?.error || error.message}`);
    
    // Try login instead
    try {
      const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
        email: 'demo@contentlens.ai',
        password: 'demo123'
      });
      authToken = loginResponse.data.token;
      console.log(`✅ Login with demo account successful\n`);
    } catch (loginError) {
      console.log(`❌ Login also failed: ${loginError.message}\n`);
    }
  }

  // Test 3: Content Analysis
  console.log('═'.repeat(70));
  console.log('TEST 3: Content Analysis Tests');
  console.log('═'.repeat(70) + '\n');

  for (let i = 0; i < testSamples.length; i++) {
    const sample = testSamples[i];
    console.log(`\n📝 Test ${i + 1}/${testSamples.length}: ${sample.name}`);
    console.log('─'.repeat(70));
    console.log(`Platform: ${sample.targetPlatform} | Intent: ${sample.contentIntent}`);
    console.log(`Content length: ${sample.content.length} characters\n`);

    const testResult = {
      name: sample.name,
      platform: sample.targetPlatform,
      intent: sample.contentIntent,
      contentLength: sample.content.length,
      success: false,
      responseTime: 0,
      score: 0,
      error: null
    };

    try {
      const start = Date.now();
      
      const response = await axios.post(
        `${API_URL}/api/analyze`,
        {
          content: sample.content,
          targetPlatform: sample.targetPlatform,
          contentIntent: sample.contentIntent
        },
        {
          headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {},
          timeout: 60000
        }
      );

      const responseTime = Date.now() - start;
      testResult.success = true;
      testResult.responseTime = responseTime;
      testResult.score = response.data.overallScore || 0;
      testResult.dimensions = response.data.dimensionScores || {};

      console.log(`✅ Analysis completed successfully`);
      console.log(`   Response time: ${(responseTime / 1000).toFixed(2)}s`);
      console.log(`   Overall Score: ${testResult.score}/100`);
      
      if (response.data.dimensionScores) {
        console.log(`   Dimension Scores:`);
        Object.entries(response.data.dimensionScores).forEach(([dim, data]) => {
          console.log(`     - ${dim}: ${data.score}/100`);
        });
      }

      results.summary.successful++;
      
    } catch (error) {
      testResult.error = error.response?.data?.error || error.message;
      console.log(`❌ Analysis failed: ${testResult.error}`);
      results.summary.failed++;
    }

    results.tests.push(testResult);
    results.summary.total++;

    // Wait between requests
    if (i < testSamples.length - 1) {
      console.log('\n⏳ Waiting 2 seconds before next test...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Calculate summary statistics
  const successfulTests = results.tests.filter(t => t.success);
  if (successfulTests.length > 0) {
    results.summary.avgResponseTime = 
      successfulTests.reduce((sum, t) => sum + t.responseTime, 0) / successfulTests.length;
    results.summary.avgScore = 
      successfulTests.reduce((sum, t) => sum + t.score, 0) / successfulTests.length;
  }

  // Print Summary
  console.log('\n\n' + '═'.repeat(70));
  console.log('                        TEST SUMMARY');
  console.log('═'.repeat(70) + '\n');

  console.log(`📊 Total Tests: ${results.summary.total}`);
  console.log(`✅ Successful: ${results.summary.successful}`);
  console.log(`❌ Failed: ${results.summary.failed}`);
  console.log(`📈 Success Rate: ${((results.summary.successful / results.summary.total) * 100).toFixed(1)}%\n`);

  if (successfulTests.length > 0) {
    console.log(`⏱️  Average Response Time: ${(results.summary.avgResponseTime / 1000).toFixed(2)}s`);
    console.log(`🎯 Average Score: ${results.summary.avgScore.toFixed(1)}/100\n`);

    console.log('📋 Individual Test Results:');
    successfulTests.forEach((test, idx) => {
      console.log(`   ${idx + 1}. ${test.name}`);
      console.log(`      Score: ${test.score}/100 | Time: ${(test.responseTime / 1000).toFixed(2)}s`);
    });
  }

  console.log('\n' + '═'.repeat(70) + '\n');

  // Save results
  const reportPath = 'test-results.json';
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`💾 Results saved to: ${reportPath}\n`);

  return results;
}

// Run tests
if (require.main === module) {
  testAPI()
    .then(() => {
      console.log('✨ All tests completed!\n');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Test suite failed:', error.message);
      process.exit(1);
    });
}

module.exports = { testAPI };

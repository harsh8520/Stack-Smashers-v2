/**
 * Performance Benchmarking Tests for ContentLens AI
 * Tests API response times, analysis accuracy, and system performance
 */

const axios = require('axios');

// Configuration
const API_BASE_URL = process.env.API_URL || 'https://contentlens-backend.onrender.com';
const TEST_ITERATIONS = 3;

// Test content samples
const TEST_SAMPLES = {
  short: {
    content: "Check out our new product! It's amazing and you'll love it. Buy now!",
    platform: "twitter",
    intent: "promotional",
    expectedScoreRange: [40, 60]
  },
  medium: {
    content: `Introducing our latest innovation in sustainable technology. 

Our team has spent years developing a solution that reduces carbon emissions by 40% while maintaining peak performance. This breakthrough combines cutting-edge AI with renewable energy systems.

Key benefits:
• 40% reduction in carbon footprint
• 25% cost savings over traditional systems
• Seamless integration with existing infrastructure
• Real-time monitoring and analytics

Join us in building a sustainable future. Learn more at our website.`,
    platform: "linkedin",
    intent: "informational",
    expectedScoreRange: [70, 90]
  },
  long: {
    content: `The Future of Artificial Intelligence in Healthcare: A Comprehensive Analysis

Introduction

Artificial intelligence is revolutionizing healthcare delivery across the globe. From diagnostic imaging to personalized treatment plans, AI technologies are enhancing patient outcomes and operational efficiency.

Current Applications

Medical imaging analysis has seen remarkable improvements with AI-powered systems achieving 95% accuracy in detecting early-stage cancers. These systems analyze thousands of scans in minutes, providing radiologists with detailed insights and flagging potential concerns.

Drug discovery has accelerated dramatically. AI algorithms can now screen millions of molecular compounds in days rather than years, identifying promising candidates for clinical trials. This has reduced development costs by approximately 30% and shortened timelines significantly.

Predictive Analytics

Healthcare providers are leveraging machine learning models to predict patient deterioration, readmission risks, and treatment responses. These predictive capabilities enable proactive interventions, improving patient safety and reducing hospital stays.

Challenges and Considerations

Data privacy remains a critical concern. Healthcare organizations must balance innovation with stringent HIPAA compliance and patient confidentiality. Robust encryption, access controls, and audit trails are essential.

Algorithm bias poses another challenge. Training data must represent diverse populations to ensure equitable care across demographics. Ongoing monitoring and validation are necessary to identify and correct biases.

Future Outlook

The integration of AI in healthcare will continue expanding. Emerging applications include virtual health assistants, robotic surgery, and genomic medicine. As technologies mature, we anticipate more personalized, efficient, and accessible healthcare for all.

Conclusion

AI represents a transformative force in modern medicine. By addressing current challenges and maintaining ethical standards, we can harness its full potential to improve global health outcomes.`,
    platform: "blog",
    intent: "educational",
    expectedScoreRange: [80, 95]
  }
};

// Performance metrics storage
const metrics = {
  responseTimes: [],
  analysisAccuracy: [],
  throughput: [],
  errors: []
};

// Utility functions
function calculateStats(arr) {
  const sorted = [...arr].sort((a, b) => a - b);
  return {
    min: Math.min(...arr),
    max: Math.max(...arr),
    avg: arr.reduce((a, b) => a + b, 0) / arr.length,
    median: sorted[Math.floor(sorted.length / 2)],
    p95: sorted[Math.floor(sorted.length * 0.95)],
    p99: sorted[Math.floor(sorted.length * 0.99)]
  };
}

function formatTime(ms) {
  if (ms < 1000) return `${ms.toFixed(0)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

// Test functions
async function testAnalysisEndpoint(sample, iteration, token) {
  const startTime = Date.now();
  
  try {
    const response = await axios.post(`${API_BASE_URL}/api/analyze`, {
      content: sample.content,
      platform: sample.platform,
      intent: sample.intent
    }, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      timeout: 60000 // 60 second timeout
    });

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    // Validate response structure
    if (!response.data || typeof response.data.overallScore !== 'number') {
      throw new Error('Invalid response structure');
    }

    const score = response.data.overallScore;
    const [minScore, maxScore] = sample.expectedScoreRange;
    const isAccurate = score >= minScore && score <= maxScore;

    return {
      success: true,
      responseTime,
      score,
      isAccurate,
      iteration,
      sampleType: sample.platform
    };

  } catch (error) {
    const endTime = Date.now();
    return {
      success: false,
      responseTime: endTime - startTime,
      error: error.message,
      iteration,
      sampleType: sample.platform
    };
  }
}

async function runBenchmark() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║         ContentLens AI - Performance Benchmark Report          ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  console.log(`📊 Test Configuration:`);
  console.log(`   API Endpoint: ${API_BASE_URL}`);
  console.log(`   Iterations per sample: ${TEST_ITERATIONS}`);
  console.log(`   Total tests: ${Object.keys(TEST_SAMPLES).length * TEST_ITERATIONS}`);
  console.log(`   Timestamp: ${new Date().toISOString()}\n`);

  // Get auth token first
  let authToken = null;
  try {
    console.log('🔐 Authenticating...');
    const authResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: 'test@benchmark.com',
      password: 'benchmark123'
    });
    authToken = authResponse.data.token;
    console.log('✓ Authentication successful\n');
  } catch (error) {
    // Try to signup if login fails
    try {
      const signupResponse = await axios.post(`${API_BASE_URL}/api/auth/signup`, {
        email: 'test@benchmark.com',
        password: 'benchmark123'
      });
      authToken = signupResponse.data.token;
      console.log('✓ New user created and authenticated\n');
    } catch (signupError) {
      console.log('⚠️  Running tests without authentication (may have limited access)\n');
    }
  }

  // Run tests for each sample type
  for (const [sampleType, sample] of Object.entries(TEST_SAMPLES)) {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`Testing: ${sampleType.toUpperCase()} content (${sample.content.length} chars)`);
    console.log(`Platform: ${sample.platform} | Intent: ${sample.intent}`);
    console.log(`${'='.repeat(70)}\n`);

    const sampleMetrics = {
      responseTimes: [],
      scores: [],
      accuracyCount: 0
    };

    for (let i = 1; i <= TEST_ITERATIONS; i++) {
      process.stdout.write(`  Test ${i}/${TEST_ITERATIONS}... `);
      
      const result = await testAnalysisEndpoint(sample, i, authToken);

      if (result.success) {
        sampleMetrics.responseTimes.push(result.responseTime);
        sampleMetrics.scores.push(result.score);
        if (result.isAccurate) sampleMetrics.accuracyCount++;
        
        metrics.responseTimes.push(result.responseTime);
        metrics.analysisAccuracy.push(result.isAccurate ? 1 : 0);

        console.log(`✓ ${formatTime(result.responseTime)} | Score: ${result.score}`);
      } else {
        metrics.errors.push(result);
        console.log(`✗ Failed: ${result.error}`);
      }

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Calculate and display sample-specific metrics
    if (sampleMetrics.responseTimes.length > 0) {
      const stats = calculateStats(sampleMetrics.responseTimes);
      const avgScore = sampleMetrics.scores.reduce((a, b) => a + b, 0) / sampleMetrics.scores.length;
      const accuracy = (sampleMetrics.accuracyCount / TEST_ITERATIONS) * 100;

      console.log(`\n  📈 Results for ${sampleType}:`);
      console.log(`     Response Time - Avg: ${formatTime(stats.avg)} | Min: ${formatTime(stats.min)} | Max: ${formatTime(stats.max)}`);
      console.log(`     Average Score: ${avgScore.toFixed(1)}/100`);
      console.log(`     Accuracy: ${accuracy.toFixed(0)}% (within expected range)`);
    }
  }

  // Overall summary
  console.log(`\n\n${'═'.repeat(70)}`);
  console.log(`                    OVERALL PERFORMANCE SUMMARY`);
  console.log(`${'═'.repeat(70)}\n`);

  if (metrics.responseTimes.length > 0) {
    const timeStats = calculateStats(metrics.responseTimes);
    const successRate = ((metrics.responseTimes.length / (Object.keys(TEST_SAMPLES).length * TEST_ITERATIONS)) * 100).toFixed(1);
    const avgAccuracy = (metrics.analysisAccuracy.reduce((a, b) => a + b, 0) / metrics.analysisAccuracy.length * 100).toFixed(1);

    console.log(`✅ Success Rate: ${successRate}%`);
    console.log(`✅ Analysis Accuracy: ${avgAccuracy}%\n`);

    console.log(`⏱️  Response Time Statistics:`);
    console.log(`   Average:    ${formatTime(timeStats.avg)}`);
    console.log(`   Median:     ${formatTime(timeStats.median)}`);
    console.log(`   Min:        ${formatTime(timeStats.min)}`);
    console.log(`   Max:        ${formatTime(timeStats.max)}`);
    console.log(`   95th %ile:  ${formatTime(timeStats.p95)}`);
    console.log(`   99th %ile:  ${formatTime(timeStats.p99)}\n`);

    // Throughput calculation
    const totalTime = metrics.responseTimes.reduce((a, b) => a + b, 0);
    const throughput = (metrics.responseTimes.length / (totalTime / 1000)).toFixed(2);
    console.log(`🚀 Throughput: ${throughput} requests/second\n`);

    // Performance rating
    const avgTime = timeStats.avg;
    let rating, emoji;
    if (avgTime < 3000) {
      rating = 'EXCELLENT';
      emoji = '🌟';
    } else if (avgTime < 5000) {
      rating = 'GOOD';
      emoji = '✨';
    } else if (avgTime < 8000) {
      rating = 'ACCEPTABLE';
      emoji = '👍';
    } else {
      rating = 'NEEDS IMPROVEMENT';
      emoji = '⚠️';
    }

    console.log(`${emoji} Overall Performance Rating: ${rating}\n`);
  }

  if (metrics.errors.length > 0) {
    console.log(`❌ Errors: ${metrics.errors.length}`);
    metrics.errors.forEach((err, idx) => {
      console.log(`   ${idx + 1}. ${err.error} (${err.sampleType})`);
    });
    console.log('');
  }

  console.log(`${'═'.repeat(70)}\n`);

  // Export results to JSON
  const report = {
    timestamp: new Date().toISOString(),
    configuration: {
      apiEndpoint: API_BASE_URL,
      iterations: TEST_ITERATIONS,
      totalTests: Object.keys(TEST_SAMPLES).length * TEST_ITERATIONS
    },
    metrics: {
      successRate: ((metrics.responseTimes.length / (Object.keys(TEST_SAMPLES).length * TEST_ITERATIONS)) * 100).toFixed(1) + '%',
      analysisAccuracy: (metrics.analysisAccuracy.reduce((a, b) => a + b, 0) / metrics.analysisAccuracy.length * 100).toFixed(1) + '%',
      responseTime: metrics.responseTimes.length > 0 ? calculateStats(metrics.responseTimes) : null,
      errors: metrics.errors.length
    },
    rawData: {
      responseTimes: metrics.responseTimes,
      analysisAccuracy: metrics.analysisAccuracy,
      errors: metrics.errors
    }
  };

  return report;
}

// Run the benchmark
if (require.main === module) {
  runBenchmark()
    .then(report => {
      const fs = require('fs');
      const reportPath = 'benchmark-report.json';
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      console.log(`📄 Detailed report saved to: ${reportPath}`);
      process.exit(0);
    })
    .catch(error => {
      console.error('Benchmark failed:', error);
      process.exit(1);
    });
}

module.exports = { runBenchmark, TEST_SAMPLES };

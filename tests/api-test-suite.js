/**
 * Ovok API Comprehensive Test Suite
 * 
 * This script systematically tests all Ovok APIs, documents results,
 * and helps build a clear roadmap for application development.
 * 
 * Usage: node tests/api-test-suite.js
 */

const axios = require('axios');

const BASE_URL = 'https://api.ovok.com';
const TEST_CREDENTIALS = {
  email: 'saeedartists@gmail.com',
  password: '12345678'
};

// Test results storage
const testResults = {
  passed: [],
  failed: [],
  skipped: [],
  tokens: {},
  metadata: {}
};

// Helper function to make API calls
async function makeRequest(method, endpoint, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...headers
      }
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      config.data = data;
    }

    const response = await axios(config);
    return {
      success: true,
      status: response.status,
      data: response.data,
      headers: response.headers
    };
  } catch (error) {
    return {
      success: false,
      status: error.response?.status || 'NO_RESPONSE',
      error: error.message,
      data: error.response?.data || null,
      headers: error.response?.headers || {}
    };
  }
}

// Test result logger
function logTest(name, result, details = {}) {
  const testResult = {
    name,
    timestamp: new Date().toISOString(),
    ...result,
    ...details
  };

  if (result.success) {
    testResults.passed.push(testResult);
    console.log(`✅ ${name} - Status: ${result.status}`);
  } else {
    testResults.failed.push(testResult);
    console.log(`❌ ${name} - Status: ${result.status} - Error: ${result.error || 'Unknown'}`);
  }

  return testResult;
}

// Wait function for rate limiting
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// PHASE 1: AUTHENTICATION TESTS
// ============================================================================

// Helper to generate PKCE code challenge
function generateCodeChallenge() {
  const crypto = require('crypto');
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
  return { codeVerifier, codeChallenge };
}

async function testStandardAuth() {
  console.log('\n🔐 PHASE 1: STANDARD AUTHENTICATION');
  console.log('='.repeat(60));

  // First, try to get account info with /auth/me if we have a token
  // This might give us the clientId
  console.log('\n0. Checking for existing token in localStorage approach...');
  console.log('   (This would require browser environment)');
  
  // Test 1: Standard Login - needs valid UUID clientId
  console.log('\n1. Testing POST /auth/login...');
  console.log('   ⚠️  Note: Requires valid UUID clientId');
  console.log('   Trying without clientId first to see error...');
  
  let result = await makeRequest('POST', '/auth/login', {
    email: TEST_CREDENTIALS.email,
    password: TEST_CREDENTIALS.password
  });
  
  if (!result.success && result.status === 422) {
    const errorMsg = result.data?.message?.[0];
    if (errorMsg?.path?.includes('clientId')) {
      console.log(`   Error: ${errorMsg.message}`);
      console.log('   ⚠️  You need a valid UUID clientId from your Ovok dashboard');
      console.log('   📝 To get clientId:');
      console.log('      1. Log into Ovok UI');
      console.log('      2. Go to Overview/Developer Dashboard');
      console.log('      3. Find your ClientApplication ID');
      console.log('      4. Use that UUID as clientId');
    }
  }
  
  // Try with a placeholder UUID format to show what's needed
  console.log('\n   Attempting with placeholder UUID format (will likely fail but shows format)...');
  result = await makeRequest('POST', '/auth/login', {
    email: TEST_CREDENTIALS.email,
    password: TEST_CREDENTIALS.password,
    clientId: '00000000-0000-0000-0000-000000000000' // Placeholder UUID
  });
  
  if (result.success && result.data.access_token) {
    testResults.tokens.standard = result.data.access_token;
    testResults.tokens.refresh = result.data.refresh_token;
  }
  logTest('POST /auth/login', result);

  // Test 2: Get Account Info (requires token)
  if (testResults.tokens.standard) {
    console.log('\n2. Testing GET /auth/account...');
    result = await makeRequest('GET', '/auth/account', null, {
      'Authorization': `Bearer ${testResults.tokens.standard}`
    });
    logTest('GET /auth/account', result);
    if (result.success) {
      testResults.metadata.account = result.data;
    }
  }

  // Test 3: Get /auth/me (alternative endpoint)
  if (testResults.tokens.standard) {
    console.log('\n3. Testing GET /auth/me...');
    result = await makeRequest('GET', '/auth/me', null, {
      'Authorization': `Bearer ${testResults.tokens.standard}`
    });
    logTest('GET /auth/me', result);
    if (result.success) {
      testResults.metadata.userInfo = result.data;
    }
  }

  // Test 4: Get Sessions
  if (testResults.tokens.standard) {
    console.log('\n4. Testing GET /auth/sessions...');
    result = await makeRequest('GET', '/auth/sessions', null, {
      'Authorization': `Bearer ${testResults.tokens.standard}`
    });
    logTest('GET /auth/sessions', result);
  }

  // Test 5: Refresh Token
  if (testResults.tokens.refresh) {
    console.log('\n5. Testing POST /auth/refresh...');
    result = await makeRequest('POST', '/auth/refresh', {
      refresh_token: testResults.tokens.refresh
    });
    logTest('POST /auth/refresh', result);
    if (result.success && result.data.access_token) {
      testResults.tokens.refreshed = result.data.access_token;
    }
  }

  await wait(1000);
}

async function testTenantPractitionerAuth() {
  console.log('\n👨‍⚕️ PHASE 2: TENANT PRACTITIONER AUTHENTICATION');
  console.log('='.repeat(60));

  // Test 1: Practitioner Login Start - requires PKCE (codeChallenge)
  console.log('\n1. Testing POST /auth/tenant/Practitioner/login/start...');
  console.log('   ⚠️  Note: Requires codeChallenge (PKCE flow)');
  
  // Generate PKCE challenge
  const { codeVerifier, codeChallenge } = generateCodeChallenge();
  testResults.metadata.codeVerifier = codeVerifier; // Store for later use
  
  let result = await makeRequest('POST', '/auth/tenant/Practitioner/login/start', {
    email: TEST_CREDENTIALS.email,
    password: TEST_CREDENTIALS.password,
    codeChallenge: codeChallenge,
    codeChallengeMethod: 'S256'
  });
  
  logTest('POST /auth/tenant/Practitioner/login/start (with PKCE)', result);
  
  if (result.success) {
    testResults.tokens.practitionerChallenge = result.data;
    testResults.metadata.tenantCode = result.data.profiles?.[0]?.tenantCode;
    testResults.metadata.projectId = result.data.profiles?.[0]?.project?.id;
    
    // Test 2: Get token using sessionCode - try multiple approaches
    if (result.data.sessionCode && result.data.nextStep === 'token') {
      console.log('\n2. Testing POST /auth/tenant/Practitioner/login/token...');
      
      // Try different request formats
      const attempts = [
        // Format 1: With profileId
        {
          sessionCode: result.data.sessionCode,
          codeVerifier: codeVerifier,
          profileId: result.data.profiles?.[0]?.profile?.id
        },
        // Format 2: Without profileId
        {
          sessionCode: result.data.sessionCode,
          codeVerifier: codeVerifier
        },
        // Format 3: With tenantCode
        {
          sessionCode: result.data.sessionCode,
          codeVerifier: codeVerifier,
          tenantCode: result.data.profiles?.[0]?.tenantCode
        },
        // Format 4: With email
        {
          sessionCode: result.data.sessionCode,
          codeVerifier: codeVerifier,
          email: TEST_CREDENTIALS.email
        }
      ];
      
      for (let i = 0; i < attempts.length && !testResults.tokens.practitioner; i++) {
        console.log(`   Attempt ${i + 1}/${attempts.length}...`);
        result = await makeRequest('POST', '/auth/tenant/Practitioner/login/token', attempts[i]);
        
        if (result.success && (result.data.access_token || result.data.accessToken)) {
          testResults.tokens.practitioner = result.data.access_token || result.data.accessToken;
          testResults.tokens.practitionerRefresh = result.data.refresh_token || result.data.refreshToken;
          console.log('   ✅ Successfully obtained practitioner access token!');
          logTest(`POST /auth/tenant/Practitioner/login/token (attempt ${i + 1})`, result);
          break;
        } else if (result.status !== 422) {
          // Log non-validation errors
          logTest(`POST /auth/tenant/Practitioner/login/token (attempt ${i + 1})`, result);
        }
        await wait(300);
      }
      
      // If still no token, try challenge endpoint
      if (!testResults.tokens.practitioner) {
        console.log('\n   Trying alternative: POST /auth/tenant/Practitioner/login/challenge...');
        const challengeData = {
          sessionCode: result.data.sessionCode,
          codeVerifier: codeVerifier
        };
        
        result = await makeRequest('POST', '/auth/tenant/Practitioner/login/challenge', challengeData);
        logTest('POST /auth/tenant/Practitioner/login/challenge', result);
        
        if (result.success && (result.data.access_token || result.data.accessToken)) {
          testResults.tokens.practitioner = result.data.access_token || result.data.accessToken;
        }
      }
    }
  }

  // Test 3: Exchange Token (if we have a token from login)
  if (testResults.tokens.practitioner) {
    console.log('\n3. Testing POST /auth/tenant/Practitioner/exchange-token...');
    result = await makeRequest('POST', '/auth/tenant/Practitioner/exchange-token', {
      token: testResults.tokens.practitioner
    });
    logTest('POST /auth/tenant/Practitioner/exchange-token', result);
  }

  await wait(1000);
}

async function testTenantPatientAuth() {
  console.log('\n👤 PHASE 3: TENANT PATIENT AUTHENTICATION');
  console.log('='.repeat(60));

  // Test 1: Patient Login Start - requires tenantCode and codeChallenge
  console.log('\n1. Testing POST /auth/tenant/Patient/login/start...');
  console.log('   ⚠️  Note: Requires tenantCode AND codeChallenge (PKCE flow)');
  
  // Generate PKCE challenge
  const { codeVerifier, codeChallenge } = generateCodeChallenge();
  
  // Try without tenantCode first to see error
  let result = await makeRequest('POST', '/auth/tenant/Patient/login/start', {
    email: TEST_CREDENTIALS.email,
    password: TEST_CREDENTIALS.password,
    codeChallenge: codeChallenge,
    codeChallengeMethod: 'S256'
  });
  
  if (!result.success && result.status === 422) {
    const errors = result.data?.message || [];
    const needsTenantCode = errors.some(e => e.path?.includes('tenantCode'));
    if (needsTenantCode) {
      console.log('   ⚠️  Error: tenantCode is required');
      console.log('   📝 tenantCode is typically provided by your organization');
      console.log('   💡 Try getting it from your project settings or organization admin');
    }
  }
  
  logTest('POST /auth/tenant/Patient/login/start (with PKCE, no tenantCode)', result);

  // Try with a placeholder tenantCode to show format
  console.log('\n   Attempting with placeholder tenantCode (will likely fail but shows format)...');
  result = await makeRequest('POST', '/auth/tenant/Patient/login/start', {
    email: TEST_CREDENTIALS.email,
    password: TEST_CREDENTIALS.password,
    tenantCode: 'YOUR_TENANT_CODE', // Placeholder
    codeChallenge: codeChallenge,
    codeChallengeMethod: 'S256'
  });
  
  logTest('POST /auth/tenant/Patient/login/start (with PKCE and tenantCode)', result);

  if (result.success) {
    testResults.tokens.patientChallenge = result.data;
    
    // Test 2: Challenge (if challenge received)
    if (result.data.challenge || result.data.token || result.data.sessionId) {
      console.log('\n2. Testing POST /auth/tenant/Patient/login/challenge...');
      const challengeData = {
        challenge: result.data.challenge || result.data.token || result.data.sessionId,
        email: TEST_CREDENTIALS.email,
        codeVerifier: codeVerifier
      };
      
      result = await makeRequest('POST', '/auth/tenant/Patient/login/challenge', challengeData);
      logTest('POST /auth/tenant/Patient/login/challenge', result);
      
      if (result.success && result.data.access_token) {
        testResults.tokens.patient = result.data.access_token;
      }
    }
  }

  await wait(1000);
}

// ============================================================================
// PHASE 4: FHIR API TESTS
// ============================================================================

async function testFHIRAPIs() {
  console.log('\n🏥 PHASE 4: FHIR API TESTS');
  console.log('='.repeat(60));

  // Get the best available token
  const token = testResults.tokens.practitioner || 
                testResults.tokens.standard || 
                testResults.tokens.patient;

  if (!token) {
    console.log('⚠️  No valid token available. Skipping FHIR tests.');
    testResults.skipped.push({ category: 'FHIR', reason: 'No authentication token' });
    return;
  }

  const authHeader = { 'Authorization': `Bearer ${token}` };
  const fhirResources = [
    'Patient', 'Practitioner', 'Observation', 'Encounter', 
    'Appointment', 'Questionnaire', 'QuestionnaireResponse',
    'CarePlan', 'Condition', 'ServiceRequest', 'DiagnosticReport'
  ];

  // Test Search for each resource
  for (const resource of fhirResources) {
    console.log(`\nTesting GET /fhir/${resource}...`);
    let result = await makeRequest('GET', `/fhir/${resource}`, null, {
      ...authHeader,
      'Accept': 'application/fhir+json'
    });
    
    // Try with query params if initial fails
    if (!result.success && result.status === 400) {
      result = await makeRequest('GET', `/fhir/${resource}?_count=10`, null, {
        ...authHeader,
        'Accept': 'application/fhir+json'
      });
    }
    
    logTest(`GET /fhir/${resource}`, result);
    await wait(500);
  }

  // Test Create Patient (if we have write access)
  if (token) {
    console.log('\nTesting POST /fhir/Patient (create)...');
    const newPatient = {
      resourceType: "Patient",
      name: [{
        given: ["Test"],
        family: "Patient"
      }],
      gender: "male",
      birthDate: "1990-01-01"
    };
    
    let result = await makeRequest('POST', '/fhir/Patient', newPatient, {
      ...authHeader,
      'Content-Type': 'application/fhir+json',
      'Accept': 'application/fhir+json'
    });
    
    logTest('POST /fhir/Patient', result);
    
    if (result.success && result.data.id) {
      const patientId = result.data.id;
      testResults.metadata.createdPatientId = patientId;
      
      // Test Read
      console.log(`\nTesting GET /fhir/Patient/${patientId}...`);
      result = await makeRequest('GET', `/fhir/Patient/${patientId}`, null, {
        ...authHeader,
        'Accept': 'application/fhir+json'
      });
      logTest(`GET /fhir/Patient/${patientId}`, result);
    }
  }

  await wait(1000);
}

// ============================================================================
// PHASE 5: HIGH-LEVEL API TESTS
// ============================================================================

async function testHighLevelAPIs() {
  console.log('\n📋 PHASE 5: HIGH-LEVEL API TESTS');
  console.log('='.repeat(60));

  const token = testResults.tokens.practitioner || 
                testResults.tokens.standard || 
                testResults.tokens.patient;

  if (!token) {
    console.log('⚠️  No valid token available. Skipping high-level API tests.');
    testResults.skipped.push({ category: 'High-Level APIs', reason: 'No authentication token' });
    return;
  }

  const authHeader = { 'Authorization': `Bearer ${token}` };

  // Test Documents
  console.log('\n1. Testing Document APIs...');
  let result = await makeRequest('GET', '/documents/search', null, authHeader);
  logTest('GET /documents/search', result);
  await wait(500);

  // Test CMS
  console.log('\n2. Testing CMS APIs...');
  result = await makeRequest('GET', '/cms/content/search', null, authHeader);
  logTest('GET /cms/content/search', result);
  await wait(500);

  // Test Localization
  console.log('\n3. Testing Localization APIs...');
  result = await makeRequest('GET', '/localization/i18next/en', null, authHeader);
  logTest('GET /localization/i18next/en', result);
  await wait(500);

  // Test AI Translation
  console.log('\n4. Testing AI Translation...');
  result = await makeRequest('POST', '/ai/translate', {
    text: 'Hello',
    targetLanguage: 'es'
  }, authHeader);
  logTest('POST /ai/translate', result);
  await wait(500);
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function runAllTests() {
  console.log('\n🚀 OVOK API COMPREHENSIVE TEST SUITE');
  console.log('='.repeat(60));
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Test Email: ${TEST_CREDENTIALS.email}`);
  console.log('='.repeat(60));

  const startTime = Date.now();

  try {
    // Run all test phases
    await testStandardAuth();
    await testTenantPractitionerAuth();
    await testTenantPatientAuth();
    await testFHIRAPIs();
    await testHighLevelAPIs();

    // Generate report
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${testResults.passed.length}`);
    console.log(`❌ Failed: ${testResults.failed.length}`);
    console.log(`⏭️  Skipped: ${testResults.skipped.length}`);
    console.log(`⏱️  Duration: ${duration}s`);
    console.log('='.repeat(60));

    // Save results to file
    const fs = require('fs');
    const report = {
      summary: {
        passed: testResults.passed.length,
        failed: testResults.failed.length,
        skipped: testResults.skipped.length,
        duration: `${duration}s`,
        timestamp: new Date().toISOString()
      },
      tokens: {
        // Don't log full tokens for security
        standard: testResults.tokens.standard ? '✓' : '✗',
        practitioner: testResults.tokens.practitioner ? '✓' : '✗',
        patient: testResults.tokens.patient ? '✓' : '✗'
      },
      passed: testResults.passed,
      failed: testResults.failed,
      skipped: testResults.skipped,
      metadata: testResults.metadata
    };

    fs.writeFileSync(
      'tests/test-results.json',
      JSON.stringify(report, null, 2)
    );

    console.log('\n📄 Detailed results saved to: tests/test-results.json');
    console.log('\n🎯 Next Steps:');
    console.log('   1. Review test-results.json for detailed results');
    console.log('   2. Check which authentication method works');
    console.log('   3. Use working tokens to build your application');
    console.log('   4. Focus on APIs that passed tests\n');

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Run tests
runAllTests();


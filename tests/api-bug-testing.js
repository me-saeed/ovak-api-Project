/**
 * API Bug Testing Script
 * Tests common bug-prone areas in Ovok API
 * Run this separately - does not modify project functionality
 */

const axios = require('axios');

const API_BASE_URL = 'https://api.ovok.com';

// You'll need to set this from your browser's localStorage after logging in
// Or use environment variable
const ACCESS_TOKEN = process.env.OVOK_ACCESS_TOKEN || '';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/fhir+json',
    'Accept': 'application/fhir+json',
    'Authorization': ACCESS_TOKEN ? `Bearer ${ACCESS_TOKEN}` : '',
  },
});

const bugReports = [];

function logBug(bug) {
  bugReports.push({
    ...bug,
    timestamp: new Date().toISOString(),
  });
  console.log(`\n🐛 BUG FOUND: ${bug.title}`);
  console.log(`   Type: ${bug.type}`);
  console.log(`   Endpoint: ${bug.endpoint}`);
  console.log(`   Status: ${bug.statusCode}`);
}

function logTest(name, passed, details = {}) {
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} ${name}`);
  if (!passed && details.error) {
    console.log(`   Error: ${details.error}`);
  }
  return passed;
}

/**
 * Test 1: Patient Creation - Missing Required Fields
 */
async function testPatientMissingFields() {
  console.log('\n=== Test: Patient Creation - Missing Required Fields ===');
  
  if (!ACCESS_TOKEN) {
    console.log('⏭️  Skipped - requires authentication token');
    return;
  }
  
  try {
    // Test creating patient with minimal data (should validate required fields)
    const response = await apiClient.post('/fhir/Patient', {
      resourceType: 'Patient',
      // Missing name, which might be required
    });
    
    if (response.status === 200 || response.status === 201) {
      logBug({
        type: 'Validation',
        title: 'Patient creation accepts missing required fields',
        endpoint: 'POST /fhir/Patient',
        statusCode: response.status,
        expected: '400 Bad Request with validation error',
        actual: `${response.status} - Patient created without required fields`,
        requestBody: { resourceType: 'Patient' },
        responseBody: response.data,
      });
      return false;
    }
    return logTest('Patient creation rejects missing fields', true);
  } catch (error) {
    if (error.response?.status === 400) {
      // Check if error message is helpful
      const errorData = error.response?.data;
      if (errorData && (errorData.message || errorData.details || errorData.issue)) {
        return logTest('Patient creation rejects missing fields with helpful error', true);
      } else {
        logBug({
          type: 'Error Handling',
          title: 'Patient creation returns 400 but error message is not helpful',
          endpoint: 'POST /fhir/Patient',
          statusCode: 400,
          expected: '400 with clear validation message about missing fields',
          actual: '400 with generic or no error message',
          errorDetails: errorData,
        });
        return false;
      }
    } else if (error.response?.status === 401) {
      console.log('⏭️  Skipped - authentication required');
      return;
    } else if (error.response?.status === 500) {
      logBug({
        type: 'Error Handling',
        title: '500 error for missing required fields (should be 400)',
        endpoint: 'POST /fhir/Patient',
        statusCode: 500,
        expected: '400 Bad Request',
        actual: '500 Internal Server Error',
        errorDetails: error.response?.data,
      });
      return false;
    }
    return false;
  }
}

/**
 * Test 2: Patient Creation - Invalid Data Types
 */
async function testPatientInvalidData() {
  console.log('\n=== Test: Patient Creation - Invalid Data Types ===');
  
  if (!ACCESS_TOKEN) {
    console.log('⏭️  Skipped - requires authentication token');
    return;
  }
  
  const invalidTests = [
    {
      name: 'Invalid birthDate format',
      data: {
        resourceType: 'Patient',
        name: [{ given: ['John'], family: 'Doe' }],
        birthDate: '2024-13-45', // Invalid date
      },
    },
    {
      name: 'Invalid gender value',
      data: {
        resourceType: 'Patient',
        name: [{ given: ['John'], family: 'Doe' }],
        gender: 'invalid-gender', // Not in allowed values
      },
    },
    {
      name: 'Invalid date format (text)',
      data: {
        resourceType: 'Patient',
        name: [{ given: ['John'], family: 'Doe' }],
        birthDate: 'not-a-date',
      },
    },
  ];
  
  for (const test of invalidTests) {
    try {
      const response = await apiClient.post('/fhir/Patient', test.data);
      
      if (response.status === 200 || response.status === 201) {
        logBug({
          type: 'Validation',
          title: `Patient creation accepts invalid ${test.name}`,
          endpoint: 'POST /fhir/Patient',
          statusCode: response.status,
          expected: '400 Bad Request with field-specific error',
          actual: `${response.status} - Patient created with invalid data`,
          requestBody: test.data,
          responseBody: response.data,
        });
      }
    } catch (error) {
      if (error.response?.status === 400) {
        // Check if error message is helpful
        const errorData = error.response?.data;
        if (!errorData || (!errorData.message && !errorData.details)) {
          logBug({
            type: 'Error Handling',
            title: `Generic error message for invalid ${test.name}`,
            endpoint: 'POST /fhir/Patient',
            statusCode: 400,
            expected: '400 with field-specific error details',
            actual: '400 with generic or no error message',
            errorDetails: errorData,
          });
        }
      } else if (error.response?.status === 500) {
        logBug({
          type: 'Error Handling',
          title: `500 error for invalid ${test.name} (should be 400)`,
          endpoint: 'POST /fhir/Patient',
          statusCode: 500,
          expected: '400 Bad Request',
          actual: '500 Internal Server Error',
          errorDetails: error.response?.data,
        });
      }
    }
  }
}

/**
 * Test 3: Patient Search - Edge Cases
 */
async function testPatientSearchEdgeCases() {
  console.log('\n=== Test: Patient Search - Edge Cases ===');
  
  if (!ACCESS_TOKEN) {
    console.log('⏭️  Skipped - requires authentication token');
    return;
  }
  
  const searchTests = [
    {
      name: 'Search with special characters in name',
      params: { name: "O'Brien" },
    },
    {
      name: 'Search with empty string',
      params: { name: '' },
    },
    {
      name: 'Search with SQL injection attempt',
      params: { name: "'; DROP TABLE--" },
    },
    {
      name: 'Search with very long string',
      params: { name: 'a'.repeat(1000) },
    },
    {
      name: 'Search with invalid _count',
      params: { _count: -1 },
    },
    {
      name: 'Search with invalid _count (too large)',
      params: { _count: 100000 },
    },
  ];
  
  for (const test of searchTests) {
    try {
      const response = await apiClient.get('/fhir/Patient', { params: test.params });
      
      if (response.status === 500) {
        logBug({
          type: 'Functional',
          title: `Patient search returns 500 for ${test.name}`,
          endpoint: 'GET /fhir/Patient',
          statusCode: 500,
          expected: '400 Bad Request or empty results',
          actual: '500 Internal Server Error',
          searchParams: test.params,
          errorDetails: response.data,
        });
      } else if (response.status === 200) {
        logTest(`Search with ${test.name}`, true);
      }
    } catch (error) {
      if (error.response?.status === 500) {
        logBug({
          type: 'Functional',
          title: `Patient search crashes with ${test.name}`,
          endpoint: 'GET /fhir/Patient',
          statusCode: 500,
          expected: '400 Bad Request or empty results',
          actual: '500 Internal Server Error',
          searchParams: test.params,
          errorDetails: error.response?.data,
        });
      }
    }
  }
}

/**
 * Test 4: Patient Update - Invalid ID
 */
async function testPatientInvalidId() {
  console.log('\n=== Test: Patient Operations - Invalid ID ===');
  
  if (!ACCESS_TOKEN) {
    console.log('⏭️  Skipped - requires authentication token');
    return;
  }
  
  const invalidIds = [
    'non-existent-id-12345',
    '../../etc/passwd',
    "'; DROP TABLE--",
    '',
    null,
  ];
  
  for (const id of invalidIds) {
    try {
      const response = await apiClient.get(`/fhir/Patient/${id}`);
      
      if (response.status === 200) {
        logBug({
          type: 'Security',
          title: `Patient GET accepts invalid ID: ${id}`,
          endpoint: `GET /fhir/Patient/${id}`,
          statusCode: 200,
          expected: '404 Not Found',
          actual: '200 OK',
        });
      }
    } catch (error) {
      if (error.response?.status === 500) {
        logBug({
          type: 'Error Handling',
          title: `Patient GET returns 500 for invalid ID: ${id}`,
          endpoint: `GET /fhir/Patient/${id}`,
          statusCode: 500,
          expected: '404 Not Found',
          actual: '500 Internal Server Error',
          errorDetails: error.response?.data,
        });
      }
    }
  }
}

/**
 * Test 5: Error Response Consistency
 */
async function testErrorResponseConsistency() {
  console.log('\n=== Test: Error Response Consistency ===');
  
  if (!ACCESS_TOKEN) {
    console.log('⏭️  Skipped - requires authentication token');
    return;
  }
  
  const endpoints = [
    { method: 'POST', path: '/fhir/Patient', data: {} },
    { method: 'POST', path: '/fhir/Appointment', data: { resourceType: 'Appointment' } },
    { method: 'POST', path: '/fhir/Encounter', data: { resourceType: 'Encounter' } },
  ];
  
  const errorFormats = [];
  
  for (const endpoint of endpoints) {
    try {
      await apiClient.request({
        method: endpoint.method,
        url: endpoint.path,
        data: endpoint.data,
      });
    } catch (error) {
      if (error.response?.status === 400) {
        errorFormats.push({
          endpoint: endpoint.path,
          format: JSON.stringify(error.response.data),
        });
      }
    }
  }
  
  // Check if all error formats are the same
  if (errorFormats.length > 1) {
    const firstFormat = errorFormats[0].format;
    const allSame = errorFormats.every(e => e.format === firstFormat);
    
    if (!allSame) {
      logBug({
        type: 'Consistency',
        title: 'Inconsistent error response formats across endpoints',
        endpoint: 'Multiple POST endpoints',
        statusCode: 400,
        expected: 'Consistent error format across all endpoints',
        actual: 'Different error formats',
        errorFormats: errorFormats,
      });
    }
  }
}

/**
 * Test 6: Authentication - Missing/Invalid Token
 */
async function testAuthentication() {
  console.log('\n=== Test: Authentication Edge Cases ===');
  
  // Test without token
  try {
    const response = await axios.get(`${API_BASE_URL}/fhir/Patient`, {
      headers: {
        'Content-Type': 'application/fhir+json',
        'Accept': 'application/fhir+json',
        // No Authorization header
      },
    });
    
    if (response.status === 200) {
      logBug({
        type: 'Security',
        title: 'API accepts requests without authentication token',
        endpoint: 'GET /fhir/Patient',
        statusCode: 200,
        expected: '401 Unauthorized',
        actual: '200 OK without token',
      });
    }
  } catch (error) {
    if (error.response?.status !== 401) {
      logBug({
        type: 'Security',
        title: `Unexpected status ${error.response?.status} for request without token (expected 401)`,
        endpoint: 'GET /fhir/Patient',
        statusCode: error.response?.status || 'N/A',
        expected: '401 Unauthorized',
        actual: `${error.response?.status || 'Error'}: ${error.message}`,
      });
    }
  }
  
  // Test with invalid token
  try {
    const response = await axios.get(`${API_BASE_URL}/fhir/Patient`, {
      headers: {
        'Content-Type': 'application/fhir+json',
        'Accept': 'application/fhir+json',
        'Authorization': 'Bearer invalid-token-12345',
      },
    });
    
    if (response.status === 200) {
      logBug({
        type: 'Security',
        title: 'API accepts requests with invalid authentication token',
        endpoint: 'GET /fhir/Patient',
        statusCode: 200,
        expected: '401 Unauthorized',
        actual: '200 OK with invalid token',
      });
    }
  } catch (error) {
    if (error.response?.status !== 401) {
      logBug({
        type: 'Security',
        title: `Unexpected status ${error.response?.status} for invalid token (expected 401)`,
        endpoint: 'GET /fhir/Patient',
        statusCode: error.response?.status || 'N/A',
        expected: '401 Unauthorized',
        actual: `${error.response?.status || 'Error'}: ${error.message}`,
      });
    }
  }
}

/**
 * Test 7: Appointment Creation - Invalid References
 */
async function testAppointmentInvalidReferences() {
  console.log('\n=== Test: Appointment Creation - Invalid References ===');
  
  if (!ACCESS_TOKEN) {
    console.log('⏭️  Skipped - requires authentication token');
    return;
  }
  
  const invalidTests = [
    {
      name: 'Non-existent patient reference',
      data: {
        resourceType: 'Appointment',
        status: 'proposed',
        participant: [{
          actor: { reference: 'Patient/non-existent-12345' },
          status: 'accepted',
        }],
      },
    },
    {
      name: 'Invalid reference format',
      data: {
        resourceType: 'Appointment',
        status: 'proposed',
        participant: [{
          actor: { reference: 'invalid-reference' },
          status: 'accepted',
        }],
      },
    },
  ];
  
  for (const test of invalidTests) {
    try {
      const response = await apiClient.post('/fhir/Appointment', test.data);
      
      if (response.status === 200 || response.status === 201) {
        logBug({
          type: 'Validation',
          title: `Appointment creation accepts ${test.name}`,
          endpoint: 'POST /fhir/Appointment',
          statusCode: response.status,
          expected: '400 Bad Request - invalid reference',
          actual: `${response.status} - Appointment created with invalid reference`,
          requestBody: test.data,
        });
      }
    } catch (error) {
      if (error.response?.status === 500) {
        logBug({
          type: 'Error Handling',
          title: `500 error for ${test.name} (should be 400)`,
          endpoint: 'POST /fhir/Appointment',
          statusCode: 500,
          expected: '400 Bad Request',
          actual: '500 Internal Server Error',
          errorDetails: error.response?.data,
        });
      }
    }
  }
}

/**
 * Test 8: Search Pagination
 */
async function testSearchPagination() {
  console.log('\n=== Test: Search Pagination ===');
  
  if (!ACCESS_TOKEN) {
    console.log('⏭️  Skipped - requires authentication token');
    return;
  }
  
  try {
    // Test without _count (should have default or limit)
    const response1 = await apiClient.get('/fhir/Patient');
    
    if (response1.data.entry && response1.data.entry.length > 100) {
      // Check if there's pagination info
      if (!response1.data.link || response1.data.link.length === 0) {
        logBug({
          type: 'Performance',
          title: 'Patient search without _count returns many results without pagination links',
          endpoint: 'GET /fhir/Patient',
          statusCode: 200,
          expected: 'Default _count limit or pagination links',
          actual: `Returns ${response1.data.entry.length} results without pagination`,
        });
      }
    }
    
    // Test with _count = 0 (should be rejected or have minimum)
    try {
      const response2 = await apiClient.get('/fhir/Patient', { params: { _count: 0 } });
      logBug({
        type: 'Validation',
        title: 'Patient search accepts _count=0',
        endpoint: 'GET /fhir/Patient?_count=0',
        statusCode: response2.status,
        expected: '400 Bad Request or minimum _count enforced',
        actual: `${response2.status} - _count=0 accepted`,
      });
    } catch (error) {
      // Expected to fail
    }
    
  } catch (error) {
    console.log(`Error testing pagination: ${error.message}`);
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('🚀 Starting API Bug Testing...\n');
  console.log('Note: Set OVOK_ACCESS_TOKEN environment variable for authenticated tests\n');
  
  if (!ACCESS_TOKEN) {
    console.log('⚠️  No access token provided. Some tests will be skipped or fail.\n');
  }
  
  try {
    await testAuthentication();
    await testPatientMissingFields();
    await testPatientInvalidData();
    await testPatientSearchEdgeCases();
    await testPatientInvalidId();
    await testErrorResponseConsistency();
    await testAppointmentInvalidReferences();
    await testSearchPagination();
    
    console.log('\n\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Bugs Found: ${bugReports.length}\n`);
    
    if (bugReports.length > 0) {
      console.log('🐛 BUGS FOUND:\n');
      bugReports.forEach((bug, index) => {
        console.log(`${index + 1}. ${bug.title}`);
        console.log(`   Type: ${bug.type}`);
        console.log(`   Endpoint: ${bug.endpoint}`);
        console.log(`   Status: ${bug.statusCode}`);
        console.log('');
      });
    } else {
      console.log('✅ No bugs found in tested areas!');
    }
    
    // Save bug reports to file
    const fs = require('fs');
    const path = require('path');
    const reportPath = path.join(__dirname, 'bug-reports.json');
    fs.writeFileSync(reportPath, JSON.stringify(bugReports, null, 2));
    console.log(`\n📝 Bug reports saved to: ${reportPath}`);
    
  } catch (error) {
    console.error('Test execution error:', error.message);
  }
}

// Run tests if executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = { runAllTests, bugReports };


#!/usr/bin/env node

// Simple test script to verify connection to CallTrackerPro backend
const https = require('https');

const BACKEND_URL = 'https://calltrackerpro-backend.vercel.app';

console.log('🚀 Testing CallTrackerPro Backend Connection...\n');

// Test health endpoint
function testEndpoint(path, description) {
  return new Promise((resolve, reject) => {
    const url = `${BACKEND_URL}${path}`;
    console.log(`Testing: ${description}`);
    console.log(`URL: ${url}`);
    
    const req = https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Headers:`, res.headers);
        
        if (res.statusCode === 200 || res.statusCode === 400) {
          try {
            const jsonData = JSON.parse(data);
            console.log('✅ Response:', JSON.stringify(jsonData, null, 2));
            resolve({ success: true, data: jsonData });
          } catch (e) {
            console.log('✅ Response (text):', data.substring(0, 200));
            resolve({ success: true, data: data });
          }
        } else {
          console.log('❌ Unexpected status code:', res.statusCode);
          console.log('Response:', data.substring(0, 200));
          resolve({ success: false, status: res.statusCode, data });
        }
      });
    });
    
    req.on('error', (err) => {
      console.log('❌ Request failed:', err.message);
      reject(err);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      console.log('❌ Request timeout');
      reject(new Error('Request timeout'));
    });
  });
}

async function runTests() {
  const tests = [
    { path: '/', description: 'Root endpoint' },
    { path: '/api', description: 'API root endpoint' },
    { path: '/api/call-logs', description: 'Call logs endpoint (expecting 400 without org ID)' },
    { path: '/api/call-logs?organizationId=test_org', description: 'Call logs with organization ID' }
  ];
  
  for (const test of tests) {
    try {
      console.log('\n' + '='.repeat(60));
      await testEndpoint(test.path, test.description);
      console.log('✅ Test completed');
    } catch (error) {
      console.log('❌ Test failed:', error.message);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🎯 Backend Integration Test Complete!');
  console.log('\nIf you see successful responses above, your CallTrackerPro backend is ready!');
  console.log('The React dashboard should be able to connect and fetch call logs data.');
}

runTests();
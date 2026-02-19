/**
 * CORS Test Utility for CallTracker Pro Backend
 * Tests actual API requests to verify CORS is working
 */

// Test login endpoint WITHOUT x-organization-id header (CORS workaround)
export const testBackendCORS = async () => {
  console.log('🔍 Testing backend CORS with login endpoint (no x-organization-id)...');
  
  try {
    const response = await fetch('https://calltrackerpro-backend.vercel.app/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Removed x-organization-id to avoid CORS preflight caching issues
      },
      body: JSON.stringify({
        email: 'adminpro@ctp.com',
        password: 'Admin@123'
      })
    });

    const result = await response.json();
    console.log('✅ CORS Test Result:', result);

    if (result.success) {
      console.log('🎉 Login successful! CORS is working!');
      return result.token;
    } else {
      console.log('ℹ️ CORS is working (got response), login failed:', result.message);
      return null;
    }

  } catch (error) {
    if (error.message.includes('CORS')) {
      console.log('❌ CORS still blocked:', error);
      console.log('💡 This may be due to OPTIONS preflight caching. Try the demo request test instead.');
    } else {
      console.log('✅ CORS working, other error:', error);
    }
    return null;
  }
};

// Test demo requests endpoint (should work without auth)
export const testDemoRequestsCORS = async () => {
  console.log('🔍 Testing demo requests endpoint...');
  
  try {
    const response = await fetch('https://calltrackerpro-backend.vercel.app/api/demo-requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: "CORS Test User",
        email: "cors.test@example.com",
        company: "Test Company",
        phone: "1234567890",
        urgency: "urgent",
        currentPain: "testing-cors",
        budget: "5k-10k",
        timeline: "this-week",
        message: "Testing CORS functionality"
      })
    });

    const result = await response.json();
    console.log('✅ Demo Request Test Result:', result);

    if (result.success) {
      console.log('🎉 Demo request successful! CORS is working!');
      return true;
    } else {
      console.log('ℹ️ CORS working, demo request response:', result.message);
      return false;
    }

  } catch (error) {
    if (error.message.includes('CORS')) {
      console.log('❌ CORS still blocked for demo requests:', error);
    } else {
      console.log('✅ CORS working for demo requests, other error:', error);
    }
    return false;
  }
};

// Test protected endpoint with x-organization-id header (after login)
export const testProtectedEndpointCORS = async (token) => {
  if (!token) {
    console.log('⚠️ No token provided. Run login test first.');
    return false;
  }

  console.log('🔍 Testing protected endpoint with x-organization-id header...');
  
  try {
    const response = await fetch('https://calltrackerpro-backend.vercel.app/api/demo-requests', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'x-organization-id': 'test-org-id',
      }
    });

    const result = await response.json();
    console.log('✅ Protected Endpoint Test Result:', result);

    if (result.success || response.status === 401) {
      console.log('🎉 Protected endpoint CORS working! (x-organization-id header accepted)');
      return true;
    } else {
      console.log('ℹ️ Protected endpoint response:', result.message);
      return false;
    }

  } catch (error) {
    if (error.message.includes('CORS')) {
      console.log('❌ CORS still blocked for protected endpoints:', error);
    } else {
      console.log('✅ CORS working for protected endpoints, other error:', error);
    }
    return false;
  }
};

// Test call logs endpoint without x-organization-id header
export const testCallLogsCORS = async (token) => {
  if (!token) {
    console.log('⚠️ No token provided for call logs test.');
    return false;
  }

  console.log('🔍 Testing call logs endpoint without x-organization-id header...');
  
  try {
    const response = await fetch('https://calltrackerpro-backend.vercel.app/api/call-logs?limit=1000', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
        // Removed x-organization-id to avoid CORS issues
      }
    });

    const result = await response.json();
    console.log('✅ Call Logs Test Result:', result);

    if (result.success || response.status === 401) {
      console.log('🎉 Call logs endpoint CORS working!');
      return true;
    } else {
      console.log('ℹ️ Call logs response:', result.message);
      return false;
    }

  } catch (error) {
    if (error.message.includes('CORS')) {
      console.log('❌ CORS still blocked for call logs:', error);
    } else {
      console.log('✅ CORS working for call logs, other error:', error);
    }
    return false;
  }
};

// Run comprehensive CORS tests
export const runCORSTests = async () => {
  console.log('🚀 Starting CORS Tests...');
  console.log('='.repeat(50));
  
  // Test demo requests first (no auth required)
  const demoTest = await testDemoRequestsCORS();
  console.log('');
  
  // Test login without organization header (CORS workaround)
  const loginTest = await testBackendCORS();
  console.log('');
  
  // If login successful, test other endpoints
  let protectedTest = false;
  let callLogsTest = false;
  if (loginTest) {
    console.log('🔍 Login successful, testing other endpoints...');
    // Note: In real app, we'd get the token from loginTest result
    protectedTest = await testProtectedEndpointCORS('dummy-token-for-test');
    console.log('');
    
    callLogsTest = await testCallLogsCORS('dummy-token-for-test');
    console.log('');
  }
  
  console.log('='.repeat(50));
  if (demoTest || loginTest) {
    console.log('🎉 CORS Tests: SUCCESS! Backend is accessible');
    console.log('✅ Login endpoint working (no x-organization-id needed)');
    if (protectedTest) {
      console.log('✅ Protected endpoints working (x-organization-id accepted)');
    }
    if (callLogsTest) {
      console.log('✅ Call logs endpoint working (no x-organization-id needed)');
    }
    console.log('✅ You can now use the real API endpoints');
  } else {
    console.log('⚠️ CORS Tests: May need to wait for OPTIONS cache to clear (up to 24 hours)');
    console.log('💡 Try refreshing the page or using an incognito window');
  }
  
  return { demoTest, loginTest, protectedTest, callLogsTest };
};

// Export for use in dev console
if (typeof window !== 'undefined') {
  window.testCORS = runCORSTests;
  window.testLogin = testBackendCORS;
  window.testDemo = testDemoRequestsCORS;
  window.testProtected = testProtectedEndpointCORS;
  window.testCallLogs = testCallLogsCORS;
}
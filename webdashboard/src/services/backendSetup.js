import api from './api';

export const backendSetupService = {
  /**
   * Test backend connectivity using the new setup endpoint
   */
  async testBackendHealth() {
    try {
      // First try the new setup endpoint
      const response = await api.get('/api/setup/test-connection');
      console.log('✅ Backend connectivity test successful:', response);
      return { success: true, data: response, endpoint: '/setup/test-connection' };
    } catch (error) {
      console.log('❌ New connectivity endpoint failed, trying fallback...');
      try {
        // Fallback to root endpoint
        const fallbackResponse = await api.get('/');
        console.log('✅ Backend health check (fallback):', fallbackResponse);
        return { success: true, data: fallbackResponse, endpoint: '/', fallback: true };
      } catch (fallbackError) {
        console.error('❌ All backend connectivity tests failed:', fallbackError);
        return { success: false, error: fallbackError.message };
      }
    }
  },

  /**
   * Create an initial super admin user using the new setup endpoint
   */
  async createInitialUser(userData) {
    try {
      console.log('🔧 Creating initial user:', {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        organizationName: userData.organizationName
      });
      
      // Use the new setup endpoint
      const response = await api.post('/api/setup/initial-user', {
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName || 'Admin',
        lastName: userData.lastName || 'User',
        organizationName: userData.organizationName || 'CallTracker Pro'
      });
      
      if (response.success) {
        console.log('✅ Initial user created successfully:', response);
        return { success: true, data: response, endpoint: '/setup/initial-user' };
      } else {
        throw new Error(response.message || 'Failed to create initial user');
      }
    } catch (error) {
      console.error('🚨 Failed to create initial user:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message,
        details: error.response?.data
      };
    }
  },

  /**
   * Check if the backend has any users
   */
  async checkUserExists() {
    try {
      // Try to hit an endpoint that might give us info about users
      const endpoints = ['/api/admin/stats', '/api/setup/check', '/api/users/count'];
      
      for (const endpoint of endpoints) {
        try {
          const response = await api.get(endpoint);
          console.log(`User check via ${endpoint}:`, response);
          return { success: true, data: response, endpoint };
        } catch (error) {
          continue;
        }
      }
      
      return { success: false, message: 'Unable to check user status' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Get available endpoints by testing common paths
   */
  async discoverEndpoints() {
    const commonPaths = [
      '/api/auth/login',
      '/api/auth/register', 
      '/api/auth/setup',
      '/api/setup/initial-user',
      '/api/admin/setup',
      '/api/users',
      '/api/organizations',
      '/api/call-logs',
      '/api/health',
      '/api/status'
    ];
    
    const availableEndpoints = [];
    
    for (const path of commonPaths) {
      try {
        // Use HEAD request to minimize data transfer
        await api.head(path);
        availableEndpoints.push({ path, method: 'HEAD', available: true });
      } catch (error) {
        const status = error.response?.status;
        if (status && status !== 404) {
          // Endpoint exists but may require different method/auth
          availableEndpoints.push({ 
            path, 
            method: 'HEAD', 
            available: true, 
            status,
            note: 'Exists but may need auth/different method'
          });
        }
      }
    }
    
    console.log('🔍 Available endpoints:', availableEndpoints);
    return availableEndpoints;
  }
};

export default backendSetupService;
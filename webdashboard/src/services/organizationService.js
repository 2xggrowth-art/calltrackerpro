import api from './api';
import axios from 'axios';

export const organizationService = {
  // Test API connectivity
  async testConnection() {
    try {
      console.log('🔍 Testing API connection...');
      console.log('🔍 API Base URL:', process.env.REACT_APP_API_URL || 'Not set');
      
      // Test with a direct fetch first to bypass our axios interceptors
      try {
        console.log('🔍 Testing with direct fetch...');
        // The health endpoint is at the root, not under /api
        const healthUrl = 'https://calltrackerpro-backend.vercel.app/health';
        console.log('🔍 Testing health URL:', healthUrl);
        const directResponse = await fetch(healthUrl);
        
        if (!directResponse.ok) {
          console.warn('⚠️ Health endpoint not available (404) - this is expected if not implemented');
          // Try a super admin endpoint instead to test connectivity
          console.log('🔍 Testing super admin endpoint instead...');
          const testUrl = 'https://calltrackerpro-backend.vercel.app/api/super-admin/organizations';
          console.log('🔍 Testing URL:', testUrl);
          const testResponse = await fetch(testUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
          });
          console.log('🔍 Super admin endpoint test status:', testResponse.status);
          if (testResponse.status === 200 || testResponse.status === 401 || testResponse.status === 500) {
            console.log('✅ Backend is reachable via super admin endpoint');
            return { status: 'connected', endpoint: 'super-admin', responseStatus: testResponse.status };
          }
        } else {
          const directData = await directResponse.json();
          console.log('✅ Direct fetch successful:', directData);
          return { status: 'connected', endpoint: 'health', data: directData };
        }
      } catch (fetchError) {
        console.error('❌ Direct fetch failed:', fetchError);
        throw fetchError;
      }
    } catch (error) {
      console.error('❌ API connection test failed:', error);
      console.error('❌ Error type:', typeof error);
      console.error('❌ Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        response: error.response,
        request: error.request
      });
      throw error;
    }
  },

  async getAllOrganizations(params = {}) {
    try {
      console.log('📡 Fetching all organizations from super admin endpoint');
      console.log('📡 Base URL being used:', process.env.REACT_APP_API_URL);
      
      // Use direct fetch to avoid axios issues
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      const url = new URL('/api/super-admin/organizations', 'https://calltrackerpro-backend.vercel.app');
      Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
      
      console.log('📡 Fetching from URL:', url.toString());
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ HTTP Error:', response.status, errorText);
        
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        } else if (response.status === 403) {
          throw new Error('Access denied. You need super admin privileges.');
        } else {
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
      }
      
      const result = await response.json();
      console.log('📡 Organizations fetched successfully:', result);
      return { data: result.data || result }; // Handle different response formats
    } catch (error) {
      console.error('📡 Error fetching organizations:', error);
      throw error;
    }
  },

  async getOrganization(orgId) {
    try {
      const response = await api.get(`/organizations/${orgId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },


  async getOrganizationUsers(orgId) {
    try {
      console.log('👥 Fetching users for organization ID:', orgId);
      
      // Use direct fetch with super admin endpoint
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      const url = `https://calltrackerpro-backend.vercel.app/api/super-admin/organizations/${orgId}/users`;
      console.log('📡 Fetching users from URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      console.log('📡 Users response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ HTTP Error:', response.status, errorText);
        
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        } else if (response.status === 403) {
          throw new Error('Access denied. You need super admin privileges.');
        } else if (response.status === 404) {
          throw new Error('Organization users endpoint not found.');
        } else {
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
      }
      
      const result = await response.json();
      console.log('📡 Users fetched successfully:', result);
      console.log('📡 Users data array:', result.data);
      console.log('📡 Pagination info:', result.pagination);
      console.log('📡 Organization info:', result.organization);
      
      return {
        data: result.data || [], // Backend returns users directly in 'data' array
        pagination: result.pagination,
        organization: result.organization,
        message: result.message,
        success: result.success
      };
    } catch (error) {
      console.error('📡 Error fetching organization users:', error);
      throw error;
    }
  },

  async getOrganizationAnalytics(orgId) {
    try {
      const response = await api.get(`/organizations/${orgId}/analytics`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  async createOrganization(orgData) {
    try {
      console.log('🏢 Creating organization with super admin endpoint');
      console.log('🏢 Input data:', orgData);
      
      // Debug authentication
      const authToken = localStorage.getItem('authToken');
      const userData = localStorage.getItem('user');
      console.log('🔐 Auth token exists:', !!authToken);
      console.log('🔐 Auth token length:', authToken?.length || 0);
      console.log('👤 User data:', userData ? JSON.parse(userData) : 'No user data');
      
      if (!authToken) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      // Prepare data in the format expected by the backend
      const organizationData = {
        name: orgData.name,
        domain: orgData.domain,
        description: orgData.description || '',
        plan: orgData.plan || 'basic',
        adminUser: {
          firstName: 'Admin',
          lastName: 'User',
          email: `admin@${orgData.domain}`,
          password: 'TempPassword123!'
        }
      };
      
      console.log('📡 Making API call to create organization:', organizationData);
      console.log('📡 Using direct fetch to avoid axios issues');
      
      // Use direct fetch to completely bypass axios configuration issues
      const response = await fetch('https://calltrackerpro-backend.vercel.app/api/super-admin/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(organizationData)
      });
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ HTTP Error:', response.status, errorText);
        
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        } else if (response.status === 403) {
          throw new Error('Access denied. You need super admin privileges.');
        } else {
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
      }
      
      const result = await response.json();
      console.log('✅ Organization created successfully:', result);
      
      return { data: result };
    } catch (error) {
      console.error('❌ Organization creation failed:', error);
      throw error;
    }
  },

  async deleteOrganization(orgId) {
    try {
      console.log('🗑️ Deleting organization via super admin endpoint:', orgId);
      
      // Create a clean axios instance to avoid double /api issue
      const cleanApi = axios.create({
        baseURL: 'https://calltrackerpro-backend.vercel.app',
        timeout: 10000,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      const response = await cleanApi.delete(`/api/super-admin/organizations/${orgId}`, {
        data: { confirmDelete: true }
      });
      console.log('✅ Organization deleted successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Error deleting organization:', error);
      throw error;
    }
  },

  async updateOrganization(orgId, data) {
    try {
      console.log('✏️ Updating organization via super admin endpoint:', orgId, data);
      
      // Create a clean axios instance to avoid double /api issue
      const cleanApi = axios.create({
        baseURL: 'https://calltrackerpro-backend.vercel.app',
        timeout: 10000,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      const response = await cleanApi.put(`/api/super-admin/organizations/${orgId}`, data);
      console.log('✅ Organization updated successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Error updating organization:', error);
      throw error;
    }
  },

  async getTeams() {
    try {
      // Teams endpoint not available yet - return empty array
      console.log('🔄 Teams endpoint not available yet - using fallback data');
      return {
        success: true,
        data: []
      };
    } catch (error) {
      console.error('❌ Error fetching teams:', error);
      throw error;
    }
  }
};

export default organizationService;
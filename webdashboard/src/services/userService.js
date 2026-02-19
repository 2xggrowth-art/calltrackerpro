import api from './api';

export const userService = {
  async getAllUsers(params = {}) {
    try {
      // Check user role to determine appropriate endpoint
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userRole = user.role;
      
      console.log('📡 Fetching users for role:', userRole);
      console.log('📡 Query params:', params);
      
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      let url;
      
      if (userRole === 'super_admin') {
        // Super admin can access all users
        url = new URL('/api/super-admin/users', 'https://calltrackerpro-backend.vercel.app');
      } else if (['org_admin', 'manager'].includes(userRole)) {
        // Organization admins/managers can access organization users
        const currentOrg = JSON.parse(localStorage.getItem('currentOrganization') || '{}');
        const orgId = currentOrg._id || currentOrg.id;
        if (!orgId) {
          throw new Error('No organization context found. Please refresh and try again.');
        }
        url = new URL(`/api/organizations/${orgId}/users`, 'https://calltrackerpro-backend.vercel.app');
      } else {
        // Other roles - return empty for now
        console.log('📋 User role does not have user management permissions');
        return {
          data: [],
          pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
          message: 'Access denied. Insufficient privileges to view users.'
        };
      }
      
      Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
      
      console.log('📡 Fetching from URL:', url.toString());
      
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
          console.log('📋 Super admin users endpoint not found');
          return {
            data: [],
            pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
            message: 'Super admin users endpoint not yet implemented on backend'
          };
        } else if (response.status === 500) {
          console.error('📋 Server error - check backend logs for details');
          return {
            data: [],
            pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
            message: 'Server error loading users. Check backend logs.'
          };
        } else {
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
      }
      
      const result = await response.json();
      console.log('📡 Users fetched successfully:', result);
      return { data: result.data || result }; // Handle different response formats
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      throw error;
    }
  },

  async getOrganizationUsers(orgId, params = {}) {
    try {
      console.log('📡 Fetching organization users from super admin endpoint...');
      console.log('📡 Organization ID:', orgId);
      console.log('📡 Query params:', params);
      
      // Use direct fetch with super admin endpoint
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      const url = new URL(`/api/super-admin/organizations/${orgId}/users`, 'https://calltrackerpro-backend.vercel.app');
      Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
      
      console.log('📡 Fetching from URL:', url.toString());
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      console.log('📡 Organization users response status:', response.status);
      
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
      console.log('📡 Organization users fetched successfully:', result);
      return { data: result.data || result }; // Handle different response formats
    } catch (error) {
      console.error('❌ Error fetching organization users:', error);
      throw error;
    }
  },

  async createUser(userData) {
    try {
      console.log('👤 Creating user with super admin endpoint...');
      console.log('👤 User data:', userData);
      
      // Use direct fetch with super admin endpoint
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      console.log('📡 Creating user at URL: https://calltrackerpro-backend.vercel.app/api/super-admin/users');
      
      const response = await fetch('https://calltrackerpro-backend.vercel.app/api/super-admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(userData)
      });
      
      console.log('📡 User creation response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ HTTP Error:', response.status, errorText);
        
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        } else if (response.status === 403) {
          throw new Error('Access denied. You need super admin privileges.');
        } else if (response.status === 404) {
          throw new Error('User creation endpoint not found.');
        } else {
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
      }
      
      const result = await response.json();
      console.log('✅ User created successfully:', result);
      return { data: result.data || result };
    } catch (error) {
      console.error('❌ Error creating user:', error);
      throw error;
    }
  },

  async updateUser(userId, userData) {
    try {
      console.log('👤 Updating user with super admin endpoint...');
      console.log('👤 User ID:', userId);
      console.log('👤 User data:', userData);
      
      // Use direct fetch with super admin endpoint
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      const url = `https://calltrackerpro-backend.vercel.app/api/super-admin/users/${userId}`;
      console.log('📡 Updating user at URL:', url);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(userData)
      });
      
      console.log('📡 User update response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ HTTP Error:', response.status, errorText);
        
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        } else if (response.status === 403) {
          throw new Error('Access denied. You need super admin privileges.');
        } else if (response.status === 404) {
          throw new Error('User or update endpoint not found.');
        } else {
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
      }
      
      const result = await response.json();
      console.log('✅ User updated successfully:', result);
      return { data: result.data || result };
    } catch (error) {
      console.error('❌ Error updating user:', error);
      throw error;
    }
  },

  async updateUserRole(orgId, userId, roleData) {
    try {
      const response = await api.put(`/api/organizations/${orgId}/users/${userId}/role`, roleData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  async deactivateUser(orgId, userId) {
    try {
      const response = await api.put(`/api/organizations/${orgId}/users/${userId}/deactivate`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  async deleteUser(userId) {
    try {
      console.log('👤 Deleting user with super admin endpoint...');
      console.log('👤 User ID:', userId);
      
      // Use direct fetch with super admin endpoint
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      const url = `https://calltrackerpro-backend.vercel.app/api/super-admin/users/${userId}`;
      console.log('📡 Deleting user at URL:', url);
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      console.log('📡 User deletion response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ HTTP Error:', response.status, errorText);
        
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        } else if (response.status === 403) {
          throw new Error('Access denied. You need super admin privileges.');
        } else if (response.status === 404) {
          throw new Error('User or delete endpoint not found.');
        } else {
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
      }
      
      const result = await response.json();
      console.log('✅ User deleted successfully:', result);
      return { data: result.data || result };
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      throw error;
    }
  },

  async getUserAnalytics(userId) {
    try {
      const response = await api.get(`/api/users/${userId}/analytics`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  async getUserActivity(userId) {
    try {
      const response = await api.get(`/api/users/${userId}/activity`);
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default userService;
import api from './api';

export const authService = {
  async login(credentials) {
    try {
      console.log('🔐 Attempting login with credentials:', { 
        email: credentials.email,
        hasPassword: !!credentials.password 
      });
      
      const response = await api.post('/api/auth/login', credentials);
      
      console.log('🔐 Login response received:', {
        success: !!response.success,
        hasToken: !!response.token,
        hasUser: !!response.user,
        message: response.message
      });
      
      if (response.success && response.token && response.user) {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        console.log('✅ Login successful, user stored:', response.user.email);
        return response;
      } else {
        console.error('❌ Login failed - invalid response structure:', response);
        throw new Error(response.message || 'Invalid response from server');
      }
    } catch (error) {
      console.error('🚨 Login error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Provide more helpful error messages
      if (error.response?.status === 401) {
        const message = error.response?.data?.message || 'Invalid credentials';
        if (message.includes('Invalid credentials')) {
          throw new Error('Invalid email or password. Please check your credentials or contact your system administrator if no users exist in the system.');
        }
        throw new Error(message);
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred during login. Please try again or contact support.');
      } else if (!error.response) {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      }
      
      throw error;
    }
  },

  async logout() {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  },

  async getCurrentUser() {
    try {
      const response = await api.get('/api/auth/me');
      return response;
    } catch (error) {
      throw error;
    }
  },

  async refreshToken() {
    try {
      const response = await api.post('/api/auth/refresh');
      
      if (response.token) {
        localStorage.setItem('authToken', response.token);
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  },

  getStoredUser() {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      return null;
    }
  },

  getStoredToken() {
    return localStorage.getItem('authToken');
  },

  isAuthenticated() {
    const token = this.getStoredToken();
    const user = this.getStoredUser();
    return !!(token && user);
  },

  isSuperAdmin() {
    const user = this.getStoredUser();
    return user?.role === 'super_admin';
  }
};

export default authService;
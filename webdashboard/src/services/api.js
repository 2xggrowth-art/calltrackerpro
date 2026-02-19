import axios from 'axios';

// Primary API endpoint - CallTrackerPro backend (NO /api suffix - added in individual calls)
const PRIMARY_API_URL = 'https://calltrackerpro-backend.vercel.app';
const FALLBACK_URLS = [
  // Disabled fallbacks due to SSL certificate issues
  // 'https://76.76.21.21',
  // 'https://64.29.17.131'
];

// Use environment URL or fallback to primary (NO /api suffix)
// Strip /api suffix if it exists in environment variable
const getCleanApiUrl = () => {
  const envUrl = process.env.REACT_APP_API_URL || PRIMARY_API_URL;
  return envUrl.endsWith('/api') ? envUrl.slice(0, -4) : envUrl;
};
const API_BASE_URL = getCleanApiUrl();

// Debug logging for API configuration
console.log('🔧 API Configuration:', {
  REACT_APP_API_URL: process.env.REACT_APP_API_URL,
  PRIMARY_API_URL: PRIMARY_API_URL,
  Final_API_BASE_URL: API_BASE_URL
});

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Increased timeout for real-time features
  headers: {
    'Content-Type': 'application/json',
  },
});

// Store current API URL for fallback mechanism
let currentApiUrl = API_BASE_URL;
let fallbackIndex = 0;

// Request interceptor to add auth token and organization context
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    const currentOrganization = localStorage.getItem('currentOrganization');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add organization context for multi-tenant data isolation
    // Skip X-Organization-ID header for endpoints with CORS preflight caching issues
    const skipOrgHeaderEndpoints = [
      '/auth/login',
      '/call-logs',
      '/tickets',
      '/notifications'
    ];
    const shouldSkipOrgHeader = skipOrgHeaderEndpoints.some(endpoint => 
      config.url?.includes(endpoint)
    );
    
    if (currentOrganization && !shouldSkipOrgHeader) {
      const orgData = JSON.parse(currentOrganization);
      config.headers['X-Organization-ID'] = orgData._id || orgData.id;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling with fallback support
api.interceptors.response.use(
  (response) => {
    // Reset fallback index on successful response
    fallbackIndex = 0;
    return response.data;
  },
  async (error) => {
    console.error('🚨 API Error Details:', {
      message: error.message,
      response: error.response,
      request: error.request,
      status: error.response?.status,
      data: error.response?.data,
      code: error.code,
      currentUrl: currentApiUrl
    });

    // Handle network errors with fallback mechanism
    if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK' || !error.response) {
      if (fallbackIndex < FALLBACK_URLS.length) {
        const fallbackUrl = FALLBACK_URLS[fallbackIndex];
        console.log(`🔄 Trying fallback API: ${fallbackUrl}`);
        
        // Update API base URL
        api.defaults.baseURL = fallbackUrl;
        currentApiUrl = fallbackUrl;
        fallbackIndex++;
        
        // Retry the original request
        return api.request(error.config);
      }
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('currentOrganization');
      window.location.href = '/admin/login';
    }

    // Handle different types of errors more clearly
    if (error.response) {
      // Server responded with error status
      return Promise.reject(error.response.data || { message: `Server error: ${error.response.status}` });
    } else if (error.request) {
      // Request was made but no response received (network error, CORS, etc.)
      return Promise.reject({ 
        message: 'Network error: Unable to reach server. All fallback URLs have been tried.',
        type: 'network_error',
        originalError: error.message
      });
    } else {
      // Something else happened
      return Promise.reject({ 
        message: error.message || 'Unknown error occurred',
        type: 'unknown_error'
      });
    }
  }
);

// Utility functions for API management
export const getCurrentApiUrl = () => currentApiUrl;
export const resetApiUrl = () => {
  api.defaults.baseURL = API_BASE_URL;
  currentApiUrl = API_BASE_URL;
  fallbackIndex = 0;
};

export default api;
/**
 * Role-Based API Routing Utility
 * 
 * This utility provides role-based endpoint routing and permission checking
 * based on the backend's multi-tenant architecture analysis.
 */

const BASE_URL = 'https://calltrackerpro-backend.vercel.app';

/**
 * Get the appropriate API endpoint based on user role and context
 */
export const getApiEndpoint = (userRole, organizationId = null, operation = null) => {
  const baseEndpoints = {
    super_admin: '/api/super-admin',
    org_admin: organizationId ? `/api/organizations/${organizationId}` : '/api/organizations',
    manager: organizationId ? `/api/organizations/${organizationId}` : '/api/organizations',
    agent: organizationId ? `/api/organizations/${organizationId}` : '/api/organizations',
    viewer: organizationId ? `/api/organizations/${organizationId}` : '/api/organizations'
  };

  const endpoint = baseEndpoints[userRole];
  if (!endpoint) {
    throw new Error(`Unsupported user role: ${userRole}`);
  }

  return endpoint;
};

/**
 * Role-based permissions mapping based on backend analysis
 */
export const rolePermissions = {
  super_admin: [
    'ALL', // Super admin has all permissions
    'manage_all_organizations',
    'view_all_users',
    'manage_all_users',
    'view_system_analytics',
    'manage_billing_all'
  ],
  org_admin: [
    'manage_organization',
    'view_all_users',
    'manage_user_roles', 
    'manage_teams',
    'manage_billing',
    'view_organization_analytics',
    'manage_subscriptions'
  ],
  manager: [
    'view_all_users',
    'manage_teams',
    'view_organization_analytics',
    'view_team_data'
  ],
  agent: [
    'view_own_data',
    'manage_own_profile',
    'view_assigned_tasks'
  ],
  viewer: [
    'view_own_data',
    'view_reports'
  ]
};

/**
 * Check if user has specific permission
 */
export const hasPermission = (userRole, permission) => {
  const permissions = rolePermissions[userRole] || [];
  return permissions.includes('ALL') || permissions.includes(permission);
};

/**
 * Get organization-scoped endpoint for non-super-admin users
 */
export const getOrganizationEndpoint = (userRole, organizationId, resource) => {
  if (userRole === 'super_admin') {
    return `/api/super-admin/${resource}`;
  }
  
  if (!organizationId) {
    throw new Error('Organization ID required for non-super-admin users');
  }
  
  return `/api/organizations/${organizationId}/${resource}`;
};

/**
 * Role-based API client factory
 */
export const createRoleBasedApiClient = (user) => {
  const { role, organizationId } = user;
  
  const makeRequest = async (endpoint, options = {}) => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      throw new Error('No authentication token found. Please log in again.');
    }

    const url = `${BASE_URL}${endpoint}`;
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
        ...options.headers
      }
    };

    const finalOptions = { ...defaultOptions, ...options };
    
    console.log(`🔐 API Request [${role}]:`, url);
    console.log(`🔐 Request headers:`, finalOptions.headers);
    console.log(`🔐 Token preview:`, authToken ? `${authToken.substring(0, 20)}...` : 'None');
    
    const response = await fetch(url, finalOptions);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error [${role}]:`, response.status, errorText);
      
      if (response.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      } else if (response.status === 403) {
        throw new Error('Access denied. You don\'t have permission for this action.');
      } else if (response.status === 404) {
        throw new Error('Resource not found or endpoint not available for your role.');
      } else {
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
    }
    
    const result = await response.json();
    console.log(`✅ API Success [${role}]:`, result);
    return { data: result.data || result };
  };

  return {
    // Organizations
    getOrganizations: () => {
      if (role === 'super_admin') {
        return makeRequest('/api/super-admin/organizations');
      } else {
        // For non-super-admin, get their specific organization
        return makeRequest(`/api/organizations/${organizationId}`).then(result => ({
          data: [result.data] // Wrap single org in array for consistency
        }));
      }
    },

    // Users  
    getUsers: () => {
      if (role === 'super_admin') {
        return makeRequest('/api/super-admin/users');
      } else if (['org_admin', 'manager'].includes(role)) {
        return makeRequest(`/api/organizations/${organizationId}/users`);
      } else {
        throw new Error('Access denied. Insufficient permissions to view users.');
      }
    },

    getOrganizationUsers: (orgId) => {
      if (role === 'super_admin') {
        return makeRequest(`/api/super-admin/organizations/${orgId}/users`);
      } else if (['org_admin', 'manager'].includes(role) && orgId === organizationId) {
        return makeRequest(`/api/organizations/${organizationId}/users`);
      } else {
        throw new Error('Access denied. You can only view users from your organization.');
      }
    },

    // User management
    createUser: (userData) => {
      if (role === 'super_admin') {
        return makeRequest('/api/super-admin/users', {
          method: 'POST',
          body: JSON.stringify(userData)
        });
      } else if (role === 'org_admin') {
        return makeRequest(`/api/organizations/${organizationId}/users`, {
          method: 'POST', 
          body: JSON.stringify(userData)
        });
      } else {
        throw new Error('Access denied. Insufficient permissions to create users.');
      }
    },

    updateUser: (userId, userData) => {
      if (role === 'super_admin') {
        return makeRequest(`/api/super-admin/users/${userId}`, {
          method: 'PUT',
          body: JSON.stringify(userData)
        });
      } else if (['org_admin', 'manager'].includes(role)) {
        return makeRequest(`/api/organizations/${organizationId}/users/${userId}`, {
          method: 'PUT',
          body: JSON.stringify(userData)
        });
      } else {
        throw new Error('Access denied. Insufficient permissions to update users.');
      }
    },

    deleteUser: (userId) => {
      if (role === 'super_admin') {
        return makeRequest(`/api/super-admin/users/${userId}`, {
          method: 'DELETE'
        });
      } else if (role === 'org_admin') {
        return makeRequest(`/api/organizations/${organizationId}/users/${userId}`, {
          method: 'DELETE'
        });
      } else {
        throw new Error('Access denied. Insufficient permissions to delete users.');
      }
    },

    // Organization management
    createOrganization: (orgData) => {
      if (role === 'super_admin') {
        return makeRequest('/api/super-admin/organizations', {
          method: 'POST',
          body: JSON.stringify(orgData)
        });
      } else {
        throw new Error('Access denied. Only super admins can create organizations.');
      }
    },

    updateOrganization: (orgId, orgData) => {
      if (role === 'super_admin') {
        return makeRequest(`/api/super-admin/organizations/${orgId}`, {
          method: 'PUT',
          body: JSON.stringify(orgData)
        });
      } else if (role === 'org_admin' && orgId === organizationId) {
        return makeRequest(`/api/organizations/${organizationId}`, {
          method: 'PUT',
          body: JSON.stringify(orgData)
        });
      } else {
        throw new Error('Access denied. You can only update your own organization.');
      }
    },

    deleteOrganization: (orgId) => {
      if (role === 'super_admin') {
        return makeRequest(`/api/super-admin/organizations/${orgId}`, {
          method: 'DELETE'
        });
      } else {
        throw new Error('Access denied. Only super admins can delete organizations.');
      }
    },

    // Get single organization
    getOrganization: (orgId) => {
      if (role === 'super_admin') {
        return makeRequest(`/api/super-admin/organizations/${orgId}`);
      } else if (['org_admin', 'manager'].includes(role) && orgId === organizationId) {
        return makeRequest(`/api/organizations/${organizationId}`);
      } else {
        throw new Error('Access denied. You can only access your own organization.');
      }
    }
  };
};

/**
 * Dashboard route permissions based on role
 */
export const getDashboardRoutes = (userRole) => {
  const routes = {
    super_admin: [
      'organizations',
      'users', 
      'analytics',
      'settings',
      'overview'
    ],
    org_admin: [
      'users',
      'teams',
      'analytics',
      'settings',
      'overview',
      'billing'
    ],
    manager: [
      'users',
      'teams', 
      'analytics',
      'overview'
    ],
    agent: [
      'overview',
      'profile',
      'tasks'
    ],
    viewer: [
      'overview',
      'reports',
      'profile'
    ]
  };

  return routes[userRole] || ['overview'];
};

const roleBasedApi = {
  getApiEndpoint,
  rolePermissions,
  hasPermission,
  getOrganizationEndpoint,
  createRoleBasedApiClient,
  getDashboardRoutes
};

export default roleBasedApi;
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/auth';

const AuthContext = createContext();

// DEV MODE: Mock user for UI development without backend
const DEV_MOCK_USER = {
  _id: 'dev-user-001',
  id: 'dev-user-001',
  name: 'Dev Admin',
  email: 'admin@dev.local',
  role: 'super_admin',
  organizationId: 'dev-org-001',
};

const initialState = {
  user: DEV_MOCK_USER,
  isAuthenticated: true,
  isLoading: false,
  error: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const user = authService.getStoredUser();
          console.log('🔐 Auth initialization - stored user:', user);
          console.log('🔐 User role:', user?.role);
          console.log('🔐 User organization ID:', user?.organizationId);
          dispatch({ type: 'LOGIN_SUCCESS', payload: { user } });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await authService.login(credentials);
      console.log('🔐 Login success - user data:', response.user);
      console.log('🔐 Login success - user role:', response.user?.role);
      console.log('🔐 Login success - user organization ID:', response.user?.organizationId);
      dispatch({ type: 'LOGIN_SUCCESS', payload: response });
      return response;
    } catch (error) {
      console.error('🔐 Login failed:', error);
      dispatch({ type: 'LOGIN_FAILURE', payload: error.message || 'Login failed' });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: 'LOGOUT' });
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    login,
    logout,
    clearError,
    // Role checking methods
    isSuperAdmin: () => state.user?.role === 'super_admin',
    isOrgAdmin: () => state.user?.role === 'org_admin',
    isManager: () => state.user?.role === 'manager',
    isAgent: () => state.user?.role === 'agent',
    isViewer: () => state.user?.role === 'viewer',
    // Permission checking methods
    canManageAllOrganizations: () => state.user?.role === 'super_admin',
    canManageOrganization: () => ['super_admin', 'org_admin'].includes(state.user?.role),
    canManageTeam: () => ['super_admin', 'org_admin', 'manager'].includes(state.user?.role),
    canViewAllTickets: () => ['super_admin', 'org_admin', 'manager'].includes(state.user?.role),
    canCreateTickets: () => ['super_admin', 'org_admin', 'manager', 'agent'].includes(state.user?.role),
    canEditTickets: () => ['super_admin', 'org_admin', 'manager', 'agent'].includes(state.user?.role),
    canDeleteTickets: () => ['super_admin', 'org_admin', 'manager'].includes(state.user?.role),
    canViewAnalytics: () => ['super_admin', 'org_admin', 'manager'].includes(state.user?.role),
    canExportData: () => ['super_admin', 'org_admin', 'manager'].includes(state.user?.role),
    // Get user permissions
    getUserRole: () => state.user?.role,
    getOrganizationId: () => state.user?.organizationId,
    getUserId: () => state.user?.id || state.user?._id,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
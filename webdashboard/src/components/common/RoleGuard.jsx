import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { hasPermission } from '../../utils/roleBasedApi';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import Button from './Button';
import { useNavigate } from 'react-router-dom';

/**
 * Role-based access control component
 * Renders children only if user has required permission
 */
const RoleGuard = ({ 
  children, 
  permission, 
  fallback = null, 
  showAccessDenied = true,
  redirectTo = '/dashboard' 
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Check if user has required permission
  if (!hasPermission(user?.role, permission)) {
    // Return custom fallback if provided
    if (fallback) {
      return fallback;
    }

    // Return access denied message if showAccessDenied is true
    if (showAccessDenied) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-6">
              You don't have permission to access this resource. This area is restricted to users with{' '}
              <span className="font-semibold">{permission}</span> privileges.
            </p>
            
            <div className="space-y-3">
              <Button 
                onClick={() => navigate(redirectTo)}
                className="w-full"
              >
                Back to Dashboard
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => navigate(-1)}
                className="w-full"
              >
                Go Back
              </Button>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Need access? Contact your system administrator to request{' '}
                <span className="font-semibold">{permission}</span> privileges.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                If you believe you should have access, please contact support.
              </p>
            </div>
            
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <p className="text-xs text-gray-600">
                Current Role: <span className="font-semibold">{user?.role || 'Unknown'}</span>
              </p>
              <p className="text-xs text-gray-600">
                Required Permission: <span className="font-semibold">{permission}</span>
              </p>
            </div>
          </div>
        </div>
      );
    }

    // Return null if no fallback and showAccessDenied is false
    return null;
  }

  // User has permission, render children
  return children;
};

/**
 * Hook for checking permissions in components
 */
export const usePermissions = () => {
  const { user } = useAuth();
  
  return {
    hasPermission: (permission) => hasPermission(user?.role, permission),
    userRole: user?.role,
    isSuper: user?.role === 'super_admin',
    isOrgAdmin: user?.role === 'org_admin', 
    isManager: user?.role === 'manager',
    isAgent: user?.role === 'agent',
    isViewer: user?.role === 'viewer'
  };
};

/**
 * Component that conditionally renders content based on role
 */
export const ConditionalRender = ({ 
  permission, 
  children, 
  fallback = null,
  role = null 
}) => {
  const { user } = useAuth();
  
  // Check by permission if provided
  if (permission) {
    return hasPermission(user?.role, permission) ? children : fallback;
  }
  
  // Check by role if provided
  if (role) {
    return user?.role === role ? children : fallback;
  }
  
  // No conditions provided, render children
  return children;
};

export default RoleGuard;
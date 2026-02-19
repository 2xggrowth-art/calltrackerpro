import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ 
  children, 
  requireSuperAdmin = false, 
  allowedRoles = [],
  requirePermission = null 
}) => {
  const auth = useAuth();
  const { isAuthenticated, isLoading, user } = auth;
  const location = useLocation();
  

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check for super admin requirement (legacy support)
  if (requireSuperAdmin && user?.role !== 'super_admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check for specific roles
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check for specific permissions using auth context methods
  if (requirePermission) {
    const hasPermission = auth[requirePermission] && auth[requirePermission]();
    if (!hasPermission) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
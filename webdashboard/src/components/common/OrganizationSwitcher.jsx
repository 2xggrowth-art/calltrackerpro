import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDownIcon,
  CheckIcon,
  BuildingOfficeIcon,
  PlusIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { organizationService } from '../../services/organizationService';
import { realTimeService } from '../../services/realTimeService';
import toast from 'react-hot-toast';

const OrganizationSwitcher = ({ className = '' }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [currentOrganization, setCurrentOrganization] = useState(null);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const fetchUserOrganizations = useCallback(async () => {
    try {
      // For super admin, fetch all organizations
      if (user?.role === 'super_admin') {
        const response = await organizationService.getAllOrganizations();
        setOrganizations(response.data || []);
      } else {
        // For other users, get organizations from user profile
        const userOrgs = user?.organizations || [];
        setOrganizations(userOrgs);
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
      toast.error('Failed to load organizations');
    }
  }, [user?.role, user?.organizations]);

  const loadCurrentOrganization = useCallback(() => {
    const saved = localStorage.getItem('currentOrganization');
    if (saved) {
      try {
        const org = JSON.parse(saved);
        setCurrentOrganization(org);
      } catch (error) {
        console.error('Error parsing saved organization:', error);
        localStorage.removeItem('currentOrganization');
      }
    } else if (user?.organizationId) {
      // Fallback to user's primary organization
      const primaryOrg = {
        _id: user.organizationId,
        name: user.organizationName || 'My Organization'
      };
      setCurrentOrganization(primaryOrg);
      localStorage.setItem('currentOrganization', JSON.stringify(primaryOrg));
    }
  }, [user?.organizationId, user?.organizationName]);

  useEffect(() => {
    fetchUserOrganizations();
    loadCurrentOrganization();
  }, [fetchUserOrganizations, loadCurrentOrganization]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOrganizationSwitch = async (organization) => {
    if (currentOrganization?._id === organization._id) {
      setIsOpen(false);
      return;
    }

    setLoading(true);
    
    try {
      // Save to localStorage for persistence
      localStorage.setItem('currentOrganization', JSON.stringify(organization));
      setCurrentOrganization(organization);
      
      // Reinitialize real-time services with new organization context
      realTimeService.disconnect();
      realTimeService.initializeSSE(organization._id);
      realTimeService.initializeWebSocket(organization._id);
      
      // Refresh the page to reload data with new organization context
      window.location.reload();
      
      toast.success(`Switched to ${organization.name}`);
    } catch (error) {
      console.error('Error switching organization:', error);
      toast.error('Failed to switch organization');
    } finally {
      setLoading(false);
      setIsOpen(false);
    }
  };

  const getOrganizationDisplayName = (org) => {
    if (!org) return 'Select Organization';
    return org.name || org.organizationName || `Organization ${org._id?.slice(-8)}`;
  };

  const getOrganizationMetrics = (org) => {
    return {
      userCount: org.userCount || org.members?.length || 0,
      activeTickets: org.activeTickets || 0,
      role: org.role || user?.role
    };
  };

  if (!user) return null;

  // Don't show for users with only one organization (unless super admin)
  const shouldShowSwitcher = user.role === 'super_admin' || 
    (organizations.length > 1) || 
    (user.organizations && user.organizations.length > 1);

  if (!shouldShowSwitcher) return null;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Current Organization Display */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center justify-between px-3 py-2 text-sm 
          bg-white border border-gray-300 rounded-lg shadow-sm
          hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
          transition-all duration-200
          ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        disabled={loading}
      >
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <div className="flex-shrink-0">
            <BuildingOfficeIcon className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="min-w-0 flex-1 text-left">
            <div className="font-medium text-gray-900 truncate">
              {getOrganizationDisplayName(currentOrganization)}
            </div>
            {currentOrganization && (
              <div className="text-xs text-gray-500 capitalize">
                {getOrganizationMetrics(currentOrganization).role?.replace('_', ' ')}
              </div>
            )}
          </div>
        </div>
        
        <ChevronDownIcon 
          className={`
            w-4 h-4 text-gray-400 transition-transform duration-200
            ${isOpen ? 'rotate-180' : ''}
          `} 
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="
              absolute top-full left-0 right-0 mt-1 z-50
              bg-white border border-gray-200 rounded-lg shadow-lg
              max-h-80 overflow-y-auto
            "
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Switch Organization
              </div>
              {user.role === 'super_admin' && (
                <div className="text-xs text-blue-600 mt-1">
                  Super Admin - All Organizations
                </div>
              )}
            </div>

            {/* Organizations List */}
            <div className="py-1">
              {organizations.map((org) => {
                const isSelected = currentOrganization?._id === org._id;
                const metrics = getOrganizationMetrics(org);
                
                return (
                  <button
                    key={org._id}
                    onClick={() => handleOrganizationSwitch(org)}
                    className={`
                      w-full px-4 py-3 text-left hover:bg-gray-50 
                      focus:outline-none focus:bg-gray-50
                      transition-colors duration-150
                      ${isSelected ? 'bg-primary-50' : ''}
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div className={`
                          w-2 h-2 rounded-full flex-shrink-0
                          ${isSelected ? 'bg-primary-500' : 'bg-gray-300'}
                        `} />
                        
                        <div className="min-w-0 flex-1">
                          <div className={`
                            font-medium truncate text-sm
                            ${isSelected ? 'text-primary-900' : 'text-gray-900'}
                          `}>
                            {getOrganizationDisplayName(org)}
                          </div>
                          
                          <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              <UserGroupIcon className="w-3 h-3" />
                              <span>{metrics.userCount} users</span>
                            </div>
                            
                            {metrics.activeTickets > 0 && (
                              <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-orange-400 rounded-full" />
                                <span>{metrics.activeTickets} tickets</span>
                              </div>
                            )}
                            
                            <span className="capitalize">
                              {metrics.role?.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {isSelected && (
                        <CheckIcon className="w-4 h-4 text-primary-600 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Footer Actions */}
            {user.role === 'super_admin' && (
              <div className="border-t border-gray-100 py-1">
                <button
                  onClick={() => {
                    // Navigate to create organization
                    window.location.href = '/dashboard/admin/organizations?action=create';
                  }}
                  className="
                    w-full px-4 py-2 text-left text-sm text-gray-700
                    hover:bg-gray-50 focus:outline-none focus:bg-gray-50
                    flex items-center space-x-2
                  "
                >
                  <PlusIcon className="w-4 h-4 text-gray-400" />
                  <span>Create New Organization</span>
                </button>
              </div>
            )}

            {/* Empty State */}
            {organizations.length === 0 && (
              <div className="px-4 py-6 text-center">
                <BuildingOfficeIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <div className="text-sm text-gray-600 mb-2">No organizations found</div>
                <div className="text-xs text-gray-500">
                  Contact your administrator to get access to organizations
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
        </div>
      )}
    </div>
  );
};

export default OrganizationSwitcher;
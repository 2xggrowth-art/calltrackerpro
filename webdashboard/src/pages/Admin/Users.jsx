import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  UsersIcon, 
  MagnifyingGlassIcon, 
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  UserCircleIcon,
  ShieldCheckIcon,
  ClockIcon,
  ChartBarIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { Card, Button, Input, Modal } from '../../components/common';
import { userService } from '../../services/userService';
import { organizationService } from '../../services/organizationService';
import { useAuth } from '../../contexts/AuthContext';
import { createRoleBasedApiClient, hasPermission } from '../../utils/roleBasedApi';
import toast from 'react-hot-toast';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [organizationFilter, setOrganizationFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [loading, setLoading] = useState(true);
  const [organizations, setOrganizations] = useState([]);
  const { user } = useAuth();

  const fetchUsers = useCallback(async () => {
      try {
        console.log('👥 Fetching users with role-based access...');
        console.log('👥 User role:', user?.role);
        console.log('👥 User organization ID:', user?.organizationId);
        
        // Check if user has permission to view users
        if (!hasPermission(user?.role, 'view_all_users')) {
          console.log('🚫 Access denied: User does not have permission to view users');
          toast.error('Access denied. You don\'t have permission to view users.');
          setUsers([]);
          setLoading(false);
          return;
        }
        
        // Use role-based API client
        const apiClient = createRoleBasedApiClient(user);
        
        // Fetch both users and organizations for name mapping
        const [usersResponse, organizationsResponse] = await Promise.all([
          apiClient.getUsers(),
          apiClient.getOrganizations().catch(() => ({ data: [] })) // Fallback if orgs fail
        ]);
        
        console.log('👥 Users response:', usersResponse);
        console.log('🏢 Organizations response:', organizationsResponse);
        
        // Create organization ID to name mapping
        const orgMap = {};
        if (organizationsResponse?.data) {
          organizationsResponse.data.forEach(org => {
            if (org._id || org.id) {
              orgMap[org._id || org.id] = org.name;
            }
          });
        }
        console.log('🗺️ Organization mapping:', orgMap);

        // Transform backend user data to match frontend structure
        const transformedUsers = usersResponse?.data?.map(backendUser => {
          // Debug individual user data
          console.log('👤 Processing user:', backendUser);
          console.log('👤 User organization field:', backendUser.organizationId);
          console.log('👤 User login history:', backendUser.loginHistory);
          console.log('👤 User last login:', backendUser.lastLoginAt);
          console.log('👤 User created:', backendUser.createdAt);
          
          // Handle organization name using the mapping - with null safety
          let organizationName = 'No Organization';
          let organizationInfo = null;
          
          if (backendUser.organizationId) {
            if (typeof backendUser.organizationId === 'object' && backendUser.organizationId?.name) {
              organizationName = backendUser.organizationId.name;
              organizationInfo = backendUser.organizationId;
            } else if (typeof backendUser.organizationId === 'string') {
              // Look up the organization name from our mapping
              organizationInfo = orgMap[backendUser.organizationId];
              organizationName = organizationInfo || `Org-${backendUser.organizationId.slice(-8)}`;
            }
          } else {
            // No organization (like super admin)
            organizationName = backendUser.role === 'super_admin' ? 'System Admin' : 'No Organization';
            organizationInfo = null;
          }
          
          // Handle user name properly
          const userName = backendUser.fullName || 
                          `${backendUser.firstName || ''} ${backendUser.lastName || ''}`.trim() ||
                          backendUser.name ||
                          backendUser.email?.split('@')[0] ||
                          'Unknown User';
          
          // Handle login statistics 
          const loginHistory = backendUser.loginHistory || [];
          let loginCount = 'N/A';
          
          if (loginHistory.length > 0) {
            loginCount = loginHistory.length;
          } else if (backendUser.loginCount) {
            loginCount = backendUser.loginCount;
          } else if (backendUser.lastLoginAt) {
            // If user has lastLoginAt but no loginHistory, assume at least 1 login
            loginCount = 1;
          }
          
          // Handle last login date - backend doesn't track this yet  
          const lastLoginDate = backendUser.lastLoginAt || backendUser.lastLogin || backendUser.updatedAt;
          const lastActive = lastLoginDate ? 
                           new Date(lastLoginDate).toLocaleDateString() : 
                           'Not tracked';
          
          return {
            id: backendUser._id || backendUser.id,
            name: userName,
            email: backendUser.email,
            phone: backendUser.phone || 'Not provided',
            avatar: backendUser.avatar,
            status: backendUser.isActive !== false ? 'active' : 'suspended',
            role: backendUser.role,
            organization: organizationName,
            organizationId: backendUser.organizationId && typeof backendUser.organizationId === 'object' ? 
                          backendUser.organizationId._id : 
                          backendUser.organizationId,
            joinedAt: backendUser.createdAt ? 
                     new Date(backendUser.createdAt).toLocaleDateString() : 
                     'Unknown',
            lastActive: lastActive,
            loginCount: loginCount,
            permissions: Object.keys(backendUser.permissions || {}).filter(key => backendUser.permissions[key]),
            activity: {
              sessionsToday: backendUser.sessionsToday || 'N/A',
              avgSessionTime: backendUser.avgSessionTime || 'N/A',
              totalCalls: backendUser.totalCalls || backendUser.callCount || 'N/A',
              lastLogin: lastLoginDate
            },
            analytics: {
              callsThisMonth: backendUser.callsThisMonth || backendUser.monthlyCallCount || 'N/A',
              successRate: backendUser.successRate ? `${backendUser.successRate}%` : 'N/A',
              avgCallDuration: backendUser.avgCallDuration || 'N/A',
              conversionRate: backendUser.conversionRate ? `${backendUser.conversionRate}%` : 'N/A'
            }
          };
        }) || [];

        setUsers(transformedUsers);

        // Extract unique organizations
        const uniqueOrgs = [...new Set(transformedUsers.map(u => u.organization))].filter(Boolean);
        setOrganizations(uniqueOrgs);

      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }, [user]);

  const refreshUsers = async () => {
    setLoading(true);
    await fetchUsers();
  };

  useEffect(() => {
    if (user) {
      fetchUsers();
    }
  }, [user, fetchUsers]);

  // Set up real-time updates for user changes
  useEffect(() => {
    const handleUserUpdate = (data) => {
      if (data.type === 'user-created' || data.type === 'user-updated' || data.type === 'user-deleted') {
        fetchUsers(); // Refresh user list
        toast.success(`User ${data.type.replace('user-', '')} successfully`);
      }
    };

    // Listen for real-time user updates (if notification service is available)
    if (typeof window !== 'undefined' && window.notificationService) {
      window.notificationService.addEventListener('user-created', handleUserUpdate);
      window.notificationService.addEventListener('user-updated', handleUserUpdate);
      window.notificationService.addEventListener('user-deleted', handleUserUpdate);
    }

    return () => {
      if (typeof window !== 'undefined' && window.notificationService) {
        window.notificationService.removeEventListener('user-created');
        window.notificationService.removeEventListener('user-updated');
        window.notificationService.removeEventListener('user-deleted');
      }
    };
  }, [fetchUsers]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.organization || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesOrg = organizationFilter === 'all' || user.organization === organizationFilter;
    
    return matchesSearch && matchesStatus && matchesRole && matchesOrg;
  });

  const handleModal = (type, user = null) => {
    setModalType(type);
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
      suspended: { color: 'bg-red-100 text-red-800', icon: XCircleIcon },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: ExclamationTriangleIcon }
    };
    
    const config = statusConfig[status];
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const roleColors = {
      super_admin: 'bg-red-100 text-red-800',
      org_admin: 'bg-purple-100 text-purple-800',
      manager: 'bg-blue-100 text-blue-800',
      agent: 'bg-green-100 text-green-800',
      viewer: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[role] || 'bg-gray-100 text-gray-800'}`}>
        {role?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown'}
      </span>
    );
  };

  const getActivityStatus = (lastActive) => {
    if (!lastActive) return 'Never';
    const now = new Date();
    const lastActiveDate = new Date(lastActive);
    const diffHours = Math.floor((now - lastActiveDate) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Online';
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Users</h1>
            <p className="text-gray-600 mt-2">
              Manage all users across the platform
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              onClick={refreshUsers}
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
            <Button
              onClick={() => handleModal('create')}
              className="flex items-center space-x-2"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Add User</span>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-primary-gradient rounded-lg flex items-center justify-center">
              <UsersIcon className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-semibold text-gray-900">{users.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-secondary-gradient rounded-lg flex items-center justify-center">
              <CheckCircleIcon className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-semibold text-gray-900">
                {users.filter(u => u.status === 'active').length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-accent-gradient rounded-lg flex items-center justify-center">
              <ClockIcon className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Online Now</p>
              <p className="text-2xl font-semibold text-gray-900">
                {users.filter(u => getActivityStatus(u.lastActive) === 'Online').length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
              <ExclamationTriangleIcon className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">
                {users.filter(u => u.status === 'pending').length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search users by name, email, or organization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={MagnifyingGlassIcon}
            />
          </div>
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
            </select>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">All Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="org_admin">Org Admin</option>
              <option value="manager">Manager</option>
              <option value="agent">Agent</option>
              <option value="viewer">Viewer</option>
            </select>
            <select
              value={organizationFilter}
              onChange={(e) => setOrganizationFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">All Organizations</option>
              {organizations.map(org => (
                <option key={org} value={org}>{org}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Users List */}
      {loading ? (
        <Card className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-primary-gradient rounded-full flex items-center justify-center">
                    <UserCircleIcon className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <span className="flex items-center">
                        <EnvelopeIcon className="w-4 h-4 mr-1" />
                        {user.email}
                      </span>
                      <span className="flex items-center">
                        <PhoneIcon className="w-4 h-4 mr-1" />
                        {user.phone}
                      </span>
                      <span className="flex items-center">
                        <BuildingOfficeIcon className="w-4 h-4 mr-1" />
                        {user.organization}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {getStatusBadge(user.status)}
                  {getRoleBadge(user.role)}
                  <span className="text-sm text-gray-500">
                    {getActivityStatus(user.lastActive)}
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <CalendarIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-lg font-bold text-gray-900">{user.loginCount}</span>
                  </div>
                  <p className="text-xs text-gray-600">Total Logins</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <ClockIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-lg font-bold text-gray-900">{user.activity.sessionsToday}</span>
                  </div>
                  <p className="text-xs text-gray-600">Sessions Today</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <ChartBarIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-lg font-bold text-gray-900">{user.analytics.callsThisMonth}</span>
                  </div>
                  <p className="text-xs text-gray-600">Calls This Month</p>
                </div>
                
                <div className="text-center">
                  <span className="text-lg font-bold text-gray-900">{user.analytics.successRate}%</span>
                  <p className="text-xs text-gray-600">Success Rate</p>
                </div>
                
                <div className="text-center">
                  <span className="text-lg font-bold text-gray-900">{user.analytics.conversionRate}%</span>
                  <p className="text-xs text-gray-600">Conversion Rate</p>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleModal('view', user)}
                  className="flex items-center space-x-1"
                >
                  <EyeIcon className="w-4 h-4" />
                  <span>View</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleModal('activity', user)}
                  className="flex items-center space-x-1"
                >
                  <ClockIcon className="w-4 h-4" />
                  <span>Activity</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleModal('permissions', user)}
                  className="flex items-center space-x-1"
                >
                  <ShieldCheckIcon className="w-4 h-4" />
                  <span>Permissions</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleModal('analytics', user)}
                  className="flex items-center space-x-1"
                >
                  <ChartBarIcon className="w-4 h-4" />
                  <span>Analytics</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleModal('edit', user)}
                  className="flex items-center space-x-1"
                >
                  <PencilIcon className="w-4 h-4" />
                  <span>Edit</span>
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleModal('delete', user)}
                  className="flex items-center space-x-1"
                >
                  <TrashIcon className="w-4 h-4" />
                  <span>Delete</span>
                </Button>
              </div>
            </Card>
          ))}
          
          {filteredUsers.length === 0 && (
            <Card className="p-8 text-center">
              <UsersIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-600">
                {searchTerm ? 'Try adjusting your search terms or filters.' : 'Get started by adding your first user.'}
              </p>
            </Card>
          )}
        </div>
      )}

      {/* Modal for different actions */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          modalType === 'create' ? 'Add New User' :
          modalType === 'edit' ? 'Edit User' :
          modalType === 'view' ? 'User Details' :
          modalType === 'activity' ? 'User Activity' :
          modalType === 'permissions' ? 'Role & Permissions' :
          modalType === 'analytics' ? 'User Analytics' :
          modalType === 'delete' ? 'Delete User' : ''
        }
        size={modalType === 'analytics' || modalType === 'activity' ? 'xl' : 'lg'}
      >
        <ModalContent 
          modalType={modalType} 
          user={selectedUser} 
          onClose={() => setIsModalOpen(false)}
          onSuccess={refreshUsers}
        />
      </Modal>
    </div>
  );
};

// Modal Content Component
const ModalContent = ({ modalType, user, onClose, onSuccess }) => {
  switch (modalType) {
    case 'create':
    case 'edit':
      return <UserForm user={user} isEdit={modalType === 'edit'} onClose={onClose} onSuccess={onSuccess} />;
    case 'view':
      return <UserDetails user={user} />;
    case 'activity':
      return <UserActivity user={user} />;
    case 'permissions':
      return <UserPermissions user={user} />;
    case 'analytics':
      return <UserAnalytics user={user} />;
    case 'delete':
      return <DeleteConfirmation user={user} onClose={onClose} onSuccess={onSuccess} />;
    default:
      return null;
  }
};

// User Form Component
const UserForm = ({ user, isEdit, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    role: user?.role || 'agent',
    status: user?.status || 'active',
    organizationId: user?.organizationId || '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetch organizations for dropdown
  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const response = await organizationService.getAllOrganizations();
      setOrganizations(response.data || []);
    } catch (error) {
      console.error('Error fetching organizations:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim() && (!formData.firstName.trim() || !formData.lastName.trim())) {
      newErrors.name = 'Full name or first/last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!isEdit) {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    if (!formData.organizationId && formData.role !== 'super_admin') {
      newErrors.organization = 'Organization is required for non-super admin users';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    setLoading(true);
    
    try {
      // Find the selected organization to get its name
      const selectedOrg = organizations.find(org => (org.id || org._id) === formData.organizationId);
      
      const userData = {
        fullName: formData.fullName || `${formData.firstName} ${formData.lastName}`.trim(),
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        isActive: formData.status === 'active',
        organizationId: formData.role === 'super_admin' ? null : formData.organizationId,
        organizationName: formData.role === 'super_admin' ? null : selectedOrg?.name
      };

      if (!isEdit) {
        userData.password = formData.password;
      }

      if (isEdit) {
        // Update existing user
        await userService.updateUser(user.id, userData);
        toast.success('User updated successfully');
      } else {
        // Create new user
        await userService.createUser(userData);
        toast.success('User created successfully! They can now login with their email and password.');
      }
      
      onSuccess(); // Refresh the users list
      onClose(); // Close the modal
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error(error.response?.data?.message || error.message || `Failed to ${isEdit ? 'update' : 'create'} user`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            placeholder="John Doe"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            error={errors.name}
            required
          />
          <div></div>
          
          <Input
            label="First Name"
            placeholder="John"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          />
          <Input
            label="Last Name"
            placeholder="Doe"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Email *"
            type="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={errors.email}
            required
          />
          <Input
            label="Phone"
            placeholder="+1 (555) 123-4567"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
      </div>

      {/* Account Information */}
      <div className="space-y-4 border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900">Account Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="input-field"
              required
            >
              <option value="super_admin">Super Admin</option>
              <option value="org_admin">Organization Admin</option>
              <option value="manager">Manager</option>
              <option value="agent">Agent</option>
              <option value="viewer">Viewer</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              {formData.role === 'super_admin' && 'Full platform access across all organizations'}
              {formData.role === 'org_admin' && 'Full access within assigned organization'}
              {formData.role === 'manager' && 'Team management and oversight'}
              {formData.role === 'agent' && 'Individual ticket and call management'}
              {formData.role === 'viewer' && 'Read-only access to tickets and calls'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="input-field"
              required
            >
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        {formData.role !== 'super_admin' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Organization *</label>
            <select
              value={formData.organizationId}
              onChange={(e) => setFormData({ ...formData, organizationId: e.target.value })}
              className="input-field"
              required
              error={errors.organization}
            >
              <option value="">Select Organization</option>
              {organizations.map((org) => (
                <option key={org.id || org._id} value={org.id || org._id}>
                  {org.name}
                </option>
              ))}
            </select>
            {errors.organization && (
              <p className="mt-1 text-sm text-red-600">{errors.organization}</p>
            )}
          </div>
        )}
      </div>

      {/* Password Section (for new users only) */}
      {!isEdit && (
        <div className="space-y-4 border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900">Login Credentials</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label="Password *"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter secure password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                error={errors.password}
                required
              />
              <p className="mt-1 text-xs text-gray-500">Minimum 6 characters</p>
            </div>
            
            <div>
              <Input
                label="Confirm Password *"
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                error={errors.confirmPassword}
                required
              />
            </div>
          </div>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
              className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
            <span className="ml-2 text-sm text-gray-600">Show passwords</span>
          </label>
        </div>
      )}

      <Modal.Footer>
        <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" loading={loading} disabled={loading}>
          {loading ? 'Saving...' : (isEdit ? 'Update User' : 'Create User')}
        </Button>
      </Modal.Footer>
    </form>
  );
};

// User Details Component
const UserDetails = ({ user }) => (
  <div className="space-y-6">
    <div className="flex items-center space-x-4">
      <div className="w-20 h-20 bg-primary-gradient rounded-full flex items-center justify-center">
        <UserCircleIcon className="w-12 h-12 text-white" />
      </div>
      <div>
        <h3 className="text-xl font-semibold text-gray-900">{user?.name}</h3>
        <p className="text-gray-600">{user?.email}</p>
        <p className="text-sm text-gray-500">Joined {user?.joinedAt}</p>
      </div>
    </div>
    
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="text-sm font-medium text-gray-500">Phone</label>
        <p className="text-lg font-semibold text-gray-900">{user?.phone}</p>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-500">Organization</label>
        <p className="text-lg font-semibold text-gray-900">{user?.organization}</p>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-500">Role</label>
        <p className="text-lg font-semibold text-gray-900 capitalize">{user?.role}</p>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-500">Status</label>
        <p className="text-lg font-semibold text-gray-900 capitalize">{user?.status}</p>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-500">Total Logins</label>
        <p className="text-lg font-semibold text-gray-900">{user?.loginCount}</p>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-500">Last Active</label>
        <p className="text-lg font-semibold text-gray-900">{user?.lastActive || 'Never'}</p>
      </div>
    </div>
  </div>
);

// User Activity Component
const UserActivity = ({ user }) => {
  const mockSessions = [
    { id: 1, start: '2024-07-23 09:00', end: '2024-07-23 12:30', duration: '3h 30m', ip: '192.168.1.1' },
    { id: 2, start: '2024-07-23 13:00', end: '2024-07-23 17:00', duration: '4h 0m', ip: '192.168.1.1' },
    { id: 3, start: '2024-07-22 08:30', end: '2024-07-22 16:45', duration: '8h 15m', ip: '192.168.1.2' }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold text-gray-900">{user?.activity.sessionsToday}</p>
          <p className="text-sm text-gray-600">Sessions Today</p>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold text-gray-900">{user?.activity.avgSessionTime}</p>
          <p className="text-sm text-gray-600">Avg Session Time</p>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold text-gray-900">{user?.activity.totalCalls}</p>
          <p className="text-sm text-gray-600">Total Calls</p>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold text-gray-900">{user?.loginCount}</p>
          <p className="text-sm text-gray-600">Total Logins</p>
        </div>
      </div>
      
      <div>
        <h4 className="text-lg font-semibold mb-4">Recent Sessions</h4>
        <div className="space-y-3">
          {mockSessions.map(session => (
            <div key={session.id} className="flex justify-between items-center p-3 border rounded-lg">
              <div>
                <p className="font-medium">{session.start} - {session.end}</p>
                <p className="text-sm text-gray-600">IP: {session.ip}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">{session.duration}</p>
                <p className="text-sm text-gray-600">Duration</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// User Permissions Component
const UserPermissions = ({ user }) => {
  const [permissions, setPermissions] = useState(user?.permissions || []);
  
  const availablePermissions = [
    { id: 'users.read', name: 'View Users', description: 'Can view user information' },
    { id: 'users.write', name: 'Manage Users', description: 'Can create, edit, and delete users' },
    { id: 'organizations.read', name: 'View Organizations', description: 'Can view organization information' },
    { id: 'organizations.write', name: 'Manage Organizations', description: 'Can create, edit, and delete organizations' },
    { id: 'analytics.read', name: 'View Analytics', description: 'Can access analytics and reports' },
    { id: 'billing.read', name: 'View Billing', description: 'Can view billing information' },
    { id: 'billing.write', name: 'Manage Billing', description: 'Can manage billing and subscriptions' }
  ];

  const togglePermission = (permissionId) => {
    setPermissions(prev => 
      prev.includes(permissionId) 
        ? prev.filter(p => p !== permissionId)
        : [...prev, permissionId]
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-semibold mb-2">Current Role: {user?.role}</h4>
        <p className="text-gray-600">Manage specific permissions for this user</p>
      </div>
      
      <div className="space-y-3">
        {availablePermissions.map(permission => (
          <div key={permission.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <h5 className="font-medium">{permission.name}</h5>
              <p className="text-sm text-gray-600">{permission.description}</p>
            </div>
            <input
              type="checkbox"
              checked={permissions.includes(permission.id)}
              onChange={() => togglePermission(permission.id)}
              className="h-4 w-4 text-primary-600 rounded"
            />
          </div>
        ))}
      </div>
      
      <Modal.Footer>
        <Button variant="ghost">Cancel</Button>
        <Button>Save Permissions</Button>
      </Modal.Footer>
    </div>
  );
};

// User Analytics Component
const UserAnalytics = ({ user }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="text-center p-4 bg-blue-50 rounded-lg">
        <p className="text-2xl font-bold text-blue-900">{user?.analytics.callsThisMonth}</p>
        <p className="text-sm text-blue-600">Calls This Month</p>
      </div>
      <div className="text-center p-4 bg-green-50 rounded-lg">
        <p className="text-2xl font-bold text-green-900">{user?.analytics.successRate}%</p>
        <p className="text-sm text-green-600">Success Rate</p>
      </div>
      <div className="text-center p-4 bg-purple-50 rounded-lg">
        <p className="text-2xl font-bold text-purple-900">{user?.analytics.avgCallDuration}</p>
        <p className="text-sm text-purple-600">Avg Call Duration</p>
      </div>
      <div className="text-center p-4 bg-orange-50 rounded-lg">
        <p className="text-2xl font-bold text-orange-900">{user?.analytics.conversionRate}%</p>
        <p className="text-sm text-orange-600">Conversion Rate</p>
      </div>
    </div>
    
    <div className="bg-gray-50 p-4 rounded-lg">
      <h4 className="text-lg font-semibold mb-4">Performance Trends</h4>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Calls vs Last Month</span>
          <span className="text-green-600 font-medium">+12%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Success Rate vs Last Month</span>
          <span className="text-green-600 font-medium">+5%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Conversion Rate vs Last Month</span>
          <span className="text-red-600 font-medium">-2%</span>
        </div>
      </div>
    </div>
    
    <div>
      <h4 className="text-lg font-semibold mb-4">Behavior Insights</h4>
      <div className="space-y-2">
        <p className="text-sm">• Most active during morning hours (9 AM - 12 PM)</p>
        <p className="text-sm">• Prefers shorter call durations with higher frequency</p>
        <p className="text-sm">• Shows consistent performance week over week</p>
        <p className="text-sm">• High engagement with new prospects</p>
      </div>
    </div>
  </div>
);

// Delete Confirmation Component
const DeleteConfirmation = ({ user, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await userService.deleteUser(user.id);
      toast.success('User deleted successfully');
      onSuccess(); // Refresh the users list
      onClose(); // Close the modal
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error.message || 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
          <TrashIcon className="h-6 w-6 text-red-600" />
        </div>
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900">Delete User</h3>
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              Are you sure you want to delete <strong>{user?.name}</strong>? 
              This action cannot be undone and will permanently remove all associated data.
            </p>
          </div>
        </div>
      </div>
      <Modal.Footer>
        <Button variant="ghost" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          variant="danger" 
          onClick={handleDelete} 
          loading={loading}
          disabled={loading}
        >
          {loading ? 'Deleting...' : 'Delete User'}
        </Button>
      </Modal.Footer>
    </div>
  );
};

export default Users;
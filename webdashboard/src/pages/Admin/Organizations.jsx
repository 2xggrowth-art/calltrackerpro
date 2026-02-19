import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  BuildingOfficeIcon, 
  MagnifyingGlassIcon, 
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  UsersIcon,
  CreditCardIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { Card, Button, Input, Modal } from '../../components/common';
import RoleGuard, { ConditionalRender } from '../../components/common/RoleGuard';
import { organizationService } from '../../services/organizationService';
import { useAuth } from '../../contexts/AuthContext';
import { createRoleBasedApiClient, hasPermission } from '../../utils/roleBasedApi';
import toast from 'react-hot-toast';

const OrganizationsContent = () => {
  const [organizations, setOrganizations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchOrganizations = useCallback(async () => {
    try {
      setLoading(true);
      
      console.log('🔍 Fetching organizations with role-based access...');
      console.log('🔍 User role:', user?.role);
      console.log('🔍 User organization ID:', user?.organizationId);
      
      // Check if user has permission to view organizations
      if (!hasPermission(user?.role, 'manage_organization') && !hasPermission(user?.role, 'manage_all_organizations')) {
        console.log('🚫 Access denied: User does not have permission to view organizations');
        toast.error('Access denied. You don\'t have permission to view organizations.');
        setOrganizations([]);
        setLoading(false);
        return;
      }
      
      // Use role-based API client
      const apiClient = createRoleBasedApiClient(user);
      const response = await apiClient.getOrganizations();

      // Transform backend organization data to match frontend structure
      const transformedOrgs = response?.data?.map(backendOrg => {
        // Debug backend organization data
        console.log('🔍 Raw backend organization data:', backendOrg);
        console.log('🔍 subscriptionStatus:', backendOrg.subscriptionStatus);
        console.log('🔍 subscriptionPlan:', backendOrg.subscriptionPlan);
        console.log('🔍 plan:', backendOrg.plan);
        console.log('🔍 userCount:', backendOrg.userCount);
        console.log('🔍 users array:', backendOrg.users);
        console.log('🔍 isActive field exists:', 'isActive' in backendOrg);
        
        return {
        id: backendOrg._id || backendOrg.id,
        name: backendOrg.name,
        domain: backendOrg.domain,
        status: backendOrg.subscriptionStatus || 'pending',
        plan: backendOrg.subscriptionPlan || backendOrg.plan || 'basic',
        users: backendOrg.userCount || (backendOrg.users ? backendOrg.users.length : 0),
        billing: {
          amount: backendOrg.plan === 'basic' ? 29 : 
                  backendOrg.plan === 'professional' ? 99 : 299,
          period: 'month'
        },
        createdAt: backendOrg.createdAt ? new Date(backendOrg.createdAt).toLocaleDateString() : 'N/A',
        lastActive: backendOrg.lastActivityAt ? new Date(backendOrg.lastActivityAt).toLocaleDateString() : 'Never',
        settings: backendOrg.settings || {},
        description: backendOrg.description || '',
        // Store original backend data for debugging
        _rawData: backendOrg
      };
      }) || [];

      setOrganizations(transformedOrgs);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      toast.error('Failed to load organizations');
      setOrganizations([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const refreshOrganizations = async () => {
    await fetchOrganizations();
  };

  useEffect(() => {
    if (user) {
      fetchOrganizations();
    }
  }, [user, fetchOrganizations]);

  const filteredOrganizations = organizations.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (org.domain && org.domain.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || org.status === statusFilter;
    const matchesPlan = planFilter === 'all' || org.plan === planFilter;
    
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const handleModal = (type, org = null) => {
    setModalType(type);
    setSelectedOrg(org);
    setIsModalOpen(true);
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      active: 'bg-green-100 text-green-800',
      suspended: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPlanBadge = (plan) => {
    const planColors = {
      basic: 'bg-gray-100 text-gray-800',
      professional: 'bg-blue-100 text-blue-800',
      enterprise: 'bg-purple-100 text-purple-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${planColors[plan]}`}>
        {plan.charAt(0).toUpperCase() + plan.slice(1)}
      </span>
    );
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
            <h1 className="text-3xl font-bold text-gray-900">Organizations</h1>
            <p className="text-gray-600 mt-2">
              Manage all organizations and their configurations
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              onClick={async () => {
                console.log('🧪 Starting comprehensive API and Auth test...');
                
                // Test 1: Check authentication
                const authToken = localStorage.getItem('authToken');
                const userData = localStorage.getItem('user');
                console.log('🔐 Auth Debug:');
                console.log('  - Token exists:', !!authToken);
                console.log('  - Token length:', authToken?.length || 0);
                console.log('  - Token preview:', authToken ? `${authToken.substring(0, 10)}...` : 'None');
                console.log('  - User data:', userData ? JSON.parse(userData) : 'No user data');
                
                // Decode JWT token to see its contents (without verification)
                if (authToken) {
                  try {
                    const tokenParts = authToken.split('.');
                    if (tokenParts.length === 3) {
                      const payload = JSON.parse(atob(tokenParts[1]));
                      console.log('🔍 JWT Token Payload:', payload);
                      console.log('  - User ID:', payload.id || payload.userId || payload.sub);
                      console.log('  - Role:', payload.role);
                      console.log('  - Email:', payload.email);
                      console.log('  - Issued at:', payload.iat ? new Date(payload.iat * 1000) : 'Not set');
                      console.log('  - Expires at:', payload.exp ? new Date(payload.exp * 1000) : 'Not set');
                      console.log('  - Is expired:', payload.exp ? (payload.exp * 1000 < Date.now()) : 'Unknown');
                    }
                  } catch (decodeError) {
                    console.error('❌ Error decoding JWT token:', decodeError);
                  }
                }
                
                if (!authToken) {
                  toast.error('❌ No authentication token found!');
                  return;
                }
                
                // Test 2: Direct fetch health check
                try {
                  console.log('🧪 Test 1: Health check');
                  const directResponse = await fetch('https://calltrackerpro-backend.vercel.app/health');
                  const directData = await directResponse.json();
                  console.log('✅ Health check successful:', directData);
                  toast.success('✅ Backend server is healthy!');
                } catch (directError) {
                  console.error('❌ Health check failed:', directError);
                  toast.error('❌ Health check failed: ' + directError.message);
                  return;
                }

                // Test 3: Test new backend debug endpoint
                try {
                  console.log('🧪 Test 2: Backend debug endpoint test');
                  const debugResponse = await fetch('https://calltrackerpro-backend.vercel.app/api/super-admin/debug-auth', {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${authToken}`,
                      'Content-Type': 'application/json'
                    }
                  });
                  
                  console.log('🔍 Debug endpoint status:', debugResponse.status);
                  const debugData = await debugResponse.json();
                  console.log('🔍 Debug endpoint response:', debugData);
                  
                  if (debugResponse.ok) {
                    toast.success('✅ Debug endpoint working - check console for details');
                  } else {
                    console.error('❌ Debug endpoint error:', debugData);
                    toast.error('❌ Debug endpoint failed - check console');
                  }
                } catch (debugError) {
                  console.error('❌ Debug endpoint test failed:', debugError);
                  console.log('🔍 Fallback: Testing original super admin endpoint...');
                }

                // Test 4: Test authentication with super admin endpoint
                try {
                  console.log('🧪 Test 3: Super admin endpoint test');
                  const response = await fetch('https://calltrackerpro-backend.vercel.app/api/super-admin/organizations', {
                    method: 'GET',
                    headers: {
                      'Authorization': `Bearer ${authToken}`,
                      'Content-Type': 'application/json'
                    }
                  });
                  
                  console.log('📡 Super admin response status:', response.status);
                  const responseText = await response.text();
                  console.log('📡 Super admin response body:', responseText);
                  
                  if (response.status === 200) {
                    toast.success('✅ Authentication successful! Organization management is working!');
                  } else if (response.status === 401) {
                    toast.error('❌ Authentication failed - token invalid');
                  } else if (response.status === 403) {
                    toast.error('❌ Access denied - insufficient permissions');
                  } else if (response.status === 500) {
                    toast.error('❌ Server authentication error - check enhanced backend logs');
                  } else {
                    toast.error(`❌ Unexpected response: ${response.status}`);
                  }
                } catch (error) {
                  console.error('❌ Super admin test failed:', error);
                  toast.error('❌ Super admin test failed: ' + error.message);
                }
              }}
              className="flex items-center space-x-2"
            >
              <span>🔍</span>
              <span>Test API</span>
            </Button>
            <ConditionalRender permission="manage_all_organizations">
              <Button
                onClick={() => handleModal('create')}
                className="flex items-center space-x-2"
              >
                <PlusIcon className="w-5 h-5" />
                <span>Add Organization</span>
              </Button>
            </ConditionalRender>
          </div>
        </div>
      </motion.div>

      {/* Filters and Search */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search organizations..."
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
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">All Plans</option>
              <option value="basic">Basic</option>
              <option value="professional">Professional</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Organizations List */}
      {loading ? (
        <Card className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading organizations...</p>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredOrganizations.map((org) => (
            <Card key={org.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary-gradient rounded-lg flex items-center justify-center">
                    <BuildingOfficeIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{org.name}</h3>
                    <p className="text-gray-600">{org.domain}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  {getStatusBadge(org.status)}
                  {getPlanBadge(org.plan)}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <UsersIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-2xl font-bold text-gray-900">{org.users}</span>
                  </div>
                  <p className="text-sm text-gray-600">Users</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <CreditCardIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-2xl font-bold text-gray-900">
                      ${org.billing.amount}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{org.billing.period}</p>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-gray-600">Created</p>
                  <p className="text-sm font-semibold text-gray-900">{org.createdAt}</p>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-gray-600">Last Active</p>
                  <p className="text-sm font-semibold text-gray-900">{org.lastActive}</p>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleModal('view', org)}
                  className="flex items-center space-x-1"
                >
                  <EyeIcon className="w-4 h-4" />
                  <span>View</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleModal('users', org)}
                  className="flex items-center space-x-1"
                >
                  <UsersIcon className="w-4 h-4" />
                  <span>Users</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleModal('billing', org)}
                  className="flex items-center space-x-1"
                >
                  <CreditCardIcon className="w-4 h-4" />
                  <span>Billing</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleModal('settings', org)}
                  className="flex items-center space-x-1"
                >
                  <Cog6ToothIcon className="w-4 h-4" />
                  <span>Settings</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleModal('edit', org)}
                  className="flex items-center space-x-1"
                >
                  <PencilIcon className="w-4 h-4" />
                  <span>Edit</span>
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleModal('delete', org)}
                  className="flex items-center space-x-1"
                >
                  <TrashIcon className="w-4 h-4" />
                  <span>Delete</span>
                </Button>
              </div>
            </Card>
          ))}
          
          {filteredOrganizations.length === 0 && (
            <Card className="p-8 text-center">
              <BuildingOfficeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No organizations found</h3>
              <p className="text-gray-600">
                {searchTerm ? 'Try adjusting your search terms or filters.' : 'Get started by adding your first organization.'}
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
          modalType === 'create' ? 'Add New Organization' :
          modalType === 'edit' ? 'Edit Organization' :
          modalType === 'view' ? 'Organization Details' :
          modalType === 'users' ? 'User Management' :
          modalType === 'billing' ? 'Billing & Subscription' :
          modalType === 'settings' ? 'Organization Settings' :
          modalType === 'delete' ? 'Delete Organization' : ''
        }
        size={modalType === 'users' || modalType === 'billing' ? 'xl' : 'lg'}
      >
        <ModalContent 
          modalType={modalType} 
          organization={selectedOrg} 
          onClose={() => setIsModalOpen(false)}
          onSuccess={refreshOrganizations}
        />
      </Modal>
    </div>
  );
};

// Modal Content Component
const ModalContent = ({ modalType, organization, onClose, onSuccess }) => {
  switch (modalType) {
    case 'create':
    case 'edit':
      return <OrganizationForm organization={organization} isEdit={modalType === 'edit'} onClose={onClose} onSuccess={onSuccess} />;
    case 'view':
      return <OrganizationDetails organization={organization} />;
    case 'users':
      return <UserManagement organization={organization} />;
    case 'billing':
      return <BillingManagement organization={organization} />;
    case 'settings':
      return <OrganizationSettings organization={organization} />;
    case 'delete':
      return <DeleteConfirmation organization={organization} onClose={onClose} onSuccess={onSuccess} />;
    default:
      return null;
  }
};

// Organization Form Component
const OrganizationForm = ({ organization, isEdit, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: organization?.name || '',
    domain: organization?.domain || '',
    plan: organization?.plan || 'basic',
    status: organization?.status || 'active',
    description: organization?.description || '',
    address: organization?.address || '',
    phone: organization?.phone || '',
    website: organization?.website || ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Organization name is required';
    }

    if (!formData.domain.trim()) {
      newErrors.domain = 'Domain is required';
    } else if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.domain)) {
      newErrors.domain = 'Please enter a valid domain (e.g., company.com)';
    }

    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'Website must start with http:// or https://';
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
      const orgData = {
        name: formData.name.trim(),
        domain: formData.domain.trim(),
        plan: formData.plan,
        isActive: formData.status === 'active',
        description: formData.description.trim(),
        address: formData.address.trim(),
        phone: formData.phone.trim(),
        website: formData.website.trim(),
        settings: {
          notifications: true,
          analytics: true,
          api: false
        }
      };

      if (isEdit) {
        await organizationService.updateOrganization(organization.id, orgData);
        toast.success('Organization updated successfully');
      } else {
        console.log('🏢 Creating organization with data:', orgData);
        const response = await organizationService.createOrganization(orgData);
        console.log('✅ Organization created successfully:', response);
        
        // Show success message with admin user credentials
        console.log('🔍 Full response structure:', JSON.stringify(response, null, 2));
        
        const adminUser = response.data?.adminUser || response.data?.data?.adminUser;
        const createdOrg = response.data?.organization || response.data?.data?.organization || response.data;
        
        // Use safe property access
        const orgName = createdOrg?.name || orgData.name || 'Organization';
        const adminEmail = adminUser?.email || `admin@${orgData.domain}`;
        
        toast.success(
          `Organization "${orgName}" created successfully!\n\n` +
          `Admin User Created:\n` +
          `Email: ${adminEmail}\n` +
          `Password: TempPassword123!\n\n` +
          `Please share these credentials with the organization admin.`,
          { 
            duration: 8000,
            style: {
              maxWidth: '500px',
              whiteSpace: 'pre-line'
            }
          }
        );
      }
      
      onSuccess(); // Refresh the organizations list
      onClose(); // Close the modal
    } catch (error) {
      console.error('❌ Error saving organization:', error);
      
      // Provide detailed error information
      let errorMessage = `Failed to ${isEdit ? 'update' : 'create'} organization`;
      
      if (error.response) {
        // Server responded with error status
        console.error('Server response error:', error.response);
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        // Request was made but no response received
        console.error('Network error:', error.request);
        errorMessage = 'Network error: Unable to connect to server. Please check if the backend server is running.';
      } else {
        // Something else happened
        console.error('Request setup error:', error.message);
        errorMessage = error.message || errorMessage;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Organization Name *"
          placeholder="Enter organization name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
          required
        />
        <Input
          label="Domain *"
          placeholder="company.com"
          value={formData.domain}
          onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
          error={errors.domain}
          required
        />
      </div>

      <Input
        label="Description"
        placeholder="Brief description of the organization"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Phone"
          placeholder="+1 (555) 123-4567"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
        <Input
          label="Website"
          placeholder="https://company.com"
          value={formData.website}
          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
          error={errors.website}
        />
      </div>

      <Input
        label="Address"
        placeholder="Company address"
        value={formData.address}
        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Plan</label>
          <select
            value={formData.plan}
            onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
            className="input-field"
          >
            <option value="basic">Basic - Up to 10 users</option>
            <option value="professional">Professional - Up to 50 users</option>
            <option value="enterprise">Enterprise - Unlimited users</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="input-field"
          >
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      <Modal.Footer>
        <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" loading={loading} disabled={loading}>
          {loading ? 'Saving...' : (isEdit ? 'Update Organization' : 'Create Organization')}
        </Button>
      </Modal.Footer>
    </form>
  );
};

// Organization Details Component
const OrganizationDetails = ({ organization }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="text-sm font-medium text-gray-500">Name</label>
        <p className="text-lg font-semibold text-gray-900">{organization?.name}</p>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-500">Domain</label>
        <p className="text-lg font-semibold text-gray-900">{organization?.domain}</p>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-500">Plan</label>
        <p className="text-lg font-semibold text-gray-900 capitalize">{organization?.plan}</p>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-500">Status</label>
        <p className="text-lg font-semibold text-gray-900 capitalize">{organization?.status}</p>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-500">Users</label>
        <p className="text-lg font-semibold text-gray-900">{organization?.users}</p>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-500">Created At</label>
        <p className="text-lg font-semibold text-gray-900">{organization?.createdAt}</p>
      </div>
    </div>
  </div>
);

// User Management Component
const UserManagement = ({ organization }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      if (!organization?.id) return;
      
      try {
        setLoading(true);
        setError(null);
        console.log('👥 Fetching users for organization with role-based access:', organization.id);
        
        // Check if user has permission to view users
        if (!hasPermission(user?.role, 'view_all_users')) {
          console.log('🚫 Access denied: User does not have permission to view users');
          setError('Access denied. You don\'t have permission to view users.');
          setLoading(false);
          return;
        }
        
        // Use role-based API client
        const apiClient = createRoleBasedApiClient(user);
        const response = await apiClient.getOrganizationUsers(organization.id);
        
        console.log('👥 Users response:', response);
        
        // Backend returns users directly in response.data array
        const usersData = response?.data || [];
        console.log('👥 Parsed users data:', usersData);
        setUsers(usersData);
      } catch (error) {
        console.error('❌ Error fetching users:', error);
        setError(error.message || 'Failed to load users');
        
        // Fallback: try to use users from organization data
        if (organization._rawData?.users) {
          console.log('🔄 Using users from organization raw data');
          setUsers(organization._rawData.users);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [organization, user]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="text-lg font-semibold">Users in {organization?.name}</h4>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="text-lg font-semibold">Users in {organization?.name}</h4>
          <Button size="sm">
            <PlusIcon className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>
        <div className="text-center py-8">
          <p className="text-red-600">Error: {error}</p>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => window.location.reload()}
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-semibold">Users in {organization?.name}</h4>
        <Button size="sm">
          <PlusIcon className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>
      
      {users.length === 0 ? (
        <div className="text-center py-8">
          <UsersIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-600">This organization doesn't have any users yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map(user => {
            // Handle backend user data format
            const userId = user._id || user.id;
            const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || 'Unknown User';
            const userEmail = user.email;
            const userRole = user.role || 'user';
            const userStatus = user.isActive ? 'active' : 'inactive'; // Backend uses isActive boolean
            
            console.log('👥 Processing user:', { userId, userName, userEmail, userRole, userStatus, isActive: user.isActive });
            
            return (
              <div key={userId} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{userName}</p>
                  <p className="text-sm text-gray-600">{userEmail}</p>
                  {user.createdAt && (
                    <p className="text-xs text-gray-400">
                      Joined: {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600 capitalize">{userRole.replace('_', ' ')}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    userStatus === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {userStatus}
                  </span>
                  <Button variant="ghost" size="sm">Edit</Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Billing Management Component
const BillingManagement = ({ organization }) => (
  <div className="space-y-6">
    <div className="bg-gray-50 p-4 rounded-lg">
      <h4 className="text-lg font-semibold mb-4">Current Subscription</h4>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Plan</label>
          <p className="text-lg font-semibold text-gray-900 capitalize">{organization?.plan}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Billing Amount</label>
          <p className="text-lg font-semibold text-gray-900">
            ${organization?.billing.amount}/{organization?.billing.period}
          </p>
        </div>
      </div>
    </div>
    
    <div className="space-y-3">
      <h4 className="text-lg font-semibold">Billing History</h4>
      <div className="space-y-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex justify-between items-center p-3 border rounded-lg">
            <div>
              <p className="font-medium">Invoice #{1000 + i}</p>
              <p className="text-sm text-gray-600">July {i}, 2024</p>
            </div>
            <div className="text-right">
              <p className="font-medium">${organization?.billing.amount}</p>
              <p className="text-sm text-green-600">Paid</p>
            </div>
          </div>
        ))}
      </div>
    </div>
    
    <Modal.Footer>
      <Button variant="ghost">Download Invoice</Button>
      <Button>Update Payment Method</Button>
    </Modal.Footer>
  </div>
);

// Organization Settings Component
const OrganizationSettings = ({ organization }) => {
  const [settings, setSettings] = useState(organization?.settings || {});

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Email Notifications</h4>
            <p className="text-sm text-gray-600">Receive email updates and alerts</p>
          </div>
          <input
            type="checkbox"
            checked={settings.notifications}
            onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
            className="h-4 w-4 text-primary-600 rounded"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Analytics Tracking</h4>
            <p className="text-sm text-gray-600">Enable detailed usage analytics</p>
          </div>
          <input
            type="checkbox"
            checked={settings.analytics}
            onChange={(e) => setSettings({ ...settings, analytics: e.target.checked })}
            className="h-4 w-4 text-primary-600 rounded"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">API Access</h4>
            <p className="text-sm text-gray-600">Allow API integration access</p>
          </div>
          <input
            type="checkbox"
            checked={settings.api}
            onChange={(e) => setSettings({ ...settings, api: e.target.checked })}
            className="h-4 w-4 text-primary-600 rounded"
          />
        </div>
      </div>
      
      <Modal.Footer>
        <Button variant="ghost">Cancel</Button>
        <Button>Save Settings</Button>
      </Modal.Footer>
    </div>
  );
};

// Delete Confirmation Component
const DeleteConfirmation = ({ organization, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await organizationService.deleteOrganization(organization.id);
      toast.success('Organization deleted successfully');
      onSuccess(); // Refresh the organizations list
      onClose(); // Close the modal
    } catch (error) {
      console.error('Error deleting organization:', error);
      toast.error(error.message || 'Failed to delete organization');
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
          <h3 className="text-lg font-medium text-gray-900">Delete Organization</h3>
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              Are you sure you want to delete <strong>{organization?.name}</strong>? 
              This action cannot be undone and will permanently remove all associated data including users, tickets, and call logs.
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
          {loading ? 'Deleting...' : 'Delete Organization'}
        </Button>
      </Modal.Footer>
    </div>
  );
};

// Main Organizations component with role-based access control
const Organizations = () => {
  return (
    <RoleGuard 
      permission="manage_organization"
      fallback={
        <RoleGuard permission="manage_all_organizations">
          <OrganizationsContent />
        </RoleGuard>
      }
    >
      <OrganizationsContent />
    </RoleGuard>
  );
};

export default Organizations;
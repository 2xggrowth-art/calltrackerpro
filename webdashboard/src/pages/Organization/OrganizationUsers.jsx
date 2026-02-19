import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  UsersIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { Card, Button, Input, Modal } from '../../components/common';
import { useAuth } from '../../contexts/AuthContext';
import { createRoleBasedApiClient, hasPermission } from '../../utils/roleBasedApi';
import toast from 'react-hot-toast';

const OrganizationUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const { user } = useAuth();

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      
      if (!user?.organizationId) {
        toast.error('Organization not found');
        return;
      }

      // Check if user has permission to view users
      if (!hasPermission(user?.role, 'view_all_users')) {
        toast.error('Access denied. You don\'t have permission to view users.');
        return;
      }
      
      console.log('👥 Fetching users for organization:', user.organizationId);
      console.log('👥 User role:', user.role);
      console.log('👥 Auth token exists:', !!localStorage.getItem('authToken'));
      
      // Use role-based API client
      const apiClient = createRoleBasedApiClient(user);
      const response = await apiClient.getOrganizationUsers(user.organizationId);
      
      const usersData = response?.data || [];
      console.log('👥 Fetched users data:', usersData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      
      // For now, provide fallback data since backend endpoint is not working
      console.warn('🔄 Using fallback user data due to backend error');
      const fallbackUsers = [
        {
          _id: 'mock-user-1',
          firstName: user.firstName || 'Anas',
          lastName: user.lastName || 'User',
          email: user.email,
          role: user.role,
          isActive: true,
          createdAt: new Date().toISOString()
        }
      ];
      setUsers(fallbackUsers);
      
      toast.error(`Failed to load users from backend. Backend error: ${error.message}. Showing current user as fallback.`);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchUsers();
    }
  }, [user, fetchUsers]);

  const filteredUsers = users.filter(u => {
    const matchesSearch = (u.firstName + ' ' + u.lastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const handleModal = (type, userData = null) => {
    setModalType(type);
    setSelectedUser(userData);
    setIsModalOpen(true);
  };

  const getRoleBadge = (role) => {
    const roleColors = {
      org_admin: 'bg-purple-100 text-purple-800',
      manager: 'bg-blue-100 text-blue-800',
      agent: 'bg-green-100 text-green-800',
      viewer: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[role] || 'bg-gray-100 text-gray-800'}`}>
        {role?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </span>
    );
  };

  const getStatusBadge = (isActive) => {
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {isActive ? 'Active' : 'Inactive'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold text-gray-900">Team Members</h1>
            <p className="text-gray-600 mt-2">
              Manage users in your organization
            </p>
          </div>
          <Button
            onClick={() => handleModal('create')}
            className="flex items-center space-x-2"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Add User</span>
          </Button>
        </div>
      </motion.div>

      {/* Filters and Search */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={MagnifyingGlassIcon}
            />
          </div>
          <div className="flex gap-4">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">All Roles</option>
              <option value="org_admin">Organization Admin</option>
              <option value="manager">Manager</option>
              <option value="agent">Agent</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Users List */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            All Users ({filteredUsers.length})
          </h3>
        </div>
        
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <UsersIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first team member.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredUsers.map((userData) => (
              <div key={userData._id || userData.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary-gradient rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {(userData.firstName?.[0] || '') + (userData.lastName?.[0] || '')}
                      </span>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-900">
                        {userData.firstName} {userData.lastName}
                      </p>
                      <p className="text-gray-600">{userData.email}</p>
                      <p className="text-sm text-gray-500">
                        Joined {new Date(userData.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {getRoleBadge(userData.role)}
                    {getStatusBadge(userData.isActive)}
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleModal('view', userData)}
                        className="flex items-center space-x-1"
                      >
                        <EyeIcon className="w-4 h-4" />
                        <span>View</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleModal('edit', userData)}
                        className="flex items-center space-x-1"
                      >
                        <PencilIcon className="w-4 h-4" />
                        <span>Edit</span>
                      </Button>
                      {userData.role !== 'org_admin' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleModal('delete', userData)}
                          className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                        >
                          <TrashIcon className="w-4 h-4" />
                          <span>Delete</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Modal for different actions */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          modalType === 'create' ? 'Add New User' :
          modalType === 'edit' ? 'Edit User' :
          modalType === 'view' ? 'User Details' :
          modalType === 'delete' ? 'Delete User' : ''
        }
      >
        <div className="p-6">
          <p>User management functionality will be implemented here.</p>
          <p>Modal Type: {modalType}</p>
          {selectedUser && (
            <p>Selected User: {selectedUser.firstName} {selectedUser.lastName}</p>
          )}
        </div>
        <Modal.Footer>
          <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default OrganizationUsers;
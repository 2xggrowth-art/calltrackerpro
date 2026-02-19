import React, { useState } from 'react';
import { Button } from '../common';
import { backendSetupService } from '../../services/backendSetup';
import toast from 'react-hot-toast';
import {
  WrenchScrewdriverIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const BackendSetup = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [setupData, setSetupData] = useState({
    email: 'admin@calltrackerpro.com',
    password: 'Admin@123',
    confirmPassword: 'Admin@123',
    firstName: 'Admin',
    lastName: 'User',
    organizationName: 'CallTracker Pro'
  });
  const [testResults, setTestResults] = useState(null);

  const handleTestBackend = async () => {
    setLoading(true);
    try {
      const healthCheck = await backendSetupService.testBackendHealth();
      const endpoints = await backendSetupService.discoverEndpoints();
      const userCheck = await backendSetupService.checkUserExists();
      
      setTestResults({
        health: healthCheck,
        endpoints,
        userStatus: userCheck
      });
      
      if (healthCheck.success) {
        toast.success('Backend is accessible');
      } else {
        toast.error('Backend connectivity issues');
      }
    } catch (error) {
      toast.error('Failed to test backend');
      console.error('Backend test error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInitialUser = async () => {
    if (setupData.password !== setupData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const result = await backendSetupService.createInitialUser({
        email: setupData.email,
        password: setupData.password,
        firstName: setupData.firstName,
        lastName: setupData.lastName,
        organizationName: setupData.organizationName
      });
      
      if (result.success) {
        toast.success('Initial user created successfully!');
        onClose();
      } else {
        toast.error(`Failed to create user: ${result.error}`);
      }
    } catch (error) {
      toast.error('Error creating initial user');
      console.error('User creation error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <WrenchScrewdriverIcon className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Backend Setup</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Backend Test Section */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-medium text-gray-900">Backend Connection Test</h4>
              <Button
                onClick={handleTestBackend}
                loading={loading}
                size="sm"
                variant="outline"
              >
                Test Backend
              </Button>
            </div>
            
            {testResults && (
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-2">
                  {testResults.health.success ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircleIcon className="w-5 h-5 text-red-500" />
                  )}
                  <span>Backend Health: {testResults.health.success ? 'Connected' : 'Failed'}</span>
                </div>
                
                <div>
                  <span className="font-medium">Available Endpoints:</span>
                  <ul className="mt-1 ml-4 space-y-1">
                    {testResults.endpoints.map((endpoint, index) => (
                      <li key={index} className="text-xs font-mono">
                        {endpoint.path} 
                        {endpoint.status && <span className="text-gray-500"> ({endpoint.status})</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Initial User Creation */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h4 className="text-md font-medium text-blue-900 mb-4">Create Initial Super Admin</h4>
            <p className="text-sm text-blue-700 mb-4">
              If the backend has no users, use this form to create the first super admin account.
            </p>
            
            <form onSubmit={(e) => { e.preventDefault(); handleCreateInitialUser(); }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={setupData.firstName}
                    onChange={(e) => setSetupData({...setupData, firstName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={setupData.lastName}
                    onChange={(e) => setSetupData({...setupData, lastName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={setupData.email}
                  onChange={(e) => setSetupData({...setupData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
                <input
                  type="text"
                  value={setupData.organizationName}
                  onChange={(e) => setSetupData({...setupData, organizationName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={setupData.password}
                    onChange={(e) => setSetupData({...setupData, password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    required
                    minLength={6}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    value={setupData.confirmPassword}
                    onChange={(e) => setSetupData({...setupData, confirmPassword: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    required
                    minLength={6}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={loading}
                  disabled={loading || setupData.password !== setupData.confirmPassword}
                >
                  Create Initial User
                </Button>
              </div>
            </form>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Important Notes:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>This setup is only needed if the backend database is empty</li>
                  <li>The backend must support initial user creation endpoints</li>
                  <li>Contact your system administrator if these options don't work</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackendSetup;
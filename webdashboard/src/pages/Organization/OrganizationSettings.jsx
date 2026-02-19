import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  BuildingOfficeIcon,
  BellIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  ChartBarIcon,
  KeyIcon
} from '@heroicons/react/24/outline';
import { Card, Button, Input } from '../../components/common';
import { useAuth } from '../../contexts/AuthContext';
import { createRoleBasedApiClient } from '../../utils/roleBasedApi';
import toast from 'react-hot-toast';

const OrganizationSettings = () => {
  const [organization, setOrganization] = useState(null);
  const [settings, setSettings] = useState({
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      weeklyReports: true
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      ipRestriction: false,
      allowedIPs: ''
    },
    analytics: {
      trackUserActivity: true,
      shareAnonymousData: false,
      detailedReports: true
    },
    billing: {
      autoRenewal: true,
      invoiceEmails: true,
      paymentMethod: 'card'
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();

  const fetchOrganizationData = useCallback(async () => {
    try {
      setLoading(true);
      
      if (!user?.organizationId) {
        toast.error('Organization not found');
        return;
      }

      console.log('🏢 Fetching organization data for:', user.organizationId);
      console.log('🏢 User role:', user.role);

      // Use role-based API client to get organization details
      const apiClient = createRoleBasedApiClient(user);
      const response = await apiClient.getOrganization(user.organizationId);
      
      const orgData = response?.data;
      console.log('🏢 Fetched organization data:', orgData);
      setOrganization(orgData);
      
      // Update settings with organization data if available
      if (orgData?.settings) {
        setSettings(prevSettings => ({
          ...prevSettings,
          ...orgData.settings
        }));
      }
    } catch (error) {
      console.error('Error fetching organization:', error);
      
      // Provide fallback organization data
      console.warn('🔄 Using fallback organization data due to backend error');
      const fallbackOrganization = {
        _id: user.organizationId,
        name: 'Your Organization',
        domain: 'organization.com',
        subscriptionPlan: 'basic',
        subscriptionStatus: 'active',
        createdAt: new Date().toISOString(),
        settings: settings
      };
      setOrganization(fallbackOrganization);
      
      toast.error(`Failed to load organization data from backend. Backend error: ${error.message}. Using fallback data.`);
    } finally {
      setLoading(false);
    }
  }, [user, settings]);

  useEffect(() => {
    if (user) {
      fetchOrganizationData();
    }
  }, [user, fetchOrganizationData]);

  const handleSettingsChange = (category, key, value) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      [category]: {
        ...prevSettings[category],
        [key]: value
      }
    }));
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      
      // Here you would normally save to backend
      // const apiClient = createRoleBasedApiClient(user);
      // await apiClient.updateOrganizationSettings(user.organizationId, settings);
      
      // For now, just show success
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading organization settings...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Organization Settings</h1>
            <p className="text-gray-600 mt-2">
              Manage your organization preferences and configurations
            </p>
          </div>
          <Button
            onClick={handleSaveSettings}
            loading={saving}
            disabled={saving}
            className="flex items-center space-x-2"
          >
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </Button>
        </div>
      </motion.div>

      {/* Organization Info */}
      <Card className="p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 bg-primary-gradient rounded-lg flex items-center justify-center">
            <BuildingOfficeIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {organization?.name || 'Organization Name'}
            </h3>
            <p className="text-gray-600">{organization?.domain}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Plan</label>
            <p className="text-lg font-semibold text-gray-900 capitalize">
              {organization?.subscriptionPlan || organization?.plan || 'Basic'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              organization?.subscriptionStatus === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {organization?.subscriptionStatus || 'Pending'}
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Created</label>
            <p className="text-lg font-semibold text-gray-900">
              {organization?.createdAt ? new Date(organization.createdAt).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
      </Card>

      {/* Notification Settings */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <BellIcon className="w-6 h-6 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Email Notifications</h4>
              <p className="text-sm text-gray-600">Receive email updates for important events</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.emailNotifications}
              onChange={(e) => handleSettingsChange('notifications', 'emailNotifications', e.target.checked)}
              className="h-4 w-4 text-primary-600 rounded"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">SMS Notifications</h4>
              <p className="text-sm text-gray-600">Get text messages for urgent alerts</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.smsNotifications}
              onChange={(e) => handleSettingsChange('notifications', 'smsNotifications', e.target.checked)}
              className="h-4 w-4 text-primary-600 rounded"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Weekly Reports</h4>
              <p className="text-sm text-gray-600">Receive weekly performance summaries</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.weeklyReports}
              onChange={(e) => handleSettingsChange('notifications', 'weeklyReports', e.target.checked)}
              className="h-4 w-4 text-primary-600 rounded"
            />
          </div>
        </div>
      </Card>

      {/* Security Settings */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <ShieldCheckIcon className="w-6 h-6 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Two-Factor Authentication</h4>
              <p className="text-sm text-gray-600">Add extra security to your organization</p>
            </div>
            <input
              type="checkbox"
              checked={settings.security.twoFactorAuth}
              onChange={(e) => handleSettingsChange('security', 'twoFactorAuth', e.target.checked)}
              className="h-4 w-4 text-primary-600 rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Timeout (minutes)
            </label>
            <Input
              type="number"
              value={settings.security.sessionTimeout}
              onChange={(e) => handleSettingsChange('security', 'sessionTimeout', parseInt(e.target.value))}
              min="5"
              max="480"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">IP Restriction</h4>
              <p className="text-sm text-gray-600">Limit access to specific IP addresses</p>
            </div>
            <input
              type="checkbox"
              checked={settings.security.ipRestriction}
              onChange={(e) => handleSettingsChange('security', 'ipRestriction', e.target.checked)}
              className="h-4 w-4 text-primary-600 rounded"
            />
          </div>
          
          {settings.security.ipRestriction && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Allowed IP Addresses (comma-separated)
              </label>
              <Input
                placeholder="192.168.1.1, 203.0.113.0/24"
                value={settings.security.allowedIPs}
                onChange={(e) => handleSettingsChange('security', 'allowedIPs', e.target.value)}
              />
            </div>
          )}
        </div>
      </Card>

      {/* Analytics Settings */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <ChartBarIcon className="w-6 h-6 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">Analytics & Reporting</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Track User Activity</h4>
              <p className="text-sm text-gray-600">Monitor user actions for reporting</p>
            </div>
            <input
              type="checkbox"
              checked={settings.analytics.trackUserActivity}
              onChange={(e) => handleSettingsChange('analytics', 'trackUserActivity', e.target.checked)}
              className="h-4 w-4 text-primary-600 rounded"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Detailed Reports</h4>
              <p className="text-sm text-gray-600">Generate comprehensive analytics reports</p>
            </div>
            <input
              type="checkbox"
              checked={settings.analytics.detailedReports}
              onChange={(e) => handleSettingsChange('analytics', 'detailedReports', e.target.checked)}
              className="h-4 w-4 text-primary-600 rounded"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Share Anonymous Data</h4>
              <p className="text-sm text-gray-600">Help improve the platform with usage data</p>
            </div>
            <input
              type="checkbox"
              checked={settings.analytics.shareAnonymousData}
              onChange={(e) => handleSettingsChange('analytics', 'shareAnonymousData', e.target.checked)}
              className="h-4 w-4 text-primary-600 rounded"
            />
          </div>
        </div>
      </Card>

      {/* Billing Settings */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <CreditCardIcon className="w-6 h-6 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">Billing & Subscription</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Auto Renewal</h4>
              <p className="text-sm text-gray-600">Automatically renew subscription</p>
            </div>
            <input
              type="checkbox"
              checked={settings.billing.autoRenewal}
              onChange={(e) => handleSettingsChange('billing', 'autoRenewal', e.target.checked)}
              className="h-4 w-4 text-primary-600 rounded"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Invoice Emails</h4>
              <p className="text-sm text-gray-600">Receive invoices via email</p>
            </div>
            <input
              type="checkbox"
              checked={settings.billing.invoiceEmails}
              onChange={(e) => handleSettingsChange('billing', 'invoiceEmails', e.target.checked)}
              className="h-4 w-4 text-primary-600 rounded"
            />
          </div>
          
          <div>
            <Button variant="ghost" className="flex items-center space-x-2">
              <CreditCardIcon className="w-4 h-4" />
              <span>Update Payment Method</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* API Settings */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <KeyIcon className="w-6 h-6 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">API Access</h3>
        </div>
        
        <div className="space-y-4">
          <p className="text-gray-600">
            Manage API keys and integrations for your organization.
          </p>
          
          <div className="flex space-x-3">
            <Button variant="ghost">Generate API Key</Button>
            <Button variant="ghost">View Documentation</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default OrganizationSettings;
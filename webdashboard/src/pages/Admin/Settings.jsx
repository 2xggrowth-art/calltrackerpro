import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CogIcon,
  FlagIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  CloudArrowUpIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  CpuChipIcon,
  ServerIcon,
  CircleStackIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { Card, Button, Input, Modal } from '../../components/common';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import api from '../../services/api';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({});
  const [systemStatus, setSystemStatus] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // For now, we'll use some default settings since there might not be 
        // a specific settings endpoint in the backend yet
        const defaultSettings = {
          general: {
            platformName: 'CallTracker Pro',
            maintenanceMode: false,
            registrationEnabled: true,
            emailVerificationRequired: true,
            defaultUserRole: 'agent',
            sessionTimeout: 24,
            maxConcurrentSessions: 5
          },
          features: {
            analytics: true,
            callRecording: true,
            voiceMail: false,
            smsIntegration: true,
            apiAccess: true,
            webhooks: false,
            advancedReporting: true,
            realTimeNotifications: true
          },
          security: {
            twoFactorAuth: true,
            passwordComplexity: 'high',
            loginAttempts: 5,
            sessionSecurity: 'strict',
            dataEncryption: true,
            auditLogging: true,
            ipWhitelisting: false,
            sslRequired: true
          },
          backup: {
            autoBackup: true,
            backupFrequency: 'daily',
            retentionPeriod: 90,
            backupLocation: 'cloud',
            dataRetention: 365,
            purgeInactiveUsers: true,
            complianceMode: 'gdpr'
          }
        };

        // Try to fetch system status from backend
        let systemStatusData = {
          uptime: 'N/A',
          cpuUsage: 0,
          memoryUsage: 0,
          diskUsage: 0,
          activeUsers: 0,
          totalCalls: 0,
          systemHealth: 'unknown',
          lastBackup: 'N/A',
          backupStatus: 'unknown',
          services: [
            { name: 'API Server', status: 'running', uptime: 'N/A' },
            { name: 'Database', status: 'running', uptime: 'N/A' },
            { name: 'Call Router', status: 'unknown', uptime: 'N/A' },
            { name: 'Analytics Engine', status: 'unknown', uptime: 'N/A' },
            { name: 'Backup Service', status: 'unknown', uptime: 'N/A' }
          ]
        };

        try {
          // Try to get some real data from the backend
          const [callLogsResponse] = await Promise.all([
            api.get('/call-logs?limit=1000').catch(() => ({ data: [] }))
          ]);

          if (callLogsResponse?.data) {
            systemStatusData.totalCalls = callLogsResponse.data.length || 0;
            systemStatusData.systemHealth = 'healthy';
            systemStatusData.services[0].status = 'running';
            systemStatusData.services[1].status = 'running';
          }
        } catch (error) {
          console.log('Could not fetch all system status data:', error);
        }

        setSettings(defaultSettings);
        setSystemStatus(systemStatusData);

      } catch (error) {
        console.error('Error fetching settings:', error);
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchSettings();
    }
  }, [user]);

  const tabs = [
    { id: 'general', name: 'General', icon: CogIcon },
    { id: 'features', name: 'Feature Flags', icon: FlagIcon },
    { id: 'monitoring', name: 'System Monitoring', icon: ChartBarIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'backup', name: 'Backup & Data', icon: CloudArrowUpIcon }
  ];

  const handleModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };


  const getHealthStatus = (health) => {
    const colors = {
      healthy: 'text-green-600',
      warning: 'text-yellow-600',
      critical: 'text-red-600'
    };
    return colors[health] || colors.critical;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </Card>
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
        <h1 className="text-3xl font-bold text-gray-900">Platform Settings</h1>
        <p className="text-gray-600 mt-2">
          Configure platform-wide settings and preferences
        </p>
      </motion.div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-primary-gradient rounded-lg flex items-center justify-center">
              <ServerIcon className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">System Health</p>
              <p className={`text-xl font-semibold ${getHealthStatus(systemStatus.systemHealth)}`}>
                {systemStatus.systemHealth?.toUpperCase()}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-secondary-gradient rounded-lg flex items-center justify-center">
              <ClockIcon className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Uptime</p>
              <p className="text-xl font-semibold text-gray-900">{systemStatus.uptime}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-accent-gradient rounded-lg flex items-center justify-center">
              <UserGroupIcon className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-xl font-semibold text-gray-900">{systemStatus.activeUsers}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
              <CircleStackIcon className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Calls</p>
              <p className="text-xl font-semibold text-gray-900">{systemStatus.totalCalls?.toLocaleString()}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Settings Tabs */}
      <Card className="p-0">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'general' && <GeneralSettings settings={settings.general} updateSetting={updateSetting} />}
          {activeTab === 'features' && <FeatureFlags features={settings.features} updateSetting={updateSetting} />}
          {activeTab === 'monitoring' && <SystemMonitoring systemStatus={systemStatus} handleModal={handleModal} />}
          {activeTab === 'security' && <SecuritySettings security={settings.security} updateSetting={updateSetting} />}
          {activeTab === 'backup' && <BackupSettings backup={settings.backup} updateSetting={updateSetting} handleModal={handleModal} />}
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <Button variant="ghost">Reset to Defaults</Button>
        <Button>Save All Changes</Button>
      </div>

      {/* Modal for maintenance actions */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          modalType === 'maintenance' ? 'System Maintenance' :
          modalType === 'backup' ? 'Manual Backup' :
          modalType === 'logs' ? 'System Logs' : ''
        }
        size="lg"
      >
        <ModalContent modalType={modalType} />
      </Modal>
    </div>
  );
};

// General Settings Component
const GeneralSettings = ({ settings, updateSetting }) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Configuration</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Platform Name"
          value={settings?.platformName || ''}
          onChange={(e) => updateSetting('general', 'platformName', e.target.value)}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Default User Role</label>
          <select
            value={settings?.defaultUserRole || 'user'}
            onChange={(e) => updateSetting('general', 'defaultUserRole', e.target.value)}
            className="input-field"
          >
            <option value="user">User</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (hours)</label>
          <input
            type="number"
            value={settings?.sessionTimeout || 24}
            onChange={(e) => updateSetting('general', 'sessionTimeout', parseInt(e.target.value))}
            className="input-field"
            min="1"
            max="168"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Max Concurrent Sessions</label>
          <input
            type="number"
            value={settings?.maxConcurrentSessions || 5}
            onChange={(e) => updateSetting('general', 'maxConcurrentSessions', parseInt(e.target.value))}
            className="input-field"
            min="1"
            max="20"
          />
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Controls</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Maintenance Mode</h4>
            <p className="text-sm text-gray-600">Temporarily disable access for maintenance</p>
          </div>
          <input
            type="checkbox"
            checked={settings?.maintenanceMode || false}
            onChange={(e) => updateSetting('general', 'maintenanceMode', e.target.checked)}
            className="h-4 w-4 text-primary-600 rounded"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">User Registration</h4>
            <p className="text-sm text-gray-600">Allow new users to register</p>
          </div>
          <input
            type="checkbox"
            checked={settings?.registrationEnabled || false}
            onChange={(e) => updateSetting('general', 'registrationEnabled', e.target.checked)}
            className="h-4 w-4 text-primary-600 rounded"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Email Verification Required</h4>
            <p className="text-sm text-gray-600">Require email verification for new accounts</p>
          </div>
          <input
            type="checkbox"
            checked={settings?.emailVerificationRequired || false}
            onChange={(e) => updateSetting('general', 'emailVerificationRequired', e.target.checked)}
            className="h-4 w-4 text-primary-600 rounded"
          />
        </div>
      </div>
    </div>
  </div>
);

// Feature Flags Component
const FeatureFlags = ({ features, updateSetting }) => {
  const featureList = [
    { key: 'analytics', name: 'Advanced Analytics', description: 'Enable detailed analytics and reporting' },
    { key: 'callRecording', name: 'Call Recording', description: 'Allow users to record calls' },
    { key: 'voiceMail', name: 'Voice Mail', description: 'Enable voicemail functionality' },
    { key: 'smsIntegration', name: 'SMS Integration', description: 'Allow SMS messaging features' },
    { key: 'apiAccess', name: 'API Access', description: 'Enable REST API access' },
    { key: 'webhooks', name: 'Webhooks', description: 'Allow webhook integrations' },
    { key: 'advancedReporting', name: 'Advanced Reporting', description: 'Enable advanced report generation' },
    { key: 'realTimeNotifications', name: 'Real-time Notifications', description: 'Enable push notifications' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Feature Toggles</h3>
        <p className="text-gray-600 mb-6">Enable or disable platform features dynamically</p>
        
        <div className="space-y-4">
          {featureList.map(feature => (
            <div key={feature.key} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">{feature.name}</h4>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
              <input
                type="checkbox"
                checked={features?.[feature.key] || false}
                onChange={(e) => updateSetting('features', feature.key, e.target.checked)}
                className="h-4 w-4 text-primary-600 rounded"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// System Monitoring Component
const SystemMonitoring = ({ systemStatus, handleModal }) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">System Performance</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <CpuChipIcon className="w-8 h-8 text-gray-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{systemStatus.cpuUsage}%</p>
          <p className="text-sm text-gray-600">CPU Usage</p>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <ServerIcon className="w-8 h-8 text-gray-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{systemStatus.memoryUsage}%</p>
          <p className="text-sm text-gray-600">Memory Usage</p>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <CircleStackIcon className="w-8 h-8 text-gray-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{systemStatus.diskUsage}%</p>
          <p className="text-sm text-gray-600">Disk Usage</p>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Services Status</h3>
      <div className="space-y-3">
        {systemStatus.services?.map((service, index) => (
          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <h4 className="font-medium">{service.name}</h4>
              <p className="text-sm text-gray-600">Uptime: {service.uptime}</p>
            </div>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              service.status === 'running' ? 'bg-green-100 text-green-800' :
              service.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {service.status === 'running' ? <CheckCircleIcon className="w-3 h-3 mr-1" /> :
               service.status === 'warning' ? <ExclamationTriangleIcon className="w-3 h-3 mr-1" /> :
               <XCircleIcon className="w-3 h-3 mr-1" />}
              {service.status}
            </span>
          </div>
        ))}
      </div>
    </div>

    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Maintenance Tools</h3>
      <div className="flex space-x-4">
        <Button
          variant="outline"
          onClick={() => handleModal('maintenance')}
          className="flex items-center space-x-2"
        >
          <CogIcon className="w-4 h-4" />
          <span>System Maintenance</span>
        </Button>
        <Button
          variant="outline"
          onClick={() => handleModal('logs')}
          className="flex items-center space-x-2"
        >
          <DocumentTextIcon className="w-4 h-4" />
          <span>View Logs</span>
        </Button>
        <Button
          variant="outline"
          className="flex items-center space-x-2"
        >
          <ArrowPathIcon className="w-4 h-4" />
          <span>Restart Services</span>
        </Button>
      </div>
    </div>
  </div>
);

// Security Settings Component
const SecuritySettings = ({ security, updateSetting }) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Authentication & Access</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Two-Factor Authentication</h4>
            <p className="text-sm text-gray-600">Require 2FA for all users</p>
          </div>
          <input
            type="checkbox"
            checked={security?.twoFactorAuth || false}
            onChange={(e) => updateSetting('security', 'twoFactorAuth', e.target.checked)}
            className="h-4 w-4 text-primary-600 rounded"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password Complexity</label>
            <select
              value={security?.passwordComplexity || 'medium'}
              onChange={(e) => updateSetting('security', 'passwordComplexity', e.target.value)}
              className="input-field"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Login Attempts</label>
            <input
              type="number"
              value={security?.loginAttempts || 5}
              onChange={(e) => updateSetting('security', 'loginAttempts', parseInt(e.target.value))}
              className="input-field"
              min="3"
              max="10"
            />
          </div>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Protection</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Data Encryption</h4>
            <p className="text-sm text-gray-600">Encrypt sensitive data at rest</p>
          </div>
          <input
            type="checkbox"
            checked={security?.dataEncryption || false}
            onChange={(e) => updateSetting('security', 'dataEncryption', e.target.checked)}
            className="h-4 w-4 text-primary-600 rounded"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Audit Logging</h4>
            <p className="text-sm text-gray-600">Log all system activities</p>
          </div>
          <input
            type="checkbox"
            checked={security?.auditLogging || false}
            onChange={(e) => updateSetting('security', 'auditLogging', e.target.checked)}
            className="h-4 w-4 text-primary-600 rounded"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">SSL/TLS Required</h4>
            <p className="text-sm text-gray-600">Force HTTPS connections</p>
          </div>
          <input
            type="checkbox"
            checked={security?.sslRequired || false}
            onChange={(e) => updateSetting('security', 'sslRequired', e.target.checked)}
            className="h-4 w-4 text-primary-600 rounded"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">IP Whitelisting</h4>
            <p className="text-sm text-gray-600">Restrict access by IP address</p>
          </div>
          <input
            type="checkbox"
            checked={security?.ipWhitelisting || false}
            onChange={(e) => updateSetting('security', 'ipWhitelisting', e.target.checked)}
            className="h-4 w-4 text-primary-600 rounded"
          />
        </div>
      </div>
    </div>
  </div>
);

// Backup Settings Component
const BackupSettings = ({ backup, updateSetting, handleModal }) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Backup Configuration</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Automatic Backups</h4>
            <p className="text-sm text-gray-600">Enable scheduled backups</p>
          </div>
          <input
            type="checkbox"
            checked={backup?.autoBackup || false}
            onChange={(e) => updateSetting('backup', 'autoBackup', e.target.checked)}
            className="h-4 w-4 text-primary-600 rounded"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Backup Frequency</label>
            <select
              value={backup?.backupFrequency || 'daily'}
              onChange={(e) => updateSetting('backup', 'backupFrequency', e.target.value)}
              className="input-field"
            >
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Backup Location</label>
            <select
              value={backup?.backupLocation || 'cloud'}
              onChange={(e) => updateSetting('backup', 'backupLocation', e.target.value)}
              className="input-field"
            >
              <option value="local">Local Storage</option>
              <option value="cloud">Cloud Storage</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Retention Period (days)</label>
            <input
              type="number"
              value={backup?.retentionPeriod || 90}
              onChange={(e) => updateSetting('backup', 'retentionPeriod', parseInt(e.target.value))}
              className="input-field"
              min="7"
              max="365"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Data Retention (days)</label>
            <input
              type="number"
              value={backup?.dataRetention || 365}
              onChange={(e) => updateSetting('backup', 'dataRetention', parseInt(e.target.value))}
              className="input-field"
              min="30"
              max="2555"
            />
          </div>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Management</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Purge Inactive Users</h4>
            <p className="text-sm text-gray-600">Automatically remove inactive user data</p>
          </div>
          <input
            type="checkbox"
            checked={backup?.purgeInactiveUsers || false}
            onChange={(e) => updateSetting('backup', 'purgeInactiveUsers', e.target.checked)}
            className="h-4 w-4 text-primary-600 rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Compliance Mode</label>
          <select
            value={backup?.complianceMode || 'gdpr'}
            onChange={(e) => updateSetting('backup', 'complianceMode', e.target.value)}
            className="input-field"
          >
            <option value="gdpr">GDPR</option>
            <option value="ccpa">CCPA</option>
            <option value="hipaa">HIPAA</option>
            <option value="sox">SOX</option>
          </select>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Backup Actions</h3>
      <div className="flex space-x-4">
        <Button
          onClick={() => handleModal('backup')}
          className="flex items-center space-x-2"
        >
          <CloudArrowUpIcon className="w-4 h-4" />
          <span>Create Backup Now</span>
        </Button>
        <Button
          variant="outline"
          className="flex items-center space-x-2"
        >
          <ArrowPathIcon className="w-4 h-4" />
          <span>Restore from Backup</span>
        </Button>
      </div>
    </div>
  </div>
);

// Modal Content Component
const ModalContent = ({ modalType }) => {
  switch (modalType) {
    case 'maintenance':
      return <MaintenanceModal />;
    case 'backup':
      return <BackupModal />;
    case 'logs':
      return <LogsModal />;
    default:
      return null;
  }
};

// Maintenance Modal Component
const MaintenanceModal = () => (
  <div className="space-y-4">
    <div className="text-center">
      <ExclamationTriangleIcon className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900">System Maintenance</h3>
      <p className="text-gray-600 mt-2">
        This will put the system in maintenance mode and disconnect all users.
      </p>
    </div>
    
    <div className="space-y-3">
      <Input label="Maintenance Duration (hours)" type="number" defaultValue="2" />
      <Input label="Maintenance Message" defaultValue="System is under maintenance. Please try again later." />
    </div>
    
    <Modal.Footer>
      <Button variant="ghost">Cancel</Button>
      <Button variant="danger">Start Maintenance</Button>
    </Modal.Footer>
  </div>
);

// Backup Modal Component
const BackupModal = () => (
  <div className="space-y-4">
    <div className="text-center">
      <CloudArrowUpIcon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900">Create Manual Backup</h3>
      <p className="text-gray-600 mt-2">
        This will create a full system backup including all user data and configurations.
      </p>
    </div>
    
    <div className="space-y-3">
      <Input label="Backup Name" placeholder="manual-backup-2024-07-23" />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Backup Type</label>
        <select className="input-field">
          <option value="full">Full Backup</option>
          <option value="incremental">Incremental Backup</option>
          <option value="differential">Differential Backup</option>
        </select>
      </div>
    </div>
    
    <Modal.Footer>
      <Button variant="ghost">Cancel</Button>
      <Button>Create Backup</Button>
    </Modal.Footer>
  </div>
);

// Logs Modal Component
const LogsModal = () => {
  const mockLogs = [
    { time: '2024-07-23 14:30:15', level: 'INFO', message: 'User login successful: john@example.com' },
    { time: '2024-07-23 14:29:42', level: 'WARNING', message: 'High CPU usage detected: 85%' },
    { time: '2024-07-23 14:28:33', level: 'ERROR', message: 'Database connection timeout' },
    { time: '2024-07-23 14:27:11', level: 'INFO', message: 'Backup completed successfully' }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">System Logs</h3>
        <div className="flex space-x-2">
          <select className="input-field text-sm">
            <option value="all">All Levels</option>
            <option value="error">Errors</option>
            <option value="warning">Warnings</option>
            <option value="info">Info</option>
          </select>
          <Button size="sm">Refresh</Button>
        </div>
      </div>
      
      <div className="max-h-96 overflow-y-auto space-y-2">
        {mockLogs.map((log, index) => (
          <div key={index} className="p-3 border rounded-lg text-sm">
            <div className="flex items-center justify-between">
              <span className="font-mono text-gray-600">{log.time}</span>
              <span className={`px-2 py-1 rounded text-xs ${
                log.level === 'ERROR' ? 'bg-red-100 text-red-800' :
                log.level === 'WARNING' ? 'bg-yellow-100 text-yellow-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {log.level}
              </span>
            </div>
            <p className="mt-1">{log.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Settings;
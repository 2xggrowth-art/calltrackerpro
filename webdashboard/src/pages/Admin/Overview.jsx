import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BuildingOfficeIcon,
  UsersIcon,
  PhoneIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Card, LoadingSpinner } from '../../components/common';
import { callLogService } from '../../services/callLogService';
import { useAuth } from '../../contexts/AuthContext';

const Overview = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch platform-wide analytics data
        const [callLogsResponse] = await Promise.all([
          callLogService.getCallLogs({ limit: 1000 })
        ]);

        // Calculate stats from actual data
        const totalCalls = callLogsResponse?.data?.length || 0;
        const successfulCalls = callLogsResponse?.data?.filter(call => call.status === 'completed')?.length || 0;
        
        setData({
          stats: {
            organizations: { value: 0, change: 0, trend: 'up' }, // Will be updated when we have org data
            users: { value: 0, change: 0, trend: 'up' }, // Will be updated when we have user data
            calls: { value: totalCalls, change: 0, trend: 'up' },
            revenue: { value: 0, change: 0, trend: 'up' } // Calculate from call data if needed
          },
          recentActivity: [
            { id: 1, type: 'system', message: 'Dashboard connected to backend API', time: 'just now' },
            { id: 2, type: 'call', message: `Total calls recorded: ${totalCalls}`, time: '1 minute ago' },
            { id: 3, type: 'call', message: `Successful calls: ${successfulCalls}`, time: '1 minute ago' }
          ],
          alerts: [
            { id: 1, type: 'success', message: 'Backend API connection established', priority: 'low' },
            { id: 2, type: 'info', message: 'Real-time data sync active', priority: 'medium' }
          ]
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Fallback to basic data structure
        setData({
          stats: {
            organizations: { value: 0, change: 0, trend: 'up' },
            users: { value: 0, change: 0, trend: 'up' },
            calls: { value: 0, change: 0, trend: 'up' },
            revenue: { value: 0, change: 0, trend: 'up' }
          },
          recentActivity: [
            { id: 1, type: 'system', message: 'Connecting to backend...', time: 'now' }
          ],
          alerts: [
            { id: 1, type: 'warning', message: 'Backend connection error - using fallback data', priority: 'high' }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const stats = [
    {
      name: 'Total Organizations',
      value: data.stats.organizations.value,
      change: data.stats.organizations.change,
      trend: data.stats.organizations.trend,
      icon: BuildingOfficeIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      name: 'Total Users',
      value: data.stats.users.value,
      change: data.stats.users.change,
      trend: data.stats.users.trend,
      icon: UsersIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      name: 'Calls This Month',
      value: data.stats.calls.value,
      change: data.stats.calls.change,
      trend: data.stats.calls.trend,
      icon: PhoneIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      name: 'Revenue (₹)',
      value: data.stats.revenue.value,
      change: data.stats.revenue.change,
      trend: data.stats.revenue.trend,
      icon: CurrencyDollarIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900">Platform Overview</h1>
        <p className="text-gray-600 mt-2">
          Monitor your CallTracker Pro platform performance and key metrics
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatNumber(stat.value)}
                </p>
                <div className="flex items-center mt-2">
                  <ArrowTrendingUpIcon className={`w-4 h-4 ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`} />
                  <span className={`text-sm ml-1 ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    +{formatNumber(stat.change)} this month
                  </span>
                </div>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {data.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'organization' ? 'bg-blue-500' :
                    activity.type === 'user' ? 'bg-green-500' :
                    activity.type === 'call' ? 'bg-purple-500' :
                    activity.type === 'system' ? 'bg-orange-500' :
                    'bg-gray-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* System Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Alerts</h3>
            <div className="space-y-4">
              {data.alerts.map((alert) => (
                <div key={alert.id} className={`flex items-start space-x-3 p-3 rounded-lg ${
                  alert.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                  alert.type === 'success' ? 'bg-green-50 border border-green-200' :
                  'bg-blue-50 border border-blue-200'
                }`}>
                  <ExclamationTriangleIcon className={`w-5 h-5 mt-0.5 ${
                    alert.type === 'warning' ? 'text-yellow-500' :
                    alert.type === 'success' ? 'text-green-500' :
                    'text-blue-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{alert.message}</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                      alert.priority === 'high' ? 'bg-red-100 text-red-800' :
                      alert.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {alert.priority} priority
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-center">
              <BuildingOfficeIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">Create Organization</p>
            </button>
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-center">
              <UsersIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">Manage Users</p>
            </button>
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-center">
              <CurrencyDollarIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">View Reports</p>
            </button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Overview;
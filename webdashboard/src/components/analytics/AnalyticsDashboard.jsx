import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  UserGroupIcon,
  PhoneIcon,
  TicketIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { Card, Button } from '../common';
import { ticketService } from '../../services/ticketService';
import { organizationService } from '../../services/organizationService';
import { useAuth } from '../../contexts/AuthContext';
import { ScheduleDemoButton } from '../demo';

const AnalyticsDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d'); // 24h, 7d, 30d, 90d
  const [analytics, setAnalytics] = useState({
    overview: {},
    pipeline: {},
    sla: {},
    conversion: {},
    performance: {}
  });

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      
      const [
        pipelineData,
        slaData,
        conversionData,
        organizationData
      ] = await Promise.all([
        ticketService.getPipelineAnalytics({ timeRange }),
        ticketService.getSLAAnalytics({ timeRange }),
        ticketService.getConversionAnalytics({ timeRange }),
        user?.role === 'super_admin' ? 
          organizationService.getAnalytics({ timeRange }) : 
          Promise.resolve({ data: {} })
      ]);

      setAnalytics({
        overview: organizationData.data || {},
        pipeline: pipelineData.data || {},
        sla: slaData.data || {},
        conversion: conversionData.data || {},
        performance: {}
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [timeRange, user?.role]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);


  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatPercentage = (value) => {
    return `${(value || 0).toFixed(1)}%`;
  };

  const getTrendIcon = (trend) => {
    return trend > 0 ? TrendingUpIcon : TrendingDownIcon;
  };

  const getTrendColor = (trend) => {
    return trend > 0 ? 'text-green-600' : 'text-red-600';
  };

  const timeRangeOptions = [
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive insights into your organization's performance
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <ScheduleDemoButton 
            variant="outline"
            size="sm"
            text="Need Help?"
            className="border-primary-300 text-primary-600 hover:bg-primary-50"
          />
          
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="input-field"
          >
            {timeRangeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          <Button
            variant="ghost"
            onClick={fetchAnalytics}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(analytics.pipeline.totalRevenue)}
          change={analytics.pipeline.revenueChange}
          icon={CurrencyDollarIcon}
          color="bg-green-500"
        />
        
        <MetricCard
          title="Active Tickets"
          value={analytics.overview.activeTickets || 0}
          change={analytics.overview.ticketChange}
          icon={TicketIcon}
          color="bg-blue-500"
        />
        
        <MetricCard
          title="Conversion Rate"
          value={formatPercentage(analytics.conversion.rate)}
          change={analytics.conversion.rateChange}
          icon={TrendingUpIcon}
          color="bg-purple-500"
        />
        
        <MetricCard
          title="SLA Compliance"
          value={formatPercentage(analytics.sla.complianceRate)}
          change={analytics.sla.complianceChange}
          icon={CheckCircleIcon}
          color="bg-orange-500"
        />
      </div>

      {/* Pipeline Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Pipeline Performance</h3>
            <ChartBarIcon className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {[
              { stage: 'Prospect', count: 45, value: 125000, conversion: 25 },
              { stage: 'Qualified', count: 32, value: 280000, conversion: 40 },
              { stage: 'Proposal', count: 18, value: 450000, conversion: 60 },
              { stage: 'Negotiation', count: 12, value: 320000, conversion: 75 },
              { stage: 'Closed Won', count: 8, value: 180000, conversion: 100 }
            ].map((stage, index) => (
              <div key={stage.stage} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full bg-primary-${(index + 1) * 100}`} />
                  <span className="font-medium text-gray-900">{stage.stage}</span>
                </div>
                
                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <span>{stage.count} tickets</span>
                  <span>{formatCurrency(stage.value)}</span>
                  <span className="text-green-600">{stage.conversion}%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">SLA Performance</h3>
            <ClockIcon className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-3">
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-medium text-gray-900">On Track</div>
                  <div className="text-sm text-gray-600">Meeting SLA requirements</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  {analytics.sla.onTrack || 85}%
                </div>
                <div className="text-sm text-green-600">156 tickets</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center space-x-3">
                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
                <div>
                  <div className="font-medium text-gray-900">At Risk</div>
                  <div className="text-sm text-gray-600">Approaching SLA deadline</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-yellow-600">
                  {analytics.sla.atRisk || 12}%
                </div>
                <div className="text-sm text-yellow-600">23 tickets</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center space-x-3">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                <div>
                  <div className="font-medium text-gray-900">Breached</div>
                  <div className="text-sm text-gray-600">SLA deadline exceeded</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-red-600">
                  {analytics.sla.breached || 3}%
                </div>
                <div className="text-sm text-red-600">5 tickets</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Team Performance & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Team Performance</h3>
            <UserGroupIcon className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {[
              { name: 'Sarah Johnson', role: 'Sales Manager', tickets: 24, conversion: 68, revenue: 125000 },
              { name: 'Mike Chen', role: 'Senior Agent', tickets: 32, conversion: 55, revenue: 89000 },
              { name: 'Lisa Rodriguez', role: 'Agent', tickets: 18, conversion: 72, revenue: 156000 },
              { name: 'David Kim', role: 'Agent', tickets: 28, conversion: 43, revenue: 67000 }
            ].map((agent) => (
              <div key={agent.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-gradient rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {agent.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{agent.name}</div>
                    <div className="text-sm text-gray-600">{agent.role}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6 text-sm">
                  <div className="text-center">
                    <div className="font-medium text-gray-900">{agent.tickets}</div>
                    <div className="text-gray-600">Tickets</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-gray-900">{agent.conversion}%</div>
                    <div className="text-gray-600">Conversion</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-gray-900">{formatCurrency(agent.revenue)}</div>
                    <div className="text-gray-600">Revenue</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <CalendarIcon className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-3">
            {[
              { action: 'Ticket created', time: '5 minutes ago', type: 'create' },
              { action: 'Deal closed won', time: '12 minutes ago', type: 'success' },
              { action: 'SLA breach warning', time: '23 minutes ago', type: 'warning' },
              { action: 'Ticket escalated', time: '1 hour ago', type: 'escalation' },
              { action: 'Pipeline stage moved', time: '2 hours ago', type: 'update' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'success' ? 'bg-green-500' :
                  activity.type === 'warning' ? 'bg-yellow-500' :
                  activity.type === 'escalation' ? 'bg-red-500' :
                  'bg-blue-500'
                }`} />
                <div className="flex-1">
                  <div className="text-sm text-gray-900">{activity.action}</div>
                  <div className="text-xs text-gray-500">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
            <span className="text-gray-700">Loading analytics...</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Metric Card Component
const MetricCard = ({ title, value, change, icon: Icon, color }) => {

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
            
            {change !== undefined && (() => {
              const TrendIcon = getTrendIcon(change);
              const trendColor = getTrendColor(change);
              return (
                <div className={`flex items-center mt-2 text-sm ${trendColor}`}>
                  <TrendIcon className="w-4 h-4 mr-1" />
                  <span>{Math.abs(change)}%</span>
                  <span className="text-gray-500 ml-1">vs last period</span>
                </div>
              );
            })()}
          </div>
          
          <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default AnalyticsDashboard;
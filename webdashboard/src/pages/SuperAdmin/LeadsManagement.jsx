import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  PhoneIcon,
  EnvelopeIcon,
  EyeIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { Card, Button } from '../../components/common';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { runCORSTests } from '../../utils/corsTest';
import { demoService } from '../../services/demoService';

const LeadsManagement = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });
  const [filters, setFilters] = useState({
    search: '',
    priority: 'all',
    urgency: 'all',
    status: 'all',
    timeline: 'all'
  });
  const [selectedLead, setSelectedLead] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Fetch leads data from API
  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build filters object for the service
      const queryFilters = {
        page: pagination.page || 1,
        limit: pagination.limit || 20,
        ...(filters.urgency && filters.urgency !== 'all' && { urgency: filters.urgency }),
        ...(filters.priority && filters.priority !== 'all' && { priority: filters.priority }),
        ...(filters.status && filters.status !== 'all' && { status: filters.status }),
        ...(filters.timeline && filters.timeline !== 'all' && { timeline: filters.timeline }),
        ...(filters.search && { search: filters.search })
      };

      const result = await demoService.getAllDemos(queryFilters);

      if (result.success) {
        // Map snake_case API fields to camelCase for frontend consistency
        const mappedLeads = (result.data || []).map(lead => ({
          ...lead,
          currentPain: lead.current_pain || lead.currentPain,
          leadScore: lead.lead_score || lead.leadScore || 50,
          followUpDate: lead.follow_up_date ? new Date(lead.follow_up_date) : null,
          createdAt: lead.created_at ? new Date(lead.created_at) : new Date(),
          updatedAt: lead.updated_at ? new Date(lead.updated_at) : new Date()
        }));

        setLeads(mappedLeads);
        setPagination(result.pagination || {});
      } else {
        console.error('API error:', result.message);
        setError(result.message || 'Failed to fetch leads');
        setLeads([]);
      }

    } catch (error) {
      console.error('Failed to fetch leads:', error);
      setError('Failed to connect to server. Please try again.');
      setLeads([]);
      
      // Show fallback data in development
      if (process.env.NODE_ENV === 'development') {
        // Fallback mock data for development
        const fallbackLeads = [
          {
            id: '1',
            name: 'Arsalan Ahmed',
            email: 'arsalanahmed507@gmail.com',
            company: '567890',
            phone: '0538180217',
            urgency: 'urgent',
            currentPain: 'wasted-ad-spend',
            budget: '5k-10k',
            timeline: 'this-week',
            message: 'Need better call tracking ASAP!',
            priority: 'high',
            segment: 'enterprise',
            leadScore: 95,
            status: 'new',
            followUpDate: new Date(Date.now() - 86400000),
            createdAt: new Date(Date.now() - 3600000),
            updatedAt: new Date(Date.now() - 1800000)
          }
        ];
        setLeads(fallbackLeads);
      }
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  // Fetch analytics data from API
  const fetchAnalytics = useCallback(async () => {
    try {
      const result = await demoService.getDemoAnalytics();

      if (result.success) {
        setAnalytics(result.data);
      }

    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      // Use fallback analytics in development
      if (process.env.NODE_ENV === 'development') {
        setAnalytics({
          totalRequests: 156,
          urgencyBreakdown: { urgent: 8, planned: 85, exploring: 40 },
          priorityDistribution: { high: 23, medium: 80, low: 40 },
          conversionRate: 23
        });
      }
    }
  }, []);

  // Update lead status via API
  const updateLeadStatus = async (leadId, newStatus) => {
    try {
      const result = await demoService.updateDemoStatus(leadId, newStatus);

      if (result.success) {
        toast.success('Lead status updated successfully');
        // Refresh leads data
        fetchLeads();
      } else {
        toast.error(result.message || 'Failed to update lead status');
      }

    } catch (error) {
      console.error('Failed to update lead status:', error);
      toast.error('Failed to update lead status');
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchLeads();
    fetchAnalytics();
  }, [fetchLeads, fetchAnalytics]);

  // Server-side filtering is now handled by the API, so we use leads directly

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    // Reset to first page when filters change
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header Section with Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Leads Management</h1>
            <p className="text-gray-600">Manage and track demo requests with intelligent lead scoring</p>
          </div>
          {process.env.NODE_ENV === 'development' && (
            <Button
              onClick={runCORSTests}
              variant="outline"
              size="sm"
              className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
            >
              Test CORS
            </Button>
          )}
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard 
            title="Total Leads" 
            value={analytics?.totalRequests || pagination.total || leads.length} 
            trend="+12%"
            color="blue"
          />
          <MetricCard 
            title="High Priority" 
            value={analytics?.priorityDistribution?.high || leads.filter(l => l.priority === 'high').length} 
            trend="+5%"
            color="red"
          />
          <MetricCard 
            title="Urgent Leads" 
            value={analytics?.urgencyBreakdown?.urgent || leads.filter(l => l.urgency === 'urgent').length} 
            trend="+8%"
            color="orange"
          />
          <MetricCard 
            title="Conversion Rate" 
            value={analytics?.conversionRate ? `${analytics.conversionRate}%` : '23%'} 
            trend="+3%"
            color="green"
          />
        </div>
      </motion.div>

      {/* Filters Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <Card className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or company..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap gap-4">
              <FilterDropdown
                label="Priority"
                value={filters.priority}
                onChange={(value) => handleFilterChange('priority', value)}
                options={[
                  { value: 'all', label: 'All Priorities' },
                  { value: 'high', label: 'High' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'low', label: 'Low' }
                ]}
              />

              <FilterDropdown
                label="Urgency"
                value={filters.urgency}
                onChange={(value) => handleFilterChange('urgency', value)}
                options={[
                  { value: 'all', label: 'All Urgency' },
                  { value: 'urgent', label: 'Urgent' },
                  { value: 'planned', label: 'Planned' },
                  { value: 'exploring', label: 'Exploring' }
                ]}
              />

              <FilterDropdown
                label="Status"
                value={filters.status}
                onChange={(value) => handleFilterChange('status', value)}
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'new', label: 'New' },
                  { value: 'contacted', label: 'Contacted' },
                  { value: 'demo-scheduled', label: 'Demo Scheduled' },
                  { value: 'converted', label: 'Converted' },
                  { value: 'lost', label: 'Lost' }
                ]}
              />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Leads Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading leads...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <div className="text-red-500 mb-4">
                <ExclamationTriangleIcon className="w-12 h-12 mx-auto mb-2" />
                <h3 className="text-lg font-medium">Error Loading Leads</h3>
                <p className="text-sm text-gray-600 mt-1">{error}</p>
              </div>
              <Button 
                onClick={() => fetchLeads()} 
                className="mt-4"
              >
                Retry
              </Button>
            </div>
          ) : leads.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-500 mb-4">
                <EyeIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <h3 className="text-lg font-medium">No Leads Found</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {filters.search || filters.priority !== 'all' || filters.urgency !== 'all' || filters.status !== 'all' 
                    ? 'Try adjusting your filters to see more results.'
                    : 'No demo requests have been submitted yet.'
                  }
                </p>
              </div>
              {(filters.search || filters.priority !== 'all' || filters.urgency !== 'all' || filters.status !== 'all') && (
                <Button 
                  variant="outline"
                  onClick={() => {
                    setFilters({
                      search: '',
                      priority: 'all',
                      urgency: 'all',
                      status: 'all',
                      timeline: 'all'
                    });
                  }} 
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Urgency
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lead Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pain Point
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Budget
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Follow-up
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <PriorityBadge priority={lead.priority} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                          <div className="text-sm text-gray-500">{lead.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {lead.company || 'Not specified'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <UrgencyBadge urgency={lead.urgency} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <LeadScoreBar score={lead.leadScore} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {lead.currentPain ? lead.currentPain.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase()) : 'Not specified'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {lead.budget ? lead.budget.replace(/-/g, ' ').toUpperCase() : 'Not specified'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <FollowUpDate date={lead.followUpDate} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={lead.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <ActionButton
                            icon={EyeIcon}
                            onClick={() => {
                              setSelectedLead(lead);
                              setShowDetailsModal(true);
                            }}
                            tooltip="View Details"
                            color="gray"
                          />
                          <ActionButton
                            icon={PhoneIcon}
                            onClick={() => window.open(`tel:${lead.phone}`)}
                            tooltip="Call Lead"
                            color="green"
                          />
                          <ActionButton
                            icon={EnvelopeIcon}
                            onClick={() => window.open(`mailto:${lead.email}`)}
                            tooltip="Send Email"
                            color="blue"
                          />
                          <ActionButton
                            icon={CalendarIcon}
                            onClick={() => console.log('Schedule demo for', lead.id)}
                            tooltip="Schedule Demo"
                            color="purple"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} leads
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={!pagination.hasPrev || loading}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={!pagination.hasNext || loading}
                >
                  Next
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Lead Details Modal */}
      {showDetailsModal && selectedLead && (
        <LeadDetailsModal
          lead={selectedLead}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedLead(null);
          }}
          onStatusUpdate={updateLeadStatus}
        />
      )}
    </div>
  );
};

// Component: Metric Card
const MetricCard = ({ title, value, trend, color }) => {
  const colorClasses = {
    blue: 'text-blue-600',
    red: 'text-red-600',
    orange: 'text-orange-600',
    green: 'text-green-600'
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${colorClasses[color]}`}>{value}</p>
        </div>
        <div className={`text-sm font-medium ${trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
          {trend}
        </div>
      </div>
    </Card>
  );
};

// Component: Filter Dropdown
const FilterDropdown = ({ label, value, onChange, options }) => {
  return (
    <div className="min-w-[150px]">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

// Component: Priority Badge
const PriorityBadge = ({ priority }) => {
  const styles = {
    high: "bg-red-100 text-red-800 border-red-200",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    low: "bg-green-100 text-green-800 border-green-200"
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${styles[priority]}`}>
      {priority.toUpperCase()}
    </span>
  );
};

// Component: Urgency Badge
const UrgencyBadge = ({ urgency }) => {
  const styles = {
    urgent: "bg-red-500 text-white animate-pulse",
    planned: "bg-orange-500 text-white",
    exploring: "bg-blue-500 text-white"
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[urgency]}`}>
      {urgency.toUpperCase()}
    </span>
  );
};

// Component: Lead Score Progress Bar
const LeadScoreBar = ({ score }) => {
  const color = score >= 80 ? "green" : score >= 60 ? "yellow" : "red";
  const colorClasses = {
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    red: "bg-red-500"
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="w-16 bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${colorClasses[color]}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs font-medium">{score}</span>
    </div>
  );
};

// Component: Follow-up Date Indicator
const FollowUpDate = ({ date }) => {
  const isOverdue = new Date(date) < new Date();
  const isToday = new Date(date).toDateString() === new Date().toDateString();

  return (
    <span className={`
      text-xs font-medium
      ${isOverdue ? 'text-red-600 font-bold' : ''}
      ${isToday ? 'text-orange-600 font-bold' : ''}
    `}>
      {isOverdue && <ExclamationTriangleIcon className="w-4 h-4 inline mr-1" />}
      {isToday && <FireIcon className="w-4 h-4 inline mr-1" />}
      {formatDistanceToNow(new Date(date), { addSuffix: true })}
    </span>
  );
};

// Component: Status Badge
const StatusBadge = ({ status }) => {
  const styles = {
    new: "bg-blue-100 text-blue-800 border-blue-200",
    contacted: "bg-yellow-100 text-yellow-800 border-yellow-200",
    'demo-scheduled': "bg-purple-100 text-purple-800 border-purple-200",
    converted: "bg-green-100 text-green-800 border-green-200",
    lost: "bg-red-100 text-red-800 border-red-200"
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${styles[status]}`}>
      {status.replace('-', ' ').toUpperCase()}
    </span>
  );
};

// Component: Action Button
const ActionButton = ({ icon: Icon, onClick, tooltip, color }) => {
  const colorClasses = {
    gray: "text-gray-400 hover:text-gray-600",
    green: "text-green-400 hover:text-green-600",
    blue: "text-blue-400 hover:text-blue-600",
    purple: "text-purple-400 hover:text-purple-600"
  };

  return (
    <button
      onClick={onClick}
      className={`${colorClasses[color]} hover:bg-gray-50 p-1 rounded`}
      title={tooltip}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
};

// Component: Lead Details Modal
const LeadDetailsModal = ({ lead, onClose, onStatusUpdate }) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Lead Details</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Contact Information</h4>
                <div className="space-y-2">
                  <p><span className="font-medium">Name:</span> {lead.name}</p>
                  <p><span className="font-medium">Email:</span> {lead.email}</p>
                  <p><span className="font-medium">Company:</span> {lead.company}</p>
                  <p><span className="font-medium">Phone:</span> {lead.phone}</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Qualification Data</h4>
                <div className="space-y-2">
                  <p><span className="font-medium">Urgency:</span> <UrgencyBadge urgency={lead.urgency} /></p>
                  <p><span className="font-medium">Priority:</span> <PriorityBadge priority={lead.priority} /></p>
                  <p><span className="font-medium">Lead Score:</span> <LeadScoreBar score={lead.leadScore} /></p>
                  <p><span className="font-medium">Budget:</span> {lead.budget}</p>
                  <p><span className="font-medium">Timeline:</span> {lead.timeline}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Pain Point & Message</h4>
              <p className="text-gray-700">{lead.message}</p>
            </div>

            {onStatusUpdate && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Update Status</h4>
                <select
                  value={lead.status}
                  onChange={(e) => onStatusUpdate(lead.id, e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="demo-scheduled">Demo Scheduled</option>
                  <option value="demo-completed">Demo Completed</option>
                  <option value="converted">Converted</option>
                  <option value="lost">Lost</option>
                </select>
              </div>
            )}
          </div>
          
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <Button onClick={onClose} className="mt-3 sm:mt-0">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadsManagement;
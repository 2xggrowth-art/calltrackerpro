import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Card, Button } from '../../components/common';
import { ticketService } from '../../services/ticketService';
import { callLogService } from '../../services/callLogService';
import { notificationService } from '../../services/notificationService';
import { createRoleBasedApiClient } from '../../utils/roleBasedApi';
import toast from 'react-hot-toast';
import {
  TicketIcon,
  PhoneIcon,
  BellIcon,
  ChartBarIcon,
  UsersIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { 
    user, 
    getUserRole, 
    canViewAllTickets, 
    canViewAnalytics,
    // isSuperAdmin,
    // isOrgAdmin,
    // isManager
  } = useAuth();
  
  const [dashboardData, setDashboardData] = useState({
    tickets: { total: 0, open: 0, overdue: 0, resolved: 0 },
    calls: { today: 0, total: 0, withTickets: 0 },
    notifications: { unread: 0 },
    recentTickets: [],
    recentCalls: [],
    loading: true
  });
  
  const [organizationInfo, setOrganizationInfo] = useState(null);

  const userRole = getUserRole();

  const fetchDashboardData = useCallback(async () => {
    try {
      setDashboardData(prev => ({ ...prev, loading: true }));

      // Fetch organization info for org_admin users
      if (userRole === 'org_admin' && user?.organizationId) {
        try {
          const apiClient = createRoleBasedApiClient(user);
          if (apiClient.getOrganization) {
            const orgResponse = await apiClient.getOrganization(user.organizationId);
            setOrganizationInfo(orgResponse?.data);
          } else {
            console.warn('getOrganization method not available, using fallback organization info');
            setOrganizationInfo({
              name: 'Your Organization',
              _id: user.organizationId
            });
          }
        } catch (error) {
          console.warn('Could not fetch organization info:', error);
        }
      }

      // Fetch data based on user role
      const promises = [];

      // CallTrackerPro ticket statistics with organization context
      let ticketsPromise;
      const organizationId = user?.organizationId;
      const teamId = user?.teamId;

      console.log('📊 Fetching dashboard data for organization:', organizationId, 'team:', teamId);

      if (!organizationId) {
        console.error('❌ No organization ID found for user - dashboard data will be limited');
        setDashboardData(prev => ({ ...prev, loading: false }));
        return;
      }

      if (canViewAllTickets()) {
        // Try stats endpoint first, fallback to CallTrackerPro tickets
        ticketsPromise = ticketService.getTicketStats({ 
          organizationId, 
          teamId 
        }).catch(async (error) => {
          console.warn('📊 Stats endpoint failed, falling back to CallTrackerPro tickets:', error);
          
          // Fallback to regular CallTrackerPro tickets with organization context
          const ticketsData = await ticketService.getTickets({ 
            limit: 20,
            organizationId,
            teamId
          });
          
          return { 
            fallback: true, 
            data: ticketsData.data || [],
            organizationId,
            teamId
          };
        });
      } else {
        // Get user's assigned tickets with CallTrackerPro context
        ticketsPromise = ticketService.getMyTickets({ 
          limit: 10,
          organizationId,
          teamId,
          assignedTo: user?.id
        });
      }

      promises.push(ticketsPromise);

      // Call logs
      promises.push(
        callLogService.getCallLogs({ limit: 10 }).catch((error) => {
          console.warn('Call logs failed:', error);
          return { data: [] };
        })
      );

      // Notifications
      promises.push(
        notificationService.getUnreadCount().catch((error) => {
          console.warn('Notifications failed:', error);
          return { unread: 0 };
        })
      );

      const [ticketsResponse, callsResponse, notificationsResponse] = await Promise.all(promises);

      // Process CallTrackerPro ticket data
      let ticketStats = { 
        total: 0, 
        open: 0, 
        overdue: 0, 
        resolved: 0,
        // CallTrackerPro specific stats
        breached: 0,
        leads: 0,
        converted: 0
      };
      let recentTickets = [];

      if (ticketsResponse.fallback) {
        // Using fallback CallTrackerPro tickets data
        console.log('📊 Using fallback CallTrackerPro ticket data:', ticketsResponse.data);
        const tickets = ticketsResponse.data || [];
        
        // Map CallTrackerPro tickets for dashboard display
        recentTickets = tickets.slice(0, 5).map(ticket => ({
          ...ticket,
          // Ensure backward compatibility
          customerName: ticket.contactName || ticket.customerName,
          id: ticket._id || ticket.id,
          // CallTrackerPro specific mapping
          isOverdue: ticket.slaStatus === 'breached',
          hasCallLog: !!ticket.callLogId,
          dealValue: ticket.dealValue || 0,
          leadScore: calculateLeadScore(ticket)
        }));

        // Calculate CallTrackerPro stats
        ticketStats = {
          total: tickets.length,
          open: tickets.filter(t => ['open', 'new', 'contacted'].includes(t.status)).length,
          overdue: tickets.filter(t => t.slaStatus === 'breached').length,
          resolved: tickets.filter(t => t.status === 'resolved').length,
          // CallTrackerPro specific metrics
          breached: tickets.filter(t => t.slaStatus === 'breached').length,
          leads: tickets.filter(t => ['sales', 'lead'].includes(t.category)).length,
          converted: tickets.filter(t => t.leadStatus === 'converted').length
        };

        console.log('📊 CallTrackerPro dashboard stats:', ticketStats);
      } else if (canViewAllTickets() && ticketsResponse.stats) {
        // Using proper CallTrackerPro stats endpoint
        ticketStats = {
          ...ticketsResponse.stats,
          // Ensure CallTrackerPro metrics are included
          breached: ticketsResponse.stats.breached || 0,
          leads: ticketsResponse.stats.leads || 0,
          converted: ticketsResponse.stats.converted || 0
        };
        recentTickets = (ticketsResponse.recentTickets || []).map(ticket => ({
          ...ticket,
          customerName: ticket.contactName || ticket.customerName,
          id: ticket._id || ticket.id,
          isOverdue: ticket.slaStatus === 'breached',
          hasCallLog: !!ticket.callLogId
        }));
      } else if (ticketsResponse.data) {
        // Using user-specific CallTrackerPro tickets
        const tickets = Array.isArray(ticketsResponse.data) ? ticketsResponse.data : [ticketsResponse.data];
        
        recentTickets = tickets.slice(0, 5).map(ticket => ({
          ...ticket,
          customerName: ticket.contactName || ticket.customerName,
          id: ticket._id || ticket.id,
          isOverdue: ticket.slaStatus === 'breached',
          hasCallLog: !!ticket.callLogId
        }));

        ticketStats = {
          total: tickets.length,
          open: tickets.filter(t => ['open', 'new', 'contacted'].includes(t.status)).length,
          overdue: tickets.filter(t => t.slaStatus === 'breached').length,
          resolved: tickets.filter(t => t.status === 'resolved').length,
          breached: tickets.filter(t => t.slaStatus === 'breached').length,
          leads: tickets.filter(t => ['sales', 'lead'].includes(t.category)).length,
          converted: tickets.filter(t => t.leadStatus === 'converted').length
        };
      }

      // Process call data
      const callsData = callsResponse?.data || callsResponse || [];
      const calls = Array.isArray(callsData) ? callsData : [];
      const today = new Date().toDateString();
      const callsToday = calls.filter(call => 
        call?.createdAt && new Date(call.createdAt).toDateString() === today
      ).length;

      setDashboardData({
        tickets: ticketStats,
        calls: {
          today: callsToday,
          total: calls.length,
          withTickets: calls.filter(call => call.ticketId || call.linkedTicket).length
        },
        notifications: {
          unread: notificationsResponse.count || 0
        },
        // CallTrackerPro specific metrics
        conversion: {
          rate: ticketStats.total > 0 ? Math.round((ticketStats.converted / ticketStats.total) * 100) : 0,
          deals: ticketStats.converted
        },
        sla: {
          onTrack: ticketStats.total - ticketStats.breached,
          breached: ticketStats.breached,
          percentage: ticketStats.total > 0 ? Math.round(((ticketStats.total - ticketStats.breached) / ticketStats.total) * 100) : 100
        },
        recentTickets,
        recentCalls: calls.slice(0, 5),
        loading: false
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
      setDashboardData(prev => ({ ...prev, loading: false }));
    }
  }, [canViewAllTickets, user, userRole]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (dashboardData.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.fullName || user?.name}!
            </h1>
            <p className="text-gray-600 mt-2">
              {getRoleDisplayName(userRole)} • {getGreeting()}
              {organizationInfo && (
                <span className="ml-2 px-2 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium">
                  {organizationInfo.name}
                </span>
              )}
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            {canViewAllTickets() && (
              <Link to="/dashboard/crm/tickets/new">
                <Button className="flex items-center space-x-2">
                  <TicketIcon className="w-5 h-5" />
                  <span>New Ticket</span>
                </Button>
              </Link>
            )}
            <Link to="/dashboard/notifications">
              <Button variant="ghost" className="relative">
                <BellIcon className="w-5 h-5" />
                {dashboardData.notifications.unread > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {dashboardData.notifications.unread}
                  </span>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <StatsCard
            title="Total Tickets"
            value={dashboardData.tickets.total}
            icon={TicketIcon}
            color="primary"
            change={canViewAnalytics() ? "+12%" : null}
            trend="up"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <StatsCard
            title="Open Tickets"
            value={dashboardData.tickets.open}
            icon={ExclamationTriangleIcon}
            color="warning"
            change={canViewAnalytics() ? "-5%" : null}
            trend="down"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <StatsCard
            title="Calls Today"
            value={dashboardData.calls.today}
            icon={PhoneIcon}
            color="secondary"
            change={canViewAnalytics() ? "+8%" : null}
            trend="up"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {/* Show SLA Breached for CallTrackerPro or Resolved for others */}
          <StatsCard
            title={dashboardData.sla?.breached > 0 ? "SLA Breached" : "Resolved"}
            value={dashboardData.sla?.breached > 0 ? dashboardData.sla.breached : dashboardData.tickets.resolved}
            icon={dashboardData.sla?.breached > 0 ? ExclamationTriangleIcon : CheckCircleIcon}
            color={dashboardData.sla?.breached > 0 ? "warning" : "success"}
            change={canViewAnalytics() ? (dashboardData.sla?.breached > 0 ? "⚠️ Alert" : "+15%") : null}
            trend={dashboardData.sla?.breached > 0 ? "down" : "up"}
          />
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tickets */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Recent Tickets</h3>
              <Link to="/dashboard/crm/tickets" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                View all
              </Link>
            </div>
            <div className="space-y-4">
              {dashboardData.recentTickets.length > 0 ? (
                dashboardData.recentTickets.map((ticket) => (
                  <TicketItem key={ticket.id || ticket._id} ticket={ticket} />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <TicketIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No tickets found</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Recent Calls */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Recent Calls</h3>
              <Link to="/dashboard/crm/calls" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                View all
              </Link>
            </div>
            <div className="space-y-4">
              {dashboardData.recentCalls.length > 0 ? (
                dashboardData.recentCalls.map((call) => (
                  <CallItem key={call.id || call._id} call={call} />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <PhoneIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No calls found</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions for Different Roles */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {getQuickActions(userRole).map((action, index) => (
              <QuickActionButton key={index} {...action} />
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

// Helper Components
const StatsCard = ({ title, value, icon: Icon, color, change, trend }) => {
  const colorClasses = {
    primary: 'bg-primary-gradient text-white',
    secondary: 'bg-secondary-gradient text-white',
    success: 'bg-green-gradient text-white',
    warning: 'bg-yellow-gradient text-white',
  };

  return (
    <Card className="p-6">
      <div className="flex items-center">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="flex items-center space-x-2">
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            {change && (
              <div className={`flex items-center text-sm ${
                trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {trend === 'up' ? (
                  <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                ) : (
                  <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />
                )}
                {change}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

const TicketItem = ({ ticket }) => (
  <Link to={`/dashboard/crm/tickets/${ticket.id || ticket._id}`} className="block">
    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
      {/* SLA Status indicator for CallTrackerPro */}
      <div className={`w-3 h-3 rounded-full ${getSLAStatusColor(ticket.slaStatus || ticket.status)}`}></div>
      <div className="flex-1 min-w-0">
        {/* CallTrackerPro ticket display */}
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium text-gray-900 truncate">
            {ticket.ticketId || ticket.title || `#${ticket.id || ticket._id}`}
          </p>
          {ticket.hasCallLog && (
            <PhoneIcon className="w-3 h-3 text-blue-500" title="Has linked call" />
          )}
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <span>{ticket.contactName || ticket.customerName || 'Unknown Contact'}</span>
          {ticket.phoneNumber && (
            <>
              <span>•</span>
              <span>{ticket.phoneNumber}</span>
            </>
          )}
          {ticket.company && (
            <>
              <span>•</span>
              <span>{ticket.company}</span>
            </>
          )}
        </div>
      </div>
      <div className="text-right">
        <p className="text-xs text-gray-500">{formatDate(ticket.createdAt)}</p>
        <div className="flex space-x-1 mt-1">
          {/* CallTrackerPro call type indicator */}
          {ticket.callType && (
            <span className={`inline-block px-2 py-1 text-xs rounded-full ${
              ticket.callType === 'incoming' ? 'bg-green-100 text-green-800' : 
              ticket.callType === 'outgoing' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {ticket.callType}
            </span>
          )}
          <span className={`inline-block px-2 py-1 text-xs rounded-full ${getPriorityClass(ticket.priority)}`}>
            {ticket.priority}
          </span>
        </div>
        {/* Deal value for sales tickets */}
        {ticket.dealValue > 0 && (
          <p className="text-xs text-green-600 font-semibold mt-1">
            ${ticket.dealValue.toLocaleString()}
          </p>
        )}
      </div>
    </div>
  </Link>
);

const CallItem = ({ call }) => (
  <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
    <div className={`w-3 h-3 rounded-full ${call.type === 'incoming' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-900">{call.customerName || call.phoneNumber}</p>
      <p className="text-sm text-gray-500">{call.duration} • {call.type}</p>
    </div>
    <div className="text-right">
      <p className="text-xs text-gray-500">{formatDate(call.createdAt)}</p>
      {call.ticketId && (
        <span className="inline-block px-2 py-1 text-xs bg-primary-100 text-primary-800 rounded-full">
          Ticket Created
        </span>
      )}
    </div>
  </div>
);

const QuickActionButton = ({ title, icon: Icon, path, color = 'primary' }) => (
  <Link to={path}>
    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
      <div className="text-center">
        <Icon className={`w-8 h-8 mx-auto mb-2 text-${color}-600`} />
        <p className="text-sm font-medium text-gray-900">{title}</p>
      </div>
    </Card>
  </Link>
);

// Helper Functions
const getRoleDisplayName = (role) => {
  const roleNames = {
    super_admin: 'Super Administrator',
    org_admin: 'Organization Administrator',
    manager: 'Manager',
    agent: 'Agent',
    viewer: 'Viewer'
  };
  return roleNames[role] || 'User';
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

// Removed unused getStatusColor function

const getPriorityClass = (priority) => {
  const classes = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
  };
  return classes[priority] || 'bg-gray-100 text-gray-800';
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};

const getQuickActions = (userRole) => {
  const baseActions = [
    { title: 'View Calls', icon: PhoneIcon, path: '/dashboard/crm/calls' },
    { title: 'Notifications', icon: BellIcon, path: '/dashboard/notifications' },
  ];

  const roleSpecificActions = {
    super_admin: [
      { title: 'All Tickets', icon: TicketIcon, path: '/dashboard/crm/tickets' },
      { title: 'Analytics', icon: ChartBarIcon, path: '/dashboard/crm/analytics' },
      { title: 'Users', icon: UsersIcon, path: '/dashboard/admin/users' },
      { title: 'Organizations', icon: UsersIcon, path: '/dashboard/admin/organizations' },
    ],
    org_admin: [
      { title: 'All Tickets', icon: TicketIcon, path: '/dashboard/crm/tickets' },
      { title: 'Analytics', icon: ChartBarIcon, path: '/dashboard/crm/analytics' },
      { title: 'Team', icon: UsersIcon, path: '/dashboard/organization/users' },
    ],
    manager: [
      { title: 'Team Tickets', icon: TicketIcon, path: '/dashboard/crm/tickets' },
      { title: 'Analytics', icon: ChartBarIcon, path: '/dashboard/crm/analytics' },
    ],
    agent: [
      { title: 'My Tickets', icon: TicketIcon, path: '/dashboard/crm/tickets' },
      { title: 'New Ticket', icon: TicketIcon, path: '/dashboard/crm/tickets/new' },
    ],
    viewer: [
      { title: 'Tickets', icon: TicketIcon, path: '/dashboard/crm/tickets' },
    ]
  };

  return [...baseActions, ...(roleSpecificActions[userRole] || [])];
};

// CallTrackerPro Helper Functions
const calculateLeadScore = (ticket) => {
  let score = 0;
  
  // Interest level scoring
  if (ticket.interestLevel === 'hot') score += 30;
  else if (ticket.interestLevel === 'warm') score += 20;
  else if (ticket.interestLevel === 'cold') score += 10;
  
  // Deal value scoring
  if (ticket.dealValue > 50000) score += 25;
  else if (ticket.dealValue > 10000) score += 15;
  else if (ticket.dealValue > 1000) score += 10;
  
  // Stage scoring
  if (ticket.stage === 'qualified') score += 20;
  else if (ticket.stage === 'proposal') score += 25;
  else if (ticket.stage === 'negotiation') score += 30;
  
  // Call activity bonus
  if (ticket.callLogId) score += 10;
  
  // Budget range bonus
  if (ticket.budgetRange) score += 5;
  
  return Math.min(score, 100); // Cap at 100
};

const getSLAStatusColor = (slaStatus) => {
  switch (slaStatus) {
    case 'on_track':
    case 'on-track':
      return 'bg-green-500';
    case 'at_risk':
    case 'at-risk':
      return 'bg-yellow-500';
    case 'breached':
      return 'bg-red-500';
    // Fallback to regular status colors
    case 'open':
    case 'new':
      return 'bg-yellow-500';
    case 'in-progress':
      return 'bg-blue-500';
    case 'resolved':
    case 'closed':
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
};

export default Dashboard;
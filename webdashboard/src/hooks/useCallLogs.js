import { useState, useEffect, useCallback, useRef } from 'react';
import { callLogsApi } from '../services/callLogsApi';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export const useCallLogs = (initialFilters = {}) => {
  const { user } = useAuth();
  const [callLogs, setCallLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1
  });
  const [filters, setFilters] = useState({
    organizationId: user?.organizationId,
    ...initialFilters
  });
  const [analytics, setAnalytics] = useState(null);
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  const eventSourceRef = useRef(null);

  // Fetch call logs with current filters
  const fetchCallLogs = useCallback(async (currentFilters = filters) => {
    try {
      setLoading(true);
      console.log('🔄 Fetching call logs with filters:', currentFilters);
      
      const response = await callLogsApi.getCallLogs(currentFilters);
      
      setCallLogs(response.data || []);
      setPagination(response.pagination || {
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 1
      });

      console.log('📞 Call logs loaded:', response.data?.length || 0, 'items');
    } catch (error) {
      console.error('Error fetching call logs:', error);
      toast.error(`Failed to load call logs: ${error.message}`);
      
      // Provide fallback data for development
      setCallLogs([]);
      setPagination({ total: 0, page: 1, limit: 20, totalPages: 1 });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch call analytics
  const fetchAnalytics = useCallback(async (analyticsFilters = filters) => {
    try {
      console.log('📊 Fetching call analytics');
      const response = await callLogsApi.getCallAnalytics(analyticsFilters);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching call analytics:', error);
      // Set fallback analytics data
      setAnalytics({
        totalCalls: 0,
        answeredCalls: 0,
        missedCalls: 0,
        totalDuration: 0,
        averageDuration: 0,
        answeredRate: 0,
        totalWithTickets: 0,
        ticketCreationRate: 0,
        averageCallQuality: 0,
        dailyStats: [],
        teamStats: []
      });
    }
  }, [filters]);

  // Update filters and fetch new data
  const updateFilters = useCallback((newFilters) => {
    const updatedFilters = {
      ...filters,
      ...newFilters,
      organizationId: user?.organizationId // Always maintain organization context
    };
    
    setFilters(updatedFilters);
    fetchCallLogs(updatedFilters);
  }, [filters, user?.organizationId, fetchCallLogs]);

  // Clear all filters except organization context
  const clearFilters = useCallback(() => {
    const clearedFilters = {
      organizationId: user?.organizationId,
      page: 1,
      limit: 20
    };
    
    setFilters(clearedFilters);
    fetchCallLogs(clearedFilters);
  }, [user?.organizationId, fetchCallLogs]);

  // Handle pagination
  const handlePageChange = useCallback((page) => {
    updateFilters({ page });
  }, [updateFilters]);

  // Handle sorting
  const handleSort = useCallback((sortBy, sortOrder = 'desc') => {
    updateFilters({ sortBy, sortOrder, page: 1 });
  }, [updateFilters]);

  // Search functionality
  const handleSearch = useCallback((searchTerm) => {
    updateFilters({ search: searchTerm, page: 1 });
  }, [updateFilters]);

  // Setup real-time updates via Server-Sent Events
  const setupRealTimeUpdates = useCallback(() => {
    if (!realTimeEnabled || !user?.organizationId) return;

    try {
      // SSE endpoint not available yet — skip connection to avoid toast spam
      console.log('📞 Real-time SSE endpoint not available yet — skipping connection');
      return;

      // eslint-disable-next-line no-unreachable
      eventSourceRef.current = callLogsApi.createEventSource(user.organizationId);

      if (!eventSourceRef.current) {
        console.warn('Could not establish SSE connection');
        return;
      }

      eventSourceRef.current.onopen = () => {
        console.log('📞 Real-time call logs connection established');
        toast.success('Real-time updates enabled');
      };

      eventSourceRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📞 Real-time update received:', data);

          switch (data.type) {
            case 'new_call_log':
              setCallLogs(prev => [data.callLog, ...prev]);
              toast.success(`New ${data.callLog.callType} call from ${data.callLog.contactName || data.callLog.phoneNumber}`);
              break;
            
            case 'call_log_updated':
              setCallLogs(prev => 
                prev.map(call => 
                  call._id === data.callLog._id ? { ...call, ...data.callLog } : call
                )
              );
              break;
            
            case 'ticket_created_from_call':
              setCallLogs(prev =>
                prev.map(call =>
                  call._id === data.callLogId 
                    ? { ...call, ticketId: data.ticketId, ticketCreated: true }
                    : call
                )
              );
              toast.success('Ticket automatically created from call');
              break;
            
            default:
              console.log('Unknown real-time event type:', data.type);
          }
        } catch (error) {
          console.error('Error processing real-time update:', error);
        }
      };

      eventSourceRef.current.onerror = (error) => {
        console.error('SSE connection error:', error);
        toast.error('Real-time connection lost');
        
        // Attempt to reconnect after delay
        setTimeout(() => {
          if (realTimeEnabled) {
            setupRealTimeUpdates();
          }
        }, 5000);
      };
    } catch (error) {
      console.error('Error setting up real-time updates:', error);
    }
  }, [realTimeEnabled, user?.organizationId]);

  // Cleanup real-time connection
  const cleanupRealTimeUpdates = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      console.log('📞 Real-time connection closed');
    }
  }, []);

  // Toggle real-time updates
  const toggleRealTime = useCallback(() => {
    setRealTimeEnabled(prev => {
      const newState = !prev;
      
      if (newState) {
        setupRealTimeUpdates();
      } else {
        cleanupRealTimeUpdates();
      }
      
      return newState;
    });
  }, [setupRealTimeUpdates, cleanupRealTimeUpdates]);

  // Export call logs
  const exportCallLogs = useCallback(async (format = 'csv') => {
    try {
      console.log('📊 Exporting call logs as:', format);
      const response = await callLogsApi.exportCallLogs(filters, format);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `call-logs-${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success(`Call logs exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Error exporting call logs:', error);
      toast.error(`Failed to export call logs: ${error.message}`);
    }
  }, [filters]);

  // Refresh data
  const refresh = useCallback(() => {
    fetchCallLogs();
    fetchAnalytics();
  }, [fetchCallLogs, fetchAnalytics]);

  // Initial data fetch
  useEffect(() => {
    if (user?.organizationId) {
      fetchCallLogs();
      fetchAnalytics();
    }
  }, [user?.organizationId, fetchCallLogs, fetchAnalytics]);

  // Setup real-time updates
  useEffect(() => {
    if (realTimeEnabled && user?.organizationId) {
      setupRealTimeUpdates();
    }

    return () => {
      cleanupRealTimeUpdates();
    };
  }, [realTimeEnabled, user?.organizationId, setupRealTimeUpdates, cleanupRealTimeUpdates]);

  return {
    // Data
    callLogs,
    analytics,
    pagination,
    filters,
    loading,
    
    // Actions
    updateFilters,
    clearFilters,
    handlePageChange,
    handleSort,
    handleSearch,
    refresh,
    exportCallLogs,
    
    // Real-time
    realTimeEnabled,
    toggleRealTime,
    
    // Utils
    fetchCallLogs,
    fetchAnalytics
  };
};

export default useCallLogs;
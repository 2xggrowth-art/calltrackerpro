import api from './api';

class CallLogsApi {
  // Get call logs with advanced filtering
  async getCallLogs(filters = {}) {
    const params = new URLSearchParams();
    
    // Add all supported filters
    const allowedFilters = [
      // Organization & team context
      'organizationId', 'teamId', 'userId',
      
      // Call filters
      'callType', 'status', 'phoneNumber', 'contactName', 'company',
      
      // Date filters
      'dateFrom', 'dateTo', 'callDate',
      
      // Ticket filters
      'hasTicket', 'ticketId', 'ticketCreated', 'autoTicketCreation',
      
      // Quality & duration filters
      'minCallQuality', 'maxCallQuality', 'minDuration', 'maxDuration',
      
      // Pagination & sorting
      'page', 'limit', 'offset', 'sortBy', 'sortOrder',
      
      // Search
      'search'
    ];
    
    Object.keys(filters).forEach(key => {
      if (allowedFilters.includes(key) && filters[key] !== undefined && 
          filters[key] !== null && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });

    // Ensure organization context for multi-tenant isolation
    const currentUser = this.getCurrentUser();
    if (currentUser?.organizationId && !params.has('organizationId')) {
      params.append('organizationId', currentUser.organizationId);
    }

    try {
      console.log('📞 Fetching call logs with params:', params.toString());
      const response = await api.get(`/api/call-logs?${params.toString()}`);
      
      return {
        success: true,
        data: response.data?.data || response.data || [],
        pagination: response.data?.pagination || {
          total: response.data?.length || 0,
          page: 1,
          limit: 20,
          totalPages: 1
        },
        filters: response.data?.filters || {}
      };
    } catch (error) {
      console.error('Error fetching call logs:', error);
      throw new Error(error.message || 'Failed to fetch call logs');
    }
  }

  // Get call analytics and statistics
  async getCallAnalytics(filters = {}) {
    const params = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });

    // Add organization context
    const currentUser = this.getCurrentUser();
    if (currentUser?.organizationId && !params.has('organizationId')) {
      params.append('organizationId', currentUser.organizationId);
    }

    try {
      console.log('📊 Fetching call analytics with params:', params.toString());
      const response = await api.get(`/api/call-logs/analytics/stats?${params.toString()}`);
      
      return {
        success: true,
        data: response.data?.data || response.data || {}
      };
    } catch (error) {
      console.error('Error fetching call analytics:', error);
      throw new Error(error.message || 'Failed to fetch call analytics');
    }
  }

  // Get call history for a specific phone number
  async getCallHistory(phoneNumber, organizationId) {
    try {
      const params = new URLSearchParams();
      if (organizationId) params.append('organizationId', organizationId);
      
      console.log('📞 Fetching call history for:', phoneNumber);
      const response = await api.get(`/api/call-logs/history/${encodeURIComponent(phoneNumber)}?${params.toString()}`);
      
      return {
        success: true,
        data: response.data?.data || response.data || []
      };
    } catch (error) {
      console.error('Error fetching call history:', error);
      throw new Error(error.message || 'Failed to fetch call history');
    }
  }

  // Get single call log details
  async getCallLogById(callLogId) {
    try {
      console.log('📞 Fetching call log details for ID:', callLogId);
      const response = await api.get(`/api/call-logs/${callLogId}`);
      
      const callLog = response.data?.data || response.data;
      if (!callLog) {
        throw new Error('Call log not found');
      }

      return { 
        success: true, 
        data: callLog 
      };
    } catch (error) {
      console.error('Error fetching call log:', error);
      throw new Error(error.message || 'Failed to fetch call log details');
    }
  }

  // Create new call log with auto-ticket creation
  async createCallLog(callData) {
    try {
      const currentUser = this.getCurrentUser();
      
      const payload = {
        // Call Information
        phoneNumber: callData.phoneNumber,
        contactName: callData.contactName,
        company: callData.company,
        callType: callData.callType || 'incoming',
        callDate: callData.callDate || new Date().toISOString(),
        duration: callData.duration || 0,
        status: callData.status || 'answered',
        callQuality: callData.callQuality || 5,
        
        // Organization context
        organizationId: currentUser?.organizationId,
        teamId: callData.teamId || currentUser?.teamId,
        userId: callData.userId || currentUser?.id,
        
        // Ticket creation settings
        autoTicketCreation: callData.autoTicketCreation || true,
        ticketData: callData.ticketData,
        
        // Additional data
        notes: callData.notes,
        tags: callData.tags || []
      };

      console.log('📞 Creating call log:', payload);
      const response = await api.post('/api/call-logs', payload);
      
      return { 
        success: true, 
        data: response.data?.data || response.data 
      };
    } catch (error) {
      console.error('Error creating call log:', error);
      throw new Error(error.message || 'Failed to create call log');
    }
  }

  // Update call log
  async updateCallLog(callLogId, updateData) {
    try {
      console.log('📞 Updating call log:', callLogId, updateData);
      const response = await api.put(`/api/call-logs/${callLogId}`, updateData);
      
      return { 
        success: true, 
        data: response.data?.data || response.data 
      };
    } catch (error) {
      console.error('Error updating call log:', error);
      throw new Error(error.message || 'Failed to update call log');
    }
  }

  // Link call log to existing ticket
  async linkToTicket(callLogId, ticketId) {
    try {
      console.log('📞 Linking call log to ticket:', callLogId, ticketId);
      const response = await api.put(`/api/call-logs/${callLogId}/link-ticket`, { ticketId });
      
      return { 
        success: true, 
        data: response.data?.data || response.data 
      };
    } catch (error) {
      console.error('Error linking call log to ticket:', error);
      throw new Error(error.message || 'Failed to link call log to ticket');
    }
  }

  // Create ticket from call log
  async createTicketFromCall(callLogId, ticketData) {
    try {
      console.log('📞 Creating ticket from call log:', callLogId, ticketData);
      const response = await api.post(`/api/call-logs/${callLogId}/create-ticket`, ticketData);
      
      return { 
        success: true, 
        data: response.data?.data || response.data 
      };
    } catch (error) {
      console.error('Error creating ticket from call log:', error);
      throw new Error(error.message || 'Failed to create ticket from call log');
    }
  }

  // Export call logs
  async exportCallLogs(filters = {}, format = 'csv') {
    const params = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    
    params.append('format', format);
    
    // Add organization context
    const currentUser = this.getCurrentUser();
    if (currentUser?.organizationId) {
      params.append('organizationId', currentUser.organizationId);
    }

    try {
      console.log('📞 Exporting call logs with format:', format);
      const response = await api.get(`/api/call-logs/export?${params.toString()}`, {
        responseType: 'blob'
      });
      
      return response;
    } catch (error) {
      console.error('Error exporting call logs:', error);
      throw new Error(error.message || 'Failed to export call logs');
    }
  }

  // Get team call statistics
  async getTeamCallStats(teamId, filters = {}) {
    const params = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    
    if (teamId) params.append('teamId', teamId);

    try {
      const response = await api.get(`/api/call-logs/analytics/team-stats?${params.toString()}`);
      
      return {
        success: true,
        data: response.data?.data || response.data || {}
      };
    } catch (error) {
      console.error('Error fetching team call stats:', error);
      throw new Error(error.message || 'Failed to fetch team call statistics');
    }
  }

  // Get call quality analytics
  async getCallQualityStats(filters = {}) {
    const params = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });

    // Add organization context
    const currentUser = this.getCurrentUser();
    if (currentUser?.organizationId) {
      params.append('organizationId', currentUser.organizationId);
    }

    try {
      const response = await api.get(`/api/call-logs/analytics/quality?${params.toString()}`);
      
      return {
        success: true,
        data: response.data?.data || response.data || {}
      };
    } catch (error) {
      console.error('Error fetching call quality stats:', error);
      throw new Error(error.message || 'Failed to fetch call quality statistics');
    }
  }

  // Helper method to get current user
  getCurrentUser() {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.warn('Could not parse user data:', error);
      return null;
    }
  }

  // Real-time connection for Server-Sent Events
  createEventSource(organizationId) {
    const currentUser = this.getCurrentUser();
    const orgId = organizationId || currentUser?.organizationId;
    
    if (!orgId) {
      console.error('No organization ID provided for SSE connection');
      return null;
    }

    try {
      const eventSource = new EventSource(`${api.defaults.baseURL}/api/call-logs/stream?organizationId=${orgId}`);
      console.log('📞 Connected to call logs real-time stream for organization:', orgId);
      return eventSource;
    } catch (error) {
      console.error('Error creating SSE connection:', error);
      return null;
    }
  }
}

export const callLogsApi = new CallLogsApi();
export default callLogsApi;
import api from './api';

class TicketService {
  // Get all tickets with CallTrackerPro format and advanced filtering
  async getTickets(filters = {}) {
    const params = new URLSearchParams();
    
    // Add all CallTrackerPro filters
    const allowedFilters = [
      // Organization & team context (required for multi-tenant)
      'organizationId', 'teamId',
      
      // Core ticket fields
      'assignedTo', 'status', 'category', 'priority',
      
      // CallTrackerPro specific filters
      'slaStatus', 'leadStatus', 'stage', 'callType', 'leadSource', 
      'interestLevel', 'budgetRange',
      
      // Contact filters  
      'contactName', 'phoneNumber', 'company',
      
      // Pagination & sorting
      'page', 'limit', 'offset', 'sortBy', 'sortOrder',
      
      // Search & date filters
      'search', 'dateFrom', 'dateTo'
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
      console.log('📞 Fetching CallTrackerPro tickets with params:', params.toString());
      const response = await api.get(`/api/tickets?${params.toString()}`);
      
      // Handle CallTrackerPro response format
      return {
        success: true,
        data: response.data?.data || response.data || [],
        total: response.data?.total || response.data?.length || 0,
        page: response.data?.page || 1,
        limit: response.data?.limit || 20
      };
    } catch (error) {
      console.error('Error fetching CallTrackerPro tickets:', error);
      throw new Error(error.message || 'Failed to fetch tickets');
    }
  }

  // Get single ticket by ID with full CallTrackerPro details
  async getTicketById(ticketId) {
    try {
      console.log('🎫 Fetching CallTrackerPro ticket details for ID:', ticketId);
      const response = await api.get(`/api/tickets/${ticketId}`);
      
      const ticket = response.data?.data || response.data;
      if (!ticket) {
        throw new Error('Ticket not found');
      }

      // Ensure backward compatibility by mapping fields
      const mappedTicket = {
        ...ticket,
        // Map CallTrackerPro format to legacy fields for backward compatibility
        customerName: ticket.contactName,
        customerEmail: ticket.email,
        customerPhone: ticket.phoneNumber,
        assignedToName: ticket.assignedToName || 'Assigned User',
        isOverdue: ticket.slaStatus === 'breached'
      };

      console.log('🎫 CallTrackerPro ticket loaded:', mappedTicket);
      return { success: true, data: mappedTicket };
    } catch (error) {
      console.error('Error fetching CallTrackerPro ticket:', error);
      throw new Error(error.message || 'Failed to fetch ticket details');
    }
  }

  // Create ticket with CallTrackerPro format
  async createTicket(ticketData) {
    try {
      const currentUser = this.getCurrentUser();
      
      // Map frontend form data to CallTrackerPro format
      const payload = {
        // Contact Information (CallTrackerPro format)
        contactName: ticketData.customerName || ticketData.contactName,
        phoneNumber: ticketData.phoneNumber,
        company: ticketData.company,
        email: ticketData.email || ticketData.customerEmail,
        jobTitle: ticketData.jobTitle,
        location: ticketData.location,

        // Core ticket fields
        status: ticketData.status || 'open',
        priority: ticketData.priority || 'medium',
        category: ticketData.category || 'sales',

        // CRM Pipeline fields
        leadSource: ticketData.leadSource || 'web',
        leadStatus: ticketData.leadStatus || 'new',
        stage: ticketData.stage || 'contacted',
        interestLevel: ticketData.interestLevel || 'warm',
        budgetRange: ticketData.budgetRange,
        dealValue: ticketData.dealValue || 0,

        // Assignment
        assignedTo: ticketData.assignedTo,
        assignedTeam: ticketData.assignedTeam,

        // Multi-tenant context
        organizationId: currentUser?.organizationId,
        teamId: ticketData.teamId || currentUser?.teamId,

        // Additional fields
        description: ticketData.description,
        tags: ticketData.tags || [],
        estimatedHours: ticketData.estimatedHours
      };

      console.log('🎫 Creating CallTrackerPro ticket:', payload);
      const response = await api.post('/api/tickets', payload);
      
      return { 
        success: true, 
        data: response.data?.data || response.data 
      };
    } catch (error) {
      console.error('Error creating CallTrackerPro ticket:', error);
      throw new Error(error.message || 'Failed to create ticket');
    }
  }

  // Add note to ticket (CallTrackerPro format)
  async addTicketNote(ticketId, noteData) {
    try {
      const currentUser = this.getCurrentUser();
      
      const payload = {
        note: noteData.content || noteData.note,
        author: currentUser?.id,
        authorName: currentUser?.fullName || currentUser?.name,
        noteType: noteData.type || 'agent', // agent/client/system
        isPrivate: noteData.isPrivate || false
      };

      console.log('📝 Adding CallTrackerPro note to ticket:', ticketId, payload);
      const response = await api.post(`/api/tickets/${ticketId}/notes`, payload);
      
      return { 
        success: true, 
        data: response.data?.data || response.data 
      };
    } catch (error) {
      console.error('Error adding CallTrackerPro note:', error);
      throw new Error(error.message || 'Failed to add note');
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

  // Get tickets assigned to current user
  async getMyTickets(filters = {}) {
    const params = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });

    try {
      const response = await api.get(`/api/tickets/my?${params.toString()}`);
      return response;
    } catch (error) {
      console.error('Error fetching my tickets:', error);
      throw new Error(error.message || 'Failed to fetch my tickets');
    }
  }

  // Get overdue tickets
  async getOverdueTickets(filters = {}) {
    const params = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });

    try {
      const response = await api.get(`/api/tickets/overdue?${params.toString()}`);
      return response;
    } catch (error) {
      console.error('Error fetching overdue tickets:', error);
      throw new Error(error.message || 'Failed to fetch overdue tickets');
    }
  }

  // Get single ticket by ID
  async getTicket(ticketId) {
    try {
      const response = await api.get(`/api/tickets/${ticketId}`);
      return response;
    } catch (error) {
      console.error('Error fetching ticket:', error);
      throw new Error(error.message || 'Failed to fetch ticket');
    }
  }

  // Legacy createTicket method removed - using CallTrackerPro version above

  // Update existing ticket
  async updateTicket(ticketId, updateData) {
    try {
      const response = await api.put(`/api/tickets/${ticketId}`, updateData);
      return response;
    } catch (error) {
      console.error('Error updating ticket:', error);
      throw new Error(error.message || 'Failed to update ticket');
    }
  }

  // Archive (soft delete) ticket
  async archiveTicket(ticketId) {
    try {
      const response = await api.delete(`/api/tickets/${ticketId}`);
      return response;
    } catch (error) {
      console.error('Error archiving ticket:', error);
      throw new Error(error.message || 'Failed to archive ticket');
    }
  }

  // Get ticket history/audit trail
  async getTicketHistory(ticketId) {
    try {
      const response = await api.get(`/api/tickets/${ticketId}/history`);
      return response;
    } catch (error) {
      console.error('Error fetching ticket history:', error);
      throw new Error(error.message || 'Failed to fetch ticket history');
    }
  }

  // Get ticket notes
  async getTicketNotes(ticketId) {
    try {
      const response = await api.get(`/api/tickets/${ticketId}/notes`);
      return response;
    } catch (error) {
      console.error('Error fetching ticket notes:', error);
      throw new Error(error.message || 'Failed to fetch ticket notes');
    }
  }

  // Legacy addTicketNote method removed - using CallTrackerPro version above

  // Get ticket statistics
  async getTicketStats(filters = {}) {
    const params = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });

    // Add organization ID as query parameter for CORS compatibility
    const currentOrganization = localStorage.getItem('currentOrganization');
    if (currentOrganization) {
      try {
        const orgData = JSON.parse(currentOrganization);
        params.append('organization_id', orgData._id || orgData.id);
      } catch (e) {
        console.warn('Could not parse organization data:', e);
      }
    }

    try {
      const response = await api.get(`/api/tickets/stats?${params.toString()}`);
      return response;
    } catch (error) {
      console.error('Error fetching ticket stats:', error);
      throw new Error(error.message || 'Failed to fetch ticket statistics');
    }
  }

  // Bulk operations
  async bulkUpdateTickets(ticketIds, updateData) {
    try {
      const response = await api.post('/api/tickets/bulk-update', {
        ticketIds,
        updateData
      });
      return response;
    } catch (error) {
      console.error('Error bulk updating tickets:', error);
      throw new Error(error.message || 'Failed to bulk update tickets');
    }
  }

  async bulkArchiveTickets(ticketIds) {
    try {
      const response = await api.post('/api/tickets/bulk-archive', {
        ticketIds
      });
      return response;
    } catch (error) {
      console.error('Error bulk archiving tickets:', error);
      throw new Error(error.message || 'Failed to bulk archive tickets');
    }
  }

  // Export tickets
  async exportTickets(filters = {}, format = 'csv') {
    const params = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    
    params.append('format', format);

    try {
      const response = await api.get(`/api/tickets/export?${params.toString()}`, {
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      console.error('Error exporting tickets:', error);
      throw new Error(error.message || 'Failed to export tickets');
    }
  }

  // Integration with call logs
  async createTicketFromCall(callLogId, ticketData) {
    try {
      const response = await api.post(`/api/call-logs/${callLogId}/create-ticket`, ticketData);
      return response;
    } catch (error) {
      console.error('Error creating ticket from call:', error);
      throw new Error(error.message || 'Failed to create ticket from call');
    }
  }

  async linkTicketToCall(callLogId, ticketId) {
    try {
      const response = await api.put(`/api/call-logs/${callLogId}/link-ticket`, {
        ticketId
      });
      return response;
    } catch (error) {
      console.error('Error linking ticket to call:', error);
      throw new Error(error.message || 'Failed to link ticket to call');
    }
  }

  async unlinkTicketFromCall(callLogId) {
    try {
      const response = await api.delete(`/api/call-logs/${callLogId}/unlink-ticket`);
      return response;
    } catch (error) {
      console.error('Error unlinking ticket from call:', error);
      throw new Error(error.message || 'Failed to unlink ticket from call');
    }
  }

  // Get calls without tickets
  async getCallsWithoutTickets(filters = {}) {
    const params = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });

    try {
      const response = await api.get(`/api/call-logs/without-tickets?${params.toString()}`);
      return response;
    } catch (error) {
      console.error('Error fetching calls without tickets:', error);
      throw new Error(error.message || 'Failed to fetch calls without tickets');
    }
  }

  // Get ticket creation analytics from calls
  async getCallTicketStats() {
    try {
      const response = await api.get('/api/call-logs/ticket-stats');
      return response;
    } catch (error) {
      console.error('Error fetching call ticket stats:', error);
      throw new Error(error.message || 'Failed to fetch call ticket statistics');
    }
  }

  // ========= ENHANCED CRM & PIPELINE FEATURES =========
  
  // Assign ticket to user/team
  async assignTicket(ticketId, assignmentData) {
    try {
      const response = await api.post(`/api/tickets/${ticketId}/assign`, assignmentData);
      return response;
    } catch (error) {
      console.error('Error assigning ticket:', error);
      throw new Error(error.message || 'Failed to assign ticket');
    }
  }

  // Escalate ticket
  async escalateTicket(ticketId, escalationData) {
    try {
      const response = await api.post(`/api/tickets/${ticketId}/escalate`, escalationData);
      return response;
    } catch (error) {
      console.error('Error escalating ticket:', error);
      throw new Error(error.message || 'Failed to escalate ticket');
    }
  }

  // Update ticket status
  async updateTicketStatus(ticketId, status, reason = '') {
    try {
      const response = await api.put(`/api/tickets/${ticketId}/status`, { status, reason });
      return response;
    } catch (error) {
      console.error('Error updating ticket status:', error);
      throw new Error(error.message || 'Failed to update ticket status');
    }
  }

  // Update CRM pipeline stage
  async updatePipelineStage(ticketId, stage, stageData = {}) {
    try {
      const response = await api.put(`/api/tickets/${ticketId}/stage`, { stage, ...stageData });
      return response;
    } catch (error) {
      console.error('Error updating pipeline stage:', error);
      throw new Error(error.message || 'Failed to update pipeline stage');
    }
  }

  // Submit customer satisfaction rating
  async submitSatisfactionRating(ticketId, ratingData) {
    try {
      const response = await api.post(`/api/tickets/${ticketId}/satisfaction`, ratingData);
      return response;
    } catch (error) {
      console.error('Error submitting satisfaction rating:', error);
      throw new Error(error.message || 'Failed to submit satisfaction rating');
    }
  }

  // Schedule follow-up
  async scheduleFollowUp(ticketId, followUpData) {
    try {
      const response = await api.post(`/api/tickets/${ticketId}/follow-up`, followUpData);
      return response;
    } catch (error) {
      console.error('Error scheduling follow-up:', error);
      throw new Error(error.message || 'Failed to schedule follow-up');
    }
  }

  // Get pipeline analytics
  async getPipelineAnalytics(filters = {}) {
    const params = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });

    try {
      const response = await api.get(`/api/tickets/analytics/pipeline?${params.toString()}`);
      return response;
    } catch (error) {
      console.error('Error fetching pipeline analytics:', error);
      throw new Error(error.message || 'Failed to fetch pipeline analytics');
    }
  }

  // Get conversion analytics
  async getConversionAnalytics(filters = {}) {
    const params = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });

    try {
      const response = await api.get(`/api/tickets/analytics/conversion?${params.toString()}`);
      return response;
    } catch (error) {
      console.error('Error fetching conversion analytics:', error);
      throw new Error(error.message || 'Failed to fetch conversion analytics');
    }
  }

  // Get SLA analytics
  async getSLAAnalytics(filters = {}) {
    const params = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });

    try {
      const response = await api.get(`/api/tickets/analytics/sla?${params.toString()}`);
      return response;
    } catch (error) {
      console.error('Error fetching SLA analytics:', error);
      throw new Error(error.message || 'Failed to fetch SLA analytics');
    }
  }

  // Get tickets by lead status for CRM pipeline
  async getTicketsByLeadStatus() {
    try {
      const response = await api.get('/api/tickets/by-lead-status');
      return response;
    } catch (error) {
      console.error('Error fetching tickets by lead status:', error);
      throw new Error(error.message || 'Failed to fetch tickets by lead status');
    }
  }

  // Get tickets by pipeline stage
  async getTicketsByStage() {
    try {
      // Backend endpoint not available yet - return mock data
      console.log('🔄 Pipeline stage endpoint not available yet - using fallback data');
      return {
        success: true,
        data: {
          'new': [],
          'in-progress': [],
          'pending-review': [],
          'resolved': [],
          'closed': []
        }
      };
    } catch (error) {
      console.error('Error fetching tickets by stage:', error);
      throw new Error(error.message || 'Failed to fetch tickets by stage');
    }
  }
}

export const ticketService = new TicketService();
export default ticketService;
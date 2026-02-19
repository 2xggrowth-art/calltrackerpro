// Legacy callLogService - now uses comprehensive callLogsApi
import { callLogsApi } from './callLogsApi';

export const callLogService = {
  // Legacy method - delegates to new API
  async getCallLogs(params = {}) {
    try {
      const response = await callLogsApi.getCallLogs(params);
      // Maintain backward compatibility with old response format
      return {
        data: response.data,
        pagination: response.pagination,
        filters: response.filters
      };
    } catch (error) {
      console.error('Error in legacy getCallLogs:', error);
      
      // Provide fallback data for backward compatibility
      return {
        data: [],
        pagination: { total: 0, page: 1, limit: 20, totalPages: 1 },
        filters: {}
      };
    }
  },

  async createCallLog(callLogData) {
    try {
      const response = await callLogsApi.createCallLog(callLogData);
      return response;
    } catch (error) {
      console.error('Error creating call log:', error);
      throw error;
    }
  },

  async getCallLog(callLogId) {
    try {
      const response = await callLogsApi.getCallLogById(callLogId);
      return response;
    } catch (error) {
      console.error('Error fetching call log:', error);
      throw error;
    }
  },

  async updateCallLog(callLogId, callLogData) {
    try {
      const response = await callLogsApi.updateCallLog(callLogId, callLogData);
      return response;
    } catch (error) {
      console.error('Error updating call log:', error);
      throw error;
    }
  },

  async deleteCallLog(callLogId) {
    try {
      // Note: Delete functionality not implemented in callLogsApi
      // Would need to be added if deletion is required
      console.warn('Delete functionality not implemented in new callLogsApi');
      throw new Error('Delete functionality not available');
    } catch (error) {
      console.error('Error deleting call log:', error);
      throw error;
    }
  },

  // New enhanced methods available through the comprehensive API
  async getCallAnalytics(filters = {}) {
    return callLogsApi.getCallAnalytics(filters);
  },

  async getCallHistory(phoneNumber, organizationId) {
    return callLogsApi.getCallHistory(phoneNumber, organizationId);
  },

  async createTicketFromCall(callLogId, ticketData) {
    return callLogsApi.createTicketFromCall(callLogId, ticketData);
  },

  async linkToTicket(callLogId, ticketId) {
    return callLogsApi.linkToTicket(callLogId, ticketId);
  },

  async exportCallLogs(filters = {}, format = 'csv') {
    return callLogsApi.exportCallLogs(filters, format);
  },

  createEventSource(organizationId) {
    return callLogsApi.createEventSource(organizationId);
  }
};

export default callLogService;
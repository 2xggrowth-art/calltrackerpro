
import api from './api';

export const demoService = {
  // Submit demo request
  async submitDemo(demoData) {
    try {
      console.log('📝 Submitting demo request:', demoData);
      
      // Transform field names to match backend expectations
      const backendData = {
        name: demoData.name,
        email: demoData.email,
        phone: demoData.phone || '',
        company: demoData.company || '',
        urgency: demoData.urgency,
        timeline: demoData.timeline,
        budget: demoData.budget,
        current_pain: demoData.currentPain, // Backend expects snake_case
        message: demoData.message || ''
      };

      console.log('📤 Sending to backend:', backendData);
      
      const response = await api.post('/api/demo-requests', backendData);

      console.log('✅ Demo submitted successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Demo submission failed:', error);
      throw error;
    }
  },

  // Fetch all demos (for super admin)
  async getAllDemos(filters = {}) {
    try {
      const queryParams = new URLSearchParams();

      // Add filters if provided
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.urgency) queryParams.append('urgency', filters.urgency);
      if (filters.priority) queryParams.append('priority', filters.priority);
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);

      const endpoint = `/api/demo-requests${queryParams.toString() ? 
        '?' + queryParams.toString() : ''}`;

      console.log('📡 Fetching demos from:', endpoint);

      const response = await api.get(endpoint);

      console.log('📊 Demos fetched:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch demos:', error);
      // Handle endpoint not available gracefully
      if (error.message && error.message.includes('Endpoint not found')) {
        console.warn('Demo requests endpoint not available - using empty data');
        return {
          success: true,
          data: [],
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false
          }
        };
      }
      throw error;
    }
  },

  // Get demo analytics
  async getDemoAnalytics() {
    try {
      const response = await api.get('/api/demo-requests/analytics');
      console.log('📈 Analytics fetched:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch demo analytics:', error);
      // Handle endpoint not available gracefully
      if (error.message && error.message.includes('Endpoint not found')) {
        console.warn('Demo requests analytics endpoint not available - using fallback data');
        return {
          success: true,
          data: {
            totalRequests: 0,
            urgencyBreakdown: { urgent: 0, planned: 0, exploring: 0 },
            priorityDistribution: { high: 0, medium: 0, low: 0 },
            conversionRate: 0
          }
        };
      }
      throw error;
    }
  },

  // Update demo request status
  async updateDemoStatus(demoId, status) {
    try {
      const response = await api.put(`/api/demo-requests/${demoId}/status`, { status });
      console.log('✅ Demo status updated:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to update demo status:', error);
      throw error;
    }
  }
};

export default demoService;
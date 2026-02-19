import { getCurrentApiUrl } from './api';

class RealTimeService {
  constructor() {
    this.eventSource = null;
    this.websocket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // Start with 1 second
    this.listeners = new Map();
    this.isConnected = false;
    this.currentOrganization = null;
    this.currentTeam = null;
  }

  // ========= SERVER-SENT EVENTS (SSE) IMPLEMENTATION =========
  
  /**
   * Initialize SSE connection for real-time ticket updates
   * @param {string} organizationId - Organization ID for multi-tenant isolation
   * @param {string} teamId - Optional team ID for team-specific updates
   */
  initializeSSE(organizationId, teamId = null) {
    try {
      this.currentOrganization = organizationId;
      this.currentTeam = teamId;
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('🚨 No auth token available for SSE connection');
        return;
      }

      // Close existing connection
      this.closeSSE();

      // SSE endpoint not available on backend yet - disable for now
      console.log('🔄 SSE endpoint not available yet - real-time features disabled');
      return;

    } catch (error) {
      console.error('🚨 Error initializing SSE:', error);
    }
  }

  /**
   * Handle incoming SSE messages and emit appropriate events
   * @param {object} data - Message data from SSE
   */
  handleSSEMessage(data) {
    const { type, payload } = data;

    switch (type) {
      case 'ticket-created':
        this.emit('ticket-created', payload);
        break;
      case 'ticket-updated': 
        this.emit('ticket-updated', payload);
        break;
      case 'ticket-assigned':
        this.emit('ticket-assigned', payload);
        break;
      case 'ticket-escalated':
        this.emit('ticket-escalated', payload);
        break;
      case 'ticket-resolved':
        this.emit('ticket-resolved', payload);
        break;
      case 'ticket-closed':
        this.emit('ticket-closed', payload);
        break;
      case 'sla-breach-warning':
        this.emit('sla-breach-warning', payload);
        break;
      case 'sla-breach':
        this.emit('sla-breach', payload);
        break;
      case 'pipeline-stage-changed':
        this.emit('pipeline-stage-changed', payload);
        break;
      case 'follow-up-due':
        this.emit('follow-up-due', payload);
        break;
      default:
        console.log('📨 Unknown SSE message type:', type);
        this.emit('unknown-message', data);
    }
  }

  /**
   * Attempt to reconnect SSE with exponential backoff
   */
  attemptSSEReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('🚨 Max SSE reconnection attempts reached');
      this.emit('connection', { status: 'failed', type: 'sse' });
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`🔄 Attempting SSE reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);

    setTimeout(() => {
      if (this.currentOrganization) {
        this.initializeSSE(this.currentOrganization, this.currentTeam);
      }
    }, delay);
  }

  /**
   * Close SSE connection
   */
  closeSSE() {
    if (this.eventSource) {
      console.log('🔌 Closing SSE connection');
      this.eventSource.close();
      this.eventSource = null;
      this.isConnected = false;
    }
  }

  // ========= WEBSOCKET IMPLEMENTATION =========
  
  /**
   * Initialize WebSocket connection for real-time notifications
   * @param {string} organizationId - Organization ID for multi-tenant isolation
   */
  initializeWebSocket(organizationId) {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('🚨 No auth token available for WebSocket connection');
        return;
      }

      // Close existing connection
      this.closeWebSocket();

      const baseUrl = getCurrentApiUrl().replace('http', 'ws').replace('/api', '');
      const wsUrl = `${baseUrl}/ws?token=${encodeURIComponent(token)}&organization_id=${organizationId}`;

      console.log('🔄 Initializing WebSocket connection:', wsUrl);

      this.websocket = new WebSocket(wsUrl);

      this.websocket.onopen = (event) => {
        console.log('✅ WebSocket connection established');
        this.emit('websocket-connection', { status: 'connected' });
      };

      this.websocket.onmessage = (event) => {
        try {
          const notification = JSON.parse(event.data);
          console.log('📨 WebSocket message received:', notification);
          this.handleWebSocketMessage(notification);
        } catch (error) {
          console.error('🚨 Error parsing WebSocket message:', error);
        }
      };

      this.websocket.onclose = (event) => {
        console.log('🔌 WebSocket connection closed:', event.code, event.reason);
        this.emit('websocket-connection', { status: 'closed', code: event.code, reason: event.reason });
      };

      this.websocket.onerror = (event) => {
        console.error('🚨 WebSocket error:', event);
        this.emit('websocket-connection', { status: 'error', error: event });
      };

    } catch (error) {
      console.error('🚨 Error initializing WebSocket:', error);
    }
  }

  /**
   * Handle incoming WebSocket messages (notifications)
   * @param {object} notification - Notification data from WebSocket
   */
  handleWebSocketMessage(notification) {
    const { type, title, message, data, priority = 'normal' } = notification;

    // Emit specific notification events
    this.emit('notification', {
      type,
      title,
      message,
      data,
      priority,
      timestamp: new Date().toISOString()
    });

    // Handle specific notification types
    switch (type) {
      case 'ticket-assignment':
        this.emit('ticket-assignment-notification', notification);
        break;
      case 'sla-warning':
        this.emit('sla-warning-notification', notification);
        break;
      case 'system-alert':
        this.emit('system-alert-notification', notification);
        break;
      case 'user-mention':
        this.emit('user-mention-notification', notification);
        break;
      default:
        console.log('📨 Unknown WebSocket notification type:', type);
    }
  }

  /**
   * Send message through WebSocket
   * @param {object} message - Message to send
   */
  sendWebSocketMessage(message) {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify(message));
    } else {
      console.warn('⚠️ WebSocket not connected, cannot send message');
    }
  }

  /**
   * Close WebSocket connection
   */
  closeWebSocket() {
    if (this.websocket) {
      console.log('🔌 Closing WebSocket connection');
      this.websocket.close();
      this.websocket = null;
    }
  }

  // ========= EVENT MANAGEMENT =========
  
  /**
   * Add event listener
   * @param {string} event - Event name
   * @param {function} callback - Callback function
   */
  addEventListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {function} callback - Callback function to remove
   */
  removeEventListener(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Remove all listeners for an event
   * @param {string} event - Event name
   */
  removeAllListeners(event) {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * Emit event to all listeners
   * @param {string} event - Event name
   * @param {*} data - Data to pass to listeners
   */
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`🚨 Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // ========= UTILITY METHODS =========
  
  /**
   * Get connection status
   * @returns {object} Connection status for both SSE and WebSocket
   */
  getConnectionStatus() {
    return {
      sse: {
        connected: this.isConnected,
        readyState: this.eventSource?.readyState
      },
      websocket: {
        connected: this.websocket?.readyState === WebSocket.OPEN,
        readyState: this.websocket?.readyState
      }
    };
  }

  /**
   * Disconnect all real-time connections
   */
  disconnect() {
    console.log('🔌 Disconnecting all real-time connections');
    this.closeSSE();
    this.closeWebSocket();
    this.removeAllListeners();
    this.currentOrganization = null;
    this.currentTeam = null;
  }

  /**
   * Reconnect with current organization and team
   */
  reconnect() {
    if (this.currentOrganization) {
      console.log('🔄 Reconnecting real-time services');
      this.initializeSSE(this.currentOrganization, this.currentTeam);
      this.initializeWebSocket(this.currentOrganization);
    }
  }
}

// Create singleton instance
export const realTimeService = new RealTimeService();
export default realTimeService;
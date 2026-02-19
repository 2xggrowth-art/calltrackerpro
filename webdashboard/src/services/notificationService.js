import api from './api';

class NotificationService {
  constructor() {
    this.eventSource = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // Start with 1 second
  }

  // Get all notifications
  async getNotifications(filters = {}) {
    const params = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });

    try {
      const response = await api.get(`/notifications?${params.toString()}`);
      return response;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw new Error(error.message || 'Failed to fetch notifications');
    }
  }

  // Get unread notifications count
  async getUnreadCount() {
    try {
      const response = await api.get('/notifications/unread');
      return response;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw new Error(error.message || 'Failed to fetch unread count');
    }
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      const response = await api.put(`/api/notifications/${notificationId}/read`);
      return response;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw new Error(error.message || 'Failed to mark notification as read');
    }
  }

  // Mark all notifications as read
  async markAllAsRead() {
    try {
      const response = await api.put('/api/notifications/mark-all-read');
      return response;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw new Error(error.message || 'Failed to mark all notifications as read');
    }
  }

  // Delete notification
  async deleteNotification(notificationId) {
    try {
      const response = await api.delete(`/notifications/${notificationId}`);
      return response;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw new Error(error.message || 'Failed to delete notification');
    }
  }

  // Get notification statistics
  async getNotificationStats() {
    try {
      const response = await api.get('/notifications/stats');
      return response;
    } catch (error) {
      console.error('Error fetching notification stats:', error);
      throw new Error(error.message || 'Failed to fetch notification stats');
    }
  }

  // Real-time SSE connection
  connectToSSE(onMessage, onError, onConnect) {
    if (this.eventSource) {
      this.eventSource.close();
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No auth token available for SSE connection');
      return;
    }

    const sseUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/notifications/stream`;
    
    try {
      this.eventSource = new EventSource(`${sseUrl}?token=${token}`);

      this.eventSource.onopen = (event) => {
        console.log('SSE connection opened');
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
        if (onConnect) onConnect();
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (onMessage) onMessage(data);
          
          // Emit to all registered listeners
          this.listeners.forEach((callback, eventType) => {
            if (data.type === eventType || eventType === 'all') {
              callback(data);
            }
          });
        } catch (error) {
          console.error('Error parsing SSE message:', error);
        }
      };

      this.eventSource.onerror = (event) => {
        console.error('SSE connection error:', event);
        
        if (this.eventSource.readyState === EventSource.CLOSED) {
          this.handleReconnect();
        }
        
        if (onError) onError(event);
      };

      // Handle specific event types
      this.eventSource.addEventListener('ticket-created', (event) => {
        const data = JSON.parse(event.data);
        this.notifyListeners('ticket-created', data);
      });

      this.eventSource.addEventListener('ticket-updated', (event) => {
        const data = JSON.parse(event.data);
        this.notifyListeners('ticket-updated', data);
      });

      this.eventSource.addEventListener('ticket-assigned', (event) => {
        const data = JSON.parse(event.data);
        this.notifyListeners('ticket-assigned', data);
      });

      this.eventSource.addEventListener('notification', (event) => {
        const data = JSON.parse(event.data);
        this.notifyListeners('notification', data);
      });

      this.eventSource.addEventListener('call-logged', (event) => {
        const data = JSON.parse(event.data);
        this.notifyListeners('call-logged', data);
      });

    } catch (error) {
      console.error('Error establishing SSE connection:', error);
      if (onError) onError(error);
    }
  }

  // Handle SSE reconnection
  handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    setTimeout(() => {
      console.log(`Attempting to reconnect SSE (attempt ${this.reconnectAttempts + 1})`);
      this.reconnectAttempts++;
      this.reconnectDelay *= 2; // Exponential backoff
      
      // Try to reconnect with the same handlers
      this.connectToSSE();
    }, this.reconnectDelay);
  }

  // Register event listener
  addEventListener(eventType, callback) {
    this.listeners.set(eventType, callback);
  }

  // Remove event listener
  removeEventListener(eventType) {
    this.listeners.delete(eventType);
  }

  // Notify all listeners of a specific event type
  notifyListeners(eventType, data) {
    const callback = this.listeners.get(eventType);
    if (callback) {
      callback(data);
    }
    
    // Also notify 'all' listeners
    const allCallback = this.listeners.get('all');
    if (allCallback) {
      allCallback({ type: eventType, ...data });
    }
  }

  // Close SSE connection
  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.listeners.clear();
    this.reconnectAttempts = 0;
  }

  // Check if connected
  isConnected() {
    return this.eventSource && this.eventSource.readyState === EventSource.OPEN;
  }

  // Browser notification integration
  async requestNotificationPermission() {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  // Show browser notification
  showBrowserNotification(title, options = {}) {
    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
        if (options.onClick) {
          options.onClick();
        }
      };

      // Auto close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      return notification;
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;
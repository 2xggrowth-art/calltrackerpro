import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ExclamationTriangleIcon,
  XMarkIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import { Button } from '../common';

const UrgentLeadNotifications = ({ onNavigateToLead }) => {
  const [urgentLeads, setUrgentLeads] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [hasPermission, setHasPermission] = useState(false);

  // Request notification permission on component mount
  useEffect(() => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        setHasPermission(true);
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          setHasPermission(permission === 'granted');
        });
      }
    }
  }, []);

  // Poll for urgent leads every 30 seconds
  useEffect(() => {
    const checkUrgentLeads = async () => {
      try {
        // In real app, this would be an API call
        // const response = await fetch('/api/demo-requests?urgency=urgent&status=new');
        // const leads = await response.json();
        
        // Mock urgent leads for demo
        const mockUrgentLeads = [
          {
            id: '1',
            name: 'Arsalan Ahmed',
            email: 'arsalanahmed507@gmail.com',
            company: '567890',
            phone: '0538180217',
            urgency: 'urgent',
            currentPain: 'wasted-ad-spend',
            message: 'Need better call tracking ASAP!',
            createdAt: new Date(),
            followUpDate: new Date(Date.now() - 86400000) // Overdue
          }
        ];

        const newUrgentLeads = mockUrgentLeads.filter(lead => 
          !urgentLeads.find(existing => existing.id === lead.id)
        );

        if (newUrgentLeads.length > 0) {
          setUrgentLeads(prev => [...prev, ...newUrgentLeads]);
          
          // Create notifications for new urgent leads
          newUrgentLeads.forEach(lead => {
            const notification = {
              id: `urgent-${lead.id}-${Date.now()}`,
              type: 'urgent',
              lead,
              createdAt: new Date(),
              dismissed: false
            };
            
            setNotifications(prev => [...prev, notification]);
            
            // Show browser notification if permission granted
            if (hasPermission && 'Notification' in window) {
              new Notification('🔥 New Urgent Lead!', {
                body: `${lead.name} from ${lead.company} needs immediate attention`,
                icon: '/favicon.ico',
                tag: lead.id,
                requireInteraction: true
              });
            }
            
            // Play notification sound
            playNotificationSound();
          });
        }
      } catch (error) {
        console.error('Error checking urgent leads:', error);
      }
    };

    // Check immediately
    checkUrgentLeads();

    // Set up polling interval
    const interval = setInterval(checkUrgentLeads, 30000);

    return () => clearInterval(interval);
  }, [urgentLeads, hasPermission]);

  // Auto-dismiss notifications after 2 minutes
  useEffect(() => {
    notifications.forEach(notification => {
      if (!notification.dismissed && new Date() - notification.createdAt > 120000) {
        dismissNotification(notification.id);
      }
    });
  }, [notifications]);

  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification-sound.mp3');
      audio.volume = 0.5;
      audio.play().catch(e => console.log('Could not play notification sound:', e));
    } catch (error) {
      console.log('Notification sound not available');
    }
  };

  const dismissNotification = (notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, dismissed: true }
          : notification
      )
    );
  };

  const handleQuickAction = (action, lead) => {
    switch (action) {
      case 'call':
        window.open(`tel:${lead.phone}`);
        break;
      case 'email':
        window.open(`mailto:${lead.email}?subject=Urgent: CallTracker Pro Demo Request&body=Hi ${lead.name},%0D%0A%0D%0AThank you for your urgent demo request. I'm reaching out immediately to help you with your call tracking needs.`);
        break;
      case 'schedule':
        // In real app, this would open a scheduling modal/widget
        console.log('Opening scheduler for', lead.name);
        break;
      case 'view':
        onNavigateToLead?.(lead.id);
        break;
    }
  };

  const activeNotifications = notifications.filter(n => !n.dismissed);

  return (
    <>
      {/* Notification Bell with Badge */}
      <div className="relative">
        <BellIcon className="w-6 h-6 text-gray-400" />
        {activeNotifications.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            {activeNotifications.length}
          </span>
        )}
      </div>

      {/* Notification Toasts */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        <AnimatePresence>
          {activeNotifications.map(notification => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.8 }}
              className="bg-white rounded-lg shadow-lg border-l-4 border-red-500 p-4 max-w-sm"
            >
              <UrgentLeadNotification
                notification={notification}
                onDismiss={dismissNotification}
                onQuickAction={handleQuickAction}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Overdue Follow-up Alerts */}
      <OverdueFollowupAlert leads={urgentLeads} onQuickAction={handleQuickAction} />
    </>
  );
};

// Individual Notification Component
const UrgentLeadNotification = ({ notification, onDismiss, onQuickAction }) => {
  const { lead } = notification;

  return (
    <div className="relative">
      {/* Close Button */}
      <button
        onClick={() => onDismiss(notification.id)}
        className="absolute top-0 right-0 text-gray-400 hover:text-gray-600"
      >
        <XMarkIcon className="w-4 h-4" />
      </button>

      {/* Alert Header */}
      <div className="flex items-center space-x-2 mb-2">
        <ExclamationTriangleIcon className="w-5 h-5 text-red-500 animate-pulse" />
        <span className="font-bold text-red-600 text-sm">URGENT LEAD</span>
      </div>

      {/* Lead Info */}
      <div className="mb-3">
        <p className="font-semibold text-gray-900">{lead.name}</p>
        <p className="text-sm text-gray-600">{lead.company}</p>
        <p className="text-xs text-gray-500 mt-1">{lead.message}</p>
      </div>

      {/* Quick Actions */}
      <div className="flex space-x-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onQuickAction('call', lead)}
          className="text-xs px-2 py-1"
        >
          <PhoneIcon className="w-3 h-3 mr-1" />
          Call
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onQuickAction('email', lead)}
          className="text-xs px-2 py-1"
        >
          <EnvelopeIcon className="w-3 h-3 mr-1" />
          Email
        </Button>
        <Button
          size="sm"
          onClick={() => onQuickAction('view', lead)}
          className="text-xs px-2 py-1"
        >
          View
        </Button>
      </div>

      {/* Urgency Indicator */}
      <div className="mt-2 text-xs text-gray-500">
        Submitted {new Date(lead.createdAt).toLocaleTimeString()}
      </div>
    </div>
  );
};

// Overdue Follow-up Alert Component
const OverdueFollowupAlert = ({ leads, onQuickAction }) => {
  const overdueLeads = leads.filter(lead => 
    lead.followUpDate && new Date(lead.followUpDate) < new Date()
  );

  if (overdueLeads.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-orange-50 border border-orange-200 rounded-lg p-4 shadow-lg max-w-sm"
      >
        <div className="flex items-center space-x-2 mb-2">
          <ExclamationTriangleIcon className="w-5 h-5 text-orange-500" />
          <span className="font-semibold text-orange-700">
            {overdueLeads.length} Overdue Follow-up{overdueLeads.length > 1 ? 's' : ''}
          </span>
        </div>
        
        <div className="space-y-2">
          {overdueLeads.slice(0, 3).map(lead => (
            <div key={lead.id} className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-900">{lead.name}</p>
                <p className="text-xs text-gray-500">
                  Due {new Date(lead.followUpDate).toLocaleDateString()}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onQuickAction('view', lead)}
                className="text-xs"
              >
                Follow Up
              </Button>
            </div>
          ))}
        </div>
        
        {overdueLeads.length > 3 && (
          <p className="text-xs text-gray-500 mt-2">
            And {overdueLeads.length - 3} more overdue leads...
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default UrgentLeadNotifications;
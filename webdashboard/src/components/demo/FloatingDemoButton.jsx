import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ChatBubbleLeftRightIcon, 
  PhoneIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';
import ScheduleDemoForm from './ScheduleDemoForm';

const FloatingDemoButton = ({ position = 'bottom-right' }) => {
  const [showDemoForm, setShowDemoForm] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <>
      <div className={`fixed ${positionClasses[position]} z-50`}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="relative"
        >
          {/* Expanded options */}
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-16 right-0 bg-white rounded-lg shadow-xl border border-gray-200 p-3 space-y-2 min-w-[200px]"
            >
              <button
                onClick={() => {
                  setShowDemoForm(true);
                  setIsExpanded(false);
                }}
                className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <ChatBubbleLeftRightIcon className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Schedule Demo</div>
                  <div className="text-sm text-gray-500">Book a personalized demo</div>
                </div>
              </button>
              
              <button
                onClick={() => {
                  // You can add a direct call feature here
                  window.open('tel:+918660310638', '_self');
                  setIsExpanded(false);
                }}
                className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <PhoneIcon className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Call Us</div>
                  <div className="text-sm text-gray-500">Speak with our team</div>
                </div>
              </button>
            </motion.div>
          )}

          {/* Main floating button */}
          <motion.button
            onClick={toggleExpanded}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
              w-14 h-14 rounded-full shadow-lg flex items-center justify-center
              transition-all duration-300 relative overflow-hidden
              ${isExpanded 
                ? 'bg-gray-600 hover:bg-gray-700' 
                : 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700'
              }
            `}
          >
            {/* Background pulse animation */}
            {!isExpanded && (
              <div className="absolute inset-0 rounded-full bg-primary-400 animate-ping opacity-20"></div>
            )}
            
            {/* Icon */}
            <motion.div
              animate={{ rotate: isExpanded ? 45 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {isExpanded ? (
                <XMarkIcon className="w-6 h-6 text-white" />
              ) : (
                <ChatBubbleLeftRightIcon className="w-6 h-6 text-white" />
              )}
            </motion.div>
            
            {/* Notification badge for new features */}
            {!isExpanded && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-bold">!</span>
              </div>
            )}
          </motion.button>
        </motion.div>
      </div>

      <ScheduleDemoForm
        isOpen={showDemoForm}
        onClose={() => setShowDemoForm(false)}
      />
    </>
  );
};

export default FloatingDemoButton;
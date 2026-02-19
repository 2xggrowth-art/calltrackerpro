import React, { useState } from 'react';
import { CalendarIcon, PlayIcon } from '@heroicons/react/24/outline';
import { Button } from '../common';
import ScheduleDemoForm from './ScheduleDemoForm';

const ScheduleDemoButton = ({ 
  variant = 'primary',
  size = 'md',
  className = '',
  text = 'Schedule Demo',
  showIcon = true 
}) => {
  const [showDemoForm, setShowDemoForm] = useState(false);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('ScheduleDemoButton clicked - opening form');
    setShowDemoForm(true);
  };

  return (
    <>
      <Button
        onClick={handleClick}
        variant={variant}
        size={size}
        className={`flex items-center space-x-2 ${className}`}
        type="button"
        data-demo-button="schedule"
      >
        {showIcon && <CalendarIcon className="w-5 h-5" />}
        <span>{text}</span>
      </Button>

      <ScheduleDemoForm
        isOpen={showDemoForm}
        onClose={() => setShowDemoForm(false)}
      />
    </>
  );
};

// Quick Support variant with different styling
export const QuickSupportButton = ({ className = '' }) => {
  const [showDemoForm, setShowDemoForm] = useState(false);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('QuickSupportButton clicked - opening form');
    setShowDemoForm(true);
  };

  return (
    <>
      <button
        onClick={handleClick}
        type="button"
        data-demo-button="quick-support"
        className={`
          inline-flex items-center space-x-2 px-4 py-2 
          bg-gradient-to-r from-green-500 to-green-600 
          hover:from-green-600 hover:to-green-700
          text-white font-medium rounded-lg shadow-lg 
          hover:shadow-xl transform hover:scale-105 
          transition-all duration-200 ${className}
        `}
      >
        <PlayIcon className="w-4 h-4" />
        <span>Quick Support</span>
      </button>

      <ScheduleDemoForm
        isOpen={showDemoForm}
        onClose={() => setShowDemoForm(false)}
      />
    </>
  );
};

export default ScheduleDemoButton;
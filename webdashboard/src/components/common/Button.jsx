import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  onClick, 
  disabled = false, 
  loading = false,
  className = '',
  type = 'button',
  ...props 
}) => {
  const baseClasses = 'font-semibold rounded-lg shadow-lg transition-all duration-300 ease-in-out transform focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-primary-gradient text-white hover:shadow-xl focus:ring-primary-500',
    secondary: 'bg-secondary-gradient text-white hover:shadow-xl focus:ring-secondary-500',
    accent: 'bg-accent-gradient text-white hover:shadow-xl focus:ring-accent-500',
    outline: 'border-2 border-primary-500 text-primary-500 bg-transparent hover:bg-primary-500 hover:text-white focus:ring-primary-500',
    ghost: 'text-gray-600 bg-transparent hover:bg-gray-100 focus:ring-gray-500',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500'
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl'
  };
  
  const hoverEffects = !disabled ? 'hover:-translate-y-1' : '';
  
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${hoverEffects} ${className}`;
  
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
      type={type}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </div>
      ) : (
        children
      )}
    </motion.button>
  );
};

export default Button;
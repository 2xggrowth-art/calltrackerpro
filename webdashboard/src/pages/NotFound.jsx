import React from 'react';
import { motion } from 'framer-motion';
import { ExclamationTriangleIcon, HomeIcon } from '@heroicons/react/24/outline';
import { Button } from '../components/common';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-md mx-auto"
      >
        <div className="mb-8">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6"
          >
            <ExclamationTriangleIcon className="w-12 h-12 text-red-500" />
          </motion.div>
          
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
          <p className="text-gray-600 mb-8">
            Sorry, we couldn't find the page you're looking for. The page might have been moved, deleted, or you entered the wrong URL.
          </p>
        </div>

        <div className="space-y-4">
          <Button
            variant="primary"
            size="lg"
            onClick={() => window.location.href = '/'}
            className="w-full"
          >
            <HomeIcon className="w-5 h-5 mr-2" />
            Back to Home
          </Button>
          
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="w-full"
          >
            Go Back
          </Button>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          If you believe this is an error, please{' '}
          <button 
            onClick={() => window.location.href = '/#contact'}
            className="text-primary-600 hover:text-primary-500 underline"
          >
            contact support
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
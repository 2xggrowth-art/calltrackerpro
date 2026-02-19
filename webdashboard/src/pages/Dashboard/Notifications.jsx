import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../../components/common';
import { BellIcon } from '@heroicons/react/24/outline';

const Notifications = () => {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
        <p className="text-gray-600 mt-2">Manage your notifications and alerts</p>
      </motion.div>

      <Card className="p-12 text-center">
        <BellIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Notifications Coming Soon</h3>
        <p className="text-gray-600">
          Real-time notifications and alert management functionality is under development.
        </p>
      </Card>
    </div>
  );
};

export default Notifications;
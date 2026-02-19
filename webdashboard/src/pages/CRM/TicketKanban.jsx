import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../../components/common';
import { Squares2X2Icon } from '@heroicons/react/24/outline';

const TicketKanban = () => {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900">Ticket Kanban Board</h1>
        <p className="text-gray-600 mt-2">Drag-and-drop ticket management</p>
      </motion.div>

      <Card className="p-12 text-center">
        <Squares2X2Icon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Kanban Board Coming Soon</h3>
        <p className="text-gray-600">
          The drag-and-drop Kanban board for ticket management is under development.
        </p>
      </Card>
    </div>
  );
};

export default TicketKanban;
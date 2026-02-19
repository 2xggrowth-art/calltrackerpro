import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { Card, Button } from '../../components/common';
import { useCallLogs } from '../../hooks/useCallLogs';
import CallLogsTable from '../../components/CallLogs/CallLogsTable';
import CallLogsFilters from '../../components/CallLogs/CallLogsFilters';
import CallAnalytics from '../../components/CallLogs/CallAnalytics';
import CallDetailModal from '../../components/CallLogs/CallDetailModal';
import {
  PhoneIcon,
  ChartBarIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  SignalIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

const CallLogs = () => {
  const { canViewAllTickets } = useAuth();
  const {
    callLogs,
    analytics,
    pagination,
    filters,
    loading,
    updateFilters,
    clearFilters,
    handlePageChange,
    handleSort,
    handleSearch,
    refresh,
    exportCallLogs,
    realTimeEnabled,
    toggleRealTime
  } = useCallLogs();

  const [showFilters, setShowFilters] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedCallLog, setSelectedCallLog] = useState(null);

  const handleCallLogSelect = (callLog) => {
    setSelectedCallLog(callLog);
  };

  const handleCloseModal = () => {
    setSelectedCallLog(null);
  };

  const handleExport = async (format) => {
    await exportCallLogs(format);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
              <PhoneIcon className="w-8 h-8" />
              <span>Call Logs</span>
            </h1>
            <p className="text-gray-600 mt-2">
              Manage and analyze your call history with real-time updates
              {analytics && (
                <span className="ml-2 text-sm">
                  • {analytics.totalCalls || 0} total calls • {analytics.answeredRate || 0}% answered rate
                </span>
              )}
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex flex-wrap items-center gap-3">
            {/* Real-time indicator */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${realTimeEnabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleRealTime}
                className="flex items-center space-x-2"
              >
                <SignalIcon className="w-4 h-4" />
                <span>{realTimeEnabled ? 'Live' : 'Offline'}</span>
              </Button>
            </div>

            {/* Action buttons */}
            <Button
              variant="ghost"
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="flex items-center space-x-2"
            >
              <ChartBarIcon className="w-5 h-5" />
              <span>Analytics</span>
            </Button>
            
            <Button
              variant="ghost"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <FunnelIcon className="w-5 h-5" />
              <span>Filters</span>
              {Object.keys(filters).filter(key => 
                key !== 'organizationId' && key !== 'page' && key !== 'limit' && filters[key]
              ).length > 0 && (
                <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-xs">
                  {Object.keys(filters).filter(key => 
                    key !== 'organizationId' && key !== 'page' && key !== 'limit' && filters[key]
                  ).length}
                </span>
              )}
            </Button>

            <div className="relative">
              <Button
                variant="ghost"
                className="flex items-center space-x-2"
                onClick={() => document.getElementById('export-dropdown').classList.toggle('hidden')}
              >
                <ArrowDownTrayIcon className="w-5 h-5" />
                <span>Export</span>
              </Button>
              <div id="export-dropdown" className="hidden absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                <div className="py-1">
                  <button
                    onClick={() => handleExport('csv')}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    Export as CSV
                  </button>
                  <button
                    onClick={() => handleExport('xlsx')}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    Export as Excel
                  </button>
                </div>
              </div>
            </div>

            {canViewAllTickets() && (
              <Button className="flex items-center space-x-2">
                <PlusIcon className="w-5 h-5" />
                <span>Add Call</span>
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Analytics Panel */}
      {showAnalytics && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <CallAnalytics analytics={analytics} loading={loading} />
        </motion.div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <CallLogsFilters
            filters={filters}
            onFiltersChange={updateFilters}
            onClearFilters={clearFilters}
            onSearch={handleSearch}
          />
        </motion.div>
      )}

      {/* Call Logs Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="p-0">
          <CallLogsTable
            callLogs={callLogs}
            loading={loading}
            pagination={pagination}
            onPageChange={handlePageChange}
            onSort={handleSort}
            onCallLogSelect={handleCallLogSelect}
            onRefresh={refresh}
          />
        </Card>
      </motion.div>

      {/* Call Detail Modal */}
      {selectedCallLog && (
        <CallDetailModal
          callLog={selectedCallLog}
          isOpen={!!selectedCallLog}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default CallLogs;
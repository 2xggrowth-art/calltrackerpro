import React, { useState, useEffect } from 'react';
import { Card, Button } from '../common';
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

const CallLogsFilters = ({
  filters = {},
  onFiltersChange,
  onClearFilters,
  onSearch
}) => {
  const [localFilters, setLocalFilters] = useState({
    search: '',
    callType: '',
    status: '',
    hasTicket: '',
    teamId: '',
    dateFrom: '',
    dateTo: '',
    minCallQuality: '',
    maxCallQuality: '',
    ...filters
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setLocalFilters(prevFilters => ({ ...prevFilters, ...filters }));
  }, [filters]);

  const handleFilterChange = (field, value) => {
    const updatedFilters = { ...localFilters, [field]: value };
    setLocalFilters(updatedFilters);

    const cleanedFilters = Object.keys(updatedFilters).reduce((acc, key) => {
      if (updatedFilters[key] !== '' && updatedFilters[key] !== null && updatedFilters[key] !== undefined) {
        acc[key] = updatedFilters[key];
      }
      return acc;
    }, {});

    onFiltersChange(cleanedFilters);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
    handleFilterChange('search', searchTerm);
  };

  const handleClearAll = () => {
    setLocalFilters({
      search: '',
      callType: '',
      status: '',
      hasTicket: '',
      teamId: '',
      dateFrom: '',
      dateTo: '',
      minCallQuality: '',
      maxCallQuality: ''
    });
    setSearchTerm('');
    onClearFilters();
  };

  const hasActiveFilters = Object.keys(localFilters).some(key =>
    key !== 'organizationId' && key !== 'page' && key !== 'limit' && localFilters[key]
  );

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <FunnelIcon className="w-5 h-5" />
          <span>Filters</span>
        </h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="flex items-center space-x-1 text-gray-600"
          >
            <XMarkIcon className="w-4 h-4" />
            <span>Clear All</span>
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <div className="flex">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by phone, name, or company..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <Button type="submit" className="rounded-l-none">
              Search
            </Button>
          </div>
        </form>

        {/* Core Filters - Always Visible */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={localFilters.callType || ''}
            onChange={(e) => handleFilterChange('callType', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Call Types</option>
            <option value="incoming">Incoming</option>
            <option value="outgoing">Outgoing</option>
            <option value="missed">Missed</option>
          </select>

          <select
            value={localFilters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Status</option>
            <option value="answered">Answered</option>
            <option value="missed">Missed</option>
            <option value="busy">Busy</option>
            <option value="failed">Failed</option>
            <option value="voicemail">Voicemail</option>
          </select>

          <select
            value={localFilters.hasTicket || ''}
            onChange={(e) => handleFilterChange('hasTicket', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Calls</option>
            <option value="true">Has Ticket</option>
            <option value="false">No Ticket</option>
          </select>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={localFilters.dateFrom === new Date().toISOString().split('T')[0] ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => handleFilterChange('dateFrom', new Date().toISOString().split('T')[0])}
          >
            Today
          </Button>
          <Button
            variant={localFilters.callType === 'missed' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => handleFilterChange('callType', localFilters.callType === 'missed' ? '' : 'missed')}
          >
            Missed Calls
          </Button>
          <Button
            variant={localFilters.hasTicket === 'false' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => handleFilterChange('hasTicket', localFilters.hasTicket === 'false' ? '' : 'false')}
          >
            No Ticket
          </Button>
        </div>

        {/* Advanced Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-primary-600 hover:underline"
        >
          {showAdvanced ? 'Hide advanced filters' : 'Show advanced filters'}
        </button>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                <input
                  type="date"
                  value={localFilters.dateFrom || ''}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                <input
                  type="date"
                  value={localFilters.dateTo || ''}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Call Quality</label>
                <select
                  value={localFilters.minCallQuality || ''}
                  onChange={(e) => handleFilterChange('minCallQuality', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Any</option>
                  <option value="1">1 Star</option>
                  <option value="2">2 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="5">5 Stars</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
                <select
                  value={localFilters.teamId || ''}
                  onChange={(e) => handleFilterChange('teamId', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Teams</option>
                  <option value="sales_team">Sales Team</option>
                  <option value="support_team">Support Team</option>
                  <option value="customer_success">Customer Success</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default CallLogsFilters;

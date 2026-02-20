import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../common';
import {
  PhoneIcon,
  PhoneArrowUpRightIcon,
  PhoneArrowDownLeftIcon,
  XMarkIcon,
  TicketIcon,
  StarIcon,
  ClockIcon,
  BuildingOfficeIcon,
  ChevronUpDownIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

const CallLogsTable = ({
  callLogs = [],
  loading = false,
  pagination = { total: 0, page: 1, limit: 20, totalPages: 1 },
  onPageChange,
  onSort,
  onCallLogSelect,
  onRefresh
}) => {
  const [sortField, setSortField] = useState('callDate');
  const [sortOrder, setSortOrder] = useState('desc');

  const handleSort = (field) => {
    const newOrder = sortField === field && sortOrder === 'desc' ? 'asc' : 'desc';
    setSortField(field);
    setSortOrder(newOrder);
    onSort(field, newOrder);
  };

  const renderCallTypeIcon = (callType) => {
    switch (callType) {
      case 'incoming':
        return <PhoneArrowDownLeftIcon className="w-4 h-4 text-green-600" />;
      case 'outgoing':
        return <PhoneArrowUpRightIcon className="w-4 h-4 text-blue-600" />;
      case 'missed':
        return <XMarkIcon className="w-4 h-4 text-red-600" />;
      default:
        return <PhoneIcon className="w-4 h-4 text-gray-600" />;
    }
  };

  const renderCallStatus = (status) => {
    const statusColors = {
      answered: 'bg-green-100 text-green-800',
      missed: 'bg-red-100 text-red-800',
      busy: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      voicemail: 'bg-blue-100 text-blue-800'
    };

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  const renderCallQuality = (quality) => {
    if (!quality) return null;
    
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          star <= quality ? (
            <StarIconSolid key={star} className="w-3 h-3 text-yellow-400" />
          ) : (
            <StarIcon key={star} className="w-3 h-3 text-gray-300" />
          )
        ))}
        <span className="text-xs text-gray-500 ml-1">{quality}/5</span>
      </div>
    );
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const renderTableHeader = (field, label) => (
    <th
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{label}</span>
        <ChevronUpDownIcon className="w-4 h-4" />
      </div>
    </th>
  );

  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;

    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, pagination.page - Math.floor(maxVisible / 2));
    let endPage = Math.min(pagination.totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-t">
        <div className="flex items-center text-sm text-gray-700">
          <span>
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} results
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
          >
            Previous
          </Button>
          
          {pages.map(page => (
            <Button
              key={page}
              variant={page === pagination.page ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => onPageChange(page)}
              className="px-3 py-1"
            >
              {page}
            </Button>
          ))}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading call logs...</p>
      </div>
    );
  }

  if (callLogs.length === 0) {
    return (
      <div className="p-12 text-center">
        <PhoneIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Call Logs Found</h3>
        <p className="text-gray-600 mb-4">
          No call logs match your current filters or none have been recorded yet.
        </p>
        <Button onClick={onRefresh} className="flex items-center space-x-2 mx-auto">
          <ArrowPathIcon className="w-4 h-4" />
          <span>Refresh</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {renderTableHeader('callId', 'Call ID')}
              {renderTableHeader('contactName', 'Contact')}
              {renderTableHeader('callType', 'Type')}
              {renderTableHeader('callDate', 'Date/Time')}
              {renderTableHeader('duration', 'Duration')}
              {renderTableHeader('status', 'Status')}
              {renderTableHeader('callQuality', 'Quality')}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ticket
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Team
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {callLogs.map((callLog) => {
              const dateTime = formatDate(callLog.callDate || callLog.createdAt);
              
              return (
                <tr
                  key={callLog._id || callLog.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => onCallLogSelect(callLog)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {renderCallTypeIcon(callLog.callType)}
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {callLog.callId}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {callLog.contactName || 'Unknown Caller'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {callLog.phoneNumber}
                      </div>
                      {callLog.company && (
                        <div className="flex items-center mt-1">
                          <BuildingOfficeIcon className="w-3 h-3 text-gray-400 mr-1" />
                          <span className="text-xs text-gray-500">{callLog.company}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {renderCallTypeIcon(callLog.callType)}
                      <span className="text-sm text-gray-900 capitalize">
                        {callLog.callType}
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900">{dateTime.date}</div>
                      <div className="text-sm text-gray-500">{dateTime.time}</div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <ClockIcon className="w-4 h-4 text-gray-400 mr-1" />
                      {formatDuration(callLog.duration)}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    {renderCallStatus(callLog.status)}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    {renderCallQuality(callLog.callQuality)}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    {callLog.ticketId ? (
                      <Link
                        to={`/dashboard/crm/tickets/${callLog.ticketId}`}
                        className="flex items-center space-x-1 text-primary-600 hover:text-primary-900"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <TicketIcon className="w-4 h-4" />
                        <span className="text-sm">View Ticket</span>
                      </Link>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle ticket creation
                          console.log('Create ticket for call:', callLog._id);
                        }}
                        className="flex items-center space-x-1 text-green-600 hover:text-green-900"
                      >
                        <TicketIcon className="w-4 h-4" />
                        <span>Create Ticket</span>
                      </Button>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {callLog.teamName || 'N/A'}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      {callLog.phoneNumber && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            const phone = callLog.phoneNumber.replace(/[^0-9]/g, '');
                            window.open(`https://wa.me/${phone}`, '_blank');
                          }}
                          className="text-green-600 hover:text-green-700"
                          title="WhatsApp"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                          </svg>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCallLogSelect(callLog);
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {renderPagination()}
    </div>
  );
};

export default CallLogsTable;
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../common';
import { callLogsApi } from '../../services/callLogsApi';
import toast from 'react-hot-toast';
import {
  XMarkIcon,
  PhoneIcon,
  PhoneArrowUpRightIcon,
  PhoneArrowDownLeftIcon,
  ClockIcon,
  StarIcon,
  UserIcon,
  BuildingOfficeIcon,
  TicketIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

const CallDetailModal = ({ callLog, isOpen, onClose }) => {
  const [callHistory, setCallHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creatingTicket, setCreatingTicket] = useState(false);
  const [showCreateTicketForm, setShowCreateTicketForm] = useState(false);
  const [ticketData, setTicketData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'support',
    assignedTo: ''
  });

  const fetchCallHistory = async () => {
    try {
      setLoading(true);
      const response = await callLogsApi.getCallHistory(
        callLog.phoneNumber, 
        callLog.organizationId
      );
      setCallHistory(response.data || []);
    } catch (error) {
      console.error('Error fetching call history:', error);
      // Set fallback empty history
      setCallHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && callLog && callLog.phoneNumber) {
      fetchCallHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, callLog]);

  const handleCreateTicket = async () => {
    try {
      setCreatingTicket(true);
      
      const ticket = {
        ...ticketData,
        // Map call log data to ticket format
        contactName: callLog.contactName,
        phoneNumber: callLog.phoneNumber,
        company: callLog.company,
        callLogId: callLog._id,
        callType: callLog.callType,
        source: 'phone_call',
        organizationId: callLog.organizationId,
        teamId: callLog.teamId
      };

      const response = await callLogsApi.createTicketFromCall(callLog._id, ticket);
      
      toast.success('Ticket created successfully from call');
      setShowCreateTicketForm(false);
      onClose();
      
      // Optionally redirect to ticket
      if (response.data?.ticketId) {
        window.open(`/dashboard/crm/tickets/${response.data.ticketId}`, '_blank');
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error(`Failed to create ticket: ${error.message}`);
    } finally {
      setCreatingTicket(false);
    }
  };

  const renderCallTypeIcon = (callType) => {
    switch (callType) {
      case 'incoming':
        return <PhoneArrowDownLeftIcon className="w-5 h-5 text-green-600" />;
      case 'outgoing':
        return <PhoneArrowUpRightIcon className="w-5 h-5 text-blue-600" />;
      case 'missed':
        return <XMarkIcon className="w-5 h-5 text-red-600" />;
      default:
        return <PhoneIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const renderCallQuality = (quality) => {
    if (!quality) return null;
    
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          star <= quality ? (
            <StarIconSolid key={star} className="w-4 h-4 text-yellow-400" />
          ) : (
            <StarIcon key={star} className="w-4 h-4 text-gray-300" />
          )
        ))}
        <span className="text-sm text-gray-600 ml-2">{quality}/5</span>
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
    return date.toLocaleString();
  };

  if (!isOpen || !callLog) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            {renderCallTypeIcon(callLog.callType)}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Call Details - {callLog.callId}
              </h3>
              <p className="text-sm text-gray-600">
                {callLog.contactName || 'Unknown Caller'} • {formatDate(callLog.callDate || callLog.createdAt)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Call Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Call Summary */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-md font-semibold text-gray-900 mb-4">Call Summary</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Phone Number</label>
                  <p className="text-sm text-gray-900 mt-1">{callLog.phoneNumber}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Duration</label>
                  <div className="flex items-center mt-1">
                    <ClockIcon className="w-4 h-4 text-gray-400 mr-1" />
                    <span className="text-sm text-gray-900">{formatDuration(callLog.duration)}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mt-1 ${
                    callLog.status === 'answered' ? 'bg-green-100 text-green-800' :
                    callLog.status === 'missed' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {callLog.status?.charAt(0).toUpperCase() + callLog.status?.slice(1)}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Call Quality</label>
                  <div className="mt-1">
                    {renderCallQuality(callLog.callQuality)}
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <UserIcon className="w-5 h-5" />
                <span>Contact Information</span>
              </h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <UserIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-900">{callLog.contactName || 'Unknown Contact'}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <PhoneIcon className="w-5 h-5 text-gray-400" />
                  <a href={`tel:${callLog.phoneNumber}`} className="text-primary-600 hover:text-primary-700">
                    {callLog.phoneNumber}
                  </a>
                </div>
                {callLog.company && (
                  <div className="flex items-center space-x-3">
                    <BuildingOfficeIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">{callLog.company}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Call History */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="text-md font-semibold text-gray-900 mb-4">Call History</h4>
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">Loading call history...</p>
                </div>
              ) : callHistory.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {callHistory.slice(0, 10).map((call, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {renderCallTypeIcon(call.callType)}
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {formatDate(call.callDate || call.createdAt)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDuration(call.duration)} • {call.status}
                          </p>
                        </div>
                      </div>
                      {call.ticketId && (
                        <Link
                          to={`/dashboard/crm/tickets/${call.ticketId}`}
                          className="text-primary-600 hover:text-primary-700 text-xs"
                        >
                          View Ticket
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No previous calls found for this number</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ticket Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <TicketIcon className="w-5 h-5" />
                <span>Ticket</span>
              </h4>
              
              {callLog.ticketId ? (
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800 mb-2">
                      ✅ Ticket already created
                    </p>
                    <Link
                      to={`/dashboard/crm/tickets/${callLog.ticketId}`}
                      className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700"
                    >
                      <TicketIcon className="w-4 h-4" />
                      <span>View Ticket</span>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">No ticket created for this call</p>
                  <Button
                    onClick={() => setShowCreateTicketForm(true)}
                    className="w-full flex items-center justify-center space-x-2"
                  >
                    <TicketIcon className="w-4 h-4" />
                    <span>Create Ticket</span>
                  </Button>
                </div>
              )}
            </div>

            {/* Additional Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="text-md font-semibold text-gray-900 mb-4">Additional Info</h4>
              <div className="space-y-3 text-sm">
                <div>
                  <label className="block text-xs font-medium text-gray-500">Team</label>
                  <p className="text-gray-900">{callLog.teamName || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500">User ID</label>
                  <p className="text-gray-900">{callLog.userId || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500">Auto Ticket</label>
                  <p className="text-gray-900">{callLog.autoTicketCreation ? 'Enabled' : 'Disabled'}</p>
                </div>
                {callLog.createdAt && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500">Created</label>
                    <p className="text-gray-900">{formatDate(callLog.createdAt)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Create Ticket Form */}
        {showCreateTicketForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Create Ticket</h3>
                <button
                  onClick={() => setShowCreateTicketForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); handleCreateTicket(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    value={ticketData.title}
                    onChange={(e) => setTicketData({...ticketData, title: e.target.value})}
                    placeholder={`Support request from ${callLog.contactName || callLog.phoneNumber}`}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={ticketData.description}
                    onChange={(e) => setTicketData({...ticketData, description: e.target.value})}
                    placeholder="Describe the issue or request from the call..."
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Priority</label>
                    <select
                      value={ticketData.priority}
                      onChange={(e) => setTicketData({...ticketData, priority: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <select
                      value={ticketData.category}
                      onChange={(e) => setTicketData({...ticketData, category: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="support">Support</option>
                      <option value="sales">Sales</option>
                      <option value="technical">Technical</option>
                      <option value="billing">Billing</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowCreateTicketForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={creatingTicket}
                    disabled={creatingTicket}
                  >
                    {creatingTicket ? 'Creating...' : 'Create Ticket'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CallDetailModal;
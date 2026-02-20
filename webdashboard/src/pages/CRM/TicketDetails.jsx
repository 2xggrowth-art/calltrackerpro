import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Card, Button } from '../../components/common';
import { ticketService } from '../../services/ticketService';
import EnhancedTicketForm from '../../components/tickets/EnhancedTicketForm';
import toast from 'react-hot-toast';
import {
  ArrowLeftIcon,
  PencilIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
  TagIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  PaperClipIcon,
  ChatBubbleLeftRightIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  FireIcon,
  StarIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

const TicketDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { canEditTickets } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);

  const fetchTicket = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🎫 Fetching CallTrackerPro ticket details for ID:', id);
      const response = await ticketService.getTicketById(id);
      console.log('🎫 CallTrackerPro ticket response:', response);
      setTicket(response.data);
    } catch (error) {
      console.error('Error fetching ticket:', error);
      toast.error('Failed to load ticket. Please check your connection and try again.');
      setTicket(null);
    } finally {
      setLoading(false);
    }
  }, [id]); // navigate is stable and doesn't need to be in deps

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading ticket details...</p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Ticket not found</h2>
        <Button onClick={() => navigate('/dashboard/crm/tickets')}>
          Back to Tickets
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard/crm/tickets')}
            className="flex items-center space-x-2"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Back to Tickets</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{ticket.title}</h1>
            <div className="flex items-center space-x-4 mt-2">
              <p className="text-gray-600">Ticket #{ticket.ticketId || ticket.id || ticket._id}</p>
              {ticket.callLogId && (
                <div className="flex items-center space-x-1 text-blue-600">
                  <PhoneIcon className="w-4 h-4" />
                  <span className="text-sm">Call-Generated</span>
                </div>
              )}
              {ticket.leadScore && (
                <div className="flex items-center space-x-1">
                  <StarIcon className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-gray-600">Lead Score: {ticket.leadScore}%</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {(ticket.phoneNumber || ticket.customerPhone) && (
            <button
              onClick={() => {
                const phone = (ticket.phoneNumber || ticket.customerPhone).replace(/[^0-9]/g, '');
                window.open(`https://wa.me/${phone}`, '_blank');
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
              title="Message on WhatsApp"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              </svg>
              WhatsApp
            </button>
          )}
          {canEditTickets() && (
            <Button
              onClick={() => setShowEditForm(true)}
              className="flex items-center space-x-2"
            >
              <PencilIcon className="w-5 h-5" />
              <span>Edit Ticket</span>
            </Button>
          )}
        </div>
      </motion.div>

      {/* Ticket Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
          </Card>

          {/* Notes and Activity */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <ChatBubbleLeftRightIcon className="w-6 h-6" />
              <span>Notes & Activity</span>
            </h2>
            {ticket.notes && ticket.notes.length > 0 ? (
              <div className="space-y-4">
                {ticket.notes.map((note) => (
                  <div key={note.id} className="border-l-4 border-primary-200 pl-4 py-2">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{note.author}</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          note.type === 'system' ? 'bg-gray-100 text-gray-800' :
                          note.type === 'assignment' ? 'bg-blue-100 text-blue-800' :
                          'bg-primary-100 text-primary-800'
                        }`}>
                          {note.type?.replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(note.createdAt).toLocaleDateString()} {new Date(note.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <DocumentTextIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No notes or activity yet</p>
              </div>
            )}
          </Card>

          {/* Attachments */}
          {ticket.attachments && ticket.attachments.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <PaperClipIcon className="w-6 h-6" />
                <span>Attachments</span>
              </h2>
              <div className="space-y-2">
                {ticket.attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                    <PaperClipIcon className="w-5 h-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{attachment.name}</p>
                      <p className="text-sm text-gray-500">{attachment.size} • {attachment.type}</p>
                    </div>
                    <Button variant="ghost" size="sm">Download</Button>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {/* Call Information - CallTrackerPro specific */}
          {ticket.callLogId && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <PhoneIcon className="w-5 h-5" />
                <span>Call Information</span>
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Call Type</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        ticket.callType === 'incoming' ? 'bg-green-100 text-green-800' : 
                        ticket.callType === 'outgoing' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {ticket.callType?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Duration</label>
                    <p className="text-sm text-gray-900 mt-1">{ticket.callDuration || 'N/A'}</p>
                  </div>
                </div>
                {ticket.callRecordingUrl && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Recording</label>
                    <div className="mt-1">
                      <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                        <PhoneIcon className="w-4 h-4" />
                        <span>Play Recording</span>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* CRM Pipeline Information */}
          {(ticket.leadStatus || ticket.stage || ticket.dealValue) && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <ChartBarIcon className="w-5 h-5" />
                <span>CRM Pipeline</span>
              </h3>
              <div className="space-y-4">
                {ticket.leadStatus && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Lead Status</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        ticket.leadStatus === 'converted' ? 'bg-green-100 text-green-800' :
                        ticket.leadStatus === 'qualified' ? 'bg-blue-100 text-blue-800' :
                        ticket.leadStatus === 'new' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {ticket.leadStatus?.replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                  </div>
                )}
                
                {ticket.stage && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Pipeline Stage</label>
                    <p className="text-sm text-gray-900 mt-1 capitalize">{ticket.stage?.replace('_', ' ')}</p>
                  </div>
                )}
                
                {ticket.interestLevel && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Interest Level</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <FireIcon className={`w-4 h-4 ${
                        ticket.interestLevel === 'hot' ? 'text-red-500' :
                        ticket.interestLevel === 'warm' ? 'text-orange-500' :
                        'text-blue-500'
                      }`} />
                      <span className={`text-sm font-medium capitalize ${
                        ticket.interestLevel === 'hot' ? 'text-red-700' :
                        ticket.interestLevel === 'warm' ? 'text-orange-700' :
                        'text-blue-700'
                      }`}>
                        {ticket.interestLevel}
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  {ticket.dealValue > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Deal Value</label>
                      <div className="flex items-center space-x-1 mt-1">
                        <CurrencyDollarIcon className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-semibold text-green-700">
                          ${ticket.dealValue?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {ticket.budgetRange && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Budget Range</label>
                      <p className="text-sm text-gray-900 mt-1">{ticket.budgetRange}</p>
                    </div>
                  )}
                </div>
                
                {ticket.leadSource && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Lead Source</label>
                    <p className="text-sm text-gray-900 mt-1 capitalize">{ticket.leadSource?.replace('_', ' ')}</p>
                  </div>
                )}

                {ticket.conversionProbability && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Conversion Probability</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            ticket.conversionProbability >= 75 ? 'bg-green-500' :
                            ticket.conversionProbability >= 50 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${ticket.conversionProbability}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{ticket.conversionProbability}%</span>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Ticket Details */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ticket Information</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div className="flex items-center space-x-2 mt-1">
                  {getStatusIcon(ticket.status)}
                  <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(ticket.status)}`}>
                    {ticket.status?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Priority</label>
                <div className="flex items-center space-x-2 mt-1">
                  {getPriorityIcon(ticket.priority)}
                  <span className={`px-2 py-1 rounded-full text-sm font-medium ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority?.replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>
              </div>
              {ticket.category && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Category</label>
                  <p className="text-sm text-gray-900 mt-1 capitalize">{ticket.category?.replace('-', ' ')}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-500">Assigned To</label>
                <div className="flex items-center space-x-2 mt-1">
                  <UserIcon className="w-4 h-4 text-gray-400" />
                  <div>
                    <span className="text-sm text-gray-900">{ticket.assignedTo?.name || 'Unassigned'}</span>
                    {ticket.assignedTeam && (
                      <p className="text-xs text-gray-500">{ticket.assignedTeam}</p>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Source</label>
                <p className="text-sm text-gray-900 mt-1 capitalize">{ticket.source || 'Unknown'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Created</label>
                <div className="flex items-center space-x-2 mt-1">
                  <ClockIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-900">
                    {new Date(ticket.createdAt).toLocaleDateString()} {new Date(ticket.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
              {ticket.dueDate && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Due Date</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <ClockIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900">
                      {new Date(ticket.dueDate).toLocaleDateString()} {new Date(ticket.dueDate).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              )}
              {ticket.estimatedHours && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Time Estimate</label>
                  <p className="text-sm text-gray-900 mt-1">{ticket.estimatedHours} hours</p>
                </div>
              )}
              {ticket.slaStatus && (
                <div>
                  <label className="text-sm font-medium text-gray-500">SLA Status</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      ticket.slaStatus === 'on_track' || ticket.slaStatus === 'on-track' ? 'bg-green-100 text-green-800' :
                      ticket.slaStatus === 'at_risk' || ticket.slaStatus === 'at-risk' ? 'bg-yellow-100 text-yellow-800' :
                      ticket.slaStatus === 'breached' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {ticket.slaStatus?.replace('_', ' ').replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                </div>
              )}
              
              {ticket.nextFollowUp && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Next Follow-up</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <CalendarIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900">
                      {new Date(ticket.nextFollowUp).toLocaleDateString()} {new Date(ticket.nextFollowUp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              )}
              
              {ticket.actualHours && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Time Spent</label>
                  <p className="text-sm text-gray-900 mt-1">{ticket.actualHours} hours</p>
                </div>
              )}
            </div>
          </Card>

          {/* Tags */}
          {ticket.tags && ticket.tags.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <TagIcon className="w-5 h-5" />
                <span>Tags</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {ticket.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-primary-100 text-primary-800 text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {/* Contact Information - CallTrackerPro Format */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <UserIcon className="w-5 h-5 text-gray-400" />
                <div>
                  <span className="text-gray-900">{ticket.contactName || ticket.customerName || ticket.customer?.name}</span>
                  {ticket.jobTitle && (
                    <p className="text-xs text-gray-500">{ticket.jobTitle}</p>
                  )}
                </div>
              </div>
              
              {(ticket.email || ticket.customerEmail) && (
                <div className="flex items-center space-x-3">
                  <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                  <a href={`mailto:${ticket.email || ticket.customerEmail}`} className="text-primary-600 hover:text-primary-700">
                    {ticket.email || ticket.customerEmail}
                  </a>
                </div>
              )}
              
              {(ticket.phoneNumber || ticket.customerPhone) && (
                <div className="flex items-center space-x-3">
                  <PhoneIcon className="w-5 h-5 text-gray-400" />
                  <a href={`tel:${ticket.phoneNumber || ticket.customerPhone}`} className="text-primary-600 hover:text-primary-700">
                    {ticket.phoneNumber || ticket.customerPhone}
                  </a>
                </div>
              )}
              
              {ticket.company && (
                <div className="flex items-center space-x-3">
                  <BuildingOfficeIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-900">{ticket.company}</span>
                </div>
              )}
              
              {ticket.location && (
                <div className="flex items-center space-x-3">
                  <MapPinIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-900">
                    {typeof ticket.location === 'string' 
                      ? ticket.location 
                      : `${ticket.location.address || ''} ${ticket.location.city || ''}, ${ticket.location.state || ''} ${ticket.location.country || ''}`.trim()
                    }
                  </span>
                </div>
              )}
              
              {ticket.customerLifetimeValue && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-3">
                    <CurrencyDollarIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <span className="text-sm font-medium text-gray-500">Customer LTV</span>
                      <p className="text-sm font-semibold text-green-700">
                        ${ticket.customerLifetimeValue?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Ticket Modal */}
      {showEditForm && (
        <EnhancedTicketForm
          ticket={ticket}
          isEdit={true}
          onClose={() => setShowEditForm(false)}
          onSuccess={() => { setShowEditForm(false); fetchTicket(); }}
        />
      )}
    </div>
  );
};

// Helper Functions
const getStatusIcon = (status) => {
  switch (status) {
    case 'open':
    case 'new':
      return <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500" />;
    case 'in-progress':
      return <ClockIcon className="w-4 h-4 text-blue-500" />;
    case 'resolved':
    case 'closed':
      return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
    default:
      return <ExclamationTriangleIcon className="w-4 h-4 text-gray-500" />;
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'open':
    case 'new':
      return 'bg-yellow-100 text-yellow-800';
    case 'in-progress':
      return 'bg-blue-100 text-blue-800';
    case 'resolved':
    case 'closed':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getPriorityIcon = (priority) => {
  switch (priority) {
    case 'urgent':
    case 'high':
      return <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />;
    case 'medium':
      return <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500" />;
    case 'low':
      return <ExclamationTriangleIcon className="w-4 h-4 text-gray-500" />;
    default:
      return <ExclamationTriangleIcon className="w-4 h-4 text-gray-500" />;
  }
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'urgent':
    case 'high':
      return 'bg-red-100 text-red-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default TicketDetails;
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Card, Button } from '../../components/common';
import { ticketService } from '../../services/ticketService';
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

  const fetchTicket = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🎫 Fetching CallTrackerPro ticket details for ID:', id);
      const response = await ticketService.getTicketById(id);
      console.log('🎫 CallTrackerPro ticket response:', response);
      setTicket(response.data);
    } catch (error) {
      console.error('Error fetching ticket:', error);
      
      // Provide fallback CallTrackerPro ticket data for demonstration purposes
      console.warn('🔄 Using fallback CallTrackerPro ticket data due to backend error');
      const fallbackTicket = {
        id: id,
        _id: id,
        ticketId: `CTP-${id}`,
        title: `CallTrackerPro Support Ticket ${id}`,
        description: `Customer contacted via phone regarding service inquiry. Auto-created ticket from incoming call.

**Call Summary:**
- Customer interested in CallTrackerPro premium features
- Discussed pricing and implementation timeline
- Requested demo for next week
- Budget range: $10,000 - $25,000

**Customer Background:**
- Company: Tech Solutions Inc
- Industry: Software Development
- Current phone system: Legacy PBX
- Team size: 50+ employees

**Next Steps:**
1. Schedule product demo
2. Prepare custom pricing proposal
3. Send implementation timeline
4. Follow up within 24 hours`,
        
        // Core ticket fields
        status: 'contacted',
        priority: 'high',
        category: 'sales',
        
        // CallTrackerPro Contact Information
        contactName: 'Michael Johnson',
        phoneNumber: '+1 (555) 987-6543',
        company: 'Tech Solutions Inc',
        email: 'michael.johnson@techsolutions.com',
        jobTitle: 'CTO',
        location: 'San Francisco, CA',
        
        // CRM Pipeline Data
        leadSource: 'inbound_call',
        leadStatus: 'qualified',
        stage: 'qualified',
        interestLevel: 'hot',
        budgetRange: '$10k-25k',
        dealValue: 15000,
        
        // Call Information
        callType: 'incoming',
        callDuration: '12:34',
        callLogId: 'call_12345',
        callRecordingUrl: '/recordings/call_12345.mp3',
        
        // Assignment & Organization
        assignedTo: {
          name: 'Sarah Wilson',
          email: 'sarah.wilson@calltrackerpro.com',
          id: 'agent-1'
        },
        assignedTeam: 'Sales Team',
        organizationId: 'org_123',
        teamId: 'team_sales',
        
        // Timestamps
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        lastActivity: new Date().toISOString(),
        
        // SLA & Follow-up
        slaStatus: 'on_track',
        nextFollowUp: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        
        // Tags & Source
        tags: ['hot-lead', 'enterprise', 'demo-requested', 'high-value'],
        source: 'phone_call',
        
        // Time tracking
        estimatedHours: 4,
        actualHours: 1.5,
        
        // Notes with CallTrackerPro format
        notes: [
          {
            id: 'note-1',
            content: 'Auto-created ticket from incoming call. Call duration: 12:34. Customer expressed strong interest in premium features.',
            author: 'CallTrackerPro System',
            createdAt: new Date().toISOString(),
            type: 'system',
            isPrivate: false
          },
          {
            id: 'note-2', 
            content: 'Assigned to Sales Team for follow-up. Customer has budget approved and decision-making authority. Priority: High.',
            author: 'Lead Distribution System',
            createdAt: new Date().toISOString(),
            type: 'assignment',
            isPrivate: false
          },
          {
            id: 'note-3',
            content: 'Customer mentioned they are currently using a legacy PBX system and are looking to modernize their call tracking capabilities. Mentioned competitors but seems most interested in our AI features.',
            author: 'Sarah Wilson',
            createdAt: new Date().toISOString(),
            type: 'agent',
            isPrivate: true
          }
        ],
        
        // Attachments
        attachments: [
          {
            id: 'att-1',
            name: 'call_recording_12345.mp3',
            type: 'audio/mp3',
            size: '2.4 MB',
            url: '/recordings/call_12345.mp3'
          }
        ],
        
        // Related data
        relatedTickets: [],
        
        // Additional CallTrackerPro fields
        leadScore: calculateLeadScore({
          interestLevel: 'hot',
          dealValue: 15000,
          stage: 'qualified',
          callLogId: 'call_12345',
          budgetRange: '$10k-25k'
        }),
        conversionProbability: 85,
        customerLifetimeValue: 45000
      };
      
      setTicket(fallbackTicket);
      toast.error(`Failed to load real ticket data. Backend error: ${error.message}. Showing sample ticket data.`);
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
        {canEditTickets() && (
          <Button
            onClick={() => navigate(`/dashboard/crm/tickets/${id}?mode=edit`)}
            className="flex items-center space-x-2"
          >
            <PencilIcon className="w-5 h-5" />
            <span>Edit Ticket</span>
          </Button>
        )}
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

// CallTrackerPro Helper Functions
const calculateLeadScore = (ticket) => {
  let score = 0;
  
  // Interest level scoring
  if (ticket.interestLevel === 'hot') score += 30;
  else if (ticket.interestLevel === 'warm') score += 20;
  else if (ticket.interestLevel === 'cold') score += 10;
  
  // Deal value scoring
  if (ticket.dealValue > 50000) score += 25;
  else if (ticket.dealValue > 10000) score += 15;
  else if (ticket.dealValue > 1000) score += 10;
  
  // Stage scoring
  if (ticket.stage === 'qualified') score += 20;
  else if (ticket.stage === 'proposal') score += 25;
  else if (ticket.stage === 'negotiation') score += 30;
  
  // Call activity bonus
  if (ticket.callLogId) score += 10;
  
  // Budget range bonus
  if (ticket.budgetRange) score += 5;
  
  return Math.min(score, 100); // Cap at 100
};

export default TicketDetails;
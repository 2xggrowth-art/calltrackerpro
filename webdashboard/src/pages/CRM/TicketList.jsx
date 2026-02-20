import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Card, Button, Input, Modal } from '../../components/common';
import { ticketService } from '../../services/ticketService';
import { realTimeService } from '../../services/realTimeService';
import EnhancedTicketForm from '../../components/tickets/EnhancedTicketForm';
import PipelineKanban from '../../components/crm/PipelineKanban';
import toast from 'react-hot-toast';
import {
  TicketIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  Squares2X2Icon,
  TableCellsIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

const TicketList = () => {
  const { 
    // getUserRole, 
    // getUserId,
    canViewAllTickets,
    canCreateTickets,
    canEditTickets,
    canDeleteTickets,
    canExportData
  } = useAuth();
  
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'kanban'
  
  // Filters and search - Enhanced with complete schema fields
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    assignedTo: '',
    assignedTeam: '',
    category: '',
    leadStatus: '',
    stage: '',
    slaStatus: '',
    leadSource: '',
    interestLevel: '',
    dateRange: '',
    tags: ''
  });

  // Form states
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  // Modal states
  const [showFilters, setShowFilters] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [bulkActionModal, setBulkActionModal] = useState(null);

  // const userRole = getUserRole();
  // const userId = getUserId();

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      
      const queryParams = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        ...filters
      };

      // Remove empty filters
      Object.keys(queryParams).forEach(key => {
        if (!queryParams[key]) delete queryParams[key];
      });

      let response;
      if (canViewAllTickets()) {
        response = await ticketService.getTickets(queryParams);
      } else {
        response = await ticketService.getMyTickets(queryParams);
      }

      setTickets(response.data || []);
      setPagination(prev => ({
        ...prev,
        total: response.total || 0,
        totalPages: Math.ceil((response.total || 0) / prev.limit)
      }));

    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to load tickets');
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchTerm, filters, canViewAllTickets]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleTicketCreated = useCallback((data) => {
    const { ticket } = data;
    setTickets(prevTickets => [ticket, ...prevTickets]);
    toast.success(`New ticket created: ${ticket.contactName}`);
  }, []);

  const handleTicketUpdated = useCallback((data) => {
    const { ticket } = data;
    setTickets(prevTickets => 
      prevTickets.map(existingTicket => 
        existingTicket._id === ticket._id ? ticket : existingTicket
      )
    );
  }, []);

  const handleTicketAssigned = useCallback((data) => {
    const { ticket, assignedToName } = data;
    setTickets(prevTickets => 
      prevTickets.map(existingTicket => 
        existingTicket._id === ticket._id ? ticket : existingTicket
      )
    );
    toast.success(`Ticket assigned to ${assignedToName}`);
  }, []);

  const handleTicketEscalated = useCallback((data) => {
    const { ticket } = data;
    setTickets(prevTickets => 
      prevTickets.map(existingTicket => 
        existingTicket._id === ticket._id ? ticket : existingTicket
      )
    );
    toast.error(`Ticket escalated: ${ticket.contactName}`);
  }, []);

  const handleSLAWarning = useCallback((data) => {
    const { ticket, timeRemaining } = data;
    toast.error(`SLA Warning: ${ticket.contactName} - ${timeRemaining} remaining`);
  }, []);

  const handlePipelineStageChanged = useCallback((data) => {
    const { ticket, newStage } = data;
    setTickets(prevTickets => 
      prevTickets.map(existingTicket => 
        existingTicket._id === ticket._id ? ticket : existingTicket
      )
    );
    toast.success(`Ticket moved to ${newStage.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}`);
  }, []);

  useEffect(() => {
    // Set up enhanced real-time updates
    const currentOrg = JSON.parse(localStorage.getItem('currentOrganization') || '{}');
    if (currentOrg._id) {
      realTimeService.initializeSSE(currentOrg._id);
      
      // Listen for comprehensive real-time ticket updates
      realTimeService.addEventListener('ticket-created', handleTicketCreated);
      realTimeService.addEventListener('ticket-updated', handleTicketUpdated);
      realTimeService.addEventListener('ticket-assigned', handleTicketAssigned);
      realTimeService.addEventListener('ticket-escalated', handleTicketEscalated);
      realTimeService.addEventListener('sla-breach-warning', handleSLAWarning);
      realTimeService.addEventListener('pipeline-stage-changed', handlePipelineStageChanged);
    }

    return () => {
      realTimeService.removeEventListener('ticket-created', handleTicketCreated);
      realTimeService.removeEventListener('ticket-updated', handleTicketUpdated);
      realTimeService.removeEventListener('ticket-assigned', handleTicketAssigned);
      realTimeService.removeEventListener('ticket-escalated', handleTicketEscalated);
      realTimeService.removeEventListener('sla-breach-warning', handleSLAWarning);
      realTimeService.removeEventListener('pipeline-stage-changed', handlePipelineStageChanged);
    };
  }, [handleTicketCreated, handleTicketUpdated, handleTicketAssigned, handleTicketEscalated, handleSLAWarning, handlePipelineStageChanged]);

  const handleTicketSelect = (ticketId, isSelected) => {
    if (isSelected) {
      setSelectedTickets(prev => [...prev, ticketId]);
    } else {
      setSelectedTickets(prev => prev.filter(id => id !== ticketId));
    }
  };

  const handleCreateTicket = () => {
    setSelectedTicket(null);
    setIsEditMode(false);
    setShowTicketForm(true);
  };

  const handleEditTicket = (ticket) => {
    setSelectedTicket(ticket);
    setIsEditMode(true);
    setShowTicketForm(true);
  };

  const handleTicketFormSuccess = () => {
    setShowTicketForm(false);
    setSelectedTicket(null);
    fetchTickets();
  };

  // const handleSelectAll = (isSelected) => {
  //   if (isSelected) {
  //     setSelectedTickets(tickets.map(ticket => ticket.id || ticket._id));
  //   } else {
  //     setSelectedTickets([]);
  //   }
  // };

  const handleBulkAction = async (action, data = {}) => {
    if (selectedTickets.length === 0) {
      toast.error('Please select tickets first');
      return;
    }

    try {
      switch (action) {
        case 'updateStatus':
          await ticketService.bulkUpdateTickets(selectedTickets, { status: data.status });
          toast.success(`Updated ${selectedTickets.length} tickets`);
          break;
        case 'assignTo':
          await ticketService.bulkUpdateTickets(selectedTickets, { assignedTo: data.assignedTo });
          toast.success(`Assigned ${selectedTickets.length} tickets`);
          break;
        case 'archive':
          await ticketService.bulkArchiveTickets(selectedTickets);
          toast.success(`Archived ${selectedTickets.length} tickets`);
          break;
        default:
          break;
      }
      
      setSelectedTickets([]);
      setBulkActionModal(null);
      fetchTickets();
    } catch (error) {
      console.error('Bulk action error:', error);
      toast.error('Failed to perform bulk action');
    }
  };

  const handleExport = async (format) => {
    try {
      if (format === 'csv') {
        // Client-side CSV export from loaded data
        if (!tickets || tickets.length === 0) {
          toast.error('No tickets to export');
          return;
        }
        const headers = ['Title', 'Status', 'Priority', 'Customer', 'Phone', 'Assigned To', 'Category', 'Created'];
        const rows = tickets.map(t => [
          t.title || '',
          t.status || '',
          t.priority || '',
          t.contactName || t.customerName || '',
          t.phoneNumber || t.customerPhone || '',
          t.assignedTo?.name || 'Unassigned',
          t.category || '',
          t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '',
        ]);
        const csv = [
          headers.join(','),
          ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        ].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tickets_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('CSV exported successfully');
      } else {
        // Try server-side export for other formats
        const queryParams = { search: searchTerm, ...filters };
        const blob = await ticketService.exportTickets(queryParams, format);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tickets-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Export started');
      }
      setShowExportModal(false);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export tickets');
    }
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      priority: '',
      assignedTo: '',
      assignedTeam: '',
      category: '',
      leadStatus: '',
      stage: '',
      slaStatus: '',
      leadSource: '',
      interestLevel: '',
      dateRange: '',
      tags: ''
    });
    setSearchTerm('');
  };

  if (loading && tickets.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {canViewAllTickets() ? 'All Tickets' : 'My Tickets'}
          </h1>
          <p className="text-gray-600 mt-2">
            {canViewAllTickets() ? 'Manage tickets across your organization' : 'Manage your assigned tickets'}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3">
          {canExportData() && (
            <Button
              variant="ghost"
              onClick={() => setShowExportModal(true)}
              className="flex items-center space-x-2"
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
              <span>Export</span>
            </Button>
          )}
          {canCreateTickets() && (
            <Button 
              onClick={handleCreateTicket}
              className="flex items-center space-x-2 w-full sm:w-auto"
            >
              <PlusIcon className="w-5 h-5" />
              <span>New Ticket</span>
            </Button>
          )}
        </div>
      </motion.div>

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search tickets by title, customer, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={MagnifyingGlassIcon}
              className="w-full"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="ghost"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <FunnelIcon className="w-5 h-5" />
              <span>Filters</span>
              {Object.values(filters).some(Boolean) && (
                <span className="bg-primary-500 text-white rounded-full text-xs px-2 py-0.5">
                  {Object.values(filters).filter(Boolean).length}
                </span>
              )}
            </Button>
            <div className="flex">
              <Button
                variant={viewMode === 'list' ? 'primary' : 'ghost'}
                onClick={() => setViewMode('list')}
                className="rounded-r-none"
              >
                <TableCellsIcon className="w-5 h-5" />
              </Button>
              <Button
                variant={viewMode === 'kanban' ? 'primary' : 'ghost'}
                onClick={() => setViewMode('kanban')}
                className="rounded-l-none"
              >
                <Squares2X2Icon className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Filters - Smart Defaults + Advanced Toggle */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t space-y-4"
          >
            {/* Core Filters - Always Visible */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="input-field"
              >
                <option value="">All Status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>

              <select
                value={filters.priority}
                onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                className="input-field"
              >
                <option value="">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>

              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="input-field"
              >
                <option value="">All Categories</option>
                <option value="sales">Sales</option>
                <option value="support">Support</option>
                <option value="billing">Billing</option>
                <option value="technical">Technical</option>
              </select>

              <select
                value={filters.dateRange}
                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                className="input-field"
              >
                <option value="">All Time</option>
                <option value="today">Today</option>
                <option value="this_week">This Week</option>
                <option value="this_month">This Month</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="text-sm text-primary-600 hover:underline flex items-center gap-1"
              >
                {showAdvancedFilters ? 'Hide advanced filters' : 'Show advanced filters'}
              </button>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
            </div>

            {/* Advanced CRM Filters - Hidden by Default */}
            {showAdvancedFilters && (
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <select
                    value={filters.slaStatus}
                    onChange={(e) => setFilters(prev => ({ ...prev, slaStatus: e.target.value }))}
                    className="input-field"
                  >
                    <option value="">All SLA Status</option>
                    <option value="on_track">On Track</option>
                    <option value="at_risk">At Risk</option>
                    <option value="breached">Breached</option>
                  </select>

                  <select
                    value={filters.leadStatus}
                    onChange={(e) => setFilters(prev => ({ ...prev, leadStatus: e.target.value }))}
                    className="input-field"
                  >
                    <option value="">All Lead Status</option>
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="converted">Converted</option>
                    <option value="closed">Closed</option>
                  </select>

                  <select
                    value={filters.stage}
                    onChange={(e) => setFilters(prev => ({ ...prev, stage: e.target.value }))}
                    className="input-field"
                  >
                    <option value="">All Pipeline Stages</option>
                    <option value="prospect">Prospect</option>
                    <option value="qualified">Qualified</option>
                    <option value="proposal">Proposal</option>
                    <option value="negotiation">Negotiation</option>
                    <option value="closed-won">Closed Won</option>
                    <option value="closed-lost">Closed Lost</option>
                  </select>

                  <select
                    value={filters.interestLevel}
                    onChange={(e) => setFilters(prev => ({ ...prev, interestLevel: e.target.value }))}
                    className="input-field"
                  >
                    <option value="">All Interest Levels</option>
                    <option value="hot">Hot</option>
                    <option value="warm">Warm</option>
                    <option value="cold">Cold</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <select
                    value={filters.leadSource}
                    onChange={(e) => setFilters(prev => ({ ...prev, leadSource: e.target.value }))}
                    className="input-field"
                  >
                    <option value="">All Lead Sources</option>
                    <option value="cold_call">Cold Call</option>
                    <option value="referral">Referral</option>
                    <option value="website">Website</option>
                    <option value="marketing">Marketing</option>
                  </select>

                  <Input
                    placeholder="Assigned to user..."
                    value={filters.assignedTo}
                    onChange={(e) => setFilters(prev => ({ ...prev, assignedTo: e.target.value }))}
                  />

                  <Input
                    placeholder="Tags (comma separated)"
                    value={filters.tags}
                    onChange={(e) => setFilters(prev => ({ ...prev, tags: e.target.value }))}
                  />
                </div>
              </div>
            )}
          </motion.div>
        )}
      </Card>

      {/* Bulk Actions */}
      {selectedTickets.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary-50 border border-primary-200 rounded-lg p-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-primary-900">
                {selectedTickets.length} ticket{selectedTickets.length !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="mt-3 sm:mt-0 flex flex-wrap gap-2">
              <Button size="sm" onClick={() => setBulkActionModal('status')}>
                Update Status
              </Button>
              {canEditTickets() && (
                <Button size="sm" onClick={() => setBulkActionModal('assign')}>
                  Assign To
                </Button>
              )}
              {canDeleteTickets() && (
                <Button size="sm" variant="danger" onClick={() => setBulkActionModal('archive')}>
                  Archive
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Content - List or Kanban View */}
      {viewMode === 'kanban' ? (
        <PipelineKanban />
      ) : (
        <>
          {/* Tickets List */}
          {tickets.length > 0 ? (
            <div className="space-y-4">
              {tickets.map((ticket, index) => (
                <motion.div
                  key={ticket.id || ticket._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <TicketCard
                    ticket={ticket}
                    isSelected={selectedTickets.includes(ticket.id || ticket._id)}
                    onSelect={handleTicketSelect}
                    canEdit={canEditTickets()}
                    canDelete={canDeleteTickets()}
                    onRefresh={fetchTickets}
                    onEdit={handleEditTicket}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <TicketIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No tickets found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || Object.values(filters).some(Boolean)
                  ? 'Try adjusting your search terms or filters.'
                  : 'Get started by creating your first ticket.'}
              </p>
              {canCreateTickets() && (
                <Button onClick={handleCreateTicket}>
                  Create First Ticket
                </Button>
              )}
            </Card>
          )}
        </>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 border border-gray-200 rounded-lg">
          <div className="flex items-center">
            <p className="text-sm text-gray-700">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} results
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
            >
              <ChevronLeftIcon className="w-4 h-4" />
              Previous
            </Button>
            <span className="text-sm text-gray-700">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.totalPages}
            >
              Next
              <ChevronRightIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Export Modal */}
      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Export Tickets"
      >
        <div className="space-y-4">
          <p className="text-gray-600">Choose export format:</p>
          <div className="flex space-x-4">
            <Button onClick={() => handleExport('csv')} className="flex-1">
              CSV
            </Button>
            <Button onClick={() => handleExport('excel')} className="flex-1">
              Excel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Bulk Action Modals */}
      {bulkActionModal && (
        <BulkActionModal
          type={bulkActionModal}
          selectedCount={selectedTickets.length}
          onAction={handleBulkAction}
          onClose={() => setBulkActionModal(null)}
        />
      )}

      {/* Enhanced Ticket Form Modal */}
      {showTicketForm && (
        <EnhancedTicketForm
          ticket={selectedTicket}
          isEdit={isEditMode}
          onClose={() => setShowTicketForm(false)}
          onSuccess={handleTicketFormSuccess}
        />
      )}
    </div>
  );
};

// Ticket Card Component
const TicketCard = ({ ticket, isSelected, onSelect, canEdit, canDelete, onRefresh, onEdit }) => {
  const navigate = useNavigate();
  const ticketId = ticket.id || ticket._id;

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to archive this ticket?')) {
      try {
        await ticketService.archiveTicket(ticketId);
        toast.success('Ticket archived successfully');
        onRefresh();
      } catch (error) {
        console.error('Error archiving ticket:', error);
        toast.error('Failed to archive ticket');
      }
    }
  };

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(ticketId, e.target.checked)}
          className="mt-1 h-4 w-4 text-primary-600 rounded border-gray-300"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <Link
                to={`/dashboard/crm/tickets/${ticketId}`}
                className="text-lg font-semibold text-gray-900 hover:text-primary-600 block"
              >
                {ticket.title}
              </Link>
              <p className="text-sm text-gray-600 mt-1">{ticket.description}</p>
              
              <div className="flex flex-wrap items-center gap-4 mt-3">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Customer:</span>
                  <span className="text-sm font-medium">{ticket.customerName || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Assigned to:</span>
                  <span className="text-sm font-medium">{ticket.assignedTo?.name || 'Unassigned'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ClockIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 ml-4">
              <div className="text-right">
                <div className="flex items-center space-x-2 mb-2">
                  <StatusBadge status={ticket.status} />
                  <PriorityBadge priority={ticket.priority} />
                </div>
                {ticket.dueDate && (
                  <div className={`text-xs ${
                    new Date(ticket.dueDate) < new Date() 
                      ? 'text-red-600 font-semibold' 
                      : 'text-gray-500'
                  }`}>
                    Due: {new Date(ticket.dueDate).toLocaleDateString()}
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {(ticket.phoneNumber || ticket.customerPhone) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const phone = (ticket.phoneNumber || ticket.customerPhone).replace(/[^0-9]/g, '');
                      window.open(`https://wa.me/${phone}`, '_blank');
                    }}
                    className="text-green-600 hover:text-green-700"
                    title="Message on WhatsApp"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    </svg>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/dashboard/crm/tickets/${ticketId}`)}
                >
                  <EyeIcon className="w-4 h-4" />
                </Button>
                {canEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit ? onEdit(ticket) : navigate(`/dashboard/crm/tickets/${ticketId}?mode=edit`)}
                  >
                    <PencilIcon className="w-4 h-4" />
                  </Button>
                )}
                {canDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDelete}
                    className="text-red-600 hover:text-red-700"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    const configs = {
      open: { color: 'bg-yellow-100 text-yellow-800', icon: ExclamationTriangleIcon },
      'in-progress': { color: 'bg-blue-100 text-blue-800', icon: ClockIcon },
      resolved: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
      closed: { color: 'bg-gray-100 text-gray-800', icon: XCircleIcon }
    };
    return configs[status] || configs.open;
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
    </span>
  );
};

// Priority Badge Component
const PriorityBadge = ({ priority }) => {
  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return colors[priority] || colors.medium;
  };

  return (
    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(priority)}`}>
      {priority?.charAt(0).toUpperCase() + priority?.slice(1) || 'Medium'}
    </span>
  );
};

// Bulk Action Modal Component
const BulkActionModal = ({ type, selectedCount, onAction, onClose }) => {
  const [actionData, setActionData] = useState({});
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (type === 'assign') {
      import('../../services/userService').then(({ userService }) => {
        userService.getAllUsers()
          .then(r => setUsers(r.data || r || []))
          .catch(() => {});
      });
    }
  }, [type]);

  const getModalContent = () => {
    switch (type) {
      case 'status':
        return {
          title: 'Update Status',
          content: (
            <select
              value={actionData.status || ''}
              onChange={(e) => setActionData({ status: e.target.value })}
              className="input-field w-full"
            >
              <option value="">Select Status</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          ),
          action: () => onAction('updateStatus', actionData)
        };
      case 'assign':
        return {
          title: 'Assign Tickets',
          content: (
            <select
              value={actionData.assignedTo || ''}
              onChange={(e) => setActionData({ assignedTo: e.target.value })}
              className="input-field w-full"
            >
              <option value="">Select agent...</option>
              {users.map(u => (
                <option key={u._id || u.id} value={u._id || u.id}>
                  {u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email}
                </option>
              ))}
            </select>
          ),
          action: () => onAction('assignTo', actionData)
        };
      case 'archive':
        return {
          title: 'Archive Tickets',
          content: (
            <p className="text-gray-600">
              Are you sure you want to archive {selectedCount} ticket{selectedCount !== 1 ? 's' : ''}?
              This action cannot be undone.
            </p>
          ),
          action: () => onAction('archive')
        };
      default:
        return { title: '', content: null, action: () => {} };
    }
  };

  const { title, content, action } = getModalContent();

  return (
    <Modal isOpen={true} onClose={onClose} title={title}>
      <div className="space-y-4">
        {content}
        <Modal.Footer>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={action}>
            Confirm
          </Button>
        </Modal.Footer>
      </div>
    </Modal>
  );
};

export default TicketList;
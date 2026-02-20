import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  PhoneIcon,
  PlusIcon,
  PencilIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { Card, Button } from '../common';
import { ticketService } from '../../services/ticketService';
import { realTimeService } from '../../services/realTimeService';
import { useAuth } from '../../contexts/AuthContext';
import EnhancedTicketForm from '../tickets/EnhancedTicketForm';
import toast from 'react-hot-toast';

const PipelineKanban = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Simplified 4-stage pipeline
  const pipelineStages = useMemo(() => [
    {
      id: 'new',
      title: 'New Leads',
      color: 'border-blue-200 bg-blue-50/50',
      dot: 'bg-blue-500',
      textColor: 'text-blue-700',
    },
    {
      id: 'qualified',
      title: 'Qualified',
      color: 'border-amber-200 bg-amber-50/50',
      dot: 'bg-amber-500',
      textColor: 'text-amber-700',
    },
    {
      id: 'proposal',
      title: 'Proposal',
      color: 'border-purple-200 bg-purple-50/50',
      dot: 'bg-purple-500',
      textColor: 'text-purple-700',
    },
    {
      id: 'closed',
      title: 'Closed',
      color: 'border-green-200 bg-green-50/50',
      dot: 'bg-green-500',
      textColor: 'text-green-700',
    },
  ], []);

  // Map old stage names to new ones for backward compatibility
  const normalizeStage = (stage) => {
    const mapping = {
      'prospect': 'new',
      'new': 'new',
      'qualified': 'qualified',
      'proposal': 'proposal',
      'negotiation': 'proposal',
      'closed-won': 'closed',
      'closed-lost': 'closed',
      'closed': 'closed',
    };
    return mapping[stage] || 'new';
  };

  const handlePipelineStageChange = useCallback((data) => {
    const { ticketId, oldStage, newStage, ticket } = data;
    const normalizedOld = normalizeStage(oldStage);
    const normalizedNew = normalizeStage(newStage);

    setTickets(prevTickets => {
      const newTickets = { ...prevTickets };
      if (normalizedOld && newTickets[normalizedOld]) {
        newTickets[normalizedOld] = newTickets[normalizedOld].filter(t => t._id !== ticketId);
      }
      if (normalizedNew && newTickets[normalizedNew]) {
        const existingIndex = newTickets[normalizedNew].findIndex(t => t._id === ticketId);
        if (existingIndex === -1) {
          newTickets[normalizedNew] = [ticket, ...newTickets[normalizedNew]];
        } else {
          newTickets[normalizedNew][existingIndex] = ticket;
        }
      }
      return newTickets;
    });
    toast.success(`Moved to ${newStage.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}`);
  }, []);

  const handleTicketCreated = useCallback((data) => {
    const { ticket } = data;
    const stage = normalizeStage(ticket.stage || 'new');
    setTickets(prevTickets => ({
      ...prevTickets,
      [stage]: [ticket, ...(prevTickets[stage] || [])]
    }));
  }, []);

  const handleTicketUpdated = useCallback((data) => {
    const { ticket } = data;
    const stage = normalizeStage(ticket.stage || 'new');
    setTickets(prevTickets => {
      const newTickets = { ...prevTickets };
      if (newTickets[stage]) {
        const idx = newTickets[stage].findIndex(t => t._id === ticket._id);
        if (idx !== -1) newTickets[stage][idx] = ticket;
      }
      return newTickets;
    });
  }, []);

  const setupRealTimeUpdates = useCallback(() => {
    const currentOrg = JSON.parse(localStorage.getItem('currentOrganization') || '{}');
    if (currentOrg._id) {
      realTimeService.initializeSSE(currentOrg._id);
      realTimeService.addEventListener('pipeline-stage-changed', handlePipelineStageChange);
      realTimeService.addEventListener('ticket-created', handleTicketCreated);
      realTimeService.addEventListener('ticket-updated', handleTicketUpdated);
    }
  }, [handlePipelineStageChange, handleTicketCreated, handleTicketUpdated]);

  const cleanupRealTimeUpdates = useCallback(() => {
    realTimeService.removeEventListener('pipeline-stage-changed', handlePipelineStageChange);
    realTimeService.removeEventListener('ticket-created', handleTicketCreated);
    realTimeService.removeEventListener('ticket-updated', handleTicketUpdated);
  }, [handlePipelineStageChange, handleTicketCreated, handleTicketUpdated]);

  const fetchPipelineData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await ticketService.getTicketsByStage();
      const data = response.data || {};

      // Organize into 4 stages, mapping old stages
      const organized = { new: [], qualified: [], proposal: [], closed: [] };
      Object.entries(data).forEach(([stage, stageTickets]) => {
        const normalized = normalizeStage(stage);
        organized[normalized] = [...organized[normalized], ...(stageTickets || [])];
      });

      setTickets(organized);
    } catch (error) {
      console.error('Error fetching pipeline data:', error);
      toast.error('Failed to load pipeline');
      setTickets({ new: [], qualified: [], proposal: [], closed: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPipelineData();
    setupRealTimeUpdates();
    return () => cleanupRealTimeUpdates();
  }, [fetchPipelineData, setupRealTimeUpdates, cleanupRealTimeUpdates]);

  const handleDragStart = (event) => setActiveId(event.active.id);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const draggedId = active.id;
    const overId = over.id;

    let sourceStage, destStage, ticketToMove;

    for (const [stageId, stageTickets] of Object.entries(tickets)) {
      const t = stageTickets.find(t => t._id === draggedId);
      if (t) { sourceStage = stageId; ticketToMove = t; break; }
    }

    if (pipelineStages.find(s => s.id === overId)) {
      destStage = overId;
    } else {
      for (const [stageId, stageTickets] of Object.entries(tickets)) {
        if (stageTickets.find(t => t._id === overId)) { destStage = stageId; break; }
      }
    }

    if (!sourceStage || !destStage || !ticketToMove || sourceStage === destStage) return;

    try {
      const newTickets = { ...tickets };
      newTickets[sourceStage] = newTickets[sourceStage].filter(t => t._id !== draggedId);
      ticketToMove.stage = destStage;
      newTickets[destStage] = [ticketToMove, ...newTickets[destStage]];
      setTickets(newTickets);

      await ticketService.updatePipelineStage(draggedId, destStage, {
        previousStage: sourceStage,
        movedBy: user._id,
        movedAt: new Date().toISOString()
      });

      const stageLabel = pipelineStages.find(s => s.id === destStage)?.title || destStage;
      toast.success(`Moved to ${stageLabel}`);
    } catch (error) {
      toast.error('Failed to move ticket');
      fetchPipelineData();
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

  const handleTicketFormSuccess = useCallback(() => {
    setShowTicketForm(false);
    setSelectedTicket(null);
    fetchPipelineData();
  }, [fetchPipelineData]);

  const getPriorityDot = (priority) => {
    const colors = { low: 'bg-green-400', medium: 'bg-yellow-400', high: 'bg-orange-400', urgent: 'bg-red-500' };
    return colors[priority] || colors.medium;
  };

  const formatCurrency = (amount) => {
    if (!amount) return '';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR',
      minimumFractionDigits: 0, maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  // Simplified ticket card
  const SortableTicketCard = ({ ticket }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: ticket._id });
    const style = { transform: CSS.Transform.toString(transform), transition };

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`mb-2.5 cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-50 scale-105' : ''}`}
      >
        <Card className={`p-3.5 hover:shadow-md transition-shadow ${isDragging ? 'shadow-xl' : ''}`}>
          {/* Name + Priority */}
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-gray-900 truncate flex-1">
              {ticket.contactName}
            </h4>
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ml-2 ${getPriorityDot(ticket.priority)}`}
                 title={ticket.priority} />
          </div>

          {/* Phone */}
          <div className="flex items-center text-xs text-gray-500 mb-2">
            <PhoneIcon className="w-3 h-3 mr-1.5 text-gray-400" />
            <span className="truncate">{ticket.phoneNumber}</span>
          </div>

          {/* Company + Deal value row */}
          <div className="flex items-center justify-between text-xs">
            {ticket.company ? (
              <div className="flex items-center text-gray-500 truncate">
                <BuildingOfficeIcon className="w-3 h-3 mr-1 text-gray-400 flex-shrink-0" />
                <span className="truncate">{ticket.company}</span>
              </div>
            ) : <span />}

            {ticket.dealValue > 0 && (
              <span className="font-semibold text-gray-900 flex-shrink-0 ml-2">
                {formatCurrency(ticket.dealValue)}
              </span>
            )}
          </div>

          {/* Follow-up + Edit */}
          <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-gray-100">
            {ticket.nextFollowUp ? (
              <div className="flex items-center text-xs text-gray-400">
                <CalendarIcon className="w-3 h-3 mr-1" />
                {formatDate(ticket.nextFollowUp)}
              </div>
            ) : <span />}

            <button
              onClick={(e) => { e.stopPropagation(); handleEditTicket(ticket); }}
              className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <PencilIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </Card>
      </div>
    );
  };

  const calculateStageValue = (stageTickets) =>
    stageTickets.reduce((sum, t) => sum + (t.dealValue || 0), 0);

  const renderPipelineStage = (stage) => {
    const stageTickets = tickets[stage.id] || [];
    const totalValue = calculateStageValue(stageTickets);

    return (
      <div key={stage.id} className={`flex-1 min-w-[260px] rounded-xl border ${stage.color}`}>
        {/* Stage Header */}
        <div className="px-4 py-3 border-b border-white/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${stage.dot}`} />
              <h3 className={`font-semibold text-sm ${stage.textColor}`}>{stage.title}</h3>
              <span className="bg-white/80 text-gray-500 text-xs font-medium px-1.5 py-0.5 rounded-full">
                {stageTickets.length}
              </span>
            </div>
          </div>
          {totalValue > 0 && (
            <div className="mt-1.5 flex items-center gap-1">
              <CurrencyDollarIcon className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-500 font-medium">{formatCurrency(totalValue)}</span>
            </div>
          )}
        </div>

        {/* Droppable Area */}
        <div className="p-3 min-h-[300px]">
          <SortableContext
            items={stageTickets.map(t => t._id)}
            strategy={verticalListSortingStrategy}
          >
            <div id={stage.id} className="min-h-full">
              <AnimatePresence>
                {stageTickets.map((ticket) => (
                  <SortableTicketCard key={ticket._id} ticket={ticket} />
                ))}
              </AnimatePresence>

              {stageTickets.length === 0 && (
                <div className="text-center py-10 text-gray-400">
                  <p className="text-sm">No tickets</p>
                </div>
              )}
            </div>
          </SortableContext>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading pipeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Pipeline</h2>
          <p className="text-sm text-gray-500">Drag tickets to move them through stages</p>
        </div>
        <Button onClick={handleCreateTicket} className="flex items-center gap-1.5">
          <PlusIcon className="w-4 h-4" />
          <span>New Ticket</span>
        </Button>
      </div>

      {/* Pipeline Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {pipelineStages.map(stage => renderPipelineStage(stage))}
          </div>
        </div>

        <DragOverlay>
          {activeId ? (
            <div className="opacity-80">
              {(() => {
                for (const stageTickets of Object.values(tickets)) {
                  const ticket = stageTickets.find(t => t._id === activeId);
                  if (ticket) return <SortableTicketCard ticket={ticket} />;
                }
                return null;
              })()}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

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

export default PipelineKanban;

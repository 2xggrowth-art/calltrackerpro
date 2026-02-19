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
import {
  CSS,
} from '@dnd-kit/utilities';
import {
  UserIcon,
  PhoneIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  StarIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  ArrowTrendingUpIcon,
  BuildingOfficeIcon,
  TagIcon
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

  // Pipeline stages configuration matching your schema
  const pipelineStages = useMemo(() => [
    {
      id: 'prospect',
      title: 'Prospect',
      color: 'bg-gray-100 border-gray-300',
      headerColor: 'bg-gray-500',
      description: 'Initial leads and prospects'
    },
    {
      id: 'qualified',
      title: 'Qualified',
      color: 'bg-blue-100 border-blue-300',
      headerColor: 'bg-blue-500',
      description: 'Qualified opportunities'
    },
    {
      id: 'proposal',
      title: 'Proposal',
      color: 'bg-yellow-100 border-yellow-300',
      headerColor: 'bg-yellow-500',
      description: 'Proposal sent'
    },
    {
      id: 'negotiation',
      title: 'Negotiation',
      color: 'bg-orange-100 border-orange-300',
      headerColor: 'bg-orange-500',
      description: 'In negotiation'
    },
    {
      id: 'closed-won',
      title: 'Closed Won',
      color: 'bg-green-100 border-green-300',
      headerColor: 'bg-green-500',
      description: 'Successfully closed deals'
    },
    {
      id: 'closed-lost',
      title: 'Closed Lost',
      color: 'bg-red-100 border-red-300',
      headerColor: 'bg-red-500',
      description: 'Lost opportunities'
    }
  ], []);

  const handlePipelineStageChange = useCallback((data) => {
    const { ticketId, oldStage, newStage, ticket } = data;
    
    setTickets(prevTickets => {
      const newTickets = { ...prevTickets };
      
      // Remove from old stage
      if (oldStage && newTickets[oldStage]) {
        newTickets[oldStage] = newTickets[oldStage].filter(t => t._id !== ticketId);
      }
      
      // Add to new stage
      if (newStage && newTickets[newStage]) {
        const existingIndex = newTickets[newStage].findIndex(t => t._id === ticketId);
        if (existingIndex === -1) {
          newTickets[newStage] = [ticket, ...newTickets[newStage]];
        } else {
          newTickets[newStage][existingIndex] = ticket;
        }
      }
      
      return newTickets;
    });
    
    toast.success(`Ticket moved to ${newStage.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}`);
  }, []);

  const handleTicketCreated = useCallback((data) => {
    const { ticket } = data;
    const stage = ticket.stage || 'prospect';
    
    setTickets(prevTickets => ({
      ...prevTickets,
      [stage]: [ticket, ...(prevTickets[stage] || [])]
    }));
  }, []);

  const handleTicketUpdated = useCallback((data) => {
    const { ticket } = data;
    const stage = ticket.stage || 'prospect';
    
    setTickets(prevTickets => {
      const newTickets = { ...prevTickets };
      
      // Find and update the ticket in the correct stage
      if (newTickets[stage]) {
        const ticketIndex = newTickets[stage].findIndex(t => t._id === ticket._id);
        if (ticketIndex !== -1) {
          newTickets[stage][ticketIndex] = ticket;
        }
      }
      
      return newTickets;
    });
  }, []);

  const setupRealTimeUpdates = useCallback(() => {
    const currentOrg = JSON.parse(localStorage.getItem('currentOrganization') || '{}');
    if (currentOrg._id) {
      realTimeService.initializeSSE(currentOrg._id);
      
      // Listen for pipeline stage changes
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
      
      // Organize tickets by pipeline stage
      const organizedTickets = {};
      pipelineStages.forEach(stage => {
        organizedTickets[stage.id] = response.data?.[stage.id] || [];
      });
      
      setTickets(organizedTickets);
    } catch (error) {
      console.error('Error fetching pipeline data:', error);
      toast.error('Failed to load pipeline data');
      
      // Initialize empty pipeline if fetch fails
      const emptyPipeline = {};
      pipelineStages.forEach(stage => {
        emptyPipeline[stage.id] = [];
      });
      setTickets(emptyPipeline);
    } finally {
      setLoading(false);
    }
  }, [pipelineStages]);

  useEffect(() => {
    fetchPipelineData();
    setupRealTimeUpdates();
    
    return () => {
      cleanupRealTimeUpdates();
    };
  }, [fetchPipelineData, setupRealTimeUpdates, cleanupRealTimeUpdates]);

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    
    setActiveId(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Find the source and destination stages
    let sourceStage, destStage;
    let ticketToMove;

    // Find source stage and ticket
    for (const [stageId, stageTickets] of Object.entries(tickets)) {
      const ticket = stageTickets.find(t => t._id === activeId);
      if (ticket) {
        sourceStage = stageId;
        ticketToMove = ticket;
        break;
      }
    }

    // Determine destination stage
    if (pipelineStages.find(stage => stage.id === overId)) {
      destStage = overId;
    } else {
      // Dropped on another ticket, find its stage
      for (const [stageId, stageTickets] of Object.entries(tickets)) {
        if (stageTickets.find(t => t._id === overId)) {
          destStage = stageId;
          break;
        }
      }
    }

    if (!sourceStage || !destStage || !ticketToMove) return;
    if (sourceStage === destStage) return;

    try {
      // Optimistic update
      const newTickets = { ...tickets };
      newTickets[sourceStage] = newTickets[sourceStage].filter(t => t._id !== activeId);
      ticketToMove.stage = destStage;
      newTickets[destStage] = [ticketToMove, ...newTickets[destStage]];
      
      setTickets(newTickets);

      // Update on server
      await ticketService.updatePipelineStage(activeId, destStage, {
        previousStage: sourceStage,
        movedBy: user._id,
        movedAt: new Date().toISOString()
      });

      toast.success(`Ticket moved to ${destStage.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}`);
    } catch (error) {
      console.error('Error updating pipeline stage:', error);
      toast.error('Failed to move ticket. Please try again.');
      
      // Revert optimistic update
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

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-green-600 bg-green-100',
      medium: 'text-yellow-600 bg-yellow-100',
      high: 'text-orange-600 bg-orange-100',
      urgent: 'text-red-600 bg-red-100'
    };
    return colors[priority] || colors.medium;
  };

  const getInterestLevelColor = (level) => {
    const colors = {
      hot: 'text-red-500',
      warm: 'text-yellow-500',
      cold: 'text-blue-500'
    };
    return colors[level] || colors.warm;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateStageMetrics = (stageTickets) => {
    const totalValue = stageTickets.reduce((sum, ticket) => sum + (ticket.dealValue || 0), 0);
    const avgProbability = stageTickets.length > 0 
      ? stageTickets.reduce((sum, ticket) => sum + (ticket.conversionProbability || 0), 0) / stageTickets.length
      : 0;
    
    return { totalValue, avgProbability, count: stageTickets.length };
  };

  // Sortable Ticket Card Component
  const SortableTicketCard = ({ ticket }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: ticket._id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`
          mb-3 transition-all duration-200 cursor-grab active:cursor-grabbing
          ${isDragging ? 'opacity-50 rotate-3 scale-105' : ''}
        `}
      >
        <Card className={`
          p-4 hover:shadow-lg transition-all duration-200
          ${isDragging ? 'bg-white shadow-2xl' : ''}
        `}>
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-gray-900 truncate">
                  {ticket.contactName}
                </h4>
                <div className="flex items-center space-x-2 mt-1">
                  <PhoneIcon className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-600 truncate">
                    {ticket.phoneNumber}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-1 ml-2">
                <span className={`
                  px-2 py-1 rounded-full text-xs font-medium
                  ${getPriorityColor(ticket.priority)}
                `}>
                  {ticket.priority}
                </span>
              </div>
            </div>

            {/* Company & Deal Value */}
            {(ticket.company || ticket.dealValue > 0) && (
              <div className="space-y-1">
                {ticket.company && (
                  <div className="flex items-center space-x-2">
                    <BuildingOfficeIcon className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-600 truncate">
                      {ticket.company}
                    </span>
                  </div>
                )}
                
                {ticket.dealValue > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <CurrencyDollarIcon className="w-3 h-3 text-gray-400" />
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(ticket.dealValue)}
                      </span>
                    </div>
                    
                    {ticket.conversionProbability > 0 && (
                      <div className="flex items-center space-x-1">
                        <ArrowTrendingUpIcon className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-600">
                          {ticket.conversionProbability}%
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Interest Level & Lead Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <StarIcon className={`w-3 h-3 ${getInterestLevelColor(ticket.interestLevel)}`} />
                <span className="text-xs text-gray-600 capitalize">
                  {ticket.interestLevel} lead
                </span>
              </div>
              
              <span className="text-xs text-gray-500 capitalize">
                {ticket.leadStatus}
              </span>
            </div>

            {/* Next Follow-up */}
            {ticket.nextFollowUp && (
              <div className="flex items-center space-x-2">
                <CalendarIcon className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-600">
                  Follow-up: {formatDate(ticket.nextFollowUp)}
                </span>
              </div>
            )}

            {/* Tags */}
            {ticket.tags && ticket.tags.length > 0 && (
              <div className="flex items-center space-x-1">
                <TagIcon className="w-3 h-3 text-gray-400" />
                <div className="flex flex-wrap gap-1">
                  {ticket.tags.slice(0, 2).map((tag, index) => (
                    <span
                      key={index}
                      className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                  {ticket.tags.length > 2 && (
                    <span className="text-xs text-gray-500">
                      +{ticket.tags.length - 2}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div className="flex items-center space-x-2">
                {ticket.assignedTo && (
                  <div className="flex items-center space-x-1">
                    <UserIcon className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-600 truncate max-w-20">
                      {ticket.assignedUserName || 'Assigned'}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle view ticket
                  }}
                  className="p-1 hover:bg-gray-100"
                >
                  <EyeIcon className="w-3 h-3" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditTicket(ticket);
                  }}
                  className="p-1 hover:bg-gray-100"
                >
                  <PencilIcon className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderPipelineStage = (stage) => {
    const stageTickets = tickets[stage.id] || [];
    const metrics = calculateStageMetrics(stageTickets);

    return (
      <div
        key={stage.id}
        className={`
          flex-shrink-0 w-80 rounded-lg border-2 border-dashed transition-all duration-200
          ${stage.color}
        `}
      >
        {/* Stage Header */}
        <div className={`
          ${stage.headerColor} text-white p-4 rounded-t-lg
        `}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">{stage.title}</h3>
              <p className="text-sm opacity-90">{stage.description}</p>
            </div>
            
            <div className="text-right">
              <div className="text-xl font-bold">{metrics.count}</div>
              <div className="text-xs opacity-90">tickets</div>
            </div>
          </div>
          
          {/* Stage Metrics */}
          <div className="mt-3 pt-3 border-t border-white/20">
            <div className="flex justify-between text-sm">
              <span>Value: {formatCurrency(metrics.totalValue)}</span>
              <span>Avg: {Math.round(metrics.avgProbability)}%</span>
            </div>
          </div>
        </div>

        {/* Droppable Area */}
        <div className="p-4 min-h-96">
          <SortableContext 
            items={stageTickets.map(ticket => ticket._id)}
            strategy={verticalListSortingStrategy}
          >
            <div 
              id={stage.id}
              className="min-h-full"
            >
              <AnimatePresence>
                {stageTickets.map((ticket) => (
                  <SortableTicketCard key={ticket._id} ticket={ticket} />
                ))}
              </AnimatePresence>
              
              {/* Empty State */}
              {stageTickets.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">📋</div>
                  <p className="text-sm">No tickets in this stage</p>
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
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pipeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">CRM Pipeline</h2>
          <p className="text-gray-600">Drag and drop tickets between pipeline stages</p>
        </div>
        
        <Button
          onClick={handleCreateTicket}
          className="flex items-center space-x-2"
        >
          <PlusIcon className="w-5 h-5" />
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
        <div className="overflow-x-auto pb-6">
          <div className="flex space-x-6 min-w-max">
            {pipelineStages.map(stage => renderPipelineStage(stage))}
          </div>
        </div>
        
        <DragOverlay>
          {activeId ? (
            <div className="opacity-80">
              {(() => {
                // Find the ticket being dragged
                for (const stageTickets of Object.values(tickets)) {
                  const ticket = stageTickets.find(t => t._id === activeId);
                  if (ticket) {
                    return <SortableTicketCard ticket={ticket} />;
                  }
                }
                return null;
              })()}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

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

export default PipelineKanban;
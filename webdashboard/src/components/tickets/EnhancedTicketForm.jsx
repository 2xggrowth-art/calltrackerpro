import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  UserIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  BuildingOfficeIcon,
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  StarIcon,
  TagIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { Button, Input, Modal } from '../common';
import { ticketService } from '../../services/ticketService';
import { userService } from '../../services/userService';
import { organizationService } from '../../services/organizationService';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const EnhancedTicketForm = ({ ticket = null, isEdit = false, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Form data matching your complete schema
  const [formData, setFormData] = useState({
    // Contact Information
    phoneNumber: ticket?.phoneNumber || '',
    contactName: ticket?.contactName || '',
    alternatePhones: ticket?.alternatePhones || [''],
    email: ticket?.email || '',
    company: ticket?.company || '',
    jobTitle: ticket?.jobTitle || '',
    location: {
      city: ticket?.location?.city || '',
      state: ticket?.location?.state || '',
      country: ticket?.location?.country || '',
      address: ticket?.location?.address || ''
    },

    // Call Details
    callLogId: ticket?.callLogId || '',
    callDate: ticket?.callDate ? new Date(ticket.callDate).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
    callDuration: ticket?.callDuration || 0,
    callType: ticket?.callType || 'incoming',
    callRecordingUrl: ticket?.callRecordingUrl || '',
    callQuality: ticket?.callQuality || 3,

    // Lead Qualification
    leadSource: ticket?.leadSource || 'cold_call',
    leadStatus: ticket?.leadStatus || 'new',
    priority: ticket?.priority || 'medium',
    interestLevel: ticket?.interestLevel || 'warm',
    budgetRange: ticket?.budgetRange || '',
    timeline: ticket?.timeline || '',
    productsInterested: ticket?.productsInterested || [''],

    // Ticket Lifecycle
    status: ticket?.status || 'open',
    category: ticket?.category || 'sales',
    source: ticket?.source || 'phone',

    // SLA & Escalation
    dueDate: ticket?.dueDate ? new Date(ticket.dueDate).toISOString().slice(0, 16) : '',
    
    // Assignment
    assignedTo: ticket?.assignedTo || '',
    assignedTeam: ticket?.assignedTeam || '',

    // CRM Pipeline
    stage: ticket?.stage || 'prospect',
    nextFollowUp: ticket?.nextFollowUp ? new Date(ticket.nextFollowUp).toISOString().slice(0, 16) : '',
    followUpActions: ticket?.followUpActions || [''],
    dealValue: ticket?.dealValue || 0,
    conversionProbability: ticket?.conversionProbability || 50,

    // Notes
    agentNotes: ticket?.agentNotes || [],
    clientNotes: ticket?.clientNotes || [],
    tags: ticket?.tags || [''],
    
    // Initial notes for new tickets
    initialNote: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchUsers();
    fetchTeams();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await userService.getAllUsers();
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await organizationService.getTeams();
      setTeams(response.data || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1: // Contact Information
        if (!formData.contactName.trim()) {
          newErrors.contactName = 'Contact name is required';
        }
        if (!formData.phoneNumber.trim()) {
          newErrors.phoneNumber = 'Phone number is required';
        }
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = 'Please enter a valid email address';
        }
        break;

      case 2: // Call & Lead Details
        if (!formData.callDate) {
          newErrors.callDate = 'Call date is required';
        }
        if (formData.callDuration < 0) {
          newErrors.callDuration = 'Call duration cannot be negative';
        }
        break;

      case 3: // Assignment & SLA
        if (!formData.assignedTo && !formData.assignedTeam) {
          newErrors.assignment = 'Please assign to a user or team';
        }
        break;

      case 4: // CRM & Pipeline
        if (formData.dealValue < 0) {
          newErrors.dealValue = 'Deal value cannot be negative';
        }
        if (formData.conversionProbability < 0 || formData.conversionProbability > 100) {
          newErrors.conversionProbability = 'Conversion probability must be between 0-100%';
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    } else {
      toast.error('Please fix the errors before proceeding');
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleArrayInputChange = (field, index, value) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const addArrayItem = (field) => {
    setFormData({ 
      ...formData, 
      [field]: [...formData[field], ''] 
    });
  };

  const removeArrayItem = (field, index) => {
    if (formData[field].length > 1) {
      const newArray = formData[field].filter((_, i) => i !== index);
      setFormData({ ...formData, [field]: newArray });
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    setLoading(true);

    try {
      // Clean up form data
      const ticketData = {
        ...formData,
        // Remove empty strings from arrays
        alternatePhones: formData.alternatePhones.filter(phone => phone.trim()),
        productsInterested: formData.productsInterested.filter(product => product.trim()),
        followUpActions: formData.followUpActions.filter(action => action.trim()),
        tags: formData.tags.filter(tag => tag.trim()),
        
        // Convert dates
        callDate: new Date(formData.callDate).toISOString(),
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
        nextFollowUp: formData.nextFollowUp ? new Date(formData.nextFollowUp).toISOString() : null,
        
        // Add initial note if provided
        ...(formData.initialNote && {
          agentNotes: [{
            note: formData.initialNote,
            author: user._id,
            authorName: user.name,
            timestamp: new Date().toISOString(),
            isPrivate: false,
            noteType: 'agent'
          }]
        })
      };

      // Remove the initialNote field as it's not part of the ticket schema
      delete ticketData.initialNote;

      let result;
      if (isEdit) {
        result = await ticketService.updateTicket(ticket._id, ticketData);
        toast.success('Ticket updated successfully!');
      } else {
        result = await ticketService.createTicket(ticketData);
        toast.success('Ticket created successfully!');
      }

      onSuccess(result);
      onClose();
    } catch (error) {
      console.error('Error saving ticket:', error);
      toast.error(error.message || `Failed to ${isEdit ? 'update' : 'create'} ticket`);
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4].map(step => (
        <div key={step} className="flex items-center">
          <div className={`
            w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
            ${step <= currentStep 
              ? 'bg-primary-600 text-white' 
              : 'bg-gray-200 text-gray-600'
            }
          `}>
            {step < currentStep ? (
              <CheckCircleIcon className="w-5 h-5" />
            ) : (
              step
            )}
          </div>
          {step < 4 && (
            <div className={`
              w-16 h-1 mx-2
              ${step < currentStep ? 'bg-primary-600' : 'bg-gray-200'}
            `} />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <UserIcon className="w-12 h-12 text-primary-600 mx-auto mb-2" />
        <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
        <p className="text-gray-600">Basic contact details and location</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Contact Name *"
          placeholder="John Doe"
          value={formData.contactName}
          onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
          error={errors.contactName}
          icon={UserIcon}
          required
        />
        
        <Input
          label="Phone Number *"
          placeholder="+1 (555) 123-4567"
          value={formData.phoneNumber}
          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
          error={errors.phoneNumber}
          icon={PhoneIcon}
          required
        />

        <Input
          label="Email"
          type="email"
          placeholder="john@example.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          error={errors.email}
          icon={EnvelopeIcon}
        />

        <Input
          label="Company"
          placeholder="Acme Corp"
          value={formData.company}
          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          icon={BuildingOfficeIcon}
        />

        <Input
          label="Job Title"
          placeholder="Sales Manager"
          value={formData.jobTitle}
          onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
        />
      </div>

      {/* Alternate Phone Numbers */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Alternate Phone Numbers
        </label>
        {formData.alternatePhones.map((phone, index) => (
          <div key={index} className="flex items-center space-x-2 mb-2">
            <Input
              placeholder="+1 (555) 987-6543"
              value={phone}
              onChange={(e) => handleArrayInputChange('alternatePhones', index, e.target.value)}
              className="flex-1"
            />
            {formData.alternatePhones.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeArrayItem('alternatePhones', index)}
                className="text-red-600 hover:text-red-700"
              >
                Remove
              </Button>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => addArrayItem('alternatePhones')}
          className="text-primary-600 hover:text-primary-700"
        >
          + Add Phone Number
        </Button>
      </div>

      {/* Location */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
          <MapPinIcon className="w-5 h-5 mr-2" />
          Location
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="City"
            placeholder="New York"
            value={formData.location.city}
            onChange={(e) => setFormData({ 
              ...formData, 
              location: { ...formData.location, city: e.target.value }
            })}
          />
          
          <Input
            label="State"
            placeholder="NY"
            value={formData.location.state}
            onChange={(e) => setFormData({ 
              ...formData, 
              location: { ...formData.location, state: e.target.value }
            })}
          />

          <Input
            label="Country"
            placeholder="United States"
            value={formData.location.country}
            onChange={(e) => setFormData({ 
              ...formData, 
              location: { ...formData.location, country: e.target.value }
            })}
          />

          <Input
            label="Address"
            placeholder="123 Main St"
            value={formData.location.address}
            onChange={(e) => setFormData({ 
              ...formData, 
              location: { ...formData.location, address: e.target.value }
            })}
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <PhoneIcon className="w-12 h-12 text-primary-600 mx-auto mb-2" />
        <h3 className="text-lg font-semibold text-gray-900">Call & Lead Details</h3>
        <p className="text-gray-600">Call information and lead qualification</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Call Date *"
          type="datetime-local"
          value={formData.callDate}
          onChange={(e) => setFormData({ ...formData, callDate: e.target.value })}
          error={errors.callDate}
          icon={CalendarIcon}
          required
        />

        <Input
          label="Call Duration (seconds)"
          type="number"
          placeholder="180"
          value={formData.callDuration}
          onChange={(e) => setFormData({ ...formData, callDuration: parseInt(e.target.value) || 0 })}
          error={errors.callDuration}
          icon={ClockIcon}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Call Type</label>
          <select
            value={formData.callType}
            onChange={(e) => setFormData({ ...formData, callType: e.target.value })}
            className="input-field"
          >
            <option value="incoming">Incoming</option>
            <option value="outgoing">Outgoing</option>
            <option value="missed">Missed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Call Quality (1-5)</label>
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map(rating => (
              <button
                key={rating}
                type="button"
                onClick={() => setFormData({ ...formData, callQuality: rating })}
                className={`
                  p-1 rounded
                  ${formData.callQuality >= rating 
                    ? 'text-yellow-400' 
                    : 'text-gray-300'
                  }
                `}
              >
                <StarIcon className="w-5 h-5 fill-current" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Lead Source</label>
          <select
            value={formData.leadSource}
            onChange={(e) => setFormData({ ...formData, leadSource: e.target.value })}
            className="input-field"
          >
            <option value="cold_call">Cold Call</option>
            <option value="referral">Referral</option>
            <option value="website">Website</option>
            <option value="marketing">Marketing</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Lead Status</label>
          <select
            value={formData.leadStatus}
            onChange={(e) => setFormData({ ...formData, leadStatus: e.target.value })}
            className="input-field"
          >
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="converted">Converted</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            className="input-field"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Interest Level</label>
          <select
            value={formData.interestLevel}
            onChange={(e) => setFormData({ ...formData, interestLevel: e.target.value })}
            className="input-field"
          >
            <option value="hot">Hot</option>
            <option value="warm">Warm</option>
            <option value="cold">Cold</option>
          </select>
        </div>

        <Input
          label="Budget Range"
          placeholder="$10,000 - $50,000"
          value={formData.budgetRange}
          onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })}
        />

        <Input
          label="Timeline"
          placeholder="Q2 2024"
          value={formData.timeline}
          onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
        />
      </div>

      {/* Products Interested */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Products/Services Interested In
        </label>
        {formData.productsInterested.map((product, index) => (
          <div key={index} className="flex items-center space-x-2 mb-2">
            <Input
              placeholder="Product or service name"
              value={product}
              onChange={(e) => handleArrayInputChange('productsInterested', index, e.target.value)}
              className="flex-1"
            />
            {formData.productsInterested.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeArrayItem('productsInterested', index)}
                className="text-red-600 hover:text-red-700"
              >
                Remove
              </Button>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => addArrayItem('productsInterested')}
          className="text-primary-600 hover:text-primary-700"
        >
          + Add Product
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <ExclamationTriangleIcon className="w-12 h-12 text-primary-600 mx-auto mb-2" />
        <h3 className="text-lg font-semibold text-gray-900">Assignment & SLA</h3>
        <p className="text-gray-600">Ticket assignment and service level agreement</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="input-field"
          >
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="input-field"
          >
            <option value="sales">Sales</option>
            <option value="support">Support</option>
            <option value="billing">Billing</option>
            <option value="technical">Technical</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Assign to User</label>
          <select
            value={formData.assignedTo}
            onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
            className="input-field"
          >
            <option value="">Select User</option>
            {users.map(user => (
              <option key={user._id} value={user._id}>
                {user.name || `${user.firstName} ${user.lastName}`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Assign to Team</label>
          <select
            value={formData.assignedTeam}
            onChange={(e) => setFormData({ ...formData, assignedTeam: e.target.value })}
            className="input-field"
          >
            <option value="">Select Team</option>
            {teams.map(team => (
              <option key={team._id} value={team._id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Due Date"
          type="datetime-local"
          value={formData.dueDate}
          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          icon={CalendarIcon}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
          <select
            value={formData.source}
            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
            className="input-field"
          >
            <option value="phone">Phone</option>
            <option value="email">Email</option>
            <option value="web">Web</option>
            <option value="mobile_app">Mobile App</option>
          </select>
        </div>
      </div>

      {errors.assignment && (
        <div className="text-red-600 text-sm">{errors.assignment}</div>
      )}
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <CurrencyDollarIcon className="w-12 h-12 text-primary-600 mx-auto mb-2" />
        <h3 className="text-lg font-semibold text-gray-900">CRM & Pipeline</h3>
        <p className="text-gray-600">Deal information and follow-up planning</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Pipeline Stage</label>
          <select
            value={formData.stage}
            onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
            className="input-field"
          >
            <option value="prospect">Prospect</option>
            <option value="qualified">Qualified</option>
            <option value="proposal">Proposal</option>
            <option value="negotiation">Negotiation</option>
            <option value="closed-won">Closed Won</option>
            <option value="closed-lost">Closed Lost</option>
          </select>
        </div>

        <Input
          label="Deal Value ($)"
          type="number"
          placeholder="25000"
          value={formData.dealValue}
          onChange={(e) => setFormData({ ...formData, dealValue: parseFloat(e.target.value) || 0 })}
          error={errors.dealValue}
          icon={CurrencyDollarIcon}
        />

        <Input
          label="Conversion Probability (%)"
          type="number"
          min="0"
          max="100"
          placeholder="75"
          value={formData.conversionProbability}
          onChange={(e) => setFormData({ ...formData, conversionProbability: parseInt(e.target.value) || 0 })}
          error={errors.conversionProbability}
        />

        <Input
          label="Next Follow-Up"
          type="datetime-local"
          value={formData.nextFollowUp}
          onChange={(e) => setFormData({ ...formData, nextFollowUp: e.target.value })}
          icon={CalendarIcon}
        />
      </div>

      {/* Follow-Up Actions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Follow-Up Actions
        </label>
        {formData.followUpActions.map((action, index) => (
          <div key={index} className="flex items-center space-x-2 mb-2">
            <Input
              placeholder="Call to discuss proposal"
              value={action}
              onChange={(e) => handleArrayInputChange('followUpActions', index, e.target.value)}
              className="flex-1"
            />
            {formData.followUpActions.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeArrayItem('followUpActions', index)}
                className="text-red-600 hover:text-red-700"
              >
                Remove
              </Button>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => addArrayItem('followUpActions')}
          className="text-primary-600 hover:text-primary-700"
        >
          + Add Action
        </Button>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <TagIcon className="w-4 h-4 inline mr-1" />
          Tags
        </label>
        {formData.tags.map((tag, index) => (
          <div key={index} className="flex items-center space-x-2 mb-2">
            <Input
              placeholder="important, follow-up"
              value={tag}
              onChange={(e) => handleArrayInputChange('tags', index, e.target.value)}
              className="flex-1"
            />
            {formData.tags.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeArrayItem('tags', index)}
                className="text-red-600 hover:text-red-700"
              >
                Remove
              </Button>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => addArrayItem('tags')}
          className="text-primary-600 hover:text-primary-700"
        >
          + Add Tag
        </Button>
      </div>

      {/* Initial Note */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <DocumentTextIcon className="w-4 h-4 inline mr-1" />
          Initial Note
        </label>
        <textarea
          rows={4}
          placeholder="Add initial notes about this ticket..."
          value={formData.initialNote}
          onChange={(e) => setFormData({ ...formData, initialNote: e.target.value })}
          className="input-field"
        />
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={isEdit ? 'Edit Ticket' : 'Create New Ticket'}
      size="2xl"
    >
      <div className="p-6">
        {renderStepIndicator()}
        
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </motion.div>
      </div>

      <Modal.Footer>
        <div className="flex justify-between w-full">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          
          <div className="flex space-x-2">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="ghost"
                onClick={handlePrevious}
                disabled={loading}
              >
                Previous
              </Button>
            )}
            
            {currentStep < totalSteps ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={loading}
              >
                Next
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                loading={loading}
                disabled={loading}
              >
                {loading ? 'Saving...' : (isEdit ? 'Update Ticket' : 'Create Ticket')}
              </Button>
            )}
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default EnhancedTicketForm;
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { Button, Input, Modal } from '../common';
import { ticketService } from '../../services/ticketService';
import { userService } from '../../services/userService';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const EnhancedTicketForm = ({ ticket = null, isEdit = false, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const [formData, setFormData] = useState({
    // Step 1: Contact
    contactName: ticket?.contactName || '',
    phoneNumber: ticket?.phoneNumber || '',
    email: ticket?.email || '',
    company: ticket?.company || '',

    // Step 2: Lead Details
    priority: ticket?.priority || 'medium',
    interestLevel: ticket?.interestLevel || 'warm',
    leadSource: ticket?.leadSource || 'cold_call',
    category: ticket?.category || 'sales',
    initialNote: '',

    // Step 3: Assignment & Deal
    assignedTo: ticket?.assignedTo || '',
    stage: ticket?.stage || 'new',
    dealValue: ticket?.dealValue || 0,
    nextFollowUp: ticket?.nextFollowUp ? new Date(ticket.nextFollowUp).toISOString().slice(0, 16) : '',

    // Defaults (sent but not shown in form)
    callDate: ticket?.callDate ? new Date(ticket.callDate).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
    callType: ticket?.callType || 'incoming',
    callDuration: ticket?.callDuration || 0,
    leadStatus: ticket?.leadStatus || 'new',
    status: ticket?.status || 'open',
    source: ticket?.source || 'phone',
    conversionProbability: ticket?.conversionProbability || 50,
    tags: ticket?.tags || [],
    alternatePhones: ticket?.alternatePhones || [],
    productsInterested: ticket?.productsInterested || [],
    followUpActions: ticket?.followUpActions || [],
    location: ticket?.location || {},
    agentNotes: ticket?.agentNotes || [],
    clientNotes: ticket?.clientNotes || [],
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await userService.getAllUsers();
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const stepLabels = ['Contact', 'Details', 'Assign'];

  const validateStep = (step) => {
    const newErrors = {};
    switch (step) {
      case 1:
        if (!formData.contactName.trim()) newErrors.contactName = 'Name is required';
        if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone is required';
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email';
        break;
      case 2:
        break;
      case 3:
        if (formData.dealValue < 0) newErrors.dealValue = 'Cannot be negative';
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
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setLoading(true);
    try {
      const ticketData = {
        ...formData,
        callDate: new Date(formData.callDate).toISOString(),
        nextFollowUp: formData.nextFollowUp ? new Date(formData.nextFollowUp).toISOString() : null,
        tags: formData.tags.filter(t => t && t.trim()),
        alternatePhones: formData.alternatePhones.filter(p => p && p.trim()),
        productsInterested: formData.productsInterested.filter(p => p && p.trim()),
        followUpActions: formData.followUpActions.filter(a => a && a.trim()),
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
      delete ticketData.initialNote;

      if (isEdit) {
        await ticketService.updateTicket(ticket._id, ticketData);
        toast.success('Ticket updated!');
      } else {
        await ticketService.createTicket(ticketData);
        toast.success('Ticket created!');
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.message || `Failed to ${isEdit ? 'update' : 'create'} ticket`);
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {stepLabels.map((label, idx) => {
        const step = idx + 1;
        const isActive = step === currentStep;
        const isDone = step < currentStep;
        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`
                w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all
                ${isDone ? 'bg-green-500 text-white' : isActive ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' : 'bg-gray-100 text-gray-400'}
              `}>
                {isDone ? <CheckCircleIcon className="w-5 h-5" /> : step}
              </div>
              <span className={`text-xs mt-1.5 font-medium ${isActive ? 'text-primary-600' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
            {step < totalSteps && (
              <div className={`w-16 h-0.5 mx-3 mb-5 rounded ${isDone ? 'bg-green-500' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-5">
      <div className="text-center mb-2">
        <h3 className="text-lg font-semibold text-gray-900">Who is the contact?</h3>
        <p className="text-sm text-gray-500">Basic info to create the ticket</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Name *"
          placeholder="John Doe"
          value={formData.contactName}
          onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
          error={errors.contactName}
          icon={UserIcon}
        />
        <Input
          label="Phone *"
          placeholder="+91 98765 43210"
          value={formData.phoneNumber}
          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
          error={errors.phoneNumber}
          icon={PhoneIcon}
        />
        <Input
          label="Email"
          type="email"
          placeholder="john@company.com"
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
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-5">
      <div className="text-center mb-2">
        <h3 className="text-lg font-semibold text-gray-900">Lead details</h3>
        <p className="text-sm text-gray-500">How hot is this lead?</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Priority</label>
          <div className="grid grid-cols-2 gap-2">
            {['low', 'medium', 'high', 'urgent'].map(p => (
              <button
                key={p}
                type="button"
                onClick={() => setFormData({ ...formData, priority: p })}
                className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all capitalize
                  ${formData.priority === p
                    ? p === 'urgent' ? 'bg-red-50 border-red-300 text-red-700'
                      : p === 'high' ? 'bg-orange-50 border-orange-300 text-orange-700'
                      : p === 'medium' ? 'bg-yellow-50 border-yellow-300 text-yellow-700'
                      : 'bg-green-50 border-green-300 text-green-700'
                    : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Interest</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'hot', emoji: '🔥', color: 'red' },
              { value: 'warm', emoji: '☀️', color: 'yellow' },
              { value: 'cold', emoji: '❄️', color: 'blue' },
            ].map(({ value, emoji, color }) => (
              <button
                key={value}
                type="button"
                onClick={() => setFormData({ ...formData, interestLevel: value })}
                className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all capitalize
                  ${formData.interestLevel === value
                    ? `bg-${color}-50 border-${color}-300 text-${color}-700`
                    : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
              >
                {emoji} {value}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Source</label>
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
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
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
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          <DocumentTextIcon className="w-4 h-4 inline mr-1" />
          Quick Note
        </label>
        <textarea
          rows={3}
          placeholder="Any context about this lead..."
          value={formData.initialNote}
          onChange={(e) => setFormData({ ...formData, initialNote: e.target.value })}
          className="input-field resize-none"
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-5">
      <div className="text-center mb-2">
        <h3 className="text-lg font-semibold text-gray-900">Assign & track</h3>
        <p className="text-sm text-gray-500">Who handles this and what's the deal worth?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Assign to</label>
          <select
            value={formData.assignedTo}
            onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
            className="input-field"
          >
            <option value="">Unassigned</option>
            {users.map(u => (
              <option key={u._id} value={u._id}>
                {u.name || `${u.firstName} ${u.lastName}`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Pipeline Stage</label>
          <select
            value={formData.stage}
            onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
            className="input-field"
          >
            <option value="new">New Lead</option>
            <option value="qualified">Qualified</option>
            <option value="proposal">Proposal</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <Input
          label="Deal Value (₹)"
          type="number"
          placeholder="25000"
          value={formData.dealValue}
          onChange={(e) => setFormData({ ...formData, dealValue: parseFloat(e.target.value) || 0 })}
          error={errors.dealValue}
          icon={CurrencyDollarIcon}
        />

        <Input
          label="Follow-up Date"
          type="datetime-local"
          value={formData.nextFollowUp}
          onChange={(e) => setFormData({ ...formData, nextFollowUp: e.target.value })}
          icon={CalendarIcon}
        />
      </div>

      {/* Summary Preview */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Summary</h4>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-400">Contact:</span>
            <span className="ml-2 text-gray-900 font-medium">{formData.contactName || '—'}</span>
          </div>
          <div>
            <span className="text-gray-400">Phone:</span>
            <span className="ml-2 text-gray-900 font-medium">{formData.phoneNumber || '—'}</span>
          </div>
          <div>
            <span className="text-gray-400">Priority:</span>
            <span className={`ml-2 font-medium capitalize ${
              formData.priority === 'urgent' ? 'text-red-600'
              : formData.priority === 'high' ? 'text-orange-600'
              : formData.priority === 'medium' ? 'text-yellow-600'
              : 'text-green-600'
            }`}>{formData.priority}</span>
          </div>
          <div>
            <span className="text-gray-400">Interest:</span>
            <span className="ml-2 text-gray-900 font-medium capitalize">{formData.interestLevel}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={isEdit ? 'Edit Ticket' : 'New Ticket'}
      size="lg"
    >
      <div className="p-6">
        {renderStepIndicator()}

        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
        >
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
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
                Back
              </Button>
            )}

            {currentStep < totalSteps ? (
              <Button type="button" onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                loading={loading}
                disabled={loading}
              >
                {loading ? 'Saving...' : (isEdit ? 'Update' : 'Create Ticket')}
              </Button>
            )}
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default EnhancedTicketForm;

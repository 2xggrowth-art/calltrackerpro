import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Card, Button, Input } from '../../components/common';
import { ticketService } from '../../services/ticketService';
import toast from 'react-hot-toast';
import {
  TicketIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  TagIcon,
  CalendarIcon,
  DocumentTextIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const TicketCreate = () => {
  const { getUserId, getOrganizationId } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'open',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    assignedTo: '',
    dueDate: '',
    tags: [],
    category: '',
    source: 'manual'
  });

  const [errors, setErrors] = useState({});
  const [tagInput, setTagInput] = useState('');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Customer name is required';
    }

    if (formData.customerEmail && !isValidEmail(formData.customerEmail)) {
      newErrors.customerEmail = 'Please enter a valid email address';
    }

    if (formData.dueDate && new Date(formData.dueDate) < new Date()) {
      newErrors.dueDate = 'Due date cannot be in the past';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    setLoading(true);

    try {
      const ticketData = {
        ...formData,
        createdBy: getUserId(),
        organizationId: getOrganizationId(),
        customer: {
          name: formData.customerName,
          email: formData.customerEmail,
          phone: formData.customerPhone
        }
      };

      const response = await ticketService.createTicket(ticketData);
      
      toast.success('Ticket created successfully!');
      navigate(`/dashboard/crm/tickets/${response.data.id || response.data._id}`);
      
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error(error.message || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    setLoading(true);
    
    try {
      const draftData = {
        ...formData,
        status: 'draft',
        createdBy: getUserId(),
        organizationId: getOrganizationId(),
        customer: {
          name: formData.customerName,
          email: formData.customerEmail,
          phone: formData.customerPhone
        }
      };

      const response = await ticketService.createTicket(draftData);
      
      toast.success('Draft saved successfully!');
      navigate(`/dashboard/crm/tickets/${response.data.id || response.data._id}?mode=edit`);
      
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error('Failed to save draft');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center space-x-4"
      >
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard/crm/tickets')}
          className="flex items-center space-x-2"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Back to Tickets</span>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Ticket</h1>
          <p className="text-gray-600 mt-2">Fill in the details to create a new support ticket</p>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-6">
              <TicketIcon className="w-6 h-6 text-primary-600" />
              <h2 className="text-xl font-semibold text-gray-900">Ticket Details</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="lg:col-span-2">
                <Input
                  label="Title *"
                  placeholder="Brief description of the issue"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  error={errors.title}
                  required
                />
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  placeholder="Detailed description of the issue..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className={`input-field ${errors.description ? 'border-red-300' : ''}`}
                  required
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className="input-field"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="input-field"
                >
                  <option value="">Select Category</option>
                  <option value="technical">Technical Issue</option>
                  <option value="billing">Billing</option>
                  <option value="feature-request">Feature Request</option>
                  <option value="bug-report">Bug Report</option>
                  <option value="general">General Inquiry</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <Input
                  label="Due Date"
                  type="datetime-local"
                  value={formData.dueDate}
                  onChange={(e) => handleInputChange('dueDate', e.target.value)}
                  error={errors.dueDate}
                  icon={CalendarIcon}
                />
              </div>

              <div>
                <Input
                  label="Assigned To"
                  placeholder="User ID or email"
                  value={formData.assignedTo}
                  onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                  icon={UserIcon}
                />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Customer Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-6">
              <UserIcon className="w-6 h-6 text-primary-600" />
              <h2 className="text-xl font-semibold text-gray-900">Customer Information</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <Input
                  label="Customer Name *"
                  placeholder="Full name"
                  value={formData.customerName}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                  error={errors.customerName}
                  icon={UserIcon}
                  required
                />
              </div>

              <div>
                <Input
                  label="Email"
                  type="email"
                  placeholder="customer@example.com"
                  value={formData.customerEmail}
                  onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                  error={errors.customerEmail}
                  icon={EnvelopeIcon}
                />
              </div>

              <div>
                <Input
                  label="Phone"
                  placeholder="+1 (555) 123-4567"
                  value={formData.customerPhone}
                  onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                  icon={PhoneIcon}
                />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Tags and Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-6">
              <TagIcon className="w-6 h-6 text-primary-600" />
              <h2 className="text-xl font-semibold text-gray-900">Tags & Labels</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add a tag and press Enter"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button type="button" onClick={addTag} disabled={!tagInput.trim()}>
                    Add
                  </Button>
                </div>
                
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 text-primary-600 hover:text-primary-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Form Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4"
        >
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/dashboard/crm/tickets')}
            disabled={loading}
          >
            Cancel
          </Button>
          
          <Button
            type="button"
            variant="secondary"
            onClick={handleSaveDraft}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <DocumentTextIcon className="w-5 h-5" />
            <span>{loading ? 'Saving...' : 'Save Draft'}</span>
          </Button>
          
          <Button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <TicketIcon className="w-5 h-5" />
            <span>{loading ? 'Creating...' : 'Create Ticket'}</span>
          </Button>
        </motion.div>
      </form>
    </div>
  );
};

export default TicketCreate;
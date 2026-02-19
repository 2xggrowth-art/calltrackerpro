import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '../common';
import toast from 'react-hot-toast';
import { demoService } from '../../services/demoService';

const ScheduleDemoForm = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    urgency: '',
    currentPain: '',
    budget: '',
    timeline: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const urgencyOptions = [
    { value: 'urgent', label: '🔥 Urgent - We need to solve this ASAP' },
    { value: 'planned', label: '📋 Planned - Looking for the right solution' },
    { value: 'exploring', label: '🤔 Exploring - Just researching options' }
  ];

  const painOptions = [
    { value: 'wasted-ad-spend', label: 'Wasted ad spend - no idea what drives calls' },
    { value: 'poor-roi-tracking', label: 'Can\'t prove ROI to clients/management' },
    { value: 'missed-opportunities', label: 'Missing calls or losing deals' },
    { value: 'manual-tracking', label: 'Manual tracking is time-consuming' },
    { value: 'competitor-advantage', label: 'Competitors have better call insights' },
    { value: 'other', label: 'Other (will explain in message)' }
  ];

  const budgetOptions = [
    { value: 'under-1k', label: 'Under $1,000' },
    { value: '1k-5k', label: '$1,000 - $5,000' },
    { value: '5k-10k', label: '$5,000 - $10,000' },
    { value: '10k-plus', label: '$10,000+' },
    { value: 'not-sure', label: 'Not sure yet' }
  ];

  const timelineOptions = [
    { value: 'this-week', label: 'This week' },
    { value: 'this-month', label: 'This month' },
    { value: 'next-month', label: 'Next month' },
    { value: 'next-quarter', label: 'Next quarter' },
    { value: 'flexible', label: 'Flexible' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Basic validation
      if (!formData.name || !formData.email || !formData.urgency) {
        throw new Error('Please fill in all required fields');
      }
      
      console.log('📝 Submitting demo request:', formData);

      // Validate form data against backend expectations
      const validUrgencies = ['urgent', 'planned', 'exploring'];
      const validBudgets = ['under-1k', '1k-5k', '5k-10k', '10k-plus', 'not-sure'];
      const validTimelines = ['this-week', 'this-month', 'next-month', 'next-quarter', 'flexible'];

      if (!validUrgencies.includes(formData.urgency)) {
        throw new Error('Invalid urgency value');
      }

      if (formData.budget && !validBudgets.includes(formData.budget)) {
        throw new Error('Invalid budget value');
      }

      if (formData.timeline && !validTimelines.includes(formData.timeline)) {
        throw new Error('Invalid timeline value');
      }

      const demoData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        urgency: formData.urgency, // 'urgent', 'planned', 'exploring'
        timeline: formData.timeline, // 'this-week', 'this-month', 'next-month', 'next-quarter', 'flexible'
        budget: formData.budget, // 'under-1k', '1k-5k', '5k-10k', '10k-plus', 'not-sure'
        currentPain: formData.currentPain, // Pain point selection
        message: formData.message
      };

      const response = await demoService.submitDemo(demoData);
      console.log('✅ Demo submitted successfully:', response);

      // Create personalized success message based on urgency
      const urgencyMessage = formData.urgency === 'urgent' 
        ? 'I\'ll prioritize your request and get back to you within 2 hours!'
        : formData.urgency === 'planned'
        ? 'Perfect timing! I\'ll send you a detailed demo proposal within 24 hours.'
        : 'Thanks for your interest! I\'ll send you some helpful resources and schedule a demo when you\'re ready.';
      
      toast.success(`🎯 Got it! ${urgencyMessage}`, { duration: 6000 });
      
      // Reset form
      setFormData({
        name: '', email: '', company: '', phone: '', urgency: '',
        currentPain: '', budget: '', timeline: '', message: ''
      });
      
      onClose();
    } catch (error) {
      console.error('❌ Demo submission failed:', error);
      toast.error(error.message || 'Failed to submit demo request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          onClick={onClose}
        ></div>
        
        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Schedule Your Demo</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Contact Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Your name"
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="your@company.com"
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  placeholder="Your company"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Your phone number"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* Urgency Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                How urgent is this for you? <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {urgencyOptions.map((option) => (
                  <label key={option.value} className="flex items-center cursor-pointer p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all">
                    <input
                      type="radio"
                      name="urgency"
                      value={option.value}
                      checked={formData.urgency === option.value}
                      onChange={(e) => handleInputChange('urgency', e.target.value)}
                      required
                      className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                    />
                    <span className="ml-3 text-gray-700 font-medium">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Current Pain Point */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                What's your biggest call tracking challenge?
              </label>
              <select
                value={formData.currentPain}
                onChange={(e) => handleInputChange('currentPain', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select your main challenge...</option>
                {painOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Budget and Timeline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Budget Range
                </label>
                <select
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select budget...</option>
                  {budgetOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Timeline
                </label>
                <select
                  value={formData.timeline}
                  onChange={(e) => handleInputChange('timeline', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">When do you need this?</option>
                  {timelineOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Additional Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Anything else you'd like us to know?
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                placeholder="Tell us more about your specific needs..."
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              
              <Button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 min-w-[120px]"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  'Schedule Demo'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ScheduleDemoForm;
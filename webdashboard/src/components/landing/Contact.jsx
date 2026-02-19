import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { 
  PhoneIcon, 
  EnvelopeIcon, 
  MapPinIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline';
import { Button, Input, Card } from '../common';
import { ScheduleDemoButton } from '../demo';
import toast from 'react-hot-toast';
import { registrationService } from '../../services/registrationService';

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const contactInfo = [
    {
      icon: PhoneIcon,
      title: 'Phone Support',
      details: '+91 8660310638',
      subtitle: 'Available 24/7 for Enterprise customers'
    },
    {
      icon: EnvelopeIcon,
      title: 'Email Support',
      details: 'support@calltrackerprp.com',
      subtitle: 'We respond within 4 hours'
    },
    {
      icon: MapPinIcon,
      title: 'Headquarters',
      details: 'Bengaluru, KA',
      subtitle: 'Global offices in 12+ countries'
    },
    {
      icon: ClockIcon,
      title: 'Business Hours',
      details: 'Mon-Fri: 9AM-6PM IST',
      subtitle: 'Emergency support available 24/7'
    }
  ];

  const supportOptions = [
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'Live Chat',
      description: 'Get instant help from our support team',
      action: 'Start Chat',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: VideoCameraIcon,
      title: 'Schedule Demo',
      description: 'Book a personalized product demonstration',
      action: 'Book Demo',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: PhoneIcon,
      title: 'Phone Support',
      description: 'Speak directly with our technical experts',
      action: 'Call Now',
      color: 'from-purple-500 to-purple-600'
    }
  ];

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await registrationService.sendContactMessage(data);
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      reset();
    } catch (error) {
      console.error('Contact form error:', error);
      toast.error(error.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Get in
            <span className="bg-clip-text text-transparent bg-primary-gradient"> Touch</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Ready to transform your call management? Our team is here to help you get started 
            and answer any questions you might have.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h3>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Input
                    label="First Name"
                    placeholder="John"
                    required
                    error={errors.firstName?.message}
                    {...register('firstName', { required: 'First name is required' })}
                  />
                  <Input
                    label="Last Name"
                    placeholder="Doe"
                    required
                    error={errors.lastName?.message}
                    {...register('lastName', { required: 'Last name is required' })}
                  />
                </div>
                
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="john@company.com"
                  required
                  error={errors.email?.message}
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: 'Invalid email address'
                    }
                  })}
                />
                
                <Input
                  label="Company Name"
                  placeholder="Your Company"
                  error={errors.company?.message}
                  {...register('company')}
                />
                
                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  error={errors.phone?.message}
                  {...register('phone')}
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Tell us about your needs..."
                    className="input-field resize-none"
                    {...register('message', { required: 'Message is required' })}
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
                  )}
                </div>
                
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    className="mt-1 mr-3"
                    {...register('newsletter')}
                  />
                  <label className="text-sm text-gray-600">
                    I'd like to receive updates about CallTracker Pro features and company news.
                  </label>
                </div>
                
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </Card>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h3>
              <div className="grid gap-6">
                {contactInfo.map((info, index) => (
                  <Card key={index} className="p-6 flex items-start space-x-4">
                    <div className="bg-primary-gradient p-3 rounded-lg">
                      <info.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{info.title}</h4>
                      <p className="text-lg text-gray-700 mb-1">{info.details}</p>
                      <p className="text-sm text-gray-500">{info.subtitle}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Quick Support Options */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Quick Support</h3>
              <div className="space-y-4">
                {supportOptions.map((option, index) => (
                  <Card key={index} className="p-6 group hover:shadow-lg cursor-pointer">
                    <div className="flex items-center space-x-4">
                      <div className={`bg-gradient-to-r ${option.color} p-3 rounded-lg group-hover:scale-110 transition-transform duration-300`}>
                        <option.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{option.title}</h4>
                        <p className="text-gray-600 text-sm">{option.description}</p>
                      </div>
                      {option.title === 'Schedule Demo' ? (
                        <ScheduleDemoButton 
                          variant="outline" 
                          size="sm"
                          text={option.action}
                          showIcon={false}
                        />
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            if (option.title === 'Phone Support') {
                              window.open('tel:+1-800-CALLTRACKER', '_self');
                            } else if (option.title === 'Live Chat') {
                              // You can integrate live chat here
                              toast.info('Live chat coming soon!');
                            }
                          }}
                        >
                          {option.action}
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center"
        >
          <Card className="p-8 bg-white">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Have Questions? Check Our FAQ
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Find quick answers to common questions about CallTracker Pro features, 
              pricing, and implementation in our comprehensive FAQ section.
            </p>
            <Button 
              variant="secondary"
              onClick={() => window.open('/faq', '_blank')}
            >
              Visit FAQ Center
            </Button>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;
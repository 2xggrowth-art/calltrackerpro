import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import {
  EnvelopeIcon,
  MapPinIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { registrationService } from '../../services/registrationService';

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await registrationService.sendContactMessage(data);
      toast.success("Message sent! We'll get back to you within 4 hours.");
      reset();
    } catch (error) {
      toast.error(error.message || 'Failed to send. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactItems = [
    {
      icon: EnvelopeIcon,
      label: 'Email',
      value: 'support@calltrackerpro.com',
      sub: 'We respond within 4 hours',
    },
    {
      icon: PhoneIcon,
      label: 'Phone',
      value: '+91 8660310638',
      sub: '24/7 for Enterprise customers',
    },
    {
      icon: MapPinIcon,
      label: 'Office',
      value: 'Bengaluru, India',
      sub: 'With teams across 12+ countries',
    },
  ];

  return (
    <section id="contact" className="py-24 md:py-32 relative bg-white">
      <div className="relative max-w-5xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-[13px] font-semibold text-indigo-600 tracking-wide uppercase mb-3">
            Contact
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">
            Let's <span className="text-indigo-600">talk</span>
          </h2>
          <p className="text-slate-700 text-[16px] max-w-lg mx-auto">
            Ready to get started? Our team is here to help.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="lg:col-span-3"
          >
            <div className="l-card p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[13px] font-semibold text-slate-700 mb-2">
                      First Name
                    </label>
                    <input
                      className="landing-input"
                      placeholder="John"
                      {...register('firstName', { required: 'Required' })}
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-[12px] text-red-500">{errors.firstName.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-slate-700 mb-2">
                      Last Name
                    </label>
                    <input
                      className="landing-input"
                      placeholder="Doe"
                      {...register('lastName', { required: 'Required' })}
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-[12px] text-red-500">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-2">
                    Work Email
                  </label>
                  <input
                    type="email"
                    className="landing-input"
                    placeholder="john@company.com"
                    {...register('email', {
                      required: 'Required',
                      pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' },
                    })}
                  />
                  {errors.email && (
                    <p className="mt-1 text-[12px] text-red-500">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-2">
                    Company
                  </label>
                  <input
                    className="landing-input"
                    placeholder="Your Company"
                    {...register('company')}
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-2">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    className="landing-input resize-none"
                    placeholder="Tell us about your needs..."
                    {...register('message', { required: 'Required' })}
                  />
                  {errors.message && (
                    <p className="mt-1 text-[12px] text-red-500">{errors.message.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-6 rounded-xl bg-indigo-600 text-white text-[14px] font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shimmer-btn shadow-md shadow-indigo-200"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </motion.div>

          {/* Contact info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="lg:col-span-2 space-y-4"
          >
            {contactItems.map((item, i) => (
              <div key={i} className="l-card p-6">
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-slate-400 uppercase tracking-wider mb-1">{item.label}</p>
                    <p className="text-[15px] text-slate-900 font-medium mb-0.5">
                      {item.value}
                    </p>
                    <p className="text-[12px] text-slate-400">{item.sub}</p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;

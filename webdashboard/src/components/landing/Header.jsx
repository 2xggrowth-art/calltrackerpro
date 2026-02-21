import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { EnvelopeIcon, PhoneIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { registrationService } from '../../services/registrationService';
import { ScheduleDemoButton } from '../demo';

const ContactDropdown = ({ onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dropdownRef = useRef(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await registrationService.sendContactMessage(data);
      toast.success("Message sent! We'll get back to you within 4 hours.");
      reset();
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to send. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactItems = [
    { icon: EnvelopeIcon, value: 'support@calltrackerpro.com' },
    { icon: PhoneIcon, value: '+91 8660310638' },
    { icon: MapPinIcon, value: 'Bengaluru, India' },
  ];

  return (
    <motion.div
      ref={dropdownRef}
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      className="absolute top-full right-0 mt-2 w-[420px] bg-white rounded-xl border border-slate-200 shadow-xl z-50"
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[15px] font-semibold text-slate-900">Get in touch</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input
                className="w-full px-3 py-2 text-[13px] border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors placeholder:text-slate-400"
                placeholder="First Name"
                {...register('firstName', { required: 'Required' })}
              />
              {errors.firstName && (
                <p className="mt-0.5 text-[11px] text-red-500">{errors.firstName.message}</p>
              )}
            </div>
            <div>
              <input
                className="w-full px-3 py-2 text-[13px] border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors placeholder:text-slate-400"
                placeholder="Last Name"
                {...register('lastName', { required: 'Required' })}
              />
              {errors.lastName && (
                <p className="mt-0.5 text-[11px] text-red-500">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div>
            <input
              type="email"
              className="w-full px-3 py-2 text-[13px] border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors placeholder:text-slate-400"
              placeholder="Work Email"
              {...register('email', {
                required: 'Required',
                pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' },
              })}
            />
            {errors.email && (
              <p className="mt-0.5 text-[11px] text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div>
            <input
              className="w-full px-3 py-2 text-[13px] border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors placeholder:text-slate-400"
              placeholder="Company"
              {...register('company')}
            />
          </div>

          <div>
            <textarea
              rows={3}
              className="w-full px-3 py-2 text-[13px] border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors resize-none placeholder:text-slate-400"
              placeholder="Tell us about your needs..."
              {...register('message', { required: 'Required' })}
            />
            {errors.message && (
              <p className="mt-0.5 text-[11px] text-red-500">{errors.message.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 text-white text-[13px] font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-4">
          {contactItems.map((item, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <item.icon className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] text-slate-500">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  const navItems = [
    { label: 'Features', href: 'features' },
    { label: 'Pricing', href: 'pricing' },
    { label: 'About', href: 'about' },
  ];

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <button
            onClick={() => scrollToSection('home')}
            className="flex items-center gap-2.5 group"
          >
            <img
              src="/logolanding.png"
              alt="CallTracker Pro"
              className="w-8 h-8 object-contain"
            />
            <span className="text-[15px] font-semibold text-slate-900 tracking-tight">
              CallTracker Pro
            </span>
          </button>

          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => scrollToSection(item.href)}
                className="text-[13px] font-medium text-slate-500 hover:text-slate-900 transition-colors duration-200"
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3 relative">
            <button
              onClick={() => setIsContactOpen(!isContactOpen)}
              className={`text-[13px] font-medium border rounded-lg px-4 py-2 transition-colors ${
                isContactOpen
                  ? 'text-indigo-700 border-indigo-700 bg-indigo-50'
                  : 'text-indigo-600 border-indigo-600 hover:text-indigo-700 hover:border-indigo-700'
              }`}
            >
              Contact
            </button>
            <button
              onClick={() => (window.location.href = '/login')}
              className="text-[13px] font-medium text-slate-500 hover:text-slate-900 transition-colors px-3 py-2"
            >
              Sign in
            </button>
            <ScheduleDemoButton
              variant="primary"
              size="sm"
              text="Get Started"
              showIcon={false}
              className="!rounded-lg !py-2 !px-4 !text-[13px] !shadow-none !bg-indigo-600 hover:!bg-indigo-700 !transform-none"
            />

            <AnimatePresence>
              {isContactOpen && (
                <ContactDropdown onClose={() => setIsContactOpen(false)} />
              )}
            </AnimatePresence>
          </div>

          <button
            className="md:hidden p-2 text-slate-500 hover:text-slate-900"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <XMarkIcon className="h-5 w-5" />
            ) : (
              <Bars3Icon className="h-5 w-5" />
            )}
          </button>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div className="bg-white border border-slate-200 rounded-xl py-4 px-4 mb-4 space-y-1 shadow-lg">
                {navItems.map((item) => (
                  <button
                    key={item.href}
                    onClick={() => scrollToSection(item.href)}
                    className="block w-full text-left text-[14px] text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg px-3 py-2.5 transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsContactOpen(true);
                    }}
                    className="block w-full text-center text-[14px] font-medium text-indigo-600 border border-indigo-600 rounded-lg px-3 py-2.5 transition-colors hover:bg-indigo-50"
                  >
                    Contact
                  </button>
                  <button
                    onClick={() => (window.location.href = '/login')}
                    className="block w-full text-left text-[14px] text-slate-600 hover:text-slate-900 px-3 py-2.5"
                  >
                    Sign in
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
};

export default Header;

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { ScheduleDemoButton } from '../demo';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    { label: 'Contact', href: 'contact' },
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

          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => (window.location.href = '/login')}
              className="text-[13px] font-medium text-slate-500 hover:text-slate-900 transition-colors px-3 py-1.5"
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

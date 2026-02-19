import React from 'react';
import { motion } from 'framer-motion';
import { PlayIcon, ChartBarIcon, PhoneIcon, UsersIcon } from '@heroicons/react/24/outline';
import { Button } from '../common';

const Hero = () => {
  const stats = [
    { icon: PhoneIcon, value: '10K+', label: 'Calls Managed Daily' },
    { icon: UsersIcon, value: '500+', label: 'Active Organizations' },
    { icon: ChartBarIcon, value: '99.9%', label: 'Uptime Guarantee' },
  ];

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center bg-primary-gradient overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <motion.div
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute inset-0 bg-gradient-to-r from-primary-600 via-secondary-500 to-accent-500 opacity-30"
          style={{
            backgroundSize: '200% 200%',
          }}
        />
      </div>

      {/* Floating Elements */}
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"
      />
      <motion.div
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-20 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Transform Your
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
              Call Management
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
            Empower your business with CallTracker Pro's comprehensive call management platform. 
            Track, analyze, and optimize every customer interaction with enterprise-grade tools.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20"
        >
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => scrollToSection('pricing')}
            className="min-w-[200px]"
          >
            Start Free Trial
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="min-w-[200px] border-white text-white hover:bg-white hover:text-gray-900 flex items-center justify-center"
            onClick={() => scrollToSection('features')}
          >
            <PlayIcon className="w-5 h-5 mr-2" />
            Watch Demo
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-16"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
            >
              <stat.icon className="w-8 h-8 text-white mb-4 mx-auto" />
              <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-white/80 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2"></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
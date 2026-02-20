import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { ScheduleDemoButton } from '../demo';

const Hero = () => {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white"
    >
      {/* Background radial glow */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-indigo-100/50 rounded-full blur-[120px]" />
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-purple-100/40 rounded-full blur-[100px]" />
      </div>

      {/* Dot grid */}
      <div className="absolute inset-0 dot-grid" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center pt-24">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-white/80 mb-8 shadow-sm"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[12px] font-medium text-slate-500 tracking-wide">
            Now available for enterprise teams
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-6"
        >
          <span className="text-slate-900">Call management</span>
          <br />
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
            that scales with you
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          Track, analyze, and optimize every customer interaction.
          Built for teams that take their communication seriously.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20"
        >
          <ScheduleDemoButton
            variant="primary"
            size="md"
            text="Start Free Trial"
            showIcon={false}
            className="shimmer-btn !rounded-xl !py-3.5 !px-8 !text-[15px] !font-semibold !bg-indigo-600 hover:!bg-indigo-700 glow-indigo !transform-none"
          />

          <button
            onClick={() =>
              document.getElementById('features').scrollIntoView({ behavior: 'smooth' })
            }
            className="group flex items-center gap-2 text-[15px] font-medium text-slate-500 hover:text-slate-900 transition-colors px-6 py-3.5"
          >
            See how it works
            <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

        {/* Metrics row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="grid grid-cols-3 gap-8 max-w-lg mx-auto"
        >
          {[
            { value: '10K+', label: 'Calls daily' },
            { value: '99.9%', label: 'Uptime' },
            { value: '500+', label: 'Teams' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                {stat.value}
              </div>
              <div className="text-[12px] text-slate-400 mt-1 tracking-wide uppercase">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bottom fade into slate-50 canvas */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#F8FAFC] to-transparent" />
    </section>
  );
};

export default Hero;

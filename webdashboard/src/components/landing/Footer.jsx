import React from 'react';
import { motion } from 'framer-motion';
import { SiGithub, SiYoutube, SiLinkedin } from 'react-icons/si';
import { ArrowUpIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { ScheduleDemoButton } from '../demo';

const Footer = () => {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  const links = {
    Product: [
      { label: 'Features', action: () => scrollToSection('features') },
      { label: 'Pricing', action: () => scrollToSection('pricing') },
      { label: 'Integrations', action: () => scrollToSection('about') },
      { label: 'API Docs', action: () => {} },
      { label: 'Security', action: () => scrollToSection('features') },
    ],
    Solutions: [
      { label: 'Call Centers', action: () => scrollToSection('about') },
      { label: 'Sales Teams', action: () => scrollToSection('about') },
      { label: 'Support Teams', action: () => scrollToSection('about') },
      { label: 'Enterprise', action: () => scrollToSection('pricing') },
    ],
    Company: [
      { label: 'About Us', action: () => scrollToSection('about') },
      { label: 'Careers', action: () => {} },
      { label: 'Blog', action: () => {} },
    ],
    Legal: [
      { label: 'Privacy Policy', action: () => {} },
      { label: 'Terms of Service', action: () => {} },
      { label: 'Cookie Policy', action: () => {} },
    ],
  };

  const socials = [
    { name: 'GitHub', href: 'https://github.com/calltrackerprp', icon: <SiGithub /> },
    { name: 'YouTube', href: 'https://youtube.com/calltrackerprp', icon: <SiYoutube /> },
    { name: 'LinkedIn', href: 'https://linkedin.com/company/calltrackerprp', icon: <SiLinkedin /> },
  ];

  return (
    <footer className="relative bg-slate-900 overflow-hidden">
      {/* Gradient accent at the top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

      {/* CTA Banner */}
      <div className="relative border-b border-slate-800">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-indigo-900/20 rounded-full blur-[100px]" />
        </div>
        <div className="relative max-w-6xl mx-auto px-6 lg:px-8 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-3">
              Ready to transform your call operations?
            </h2>
            <p className="text-slate-400 text-[15px] max-w-md mx-auto mb-8">
              Join 500+ teams already using CallTracker Pro to drive better outcomes from every conversation.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <ScheduleDemoButton
                variant="primary"
                size="md"
                text="Start Free Trial"
                showIcon={false}
                className="shimmer-btn !rounded-xl !py-3 !px-8 !text-[14px] !font-semibold !bg-indigo-600 hover:!bg-indigo-500 !transform-none"
              />
              <button
                onClick={() => scrollToSection('pricing')}
                className="group flex items-center gap-2 text-[14px] font-medium text-slate-400 hover:text-white transition-colors px-6 py-3"
              >
                View pricing
                <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <img
                src="/logolanding.png"
                alt="CallTracker Pro"
                className="w-7 h-7 object-contain brightness-200"
              />
              <span className="text-[15px] font-semibold text-white tracking-tight">
                CallTracker Pro
              </span>
            </div>
            <p className="text-[13px] text-slate-400 leading-relaxed max-w-xs mb-6">
              Unified call intelligence and CRM automation platform. Track, analyze, and optimize
              every customer interaction.
            </p>
            <div className="flex items-center gap-3">
              {socials.map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all text-[15px]"
                  title={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-[11px] font-semibold text-slate-500 tracking-[0.12em] uppercase mb-4">
                {category}
              </h4>
              <ul className="space-y-2.5">
                {items.map((link, i) => (
                  <li key={i}>
                    <button
                      onClick={link.action}
                      className="text-[13px] text-slate-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-slate-500">
            &copy; {new Date().getFullYear()} CallTracker Pro. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-[11px] text-slate-600 flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              All systems operational
            </span>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 text-[12px] text-slate-500 hover:text-white transition-colors"
            >
              Back to top
              <ArrowUpIcon className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

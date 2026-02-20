import React from 'react';
import { SiGithub, SiYoutube, SiLinkedin } from 'react-icons/si';
import { ArrowUpIcon } from '@heroicons/react/24/outline';

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
      { label: 'Security', action: () => scrollToSection('features') },
    ],
    Company: [
      { label: 'About', action: () => scrollToSection('about') },
      { label: 'Contact', action: () => scrollToSection('contact') },
    ],
    Legal: [
      { label: 'Privacy', action: () => {} },
      { label: 'Terms', action: () => {} },
    ],
  };

  const socials = [
    { name: 'GitHub', href: 'https://github.com/calltrackerprp', icon: <SiGithub /> },
    { name: 'YouTube', href: 'https://youtube.com/calltrackerprp', icon: <SiYoutube /> },
    { name: 'LinkedIn', href: 'https://linkedin.com/company/calltrackerprp', icon: <SiLinkedin /> },
  ];

  return (
    <footer className="bg-slate-900">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
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
            <p className="text-[14px] text-slate-400 leading-relaxed max-w-xs mb-6">
              Enterprise call management platform. Track, analyze, and optimize
              every customer interaction.
            </p>
            <div className="flex items-center gap-4">
              {socials.map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-500 hover:text-white transition-colors text-[16px]"
                  title={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-[12px] font-semibold text-slate-500 tracking-widest uppercase mb-4">
                {category}
              </h4>
              <ul className="space-y-3">
                {items.map((link, i) => (
                  <li key={i}>
                    <button
                      onClick={link.action}
                      className="text-[14px] text-slate-400 hover:text-white transition-colors"
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

      <div className="border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-5 flex items-center justify-between">
          <p className="text-[12px] text-slate-500">
            &copy; {new Date().getFullYear()} CallTracker Pro. All rights reserved.
          </p>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 text-[12px] text-slate-500 hover:text-white transition-colors"
          >
            Back to top
            <ArrowUpIcon className="w-3 h-3" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

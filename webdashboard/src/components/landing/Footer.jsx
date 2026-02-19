import React from 'react';
import { SiGithub, SiYoutube, SiLinkedin } from 'react-icons/si';

import { motion } from 'framer-motion';
import { 
  PhoneIcon, 
  EnvelopeIcon, 
  MapPinIcon,
  ArrowUpIcon
} from '@heroicons/react/24/outline';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const footerLinks = {
    product: [
      { label: 'Features', href: 'features' },
      { label: 'Pricing', href: 'pricing' },
      { label: 'API Documentation', href: '/docs' },
      { label: 'Integrations', href: '/integrations' },
      { label: 'Security', href: '/security' }
    ],
    company: [
      { label: 'About Us', href: 'about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Press', href: '/press' },
      { label: 'Partners', href: '/partners' },
      { label: 'Blog', href: '/blog' }
    ],
    support: [
      { label: 'Help Center', href: '/help' },
      { label: 'Contact Us', href: 'contact' },
      { label: 'Status Page', href: '/status' },
      { label: 'System Requirements', href: '/requirements' },
      { label: 'Migration Guide', href: '/migration' }
    ],
    legal: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Policy', href: '/cookies' },
      { label: 'GDPR Compliance', href: '/gdpr' },
      { label: 'Data Processing', href: '/data-processing' }
    ]
  };

  const socialLinks = [
  { name: 'GitHub', href: 'https://github.com/calltrackerprp', icon: <SiGithub /> },
  { name: 'YouTube', href: 'https://youtube.com/calltrackerprp', icon: <SiYoutube /> },
  { name: 'LinkedIn', href: 'https://linkedin.com/company/calltrackerprp', icon: <SiLinkedin /> }
];

  const handleLinkClick = (href) => {
    if (href.startsWith('#') || !href.startsWith('/')) {
      scrollToSection(href);
    } else {
      window.open(href, '_blank');
    }
  };

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <div className="flex items-center mb-4">
                <div className="bg-primary-gradient p-2 rounded-lg mr-3">
                  <div className="w-6 h-6 bg-white rounded"></div>
                </div>
                <span className="text-xl font-bold">CallTracker Pro</span>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Empowering businesses worldwide with intelligent call management solutions. 
                Transform your customer communications with our enterprise-grade platform.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center text-gray-300">
                  <PhoneIcon className="w-5 h-5 mr-3" />
                  <span>+91 8660310638</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <EnvelopeIcon className="w-5 h-5 mr-3" />
                  <span>admin@calltrackerprp.com</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <MapPinIcon className="w-5 h-5 mr-3" />
                  <span>Bengaluru, KA</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([category, links], index) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <h3 className="text-lg font-semibold mb-4 capitalize">{category}</h3>
              <ul className="space-y-3">
                {links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <button
                      onClick={() => handleLinkClick(link.href)}
                      className="text-gray-300 hover:text-white transition-colors duration-200 text-left"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Newsletter Signup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="border-t border-gray-800 pt-8 mt-12"
        >
          <div className="max-w-md mx-auto text-center">
            <h3 className="text-lg font-semibold mb-4">Stay Updated</h3>
            <p className="text-gray-300 mb-6">
              Get the latest updates on new features, product releases, and industry insights.
            </p>
            <div className="flex gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-gray-400"
              />
              <button className="btn-primary whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-gray-400 text-sm mb-4 md:mb-0"
            >
              © 2025 CallTracker Pro. All rights reserved.
            </motion.div>

            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex items-center space-x-6 mb-4 md:mb-0"
            >
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-lg"
                  title={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </motion.div>

            {/* Back to Top */}
            <motion.button
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              onClick={scrollToTop}
              className="flex items-center text-gray-400 hover:text-white transition-colors duration-200 text-sm"
            >
              <span className="mr-2">Back to top</span>
              <ArrowUpIcon className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
import React from 'react';
import { motion } from 'framer-motion';
import { 
  PhoneIcon, 
  ChartBarIcon, 
  UsersIcon, 
  CloudIcon,
  ShieldCheckIcon,
  CogIcon,
  BellIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { Card } from '../common';

const Features = () => {
  const features = [
    {
      icon: PhoneIcon,
      title: 'Advanced Call Management',
      description: 'Comprehensive call tracking, recording, and routing with intelligent call distribution and queue management.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: ChartBarIcon,
      title: 'Real-time Analytics',
      description: 'Powerful dashboards with real-time metrics, performance insights, and customizable reporting tools.',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: UsersIcon,
      title: 'Team Management',
      description: 'Multi-tenant architecture with role-based access control and team collaboration features.',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: CloudIcon,
      title: 'Cloud Infrastructure',
      description: 'Scalable cloud-based platform with 99.9% uptime guarantee and global CDN distribution.',
      color: 'from-cyan-500 to-cyan-600'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Enterprise Security',
      description: 'End-to-end encryption, GDPR compliance, and enterprise-grade security protocols.',
      color: 'from-red-500 to-red-600'
    },
    {
      icon: CogIcon,
      title: 'API Integration',
      description: 'RESTful APIs and webhooks for seamless integration with your existing business tools.',
      color: 'from-orange-500 to-orange-600'
    },
    {
      icon: BellIcon,
      title: 'Smart Notifications',
      description: 'Intelligent alert system with customizable notifications via email, SMS, and push notifications.',
      color: 'from-pink-500 to-pink-600'
    },
    {
      icon: DocumentTextIcon,
      title: 'Compliance Reporting',
      description: 'Automated compliance reports, audit trails, and data retention policies for regulatory requirements.',
      color: 'from-indigo-500 to-indigo-600'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Powerful Features for
            <span className="block bg-clip-text text-transparent bg-primary-gradient">
              Modern Businesses
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover how CallTracker Pro's comprehensive feature set can transform 
            your call management operations and drive business growth.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="h-full text-center group cursor-pointer">
                <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-16"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Transform Your Call Management?
            </h3>
            <p className="text-lg text-gray-600 mb-8">
              Join thousands of businesses already using CallTracker Pro to optimize their communication workflows.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary"
                onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}
              >
                Start Free Trial
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-secondary"
                onClick={() => document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' })}
              >
                View Pricing
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
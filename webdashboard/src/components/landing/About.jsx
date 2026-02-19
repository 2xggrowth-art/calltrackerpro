import React from 'react';
import { motion } from 'framer-motion';
import { 
  UserGroupIcon, 
  TrophyIcon, 
  GlobeAltIcon,
  HeartIcon,
  LightBulbIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { Card } from '../common';

const About = () => {
  const stats = [
    { value: '500K+', label: 'Calls Processed Monthly' },
    { value: '50+', label: 'Countries Served' },
    { value: '99.9%', label: 'Uptime Reliability' },
    { value: '24/7', label: 'Customer Support' }
  ];

  const values = [
    {
      icon: LightBulbIcon,
      title: 'Innovation',
      description: 'We continuously push the boundaries of call management technology to deliver cutting-edge solutions.'
    },
    {
      icon: HeartIcon,
      title: 'Customer Success',
      description: 'Your success is our mission. We are committed to helping businesses achieve their communication goals.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Trust & Security',
      description: 'We maintain the highest standards of security and compliance to protect your business data.'
    },
    {
      icon: GlobeAltIcon,
      title: 'Global Reach',
      description: 'Our platform serves businesses worldwide with localized support and global infrastructure.'
    }
  ];

  const team = [
    {
      name: 'Sarah Johnson',
      role: 'CEO & Founder',
      image: '/api/placeholder/150/150',
      bio: '15+ years in telecommunications and business strategy'
    },
    {
      name: 'Michael Chen',
      role: 'CTO',
      image: '/api/placeholder/150/150',
      bio: 'Former Google engineer specializing in scalable systems'
    },
    {
      name: 'Emily Rodriguez',
      role: 'VP of Product',
      image: '/api/placeholder/150/150',
      bio: 'Product management expert with focus on user experience'
    },
    {
      name: 'David Thompson',
      role: 'VP of Engineering',
      image: '/api/placeholder/150/150',
      bio: 'Full-stack architect with cloud infrastructure expertise'
    }
  ];

  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            About
            <span className="bg-clip-text text-transparent bg-primary-gradient"> CallTracker Pro</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Founded in 2025, CallTracker Pro emerged from a simple vision: to revolutionize how businesses 
            manage and optimize their customer communications. Today, we're the trusted partner for organizations 
            worldwide seeking to transform their call management operations.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20"
        >
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-primary-gradient mb-2">
                {stat.value}
              </div>
              <div className="text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Mission Statement */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-gray-50 rounded-3xl p-8 md:p-12 mb-20"
        >
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h3>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                To empower businesses of all sizes with intelligent call management solutions that drive 
                growth, improve customer satisfaction, and optimize operational efficiency.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                We believe that every customer interaction is an opportunity to build stronger relationships 
                and drive business success. Our platform makes it easier than ever to capture, analyze, 
                and act on these valuable moments.
              </p>
            </div>
            <div className="relative">
              <div className="aspect-w-16 aspect-h-9 rounded-2xl overflow-hidden bg-primary-gradient p-8">
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-white">
                    <TrophyIcon className="w-16 h-16 mx-auto mb-4" />
                    <h4 className="text-2xl font-bold mb-2">Industry Leader</h4>
                    <p className="text-lg opacity-90">Recognized for innovation and excellence</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Values */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-20"
        >
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Core Values</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center group">
                <div className="w-16 h-16 mx-auto mb-6 bg-primary-gradient rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h4>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Leadership Team */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-20"
        >
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-4">Meet Our Leadership Team</h3>
          <p className="text-lg text-gray-600 text-center mb-12 max-w-3xl mx-auto">
            Our experienced leadership team brings together decades of expertise in technology, 
            telecommunications, and business strategy.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center group">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-200 overflow-hidden group-hover:scale-105 transition-transform duration-300">
                  <div className="w-full h-full bg-primary-gradient flex items-center justify-center">
                    <UserGroupIcon className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h4>
                <p className="text-primary-600 font-medium mb-3">{member.role}</p>
                <p className="text-gray-600 text-sm leading-relaxed">{member.bio}</p>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center bg-primary-gradient rounded-3xl p-8 md:p-12 text-white"
        >
          <h3 className="text-3xl font-bold mb-4">Ready to Join Our Journey?</h3>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Be part of the future of call management. Whether you're a customer, partner, or potential team member, 
            we'd love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-primary-600 font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}
            >
              Get in Touch
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="border-2 border-white text-white font-semibold py-3 px-8 rounded-lg hover:bg-white hover:text-primary-600 transition-colors"
              onClick={() => window.open('/careers', '_blank')}
            >
              View Careers
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
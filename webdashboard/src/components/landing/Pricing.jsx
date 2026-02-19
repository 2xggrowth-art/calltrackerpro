import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckIcon, XMarkIcon, StarIcon } from '@heroicons/react/24/outline';
import { Button, Card } from '../common';

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: 'Free',
      price: { monthly: 0, annual: 0 },
      description: 'Perfect for startups and small teams getting started',
      features: [
        'Up to 100 calls/month',
        'Basic call tracking',
        'Simple analytics',
        'Email support',
        '5 team members',
        'Basic integrations'
      ],
      limitations: [
        'No call recording',
        'Limited storage',
        'No advanced analytics',
        'No priority support'
      ],
      cta: 'Get Started',
      popular: false,
      color: 'border-gray-200'
    },
    {
      name: 'Pro',
      price: { monthly: 499, annual: 4490 },
      description: 'Ideal for growing businesses with advanced needs',
      features: [
        'Up to 5,000 calls/month',
        'Advanced call tracking',
        'Call recording & transcription',
        'Real-time analytics',
        'Priority email support',
        '25 team members',
        'Advanced integrations',
        'Custom reporting',
        'API access'
      ],
      limitations: [],
      cta: 'Start Pro Trial',
      popular: true,
      color: 'border-primary-500'
    },
    {
      name: 'Business',
      price: { monthly: 899, annual: 8090 },
      description: 'For established businesses requiring comprehensive features',
      features: [
        'Up to 25,000 calls/month',
        'Everything in Pro',
        'Advanced team management',
        'Custom workflows',
        'Phone & email support',
        '100 team members',
        'White-label options',
        'Advanced security',
        'Custom integrations'
      ],
      limitations: [],
      cta: 'Start Business Trial',
      popular: false,
      color: 'border-secondary-500'
    },
    {
      name: 'Enterprise',
      price: { monthly: 1499, annual: 13490 },
      description: 'Tailored solutions for large organizations',
      features: [
        'Unlimited calls',
        'Everything in Business',
        'Dedicated account manager',
        '24/7 phone support',
        'Unlimited team members',
        'Custom development',
        'On-premise deployment',
        'SLA guarantee',
        'Advanced compliance'
      ],
      limitations: [],
      cta: 'Contact Sales',
      popular: false,
      color: 'border-accent-500'
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
    <section id="pricing" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Simple, Transparent
            <span className="block bg-clip-text text-transparent bg-primary-gradient">
              Pricing Plans
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Choose the perfect plan for your business. All plans include our core features 
            with no hidden fees or setup costs.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center mb-8">
            <span className={`mr-3 ${!isAnnual ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isAnnual ? 'bg-primary-500' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isAnnual ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`ml-3 ${isAnnual ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
              Annual
            </span>
            {isAnnual && (
              <span className="ml-2 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                Save 10%
              </span>
            )}
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {plans.map((plan, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card 
                className={`h-full relative ${plan.color} border-2 ${
                  plan.popular ? 'scale-105 shadow-2xl' : 'hover:shadow-xl'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-primary-gradient text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center">
                      <StarIcon className="w-4 h-4 mr-1" />
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">
                      ₹{isAnnual ? plan.price.annual : plan.price.monthly}
                    </span>
                    <span className="text-gray-600 ml-1">
                      /{isAnnual ? 'year' : 'month'}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start">
                      <CheckIcon className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </div>
                  ))}
                  {plan.limitations.map((limitation, limitationIndex) => (
                    <div key={limitationIndex} className="flex items-start">
                      <XMarkIcon className="w-5 h-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-500 text-sm">{limitation}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-auto">
                  <Button
                    variant={plan.popular ? 'primary' : 'outline'}
                    className="w-full"
                    onClick={() => {
                      if (plan.name === 'Enterprise') {
                        document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
                      } else {
                        // Handle plan selection
                        console.log(`Selected ${plan.name} plan`);
                      }
                    }}
                  >
                    {plan.cta}
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Enterprise Features */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <div className="bg-gray-50 rounded-2xl p-8 md:p-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Need a Custom Solution?
            </h3>
            <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
              Our Enterprise plan offers unlimited customization, dedicated support, 
              and can be tailored to meet your specific business requirements.
            </p>
            <Button 
              variant="primary" 
              size="lg"
              onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}
            >
              Contact Sales Team
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;
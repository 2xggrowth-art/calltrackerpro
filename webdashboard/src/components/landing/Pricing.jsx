import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckIcon } from '@heroicons/react/24/outline';

const plans = [
  {
    name: 'Starter',
    price: { monthly: 0, annual: 0 },
    description: 'For small teams getting started',
    features: [
      '100 calls/month',
      'Basic analytics',
      'Email support',
      '5 team members',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Pro',
    price: { monthly: 499, annual: 4490 },
    description: 'For growing businesses',
    features: [
      '5,000 calls/month',
      'Call recording & transcription',
      'Real-time analytics',
      'API access',
      '25 team members',
      'Priority support',
    ],
    cta: 'Start Pro Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: { monthly: null, annual: null },
    description: 'For large organizations',
    features: [
      'Unlimited calls',
      'Dedicated account manager',
      '24/7 phone support',
      'Custom integrations',
      'SLA guarantee',
      'On-premise option',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

const PricingCard = ({ plan, isAnnual, index }) => {
  const price = isAnnual ? plan.price.annual : plan.price.monthly;

  const cardContent = (
    <div className={`p-8 h-full flex flex-col ${plan.popular ? 'bg-white rounded-2xl' : ''}`}>
      {plan.popular && (
        <div className="inline-flex self-start items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 mb-5">
          <span className="w-1 h-1 rounded-full bg-indigo-500" />
          <span className="text-[11px] font-medium text-indigo-600 tracking-wide">
            Most Popular
          </span>
        </div>
      )}

      <h3 className="text-[18px] font-semibold text-slate-900 mb-1">{plan.name}</h3>
      <p className="text-[13px] text-slate-500 mb-6">{plan.description}</p>

      <div className="mb-8">
        {price !== null ? (
          <>
            <span className="text-4xl font-bold text-slate-900 tracking-tight">
              {'\u20B9'}{price}
            </span>
            <span className="text-slate-400 text-[14px] ml-1">
              /{isAnnual ? 'year' : 'month'}
            </span>
          </>
        ) : (
          <span className="text-4xl font-bold text-slate-900 tracking-tight">Custom</span>
        )}
      </div>

      <ul className="space-y-3 mb-8 flex-grow">
        {plan.features.map((feature, i) => (
          <li key={i} className="flex items-start gap-3">
            <CheckIcon className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
            <span className="text-[14px] text-slate-600">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => {
          if (plan.name === 'Enterprise') {
            document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
          }
        }}
        className={`w-full py-3 px-6 rounded-xl text-[14px] font-semibold transition-all duration-200 ${
          plan.popular
            ? 'bg-indigo-600 text-white hover:bg-indigo-700 shimmer-btn shadow-md shadow-indigo-200'
            : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
        }`}
      >
        {plan.cta}
      </button>
    </div>
  );

  if (plan.popular) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        viewport={{ once: true }}
        className="gradient-border-wrap glow-indigo"
      >
        {cardContent}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="l-card"
    >
      {cardContent}
    </motion.div>
  );
};

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section id="pricing" className="py-24 md:py-32 relative">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-[13px] font-semibold text-indigo-600 tracking-wide uppercase mb-3">
            Pricing
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">
            Simple, <span className="text-indigo-600">transparent</span> pricing
          </h2>
          <p className="text-slate-700 text-[16px] max-w-lg mx-auto mb-8">
            No hidden fees. No surprises. Start free, scale when you're ready.
          </p>

          <div className="flex items-center justify-center gap-3">
            <span className={`text-[13px] font-medium ${!isAnnual ? 'text-slate-900' : 'text-slate-400'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                isAnnual ? 'bg-indigo-500' : 'bg-slate-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  isAnnual ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-[13px] font-medium ${isAnnual ? 'text-slate-900' : 'text-slate-400'}`}>
              Annual
            </span>
            {isAnnual && (
              <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                Save 25%
              </span>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((plan, index) => (
            <PricingCard key={plan.name} plan={plan} isAnnual={isAnnual} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckIcon,
  XMarkIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import { ScheduleDemoButton } from '../demo';

/* ──────────────────────────────────────────────
   Data
   ────────────────────────────────────────────── */

const plans = [
  {
    name: 'Starter',
    badge: null,
    price: { monthly: 0, annual: 0 },
    description: 'For small teams getting started with call tracking',
    bestFor: 'Best for freelancers & small teams',
    features: [
      '100 calls / month',
      'Basic call analytics',
      'Email support',
      '5 team members',
      'Call log export (CSV)',
    ],
    cta: 'Get Started Free',
    popular: false,
    gradient: null,
  },
  {
    name: 'Pro',
    badge: 'Most Popular',
    price: { monthly: 499, annual: 4490 },
    description: 'For growing teams that need CRM + call intelligence',
    bestFor: 'Best for sales teams & growing businesses',
    features: [
      '5,000 calls / month',
      'Call recording & transcription',
      'Real-time analytics dashboard',
      'CRM automation workflows',
      'API access & webhooks',
      '25 team members',
      'AI conversation insights',
      'Priority support (4hr SLA)',
    ],
    cta: 'Start Pro Trial',
    popular: true,
    gradient: 'from-indigo-600 to-violet-600',
  },
  {
    name: 'Enterprise',
    badge: null,
    price: { monthly: null, annual: null },
    description: 'For large organizations with custom requirements',
    bestFor: 'Best for call centers & enterprise ops',
    features: [
      'Unlimited calls',
      'Dedicated account manager',
      '24/7 phone & chat support',
      'Custom integrations',
      'SLA guarantee (99.99%)',
      'On-premise deployment option',
      'SSO & advanced RBAC',
      'Custom AI model training',
    ],
    cta: 'Contact Sales',
    popular: false,
    gradient: null,
  },
];

const comparisonFeatures = [
  { name: 'Monthly calls', starter: '100', pro: '5,000', enterprise: 'Unlimited' },
  { name: 'Team members', starter: '5', pro: '25', enterprise: 'Unlimited' },
  { name: 'Call recording', starter: false, pro: true, enterprise: true },
  { name: 'AI insights', starter: false, pro: true, enterprise: true },
  { name: 'CRM automation', starter: false, pro: true, enterprise: true },
  { name: 'API access', starter: false, pro: true, enterprise: true },
  { name: 'Custom integrations', starter: false, pro: false, enterprise: true },
  { name: 'SSO / RBAC', starter: false, pro: false, enterprise: true },
  { name: 'Dedicated support', starter: false, pro: false, enterprise: true },
  { name: 'SLA guarantee', starter: false, pro: false, enterprise: true },
];

/* ──────────────────────────────────────────────
   Section Badge
   ────────────────────────────────────────────── */
const SectionBadge = ({ label }) => (
  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 mb-4">
    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
    <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">{label}</span>
  </div>
);

/* ──────────────────────────────────────────────
   Pricing Card
   ────────────────────────────────────────────── */
const PricingCard = ({ plan, isAnnual, index }) => {
  const price = isAnnual ? plan.price.annual : plan.price.monthly;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className={`relative rounded-2xl overflow-hidden ${
        plan.popular
          ? 'bg-white border-2 border-indigo-500 shadow-xl shadow-indigo-500/10'
          : 'l-card'
      }`}
    >
      {/* Popular glow */}
      {plan.popular && (
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-60 h-40 bg-indigo-500/10 rounded-full blur-[60px] pointer-events-none" />
      )}

      <div className="relative p-7 h-full flex flex-col">
        {/* Badge */}
        {plan.badge && (
          <div className="inline-flex self-start items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-600 mb-4">
            <StarIcon className="w-3 h-3 text-amber-300" />
            <span className="text-[10px] font-bold text-white uppercase tracking-wider">
              {plan.badge}
            </span>
          </div>
        )}

        <h3 className="text-[20px] font-bold text-slate-900 mb-1">{plan.name}</h3>
        <p className="text-[13px] text-slate-500 mb-1">{plan.description}</p>
        <p className="text-[11px] font-semibold text-indigo-600 mb-5">{plan.bestFor}</p>

        {/* Price */}
        <div className="mb-6">
          {price !== null ? (
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
                {'\u20B9'}{price.toLocaleString()}
              </span>
              <span className="text-slate-400 text-[14px] font-medium">
                /{isAnnual ? 'year' : 'month'}
              </span>
            </div>
          ) : (
            <span className="text-4xl font-extrabold text-slate-900 tracking-tight">Custom</span>
          )}
          {plan.popular && isAnnual && (
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">Save {'\u20B9'}1,498 per year</p>
          )}
        </div>

        {/* Features */}
        <ul className="space-y-2.5 mb-8 flex-grow">
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <CheckIcon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                plan.popular ? 'text-indigo-500' : 'text-emerald-500'
              }`} />
              <span className="text-[13px] text-slate-600">{feature}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        {plan.popular ? (
          <ScheduleDemoButton
            variant="primary"
            size="md"
            text={plan.cta}
            showIcon={false}
            className="shimmer-btn !w-full !rounded-xl !py-3 !text-[14px] !font-semibold !bg-indigo-600 hover:!bg-indigo-700 !shadow-md !shadow-indigo-200 !transform-none"
          />
        ) : (
          <button
            className="w-full py-3 px-6 rounded-xl text-[14px] font-semibold bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 transition-all duration-200"
          >
            {plan.cta}
          </button>
        )}
      </div>
    </motion.div>
  );
};

/* ──────────────────────────────────────────────
   Compact Comparison (collapsible)
   ────────────────────────────────────────────── */
const CompactComparison = () => {
  const [isOpen, setIsOpen] = useState(false);

  const CellValue = ({ value }) => {
    if (typeof value === 'boolean') {
      return value ? (
        <CheckIcon className="w-3.5 h-3.5 text-emerald-500 mx-auto" />
      ) : (
        <XMarkIcon className="w-3.5 h-3.5 text-slate-300 mx-auto" />
      );
    }
    return <span className="text-[11px] font-semibold text-slate-700">{value}</span>;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
      viewport={{ once: true }}
      className="mt-10 text-center"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 text-[13px] font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
      >
        {isOpen ? 'Hide' : 'Compare'} plan features
        <ChevronDownIcon className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="l-card overflow-hidden mt-6 max-w-2xl mx-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-2.5">Feature</th>
                    <th className="text-center text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 py-2.5 w-20">Starter</th>
                    <th className="text-center text-[10px] font-semibold text-indigo-600 uppercase tracking-wider px-3 py-2.5 w-20 bg-indigo-50/50">Pro</th>
                    <th className="text-center text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 py-2.5 w-24">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((feature, i) => (
                    <tr key={i} className="border-b border-slate-50 last:border-0">
                      <td className="text-[12px] text-slate-600 px-4 py-2">{feature.name}</td>
                      <td className="text-center px-3 py-2"><CellValue value={feature.starter} /></td>
                      <td className="text-center px-3 py-2 bg-indigo-50/20"><CellValue value={feature.pro} /></td>
                      <td className="text-center px-3 py-2"><CellValue value={feature.enterprise} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* ──────────────────────────────────────────────
   Main Pricing Component
   ────────────────────────────────────────────── */

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section id="pricing" className="py-24 md:py-32 relative">
      {/* Background accent */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-50/30 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <SectionBadge label="Pricing" />
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">
            Simple, <span className="text-indigo-600">transparent</span> pricing
          </h2>
          <p className="text-slate-500 text-[16px] max-w-lg mx-auto mb-8">
            Start free, scale as your team grows. No hidden fees, no surprises.
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-3">
            <span className={`text-[13px] font-medium transition-colors ${!isAnnual ? 'text-slate-900' : 'text-slate-400'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 ${
                isAnnual ? 'bg-indigo-500' : 'bg-slate-200'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                  isAnnual ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-[13px] font-medium transition-colors ${isAnnual ? 'text-slate-900' : 'text-slate-400'}`}>
              Annual
            </span>
            {isAnnual && (
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100"
              >
                Save 25%
              </motion.span>
            )}
          </div>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((plan, index) => (
            <PricingCard key={plan.name} plan={plan} isAnnual={isAnnual} index={index} />
          ))}
        </div>

        {/* Trust strip */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-10"
        >
          {[
            { icon: ShieldCheckIcon, text: 'No credit card required' },
            { icon: SparklesIcon, text: 'Free 14-day trial on Pro' },
            { icon: CheckIcon, text: 'Cancel anytime, no questions' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <item.icon className="w-4 h-4 text-slate-400" />
              <span className="text-[12px] text-slate-500 font-medium">{item.text}</span>
            </div>
          ))}
        </motion.div>

        {/* Compact comparison */}
        <CompactComparison />
      </div>
    </section>
  );
};

export default Pricing;

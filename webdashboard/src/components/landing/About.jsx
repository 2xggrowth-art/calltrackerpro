import React from 'react';
import { motion } from 'framer-motion';
import {
  PhoneIcon,
  ChartBarIcon,
  CpuChipIcon,
  BuildingOffice2Icon,
  UserGroupIcon,
  HeartIcon,
  SparklesIcon,
  GlobeAltIcon,
  BoltIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

/* ──────────────────────────────────────────────
   Sub-components
   ────────────────────────────────────────────── */

const SectionBadge = ({ label }) => (
  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 mb-4">
    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
    <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">{label}</span>
  </div>
);

/* ──────────────────────────────────────────────
   Logo Cloud
   ────────────────────────────────────────────── */
const trustedLogos = [
  { name: 'ACME', letters: 'ACME' },
  { name: 'GLOBEX', letters: 'GLOBEX' },
  { name: 'SOYLENT', letters: 'SOYLENT' },
  { name: 'INITECH', letters: 'INITECH' },
  { name: 'UMBRELLA', letters: 'UMBRELLA' },
  { name: 'HOOLI', letters: 'HOOLI' },
];

/* ──────────────────────────────────────────────
   Platform Journey Steps
   ────────────────────────────────────────────── */
const journeySteps = [
  {
    icon: PhoneIcon,
    label: 'Connect',
    title: 'Capture Every Call',
    description: 'Integrate your phone system in minutes. Every inbound and outbound call is automatically tracked.',
    gradient: 'from-indigo-500 to-indigo-600',
    shadowColor: 'shadow-indigo-500/20',
  },
  {
    icon: CpuChipIcon,
    label: 'Analyze',
    title: 'AI-powered Intelligence',
    description: 'Real-time transcription, sentiment analysis, and keyword extraction from every conversation.',
    gradient: 'from-violet-500 to-purple-600',
    shadowColor: 'shadow-violet-500/20',
  },
  {
    icon: ChartBarIcon,
    label: 'Optimize',
    title: 'Data-driven Decisions',
    description: 'Turn call data into actionable insights. Track agent performance, conversion funnels, and revenue impact.',
    gradient: 'from-emerald-500 to-emerald-600',
    shadowColor: 'shadow-emerald-500/20',
  },
];

/* ──────────────────────────────────────────────
   Use Cases
   ────────────────────────────────────────────── */
const useCases = [
  {
    icon: BuildingOffice2Icon,
    title: 'Call Centers',
    description: 'Route calls intelligently, monitor queues in real-time, and improve first-call resolution rates.',
    metric: '40% faster resolution',
    gradient: 'from-indigo-500 to-indigo-600',
  },
  {
    icon: ArrowTrendingUpIcon,
    title: 'Sales Teams',
    description: 'Track every prospect call, automate follow-ups, and close deals with AI conversation coaching.',
    metric: '2.3x more conversions',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    icon: HeartIcon,
    title: 'Support Teams',
    description: 'Reduce wait times, auto-escalate urgent issues, and measure CSAT from call sentiment analysis.',
    metric: '92% satisfaction rate',
    gradient: 'from-emerald-500 to-emerald-600',
  },
];

/* ──────────────────────────────────────────────
   Integration Logos
   ────────────────────────────────────────────── */
const integrations = [
  'Salesforce', 'HubSpot', 'Slack', 'Zapier', 'WhatsApp', 'Twilio', 'Zendesk', 'Teams',
];

/* ──────────────────────────────────────────────
   About Component
   ────────────────────────────────────────────── */

const About = () => {
  return (
    <section id="about" className="relative">

      {/* ─── Logo Cloud ─── */}
      <div className="py-16 bg-white border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <p className="text-[11px] font-semibold text-slate-400 tracking-[0.2em] uppercase mb-8 text-center">
              Trusted by forward-thinking teams worldwide
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
              {trustedLogos.map((logo, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  viewport={{ once: true }}
                  className="logo-cloud-item text-[17px] font-bold text-slate-900 tracking-[0.15em] select-none cursor-default"
                >
                  {logo.letters}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ─── How It Works (Journey) ─── */}
      <div className="py-24 md:py-32 bg-white relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-indigo-50/30 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <SectionBadge label="How It Works" />
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">
              From first ring to <span className="text-indigo-600">actionable insights</span>
            </h2>
            <p className="text-slate-500 text-[16px] max-w-lg mx-auto">
              Three steps to transform your call operations into a data-driven growth engine.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {journeySteps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="l-card p-7 text-center relative group"
              >
                {/* Step number */}
                <div className="absolute top-4 right-4 text-[40px] font-black text-slate-100 leading-none select-none">
                  {i + 1}
                </div>

                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center mx-auto mb-5 shadow-lg ${step.shadowColor}`}>
                  <step.icon className="w-6 h-6 text-white" />
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  i === 0 ? 'text-indigo-600' : i === 1 ? 'text-violet-600' : 'text-emerald-600'
                }`}>{step.label}</span>
                <h3 className="text-[17px] font-bold text-slate-900 mt-1 mb-2 tracking-tight">{step.title}</h3>
                <p className="text-[13px] text-slate-500 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── About Story + Stats ─── */}
      <div className="py-24 md:py-32 bg-gradient-to-b from-white via-slate-50/50 to-white relative">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Left — Story */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <SectionBadge label="Our Story" />
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-6 leading-tight">
                Built by <span className="text-indigo-600">operators</span>,
                <br />
                for operators.
              </h2>
              <p className="text-slate-500 text-[16px] leading-relaxed mb-5">
                We started CallTracker Pro because we were tired of cobbling together
                spreadsheets, missed call logs, and disconnected analytics tools.
                We built the <span className="font-semibold text-slate-800">platform we wished existed</span>.
              </p>
              <p className="text-slate-500 text-[16px] leading-relaxed mb-8">
                Today, hundreds of organizations trust us to manage their
                most critical communication infrastructure — from
                Bengaluru to Berlin.
              </p>

              {/* Value props */}
              <div className="space-y-3">
                {[
                  'Designed for call centers, sales teams, and support operations',
                  'Real-time analytics built into every workflow',
                  'API-first architecture for seamless integrations',
                ].map((point, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <CheckCircleIcon className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span className="text-[14px] text-slate-600 font-medium">{point}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right — Stats grid */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              {[
                { value: '500K+', label: 'Calls processed monthly', icon: PhoneIcon, gradient: 'from-indigo-500 to-indigo-600' },
                { value: '50+', label: 'Countries served', icon: GlobeAltIcon, gradient: 'from-violet-500 to-purple-600' },
                { value: '<200ms', label: 'Average API latency', icon: BoltIcon, gradient: 'from-emerald-500 to-emerald-600' },
                { value: '24/7', label: 'Enterprise support', icon: ShieldCheckIcon, gradient: 'from-amber-500 to-orange-500' },
              ].map((stat, i) => (
                <div key={i} className="l-card p-6 text-center group">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mx-auto mb-3 shadow-md`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 tracking-tight mb-0.5">
                    {stat.value}
                  </div>
                  <div className="text-[11px] font-medium text-slate-400 tracking-wide">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* ─── Use Cases ─── */}
      <div className="py-24 md:py-32 bg-white relative">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <SectionBadge label="Use Cases" />
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">
              Built for teams that <span className="text-indigo-600">depend on calls</span>
            </h2>
            <p className="text-slate-500 text-[16px] max-w-lg mx-auto">
              Whether you run a call center, sales floor, or support team — CallTracker Pro adapts to your workflow.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {useCases.map((useCase, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="l-card p-7 group"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${useCase.gradient} flex items-center justify-center mb-5 shadow-lg`}>
                  <useCase.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-[17px] font-bold text-slate-900 mb-2 tracking-tight">{useCase.title}</h3>
                <p className="text-[13px] text-slate-500 leading-relaxed mb-4">{useCase.description}</p>
                <div className="flex items-center gap-1.5">
                  <ArrowTrendingUpIcon className="w-4 h-4 text-emerald-500" />
                  <span className="text-[12px] font-bold text-emerald-600">{useCase.metric}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Integrations ─── */}
      <div className="py-20 bg-gradient-to-b from-white to-slate-50/50 relative">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <SectionBadge label="Integrations" />
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mb-3">
              Connects with your <span className="text-indigo-600">entire stack</span>
            </h2>
            <p className="text-slate-500 text-[15px] max-w-md mx-auto">
              Sync call data with your CRM, messaging, and automation tools.
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-3">
            {integrations.map((name, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                viewport={{ once: true }}
                className="bg-white border border-slate-200 rounded-xl px-5 py-3 text-[13px] font-semibold text-slate-600 hover:border-indigo-200 hover:text-indigo-600 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default"
              >
                {name}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;

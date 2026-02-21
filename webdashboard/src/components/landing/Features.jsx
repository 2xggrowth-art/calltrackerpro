import React from 'react';
import { motion } from 'framer-motion';
import {
  PhoneIcon,
  PhoneArrowUpRightIcon,
  PhoneArrowDownLeftIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  BoltIcon,
  CloudArrowUpIcon,
  CpuChipIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon,
  SignalIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon, StarIcon } from '@heroicons/react/24/solid';

/* ──────────────────────────────────────────────
   Section Header
   ────────────────────────────────────────────── */
const SectionBadge = ({ label }) => (
  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 mb-4">
    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
    <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">{label}</span>
  </div>
);

/* ──────────────────────────────────────────────
   Category Feature Cards
   ────────────────────────────────────────────── */

/* 1 — Call Intelligence: Hero-size card with live routing visual */
const CallIntelligenceCard = () => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    viewport={{ once: true }}
    className="l-card p-0 md:col-span-2 md:row-span-2 overflow-hidden group"
  >
    <div className="p-7 pb-0">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <PhoneIcon className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Call Intelligence</span>
          <h3 className="text-[18px] font-bold text-slate-900 tracking-tight leading-tight">
            Smart Call Routing & Distribution
          </h3>
        </div>
      </div>
      <p className="text-[14px] text-slate-500 leading-relaxed mb-5 max-w-md">
        AI-powered call routing that connects customers to the right agent instantly.
        Real-time queue management across your entire organization.
      </p>
      {/* Micro metrics */}
      <div className="flex items-center gap-4 mb-5">
        <div className="flex items-center gap-1.5">
          <ClockIcon className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-[11px] font-semibold text-slate-600">&lt;200ms routing</span>
        </div>
        <div className="flex items-center gap-1.5">
          <ArrowTrendingUpIcon className="w-3.5 h-3.5 text-indigo-500" />
          <span className="text-[11px] font-semibold text-slate-600">34% faster resolution</span>
        </div>
      </div>
    </div>

    {/* Live routing visual */}
    <div className="bg-gradient-to-b from-slate-50 to-slate-100/80 border-t border-slate-100 p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Live Call Routing</span>
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[9px] font-semibold text-emerald-600">ACTIVE</span>
        </div>
      </div>
      <div className="space-y-2.5">
        {[
          { agent: 'Sarah M.', status: 'On call', calls: 12, color: 'bg-emerald-500', barWidth: 'w-4/5' },
          { agent: 'John D.', status: 'Available', calls: 8, color: 'bg-indigo-500', barWidth: 'w-3/5' },
          { agent: 'Alex K.', status: 'Wrapping up', calls: 15, color: 'bg-amber-500', barWidth: 'w-full' },
          { agent: 'Raj L.', status: 'Available', calls: 6, color: 'bg-sky-500', barWidth: 'w-2/5' },
        ].map((row, i) => (
          <div key={i} className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 border border-slate-100">
            <div className={`w-7 h-7 rounded-full ${row.color} flex items-center justify-center flex-shrink-0`}>
              <span className="text-[9px] font-bold text-white">{row.agent.charAt(0)}{row.agent.split(' ')[1]?.charAt(0)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-slate-700">{row.agent}</span>
                <span className="text-[9px] text-slate-400">{row.calls} calls</span>
              </div>
              <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full ${row.color} rounded-full ${row.barWidth} transition-all duration-500`} />
              </div>
            </div>
            <span className={`text-[9px] font-medium px-2 py-0.5 rounded-full ${
              row.status === 'Available' ? 'bg-emerald-50 text-emerald-600' :
              row.status === 'On call' ? 'bg-indigo-50 text-indigo-600' :
              'bg-amber-50 text-amber-600'
            }`}>{row.status}</span>
          </div>
        ))}
      </div>
    </div>
  </motion.div>
);

/* 2 — CRM Automation */
const CRMAutomationCard = () => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.08 }}
    viewport={{ once: true }}
    className="l-card p-6 md:col-span-2 group overflow-hidden"
  >
    <div className="flex items-center gap-3 mb-3">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
        <ChatBubbleLeftRightIcon className="w-5 h-5 text-white" />
      </div>
      <div>
        <span className="text-[10px] font-bold text-violet-600 uppercase tracking-wider">CRM Automation</span>
        <h3 className="text-[16px] font-bold text-slate-900 tracking-tight leading-tight">
          Automated CRM Workflows
        </h3>
      </div>
    </div>
    <p className="text-[13px] text-slate-500 leading-relaxed mb-4">
      Every call auto-logs to your CRM. Leads move through pipelines, follow-ups trigger automatically.
    </p>

    {/* CRM Flow visual */}
    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
      <div className="flex items-center justify-between">
        {[
          { label: 'Inbound Call', icon: PhoneArrowDownLeftIcon, color: 'from-indigo-500 to-indigo-600' },
          { label: 'Auto-Log', icon: BoltIcon, color: 'from-violet-500 to-purple-600' },
          { label: 'Lead Created', icon: UserGroupIcon, color: 'from-emerald-500 to-emerald-600' },
          { label: 'Follow-up', icon: ClockIcon, color: 'from-amber-500 to-orange-500' },
        ].map((step, i) => (
          <React.Fragment key={i}>
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${step.color} flex items-center justify-center shadow-sm`}>
                <step.icon className="w-4 h-4 text-white" />
              </div>
              <span className="text-[9px] font-semibold text-slate-500 text-center">{step.label}</span>
            </div>
            {i < 3 && (
              <div className="flex-1 mx-1">
                <div className="h-px bg-gradient-to-r from-slate-300 to-slate-200 relative">
                  <div className="absolute top-1/2 right-0 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-slate-300" />
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  </motion.div>
);

/* 3 — Real-time Analytics */
const AnalyticsCard = () => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.16 }}
    viewport={{ once: true }}
    className="l-card p-6 md:col-span-2 group overflow-hidden"
  >
    <div className="flex items-center gap-3 mb-3">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
        <ChartBarIcon className="w-5 h-5 text-white" />
      </div>
      <div>
        <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider">Team Analytics</span>
        <h3 className="text-[16px] font-bold text-slate-900 tracking-tight leading-tight">
          Real-time Performance Dashboards
        </h3>
      </div>
    </div>
    <p className="text-[13px] text-slate-500 leading-relaxed mb-4">
      Live dashboards with agent leaderboards, call volume trends, and conversion funnels.
    </p>

    {/* Mini chart visual */}
    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold text-slate-600">Weekly Call Volume</span>
        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+18.2%</span>
      </div>
      <div className="flex items-end gap-[3px] h-14">
        {[25, 40, 35, 55, 45, 65, 50, 72, 60, 80, 68, 85, 75, 90, 78, 92].map((h, i) => (
          <div
            key={i}
            className={`flex-1 rounded-sm transition-all duration-300 ${
              i >= 14 ? 'bg-sky-500' : i >= 12 ? 'bg-sky-400' : 'bg-sky-200'
            }`}
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-[8px] text-slate-400">Mon</span>
        <span className="text-[8px] text-slate-400">Wed</span>
        <span className="text-[8px] text-slate-400">Fri</span>
        <span className="text-[8px] text-slate-400">Sun</span>
      </div>
    </div>
  </motion.div>
);

/* 4 — AI Insights */
const AIInsightsCard = () => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.24 }}
    viewport={{ once: true }}
    className="l-card p-6 group"
  >
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-4 shadow-lg shadow-amber-500/20">
      <SparklesIcon className="w-5 h-5 text-white" />
    </div>
    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">AI-Powered</span>
    <h3 className="text-[15px] font-bold text-slate-900 mb-1.5 tracking-tight">
      Conversation Insights
    </h3>
    <p className="text-[13px] text-slate-500 leading-relaxed mb-4">
      AI scoring, sentiment analysis, and keyword extraction in real-time.
    </p>
    <div className="flex items-center gap-2 text-[11px]">
      <BoltIcon className="w-3.5 h-3.5 text-amber-500" />
      <span className="font-semibold text-slate-600">&lt;50ms analysis</span>
    </div>
  </motion.div>
);

/* 5 — Uptime & Reliability */
const UptimeCard = () => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.32 }}
    viewport={{ once: true }}
    className="l-card p-6 group"
  >
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
      <CloudArrowUpIcon className="w-5 h-5 text-white" />
    </div>
    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Reliability</span>
    <h3 className="text-[15px] font-bold text-slate-900 mb-1.5 tracking-tight">
      99.9% Uptime SLA
    </h3>
    <p className="text-[13px] text-slate-500 leading-relaxed mb-4">
      Global CDN with automatic failover. Your calls never drop.
    </p>
    <div className="flex items-center gap-3">
      {[
        { label: 'Uptime', value: '99.97%' },
        { label: 'Latency', value: '<200ms' },
      ].map((m, i) => (
        <div key={i} className="bg-emerald-50 rounded-lg px-2.5 py-1.5">
          <span className="text-[9px] text-emerald-600 font-medium block">{m.label}</span>
          <span className="text-[13px] font-bold text-emerald-700">{m.value}</span>
        </div>
      ))}
    </div>
  </motion.div>
);

/* 6 — Enterprise Security */
const SecurityCard = () => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.36 }}
    viewport={{ once: true }}
    className="l-card p-6 md:col-span-2 group"
  >
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-lg shadow-slate-500/20 flex-shrink-0">
        <ShieldCheckIcon className="w-5 h-5 text-white" />
      </div>
      <div>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Enterprise Security</span>
        <h3 className="text-[16px] font-bold text-slate-900 mb-1.5 tracking-tight">
          Bank-grade Security & Compliance
        </h3>
        <p className="text-[13px] text-slate-500 leading-relaxed mb-4">
          End-to-end encryption, SOC 2 compliance, GDPR ready, and granular role-based access controls.
        </p>
        <div className="flex flex-wrap gap-2">
          {['SOC 2', 'GDPR', 'HIPAA', 'AES-256', 'SSO'].map((badge) => (
            <span key={badge} className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
              {badge}
            </span>
          ))}
        </div>
      </div>
    </div>
  </motion.div>
);

/* 7 — API Platform */
const APICard = () => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.40 }}
    viewport={{ once: true }}
    className="l-card p-6 md:col-span-2 group overflow-hidden"
  >
    <div className="flex items-start gap-4 mb-5">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-500/20 flex-shrink-0">
        <CpuChipIcon className="w-5 h-5 text-white" />
      </div>
      <div>
        <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Developer-First</span>
        <h3 className="text-[16px] font-bold text-slate-900 mb-1.5 tracking-tight">
          API-first Platform
        </h3>
        <p className="text-[13px] text-slate-500 leading-relaxed">
          RESTful APIs, webhooks, and SDKs to integrate with every tool in your stack.
        </p>
      </div>
    </div>

    <div className="code-block">
      <div className="code-header">
        <span className="code-dot" style={{ background: '#ff5f57' }} />
        <span className="code-dot" style={{ background: '#febc2e' }} />
        <span className="code-dot" style={{ background: '#28c840' }} />
        <span className="ml-3 text-[11px] text-slate-500">api-request.sh</span>
      </div>
      <div className="code-body">
        <div><span className="code-comment">{'// Fetch active calls with analytics'}</span></div>
        <div>
          <span className="code-method">GET</span>{' '}
          <span className="code-url">/api/v1/calls</span>
          <span className="code-key">?status</span>=<span className="code-string">active</span>
          <span className="code-key">&include</span>=<span className="code-string">analytics</span>
        </div>
        <div className="mt-2"><span className="code-comment">{'// Response'}</span></div>
        <div>
          <span className="code-bracket">{'{'}</span>{' '}
          <span className="code-key">"status"</span>: <span className="code-status">"ok"</span>,{' '}
          <span className="code-key">"count"</span>: <span className="code-number">247</span>,{' '}
          <span className="code-key">"avg_duration"</span>: <span className="code-string">"4:32"</span>{' '}
          <span className="code-bracket">{'}'}</span>
        </div>
      </div>
    </div>
  </motion.div>
);

/* ──────────────────────────────────────────────
   Main Features Section
   ────────────────────────────────────────────── */

const Features = () => {
  return (
    <section id="features" className="py-24 md:py-32 relative">
      {/* Background accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-indigo-50/40 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <SectionBadge label="Platform Features" />
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">
            Unified Call Intelligence
            <br />
            <span className="text-indigo-600">& CRM Automation</span>
          </h2>
          <p className="text-slate-500 text-[16px] leading-relaxed max-w-xl mx-auto">
            Everything your team needs to track calls, automate workflows,
            and turn every conversation into actionable data.
          </p>
        </motion.div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <CallIntelligenceCard />
          <CRMAutomationCard />
          <AnalyticsCard />
          <AIInsightsCard />
          <UptimeCard />
          <SecurityCard />
          <APICard />
        </div>
      </div>
    </section>
  );
};

export default Features;

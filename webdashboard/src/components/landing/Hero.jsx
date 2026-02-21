import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRightIcon,
  PhoneArrowUpRightIcon,
  PhoneArrowDownLeftIcon,
  ChartBarIcon,
  UserGroupIcon,
  BoltIcon,
  SparklesIcon,
  SignalIcon,
  ArrowTrendingUpIcon,
  PlayCircleIcon,
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon,
  StarIcon,
  PhoneIcon,
} from '@heroicons/react/24/solid';
import { ScheduleDemoButton } from '../demo';

/* ──────────────────────────────────────────────
   Reusable sub-components
   ────────────────────────────────────────────── */

const GlassCard = ({ children, className = '', delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    className={`hero-glass-card ${className}`}
  >
    {children}
  </motion.div>
);

const LiveIndicator = () => (
  <span className="relative flex h-2 w-2">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
  </span>
);

/* ──────────────────────────────────────────────
   Floating widgets (glassmorphism overlays)
   ────────────────────────────────────────────── */

const ActiveCallsWidget = ({ delay }) => (
  <GlassCard delay={delay} className="hero-float-widget hero-float-1">
    <div className="flex items-center gap-2.5">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
        <PhoneArrowUpRightIcon className="w-4 h-4 text-white" />
      </div>
      <div>
        <div className="flex items-center gap-1.5">
          <LiveIndicator />
          <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">Live</span>
        </div>
        <p className="text-[15px] font-bold text-slate-900 leading-tight">247 Active Calls</p>
      </div>
    </div>
  </GlassCard>
);

const AIInsightWidget = ({ delay }) => (
  <GlassCard delay={delay} className="hero-float-widget hero-float-2">
    <div className="flex items-center gap-2.5">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
        <SparklesIcon className="w-4 h-4 text-white" />
      </div>
      <div>
        <p className="text-[10px] font-medium text-slate-400">AI Insight</p>
        <p className="text-[12px] font-semibold text-slate-800">"Peak hours: 2-4 PM"</p>
      </div>
    </div>
  </GlassCard>
);

const ConversionWidget = ({ delay }) => (
  <GlassCard delay={delay} className="hero-float-widget hero-float-3">
    <div className="flex items-center gap-2.5">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
        <ArrowTrendingUpIcon className="w-4 h-4 text-white" />
      </div>
      <div>
        <p className="text-[10px] font-medium text-slate-400">Conversion Rate</p>
        <div className="flex items-center gap-1.5">
          <p className="text-[15px] font-bold text-slate-900">34.2%</p>
          <span className="text-[10px] font-bold text-emerald-600">+5.7%</span>
        </div>
      </div>
    </div>
  </GlassCard>
);

const AgentStatusWidget = ({ delay }) => (
  <GlassCard delay={delay} className="hero-float-widget hero-float-4">
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {['bg-indigo-500', 'bg-violet-500', 'bg-sky-500', 'bg-emerald-500'].map((bg, i) => (
          <div key={i} className={`w-7 h-7 rounded-full ${bg} border-2 border-white flex items-center justify-center`}>
            <span className="text-[9px] font-bold text-white">{['SM', 'JD', 'AK', 'RL'][i]}</span>
          </div>
        ))}
      </div>
      <div>
        <p className="text-[10px] font-medium text-slate-400">Agents Online</p>
        <p className="text-[13px] font-bold text-slate-900">18 / 24</p>
      </div>
    </div>
  </GlassCard>
);

/* ──────────────────────────────────────────────
   Product mockup — layered dashboard preview
   ────────────────────────────────────────────── */

const DashboardMockup = () => (
  <div className="relative w-full">
    {/* Glow behind the mockup */}
    <div className="absolute -inset-8 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-sky-500/5 rounded-3xl blur-2xl hero-glow-pulse" />

    {/* Main dashboard card */}
    <motion.div
      initial={{ opacity: 0, y: 30, rotateX: 8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
      style={{ perspective: '1200px' }}
    >
      <div className="relative bg-white border border-slate-200/80 rounded-2xl shadow-2xl shadow-slate-300/40 overflow-hidden">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-300" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-300" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-300" />
          </div>
          <div className="flex-1 mx-6">
            <div className="bg-slate-50 border border-slate-200/80 rounded-md px-3 py-1 text-[10px] text-slate-400 text-center font-medium">
              app.calltrackerpro.com/dashboard
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <LiveIndicator />
            <span className="text-[9px] font-semibold text-emerald-600">Connected</span>
          </div>
        </div>

        {/* Dashboard body */}
        <div className="p-4">
          {/* Sidebar + Content layout */}
          <div className="flex gap-3">
            {/* Mini sidebar */}
            <div className="hidden sm:flex flex-col gap-2 w-10 flex-shrink-0">
              {[
                { icon: ChartBarIcon, active: true },
                { icon: PhoneIcon, active: false },
                { icon: UserGroupIcon, active: false },
                { icon: BoltIcon, active: false },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + i * 0.05 }}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    item.active ? 'bg-indigo-600 shadow-md shadow-indigo-500/20' : 'bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <item.icon className={`w-4 h-4 ${item.active ? 'text-white' : 'text-slate-400'}`} />
                </motion.div>
              ))}
            </div>

            {/* Main content */}
            <div className="flex-1 space-y-3">
              {/* KPI cards */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Total Calls', value: '12,847', change: '+12.3%', icon: PhoneArrowUpRightIcon, gradient: 'from-indigo-500 to-indigo-600' },
                  { label: 'Avg Duration', value: '4:32', change: '+8.1%', icon: SignalIcon, gradient: 'from-violet-500 to-purple-600' },
                  { label: 'Conversion', value: '34.2%', change: '+5.7%', icon: ArrowTrendingUpIcon, gradient: 'from-emerald-500 to-emerald-600' },
                  { label: 'Revenue', value: '$284K', change: '+22.4%', icon: BoltIcon, gradient: 'from-amber-500 to-orange-500' },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 + i * 0.08 }}
                    className="bg-white border border-slate-100 rounded-xl p-2.5 group"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                        <stat.icon className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">{stat.change}</span>
                    </div>
                    <p className="text-[14px] font-bold text-slate-900 leading-none">{stat.value}</p>
                    <p className="text-[9px] text-slate-400 mt-0.5 font-medium">{stat.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Chart + Activity split */}
              <div className="grid grid-cols-5 gap-2">
                {/* Call volume chart */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.1 }}
                  className="col-span-3 bg-white border border-slate-100 rounded-xl p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-[10px] font-semibold text-slate-700">Call Volume</p>
                      <p className="text-[9px] text-slate-400">Last 7 days</p>
                    </div>
                    <div className="flex gap-2">
                      {['Daily', 'Weekly', 'Monthly'].map((t, i) => (
                        <span key={i} className={`text-[8px] px-1.5 py-0.5 rounded ${i === 1 ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-slate-400'}`}>{t}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-end gap-[3px] h-20">
                    {[30, 45, 38, 62, 48, 70, 55, 78, 60, 85, 68, 92, 75, 88, 72, 95, 82, 98, 78, 90, 85, 94, 88, 97].map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ duration: 0.5, delay: 1.2 + i * 0.02 }}
                        className={`flex-1 rounded-sm ${i >= 20 ? 'bg-indigo-500' : i >= 16 ? 'bg-indigo-400' : 'bg-indigo-200/80'}`}
                      />
                    ))}
                  </div>
                </motion.div>

                {/* Live call feed */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  className="col-span-2 bg-white border border-slate-100 rounded-xl p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-semibold text-slate-700">Live Activity</p>
                    <div className="flex items-center gap-1">
                      <LiveIndicator />
                      <span className="text-[8px] text-emerald-600 font-semibold">LIVE</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {[
                      { name: 'Sarah M.', action: 'Inbound call', time: 'Now', status: 'active', icon: PhoneArrowDownLeftIcon },
                      { name: 'John D.', action: 'Follow-up', time: '2m', status: 'done', icon: PhoneArrowUpRightIcon },
                      { name: 'Alex K.', action: 'Scheduled', time: '5m', status: 'pending', icon: PhoneIcon },
                      { name: 'Raj L.', action: 'CRM updated', time: '8m', status: 'done', icon: CheckCircleIcon },
                    ].map((call, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.4 + i * 0.08 }}
                        className="flex items-center gap-2 py-1"
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold text-white ${
                          call.status === 'active' ? 'bg-emerald-500' : call.status === 'done' ? 'bg-indigo-500' : 'bg-slate-300'
                        }`}>
                          {call.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] font-semibold text-slate-700 truncate">{call.name}</p>
                          <p className="text-[8px] text-slate-400">{call.action}</p>
                        </div>
                        <span className="text-[8px] text-slate-400 flex-shrink-0">{call.time}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Bottom row — Agent performance */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4 }}
                className="bg-white border border-slate-100 rounded-xl p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-semibold text-slate-700">Top Agents Today</p>
                  <span className="text-[8px] text-indigo-600 font-medium">View All</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { name: 'Sarah M.', calls: 47, rate: '42%', rating: 4.9, color: 'bg-indigo-500' },
                    { name: 'John D.', calls: 38, rate: '37%', rating: 4.7, color: 'bg-violet-500' },
                    { name: 'Alex K.', calls: 35, rate: '35%', rating: 4.8, color: 'bg-sky-500' },
                    { name: 'Raj L.', calls: 31, rate: '31%', rating: 4.6, color: 'bg-emerald-500' },
                  ].map((agent, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.5 + i * 0.06 }}
                      className="flex items-center gap-2 bg-slate-50/80 rounded-lg px-2 py-1.5"
                    >
                      <div className={`w-6 h-6 rounded-full ${agent.color} flex items-center justify-center`}>
                        <span className="text-[8px] font-bold text-white">{agent.name.charAt(0)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-semibold text-slate-700 truncate">{agent.name}</p>
                        <div className="flex items-center gap-1">
                          <span className="text-[8px] text-slate-500">{agent.calls} calls</span>
                          <StarIcon className="w-2.5 h-2.5 text-amber-400" />
                          <span className="text-[8px] font-semibold text-slate-600">{agent.rating}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  </div>
);

/* ──────────────────────────────────────────────
   Main Hero Component
   ────────────────────────────────────────────── */

const Hero = () => {
  const trustItems = [
    'Real-time Call Analytics',
    'AI-powered Insights',
    'CRM Sync',
    '99.9% Uptime SLA',
  ];

  return (
    <section
      id="home"
      className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white via-slate-50/30 to-white"
    >
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[15%] left-[10%] w-[600px] h-[600px] bg-indigo-100/30 rounded-full blur-[140px]"
        />
        <motion.div
          animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
          transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[20%] right-[5%] w-[500px] h-[500px] bg-violet-100/25 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ x: [0, 20, 0], y: [0, 20, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-[10%] left-[30%] w-[400px] h-[400px] bg-sky-100/20 rounded-full blur-[100px]"
        />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 dot-grid opacity-40" />

      {/* ─── Main content area ─── */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-28 md:pt-32 pb-12">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center lg:justify-start mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100">
            <span className="text-[10px] font-bold text-white bg-indigo-600 rounded-full px-2 py-0.5 uppercase tracking-wider">New</span>
            <span className="text-[12px] font-medium text-indigo-700 tracking-wide">
              Enterprise-grade call intelligence — now available
            </span>
            <ArrowRightIcon className="w-3 h-3 text-indigo-400" />
          </div>
        </motion.div>

        {/* Split layout: Text left, Product right */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

          {/* ─── LEFT: Copy + CTAs ─── */}
          <div className="text-center lg:text-left">
            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-[64px] font-extrabold tracking-tight leading-[1.08] mb-6"
            >
              <span className="text-slate-900">Smart Call</span>
              <br />
              <span className="text-slate-900">Intelligence for</span>
              <br />
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Modern CRM</span>
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.7, delay: 0.9 }}
                  className="absolute -bottom-1.5 left-0 right-0 h-[3px] bg-gradient-to-r from-indigo-600/40 to-violet-600/40 rounded-full origin-left"
                />
              </span>
              {' '}
              <span className="text-slate-900">Teams</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-[17px] md:text-lg text-slate-500 max-w-lg mx-auto lg:mx-0 mb-8 leading-relaxed"
            >
              Track every call, automate CRM workflows, and unlock AI-driven
              conversation insights — all from one unified platform built for
              sales teams and call centers.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start items-center mb-4"
            >
              <ScheduleDemoButton
                variant="primary"
                size="md"
                text="Start Free Trial"
                showIcon={false}
                className="shimmer-btn !rounded-xl !py-3.5 !px-8 !text-[15px] !font-semibold !bg-indigo-600 hover:!bg-indigo-700 glow-indigo !transform-none"
              />

              <button
                onClick={() =>
                  document.getElementById('features').scrollIntoView({ behavior: 'smooth' })
                }
                className="group flex items-center gap-2 text-[15px] font-medium text-slate-600 hover:text-slate-900 transition-all px-6 py-3.5 border border-slate-200 rounded-xl hover:border-slate-300 hover:bg-white hover:shadow-sm"
              >
                <PlayCircleIcon className="w-5 h-5 text-indigo-500 group-hover:text-indigo-600 transition-colors" />
                See Live Demo
              </button>
            </motion.div>

            {/* Microcopy */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-[12px] text-slate-400 mb-8 text-center lg:text-left"
            >
              No credit card required &middot; Free 14-day trial &middot; Cancel anytime
            </motion.p>

            {/* Trust row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-wrap justify-center lg:justify-start gap-x-5 gap-y-2 mb-10"
            >
              {trustItems.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 + i * 0.08 }}
                  className="flex items-center gap-1.5"
                >
                  <CheckCircleIcon className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span className="text-[12px] text-slate-500 font-medium">{item}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Social proof strip */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col sm:flex-row items-center lg:items-start gap-4 sm:gap-6"
            >
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {['bg-indigo-600', 'bg-violet-600', 'bg-sky-600', 'bg-emerald-600', 'bg-amber-600'].map((bg, i) => (
                    <div key={i} className={`w-8 h-8 rounded-full ${bg} border-2 border-white flex items-center justify-center`}>
                      <span className="text-[9px] font-bold text-white">{['SM', 'JD', 'AK', 'RL', 'MP'][i]}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} className="w-3.5 h-3.5 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">Trusted by <span className="text-slate-700 font-semibold">500+</span> teams</p>
                </div>
              </div>
              <div className="hidden sm:block w-px h-8 bg-slate-200" />
              <div className="grid grid-cols-2 gap-x-5 gap-y-1 text-center sm:text-left">
                <div>
                  <p className="text-[16px] font-bold text-slate-900">10K+</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Calls / day</p>
                </div>
                <div>
                  <p className="text-[16px] font-bold text-slate-900">99.9%</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Uptime</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ─── RIGHT: Product mockup ─── */}
          <div className="relative">
            <DashboardMockup />
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#F8FAFC] to-transparent" />
    </section>
  );
};

export default Hero;

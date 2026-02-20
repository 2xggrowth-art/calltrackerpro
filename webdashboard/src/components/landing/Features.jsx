import React from 'react';
import { motion } from 'framer-motion';
import {
  PhoneIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  BoltIcon,
  CloudArrowUpIcon,
  CpuChipIcon,
} from '@heroicons/react/24/outline';

const Features = () => {
  return (
    <section id="features" className="py-24 md:py-32 relative">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-2xl mb-16"
        >
          <p className="text-[13px] font-semibold text-indigo-600 tracking-wide uppercase mb-3">
            Features
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">
            Everything you need.
            <br />
            <span className="text-indigo-600">Nothing</span> you don't.
          </h2>
          <p className="text-slate-700 text-[16px] leading-relaxed">
            Built for teams that need reliable <span className="font-semibold text-slate-900">call infrastructure</span> without the bloat.
          </p>
        </motion.div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Call Management — tall hero card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            viewport={{ once: true }}
            className="l-card p-8 md:col-span-2 md:row-span-2 group glow-indigo flex flex-col justify-between"
          >
            <div>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 bg-indigo-50 text-indigo-600">
                <PhoneIcon className="w-5 h-5" />
              </div>
              <h3 className="text-[20px] font-bold text-slate-900 mb-3 tracking-tight">
                Advanced Call Management
              </h3>
              <p className="text-[14px] text-slate-600 leading-relaxed mb-8">
                Intelligent routing, queue management, and <span className="font-semibold text-indigo-600">real-time call
                distribution</span> across your entire organization.
              </p>
            </div>

            {/* Mini routing visual */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200" />
                <div className="flex-1 h-px bg-gradient-to-r from-emerald-300 to-transparent" />
                <span className="text-[11px] text-slate-500 font-mono">agent-01</span>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-sm shadow-indigo-200" />
                <div className="flex-1 h-px bg-gradient-to-r from-indigo-300 to-transparent" />
                <span className="text-[11px] text-slate-500 font-mono">agent-02</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-200" />
                <div className="flex-1 h-px bg-gradient-to-r from-amber-300 to-transparent" />
                <span className="text-[11px] text-slate-500 font-mono">queue</span>
              </div>
            </div>
          </motion.div>

          {/* Analytics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
            viewport={{ once: true }}
            className="l-card p-6 md:col-span-2 group"
          >
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors duration-300 flex-shrink-0">
                <ChartBarIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-slate-900 mb-1.5 tracking-tight">
                  Real-time Analytics
                </h3>
                <p className="text-[13px] text-slate-600 leading-relaxed">
                  Live dashboards with <span className="font-semibold text-slate-800">performance metrics</span>, trend analysis, and
                  exportable reports.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Security */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.16 }}
            viewport={{ once: true }}
            className="l-card p-6 md:col-span-2 group"
          >
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors duration-300 flex-shrink-0">
                <ShieldCheckIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-slate-900 mb-1.5 tracking-tight">
                  Enterprise Security
                </h3>
                <p className="text-[13px] text-slate-600 leading-relaxed">
                  End-to-end encryption, <span className="font-semibold text-slate-800">SOC 2 compliance</span>, GDPR ready, and
                  role-based access controls.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Instant Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.24 }}
            viewport={{ once: true }}
            className="l-card p-6 group"
          >
            <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors duration-300">
              <BoltIcon className="w-5 h-5" />
            </div>
            <h3 className="text-[15px] font-bold text-slate-900 mb-1.5 tracking-tight">
              Instant Insights
            </h3>
            <p className="text-[13px] text-slate-600 leading-relaxed">
              AI-powered call scoring and sentiment analysis in <span className="font-semibold text-indigo-600">milliseconds</span>.
            </p>
          </motion.div>

          {/* Uptime */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.32 }}
            viewport={{ once: true }}
            className="l-card p-6 group"
          >
            <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors duration-300">
              <CloudArrowUpIcon className="w-5 h-5" />
            </div>
            <h3 className="text-[15px] font-bold text-slate-900 mb-1.5 tracking-tight">
              99.9% Uptime
            </h3>
            <p className="text-[13px] text-slate-600 leading-relaxed">
              Global CDN with automatic failover. Your calls <span className="font-semibold text-slate-800">never drop</span>.
            </p>
          </motion.div>

          {/* API — VS Code code block */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.40 }}
            viewport={{ once: true }}
            className="l-card p-6 md:col-span-2 group"
          >
            <div className="flex items-start gap-4 mb-5">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors duration-300 flex-shrink-0">
                <CpuChipIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-slate-900 mb-1.5 tracking-tight">
                  API-first Platform
                </h3>
                <p className="text-[13px] text-slate-600 leading-relaxed">
                  RESTful APIs and webhooks to integrate with <span className="font-semibold text-slate-800">every tool</span> in your stack.
                </p>
              </div>
            </div>

            {/* VS Code–style code block */}
            <div className="code-block">
              <div className="code-header">
                <span className="code-dot" style={{ background: '#ff5f57' }} />
                <span className="code-dot" style={{ background: '#febc2e' }} />
                <span className="code-dot" style={{ background: '#28c840' }} />
                <span className="ml-3 text-[11px] text-slate-500">api-request.sh</span>
              </div>
              <div className="code-body">
                <div><span className="code-comment">{'// Fetch active calls'}</span></div>
                <div>
                  <span className="code-method">GET</span>{' '}
                  <span className="code-url">/api/v1/calls</span>
                  <span className="code-key">?status</span>=<span className="code-string">active</span>
                  <span className="code-key">&limit</span>=<span className="code-number">50</span>
                </div>
                <div className="mt-2"><span className="code-comment">{'// Response'}</span></div>
                <div>
                  <span className="code-bracket">{'{'}</span>{' '}
                  <span className="code-key">"status"</span>: <span className="code-status">"ok"</span>,{' '}
                  <span className="code-key">"count"</span>: <span className="code-number">47</span>{' '}
                  <span className="code-bracket">{'}'}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Features;

import React from 'react';
import { motion } from 'framer-motion';

const trustedLogos = [
  { name: 'Acme Corp', svg: 'ACME' },
  { name: 'Globex', svg: 'GLOBEX' },
  { name: 'Soylent', svg: 'SOYLENT' },
  { name: 'Initech', svg: 'INITECH' },
  { name: 'Umbrella', svg: 'UMBRELLA' },
  { name: 'Hooli', svg: 'HOOLI' },
];

const About = () => {
  return (
    <section id="about" className="py-24 md:py-32 relative bg-white">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* Trusted by */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-24"
        >
          <p className="text-[11px] font-semibold text-slate-400 tracking-[0.2em] uppercase mb-10">
            Trusted by forward-thinking teams
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-14 gap-y-8">
            {trustedLogos.map((logo, i) => (
              <div
                key={i}
                className="logo-cloud-item text-[18px] font-bold text-slate-900 tracking-widest select-none cursor-default"
              >
                {logo.svg}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Value props */}
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <p className="text-[13px] font-semibold text-indigo-600 tracking-wide uppercase mb-3">
              About CallTracker Pro
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-6 leading-tight">
              Built by <span className="text-indigo-600">operators</span>,
              <br />
              for operators.
            </h2>
            <p className="text-slate-700 text-[16px] leading-relaxed mb-6">
              We started CallTracker Pro because we were tired of cobbling together
              spreadsheets, missed call logs, and disconnected analytics tools.
              We built the <span className="font-semibold text-slate-900">platform we wished existed</span>.
            </p>
            <p className="text-slate-700 text-[16px] leading-relaxed">
              Today, hundreds of organizations trust us to manage their
              most critical communication infrastructure — from
              Bengaluru to Berlin.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-4"
          >
            {[
              { value: '500K+', label: 'Calls processed monthly' },
              { value: '50+', label: 'Countries served' },
              { value: '<200ms', label: 'Average API latency' },
              { value: '24/7', label: 'Support for Enterprise' },
            ].map((stat, i) => (
              <div key={i} className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <div className="text-2xl font-bold text-indigo-600 tracking-tight mb-1">
                  {stat.value}
                </div>
                <div className="text-[12px] font-medium text-slate-500 tracking-wide">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;

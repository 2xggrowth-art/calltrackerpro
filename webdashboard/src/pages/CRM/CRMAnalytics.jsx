import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../../components/common';
import { ticketService } from '../../services/ticketService';
import { callLogService } from '../../services/callLogService';
import toast from 'react-hot-toast';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  LineChart, Line,
  FunnelChart, Funnel, LabelList
} from 'recharts';
import {
  ChartBarIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const STATUS_COLORS = {
  open: '#F59E0B',
  in_progress: '#3B82F6',
  resolved: '#10B981',
  closed: '#6B7280',
  new: '#8B5CF6',
};

const PRIORITY_COLORS = {
  low: '#9CA3AF',
  medium: '#F59E0B',
  high: '#F97316',
  urgent: '#EF4444',
};

const FUNNEL_COLORS = ['#8B5CF6', '#3B82F6', '#F59E0B', '#10B981', '#6B7280'];

const CRMAnalytics = () => {
  const [tickets, setTickets] = useState([]);
  const [callLogs, setCallLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [ticketRes, callRes] = await Promise.allSettled([
        ticketService.getTickets({ limit: 500 }),
        callLogService.getCallLogs({ limit: 500 }),
      ]);

      setTickets(ticketRes.status === 'fulfilled' ? (ticketRes.value.data || []) : []);
      setCallLogs(callRes.status === 'fulfilled' ? (callRes.value.data || []) : []);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Chart Data ---

  // 1. Ticket Pipeline Bar Chart
  const pipelineData = (() => {
    const statusCounts = { new: 0, open: 0, in_progress: 0, resolved: 0, closed: 0 };
    tickets.forEach(t => {
      const s = t.status?.replace('-', '_') || 'open';
      if (statusCounts[s] !== undefined) statusCounts[s]++;
      else statusCounts.open++;
    });
    return Object.entries(statusCounts).map(([status, count]) => ({
      status: status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      count,
      fill: STATUS_COLORS[status] || '#6B7280',
    }));
  })();

  // 2. Priority Distribution Pie Chart
  const priorityData = (() => {
    const counts = { low: 0, medium: 0, high: 0, urgent: 0 };
    tickets.forEach(t => {
      const p = t.priority || 'medium';
      if (counts[p] !== undefined) counts[p]++;
      else counts.medium++;
    });
    return Object.entries(counts)
      .filter(([, count]) => count > 0)
      .map(([priority, count]) => ({
        name: priority.charAt(0).toUpperCase() + priority.slice(1),
        value: count,
        color: PRIORITY_COLORS[priority],
      }));
  })();

  // 3. Call Volume Line Chart (last 30 days)
  const callVolumeData = (() => {
    const days = {};
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      days[key] = 0;
    }
    callLogs.forEach(c => {
      const date = (c.callDate || c.createdAt || '').split('T')[0];
      if (days[date] !== undefined) days[date]++;
    });
    return Object.entries(days).map(([date, count]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      calls: count,
    }));
  })();

  // 4. Conversion Funnel
  const funnelData = (() => {
    const stages = ['new', 'open', 'in_progress', 'resolved', 'closed'];
    const labels = ['New', 'Open', 'In Progress', 'Resolved', 'Closed'];
    const counts = stages.map(s => tickets.filter(t => (t.status?.replace('-', '_') || 'open') === s).length);
    // Build cumulative funnel (each stage includes all tickets that reached it or beyond)
    const cumulative = stages.map((_, i) => counts.slice(i).reduce((a, b) => a + b, 0));
    return stages.map((s, i) => ({
      name: labels[i],
      value: cumulative[i] || 0,
      fill: FUNNEL_COLORS[i],
    }));
  })();

  const totalTickets = tickets.length;
  const totalCalls = callLogs.length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
            <ChartBarIcon className="w-8 h-8" />
            <span>CRM Analytics</span>
          </h1>
          <p className="text-gray-600 mt-2">
            {totalTickets} tickets &bull; {totalCalls} calls tracked
          </p>
        </div>
        <button
          onClick={fetchData}
          className="mt-4 sm:mt-0 inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <ArrowPathIcon className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </motion.div>

      {/* Charts Grid — 2 cols on desktop, 1 on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Ticket Pipeline Bar Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Ticket Pipeline</h3>
            <p className="text-sm text-gray-500 mb-4">Count of tickets by current status</p>
            {totalTickets === 0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={pipelineData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {pipelineData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </motion.div>

        {/* 2. Priority Distribution Pie Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Priority Distribution</h3>
            <p className="text-sm text-gray-500 mb-4">Low / Medium / High / Urgent breakdown</p>
            {totalTickets === 0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {priorityData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>
        </motion.div>

        {/* 3. Call Volume Line Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Call Volume (Last 30 Days)</h3>
            <p className="text-sm text-gray-500 mb-4">Daily call count over the past month</p>
            {totalCalls === 0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={callVolumeData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="calls" stroke="#3B82F6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Card>
        </motion.div>

        {/* 4. Conversion Funnel */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Conversion Funnel</h3>
            <p className="text-sm text-gray-500 mb-4">New &rarr; Open &rarr; In Progress &rarr; Resolved &rarr; Closed</p>
            {totalTickets === 0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <FunnelChart>
                  <Tooltip />
                  <Funnel dataKey="value" data={funnelData} isAnimationActive>
                    {funnelData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                    <LabelList position="right" fill="#374151" stroke="none" dataKey="name" fontSize={12} />
                    <LabelList position="center" fill="#fff" stroke="none" dataKey="value" fontSize={14} fontWeight="bold" />
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

const EmptyChart = () => (
  <div className="flex flex-col items-center justify-center h-[300px] text-gray-400">
    <ChartBarIcon className="w-12 h-12 mb-2" />
    <p className="text-sm">No data available</p>
  </div>
);

export default CRMAnalytics;

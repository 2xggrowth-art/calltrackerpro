import React from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Card } from '../common';

const LeadsAnalytics = () => {
  // Mock data for charts
  const dailyLeadVolume = [
    { date: '2025-08-01', leads: 12, urgent: 2 },
    { date: '2025-08-02', leads: 15, urgent: 4 },
    { date: '2025-08-03', leads: 8, urgent: 1 },
    { date: '2025-08-04', leads: 22, urgent: 6 },
    { date: '2025-08-05', leads: 18, urgent: 3 },
    { date: '2025-08-06', leads: 25, urgent: 8 },
    { date: '2025-08-07', leads: 20, urgent: 5 }
  ];

  const priorityBreakdown = [
    { name: 'High Priority', value: 35, count: 54 },
    { name: 'Medium Priority', value: 45, count: 70 },
    { name: 'Low Priority', value: 20, count: 32 }
  ];

  const painPointsData = [
    { pain: 'Wasted Ad Spend', count: 45, percentage: 28.8 },
    { pain: 'Poor ROI Tracking', count: 38, percentage: 24.4 },
    { pain: 'Missed Opportunities', count: 32, percentage: 20.5 },
    { pain: 'Manual Tracking', count: 25, percentage: 16.0 },
    { pain: 'Competitor Advantage', count: 16, percentage: 10.3 }
  ];

  const budgetSegments = [
    { name: 'Under $1K', value: 25, count: 39, color: '#10B981' },
    { name: '$1K-5K', value: 35, count: 55, color: '#3B82F6' },
    { name: '$5K-10K', value: 25, count: 39, color: '#8B5CF6' },
    { name: '$10K+', value: 15, count: 23, color: '#EF4444' }
  ];

  const conversionFunnel = [
    { stage: 'New Leads', count: 156, percentage: 100 },
    { stage: 'Contacted', count: 124, percentage: 79.5 },
    { stage: 'Demo Scheduled', count: 89, percentage: 57.1 },
    { stage: 'Demo Completed', count: 67, percentage: 42.9 },
    { stage: 'Converted', count: 36, percentage: 23.1 }
  ];

  const responseTimeData = [
    { urgency: 'Urgent', avgResponse: 1.2, target: 2.0 },
    { urgency: 'Planned', avgResponse: 18.5, target: 24.0 },
    { urgency: 'Exploring', avgResponse: 45.8, target: 72.0 }
  ];

  const COLORS = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
      {/* Lead Volume Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="xl:col-span-2"
      >
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Volume Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dailyLeadVolume}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value, name) => [value, name === 'leads' ? 'Total Leads' : 'Urgent Leads']}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="leads"
                stackId="1"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.6}
                name="Total Leads"
              />
              <Area
                type="monotone"
                dataKey="urgent"
                stackId="2"
                stroke="#EF4444"
                fill="#EF4444"
                fillOpacity={0.8}
                name="Urgent Leads"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>

      {/* Priority Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={priorityBreakdown}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percentage }) => `${name}: ${percentage}%`}
                labelLine={false}
              >
                {priorityBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>

      {/* Pain Points Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="xl:col-span-2"
      >
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pain Points Analysis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={painPointsData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="pain" tick={{ fontSize: 12 }} width={120} />
              <Tooltip formatter={(value, name) => [value, name === 'count' ? 'Leads' : name]} />
              <Bar dataKey="count" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>

      {/* Budget Segments */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Segments</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={budgetSegments}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
                labelLine={false}
              >
                {budgetSegments.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name, props) => [`${value}% (${props.payload.count} leads)`, 'Percentage']} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>

      {/* Conversion Funnel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="xl:col-span-2"
      >
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Funnel</h3>
          <div className="space-y-4">
            {conversionFunnel.map((stage, index) => (
              <div key={stage.stage} className="flex items-center space-x-4">
                <div className="w-24 text-sm font-medium text-gray-600">{stage.stage}</div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-900">{stage.count} leads</span>
                    <span className="text-sm text-gray-500">{stage.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${stage.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Response Time Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Response Time Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={responseTimeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="urgency" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value, name) => [`${value} hours`, name === 'avgResponse' ? 'Actual Response' : 'Target']} />
              <Legend />
              <Bar dataKey="avgResponse" fill="#3B82F6" name="Actual Response" />
              <Bar dataKey="target" fill="#10B981" name="Target" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>
    </div>
  );
};

export default LeadsAnalytics;
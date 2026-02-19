import React from 'react';
import { Card } from '../common';
import {
  PhoneIcon,
  PhoneArrowDownLeftIcon,
  XMarkIcon,
  ClockIcon,
  TicketIcon,
  StarIcon,
  UsersIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const CallAnalytics = ({ analytics, loading = false }) => {
  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (!analytics) {
    return null;
  }

  const {
    totalCalls = 0,
    answeredCalls = 0,
    missedCalls = 0,
    totalDuration = 0,
    averageDuration = 0,
    answeredRate = 0,
    totalWithTickets = 0,
    ticketCreationRate = 0,
    averageCallQuality = 0,
    dailyStats = [],
    teamStats = []
  } = analytics;

  const StatCard = ({ icon: Icon, title, value, subtitle, color = 'primary' }) => {
    const colorClasses = {
      primary: 'bg-primary-gradient text-white',
      success: 'bg-green-gradient text-white',
      warning: 'bg-yellow-gradient text-white',
      info: 'bg-blue-gradient text-white',
      danger: 'bg-red-gradient text-white'
    };

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <div className="flex items-center">
              <p className="text-2xl font-semibold text-gray-900">{value}</p>
              {subtitle && (
                <p className="ml-2 text-sm text-gray-500">{subtitle}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${seconds % 60}s`;
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <ChartBarIcon className="w-5 h-5" />
          <span>Call Analytics</span>
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Overview of your call performance and statistics
        </p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={PhoneIcon}
          title="Total Calls"
          value={totalCalls.toLocaleString()}
          color="primary"
        />
        
        <StatCard
          icon={PhoneArrowDownLeftIcon}
          title="Answered Calls"
          value={answeredCalls.toLocaleString()}
          subtitle={`${answeredRate.toFixed(1)}% rate`}
          color="success"
        />
        
        <StatCard
          icon={XMarkIcon}
          title="Missed Calls"
          value={missedCalls.toLocaleString()}
          subtitle={`${((missedCalls / totalCalls) * 100).toFixed(1)}% rate`}
          color="danger"
        />
        
        <StatCard
          icon={ClockIcon}
          title="Total Duration"
          value={formatDuration(totalDuration)}
          subtitle={`Avg: ${Math.round(averageDuration)}s`}
          color="info"
        />
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon={TicketIcon}
          title="Tickets Created"
          value={totalWithTickets.toLocaleString()}
          subtitle={`${ticketCreationRate.toFixed(1)}% of calls`}
          color="warning"
        />
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-yellow-gradient text-white">
              <StarIcon className="w-6 h-6" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">Average Call Quality</p>
              {renderStars(averageCallQuality)}
            </div>
          </div>
        </div>
        
        <StatCard
          icon={UsersIcon}
          title="Teams Active"
          value={teamStats.length}
          subtitle="handling calls"
          color="info"
        />
      </div>

      {/* Daily Stats Chart */}
      {dailyStats.length > 0 && (
        <div className="mb-8">
          <h4 className="text-md font-semibold text-gray-900 mb-4">Daily Call Trends</h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-end space-x-2 h-32">
              {dailyStats.slice(-7).map((day, index) => {
                const maxCalls = Math.max(...dailyStats.map(d => d.totalCalls));
                const height = (day.totalCalls / maxCalls) * 100;
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-primary-500 rounded-t min-h-1"
                      style={{ height: `${height}%` }}
                      title={`${day.totalCalls} calls on ${new Date(day.date).toLocaleDateString()}`}
                    ></div>
                    <div className="text-xs text-gray-600 mt-2">
                      {new Date(day.date).toLocaleDateString([], { weekday: 'short' })}
                    </div>
                    <div className="text-xs font-semibold text-gray-800">
                      {day.totalCalls}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Team Performance */}
      {teamStats.length > 0 && (
        <div>
          <h4 className="text-md font-semibold text-gray-900 mb-4">Team Performance</h4>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Team
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Calls
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Answered Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teamStats.map((team, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <UsersIcon className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {team.teamName}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {team.teamId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{team.totalCalls}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{team.answeredRate.toFixed(1)}%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className={`h-2 rounded-full ${
                              team.answeredRate >= 80 ? 'bg-green-500' :
                              team.answeredRate >= 60 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(team.answeredRate, 100)}%` }}
                          ></div>
                        </div>
                        <span className={`text-sm font-medium ${
                          team.answeredRate >= 80 ? 'text-green-600' :
                          team.answeredRate >= 60 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {team.answeredRate >= 80 ? 'Excellent' :
                           team.answeredRate >= 60 ? 'Good' :
                           'Needs Improvement'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Card>
  );
};

export default CallAnalytics;
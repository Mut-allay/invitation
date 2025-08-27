import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import MainChart from '../organisms/charts/MainChart';

interface RealTimeMetric {
  id: string;
  label: string;
  value: number;
  change: number;
  isPositive: boolean;
  trend: 'up' | 'down' | 'stable';
  lastUpdated: Date;
}

interface RealTimeAnalyticsProps {
  className?: string;
}

const RealTimeAnalytics: React.FC<RealTimeAnalyticsProps> = ({ className = '' }) => {
  const [metrics, setMetrics] = useState<RealTimeMetric[]>([
    {
      id: 'sales',
      label: 'Sales (Last Hour)',
      value: 25,
      change: 5,
      isPositive: true,
      trend: 'up',
      lastUpdated: new Date()
    },
    {
      id: 'repairs',
      label: 'Active Repairs',
      value: 12,
      change: 2,
      isPositive: true,
      trend: 'up',
      lastUpdated: new Date()
    },
    {
      id: 'customers',
      label: 'New Customers',
      value: 8,
      change: 3,
      isPositive: true,
      trend: 'up',
      lastUpdated: new Date()
    },
    {
      id: 'revenue',
      label: 'Revenue (K)',
      value: 45000,
      change: 5000,
      isPositive: true,
      trend: 'up',
      lastUpdated: new Date()
    }
  ]);
  const [isConnected] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Simulate real-time data updates
  useEffect(() => {
    // Set initial metrics immediately
    setMetrics(prevMetrics => prevMetrics);
    
    const interval = setInterval(() => {
      setMetrics([
        {
          id: 'sales',
          label: 'Sales (Last Hour)',
          value: Math.floor(Math.random() * 50) + 10,
          change: Math.floor(Math.random() * 20) - 10,
          isPositive: Math.random() > 0.5,
          trend: Math.random() > 0.5 ? 'up' : 'down',
          lastUpdated: new Date()
        },
        {
          id: 'repairs',
          label: 'Active Repairs',
          value: Math.floor(Math.random() * 15) + 5,
          change: Math.floor(Math.random() * 5) - 2,
          isPositive: Math.random() > 0.5,
          trend: Math.random() > 0.5 ? 'up' : 'down',
          lastUpdated: new Date()
        },
        {
          id: 'customers',
          label: 'New Customers',
          value: Math.floor(Math.random() * 10) + 2,
          change: Math.floor(Math.random() * 5) - 2,
          isPositive: Math.random() > 0.5,
          trend: Math.random() > 0.5 ? 'up' : 'down',
          lastUpdated: new Date()
        },
        {
          id: 'revenue',
          label: 'Revenue (K)',
          value: Math.floor(Math.random() * 50000) + 10000,
          change: Math.floor(Math.random() * 10000) - 5000,
          isPositive: Math.random() > 0.5,
          trend: Math.random() > 0.5 ? 'up' : 'down',
          lastUpdated: new Date()
        }
      ]);
      setLastUpdate(new Date());
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />;
      case 'down':
        return <ArrowTrendingUpIcon className="h-4 w-4 text-red-500 transform rotate-180" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatValue = (value: number, label: string) => {
    if (label.includes('Revenue')) {
      return `K ${value.toLocaleString()}`;
    }
    return value.toString();
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Real-Time Analytics</h3>
              <p className="text-blue-100 text-sm">Live business metrics and performance</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${
              isConnected 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {isConnected ? (
                <CheckCircleIcon className="h-3 w-3" />
              ) : (
                <ExclamationTriangleIcon className="h-3 w-3" />
              )}
              <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
            <div className="text-blue-100 text-xs">
              Last update: {lastUpdate.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric) => (
            <div
              key={metric.id}
              className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">{metric.label}</span>
                {getTrendIcon(metric.trend)}
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {formatValue(metric.value, metric.label)}
              </div>
              <div className={`flex items-center space-x-1 text-xs ${
                metric.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                <span>{metric.isPositive ? '+' : ''}{metric.change}</span>
                <span>from last hour</span>
              </div>
            </div>
          ))}
        </div>

        {/* Real-time Chart */}
        <div className="mt-8">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Live Performance Trends</h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <MainChart
              data={[
                { time: '09:00', sales: 12, repairs: 8, customers: 3 },
                { time: '10:00', sales: 18, repairs: 12, customers: 5 },
                { time: '11:00', sales: 15, repairs: 10, customers: 4 },
                { time: '12:00', sales: 22, repairs: 15, customers: 7 },
                { time: '13:00', sales: 19, repairs: 11, customers: 6 },
                { time: '14:00', sales: 25, repairs: 18, customers: 8 },
                { time: '15:00', sales: 21, repairs: 14, customers: 5 },
              ]}
              type="line"
              dataKey="sales"
              xAxisKey="time"
              title="Hourly Performance"
              height={300}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeAnalytics;

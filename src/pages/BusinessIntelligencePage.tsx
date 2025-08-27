import React, { useState } from 'react';
import { 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  DocumentTextIcon,
  CogIcon,
  EyeIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import RealTimeAnalytics from '../components/analytics/RealTimeAnalytics';
import AdvancedReporting from '../components/analytics/AdvancedReporting';
import PredictiveAnalytics from '../components/analytics/PredictiveAnalytics';
import MainChart from '../components/organisms/charts/MainChart';
import DateRangeFilter from '../components/organisms/DateRangeFilter';

const BusinessIntelligencePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'realtime' | 'reports' | 'predictions'>('overview');



  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: ChartBarIcon,
      description: 'Key metrics and performance summary'
    },
    {
      id: 'realtime',
      label: 'Real-Time Analytics',
      icon: EyeIcon,
      description: 'Live data and performance monitoring'
    },
    {
      id: 'reports',
      label: 'Advanced Reports',
      icon: DocumentTextIcon,
      description: 'Custom reports and exports'
    },
    {
      id: 'predictions',
      label: 'Predictive Analytics',
      icon: ArrowTrendingUpIcon,
      description: 'AI-powered forecasting and insights'
    }
  ];

  const overviewMetrics = [
    {
      title: 'Total Revenue',
      value: 'K 2,450,000',
      change: '+12.5%',
      isPositive: true,
      icon: ChartBarIcon,
      color: 'from-green-500 to-green-400'
    },
    {
      title: 'Active Customers',
      value: '1,247',
      change: '+8.2%',
      isPositive: true,
      icon: EyeIcon,
      color: 'from-blue-500 to-blue-400'
    },
    {
      title: 'Inventory Turnover',
      value: '4.2x',
      change: '+15.3%',
      isPositive: true,
      icon: CogIcon,
      color: 'from-purple-500 to-purple-400'
    },
    {
      title: 'Repair Completion',
      value: '94.2%',
      change: '+2.1%',
      isPositive: true,
      icon: ArrowTrendingUpIcon,
      color: 'from-yellow-500 to-yellow-400'
    }
  ];

  const performanceData = [
    { month: 'Jan', sales: 45000, repairs: 120, customers: 85 },
    { month: 'Feb', sales: 52000, repairs: 135, customers: 92 },
    { month: 'Mar', sales: 48000, repairs: 110, customers: 78 },
    { month: 'Apr', sales: 61000, repairs: 150, customers: 105 },
    { month: 'May', sales: 55000, repairs: 125, customers: 95 },
    { month: 'Jun', sales: 68000, repairs: 165, customers: 115 }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Business Intelligence</h1>
              <p className="text-gray-600">Advanced analytics and insights for data-driven decisions</p>
            </div>
            <div className="flex items-center space-x-3">
              <DateRangeFilter onDateRangeChange={() => {}} />
              <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                <ArrowDownTrayIcon className="h-4 w-4" />
                <span>Export Dashboard</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'overview' | 'realtime' | 'reports' | 'predictions')}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {overviewMetrics.map((metric, index) => {
                const IconComponent = metric.icon;
                return (
                  <div
                    key={index}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${metric.color}`}>
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <span className={`text-sm font-medium ${
                        metric.isPositive ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {metric.change}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</h3>
                    <p className="text-gray-600">{metric.title}</p>
                  </div>
                );
              })}
            </div>

            {/* Performance Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trends</h3>
                <MainChart
                  data={performanceData}
                  type="line"
                  dataKey="sales"
                  xAxisKey="month"
                  title="Monthly Revenue (K)"
                  height={300}
                />
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Activity</h3>
                <MainChart
                  data={performanceData}
                  type="bar"
                  dataKey="repairs"
                  xAxisKey="month"
                  title="Monthly Repairs"
                  height={300}
                />
              </div>
            </div>

            {/* Quick Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <h4 className="text-lg font-semibold text-blue-900 mb-3">Top Performing Month</h4>
                <p className="text-3xl font-bold text-blue-600 mb-2">June 2024</p>
                <p className="text-blue-700 text-sm">K 68,000 in sales with 165 repairs completed</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                <h4 className="text-lg font-semibold text-green-900 mb-3">Customer Growth</h4>
                <p className="text-3xl font-bold text-green-600 mb-2">+35.3%</p>
                <p className="text-green-700 text-sm">Customer base increased from 85 to 115 this quarter</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-200">
                <h4 className="text-lg font-semibold text-purple-900 mb-3">Efficiency Score</h4>
                <p className="text-3xl font-bold text-purple-600 mb-2">94.2%</p>
                <p className="text-purple-700 text-sm">Repair completion rate with high customer satisfaction</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'realtime' && (
          <RealTimeAnalytics />
        )}

        {activeTab === 'reports' && (
          <AdvancedReporting />
        )}

        {activeTab === 'predictions' && (
          <PredictiveAnalytics />
        )}
      </div>
    </div>
  );
};

export default BusinessIntelligencePage;

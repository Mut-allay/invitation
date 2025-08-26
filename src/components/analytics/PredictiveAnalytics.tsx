import React, { useState, useEffect } from 'react';
import { 
  ArrowTrendingUpIcon,
  ChartBarIcon,
  UserGroupIcon,
  CubeIcon,

  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import MainChart from '../organisms/charts/MainChart';

interface Prediction {
  id: string;
  title: string;
  currentValue: number;
  predictedValue: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
  timeframe: string;
  factors: string[];
}

interface PredictiveAnalyticsProps {
  className?: string;
}

const PredictiveAnalytics: React.FC<PredictiveAnalyticsProps> = ({ className = '' }) => {
  const [predictions, setPredictions] = useState<Prediction[]>([
    {
      id: 'sales-forecast',
      title: 'Sales Forecast',
      currentValue: 45000,
      predictedValue: 52000,
      confidence: 85,
      trend: 'up',
      timeframe: 'Next 30 days',
      factors: ['Seasonal trends', 'Marketing campaigns', 'Customer retention']
    },
    {
      id: 'inventory-prediction',
      title: 'Inventory Demand',
      currentValue: 150,
      predictedValue: 180,
      confidence: 78,
      trend: 'up',
      timeframe: 'Next 30 days',
      factors: ['Sales velocity', 'Supplier lead times', 'Seasonal demand']
    },
    {
      id: 'customer-acquisition',
      title: 'New Customers',
      currentValue: 25,
      predictedValue: 32,
      confidence: 82,
      trend: 'up',
      timeframe: 'Next 30 days',
      factors: ['Referral rates', 'Marketing effectiveness', 'Market expansion']
    },
    {
      id: 'repair-volume',
      title: 'Repair Volume',
      currentValue: 45,
      predictedValue: 38,
      confidence: 75,
      trend: 'down',
      timeframe: 'Next 30 days',
      factors: ['Vehicle age', 'Maintenance schedules', 'Seasonal patterns']
    }
  ]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'quarter'>('month');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    // Simulate API call for predictions
    setTimeout(() => {
      setPredictions([
        {
          id: 'sales-forecast',
          title: 'Sales Forecast',
          currentValue: 45000,
          predictedValue: 52000,
          confidence: 85,
          trend: 'up',
          timeframe: 'Next 30 days',
          factors: ['Seasonal trends', 'Marketing campaigns', 'Customer retention']
        },
        {
          id: 'inventory-prediction',
          title: 'Inventory Demand',
          currentValue: 150,
          predictedValue: 180,
          confidence: 78,
          trend: 'up',
          timeframe: 'Next 30 days',
          factors: ['Sales velocity', 'Supplier lead times', 'Seasonal demand']
        },
        {
          id: 'customer-acquisition',
          title: 'New Customers',
          currentValue: 25,
          predictedValue: 32,
          confidence: 82,
          trend: 'up',
          timeframe: 'Next 30 days',
          factors: ['Referral rates', 'Marketing effectiveness', 'Market expansion']
        },
        {
          id: 'repair-volume',
          title: 'Repair Volume',
          currentValue: 45,
          predictedValue: 38,
          confidence: 75,
          trend: 'down',
          timeframe: 'Next 30 days',
          factors: ['Vehicle age', 'Maintenance schedules', 'Seasonal patterns']
        }
      ]);
      setIsLoading(false);
    }, 2000);
  }, [selectedTimeframe]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />;
      case 'down':
        return <ArrowTrendingUpIcon className="h-5 w-5 text-red-500 transform rotate-180" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 bg-green-100';
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const formatValue = (value: number, title: string) => {
    if (title.includes('Sales') || title.includes('Revenue')) {
      return `K ${value.toLocaleString()}`;
    }
    return value.toString();
  };

  const getPredictionChartData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month) => ({
      month,
      actual: Math.floor(Math.random() * 50000) + 30000,
      predicted: Math.floor(Math.random() * 50000) + 35000,
      confidence: Math.floor(Math.random() * 20) + 70
    }));
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <ArrowTrendingUpIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Predictive Analytics</h3>
              <p className="text-emerald-100 text-sm">AI-powered forecasting and trend analysis</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value as 'week' | 'month' | 'quarter')}
              className="px-3 py-1 bg-white/20 text-white border border-white/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <option value="week">Next Week</option>
              <option value="month">Next Month</option>
              <option value="quarter">Next Quarter</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            <span className="ml-3 text-gray-600">Generating predictions...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Predictions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {predictions.map((prediction) => (
                <div
                  key={prediction.id}
                  className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getTrendIcon(prediction.trend)}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{prediction.title}</h4>
                        <p className="text-sm text-gray-600">{prediction.timeframe}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${getConfidenceColor(prediction.confidence)}`}>
                      {prediction.confidence}% confidence
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Current</span>
                      <span className="font-semibold text-gray-900">
                        {formatValue(prediction.currentValue, prediction.title)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Predicted</span>
                      <span className={`font-semibold ${
                        prediction.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatValue(prediction.predictedValue, prediction.title)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Change</span>
                      <span className={`font-semibold ${
                        prediction.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {prediction.trend === 'up' ? '+' : ''}
                        {(((prediction.predictedValue - prediction.currentValue) / prediction.currentValue) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Key Factors</h5>
                    <div className="space-y-1">
                      {prediction.factors.map((factor, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                          <span className="text-xs text-gray-600">{factor}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Prediction Chart */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Forecast vs Actual Performance</h4>
              <MainChart
                data={getPredictionChartData()}
                type="line"
                dataKey="actual"
                xAxisKey="month"
                title="Monthly Performance"
                height={300}
              />
            </div>

            {/* Trend Indicators */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Trend Indicators</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-2">
                    <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-medium text-green-700">Sales trending up</span>
                  </div>
                  <span className="text-xs text-green-600">from last hour</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center space-x-2">
                    <ArrowTrendingUpIcon className="h-5 w-5 text-red-500 transform rotate-180" />
                    <span className="text-sm font-medium text-red-700">Repair volume down</span>
                  </div>
                  <span className="text-xs text-red-600">from last hour</span>
                </div>
              </div>
            </div>

            {/* Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ChartBarIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <h5 className="font-semibold text-blue-900">Sales Insights</h5>
                </div>
                <p className="text-sm text-blue-700">
                  Sales are expected to increase by 15% next month due to seasonal demand and new marketing campaigns.
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <UserGroupIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <h5 className="font-semibold text-green-900">Customer Trends</h5>
                </div>
                <p className="text-sm text-green-700">
                  Customer acquisition rate is improving with referral programs showing 25% effectiveness.
                </p>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <CubeIcon className="h-5 w-5 text-yellow-600" />
                  </div>
                  <h5 className="font-semibold text-yellow-900">Inventory Alert</h5>
                </div>
                <p className="text-sm text-yellow-700">
                  Consider increasing stock levels for popular parts as demand is predicted to rise by 20%.
                </p>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6 border border-purple-200">
              <h4 className="text-lg font-semibold text-purple-900 mb-4">AI Recommendations</h4>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h5 className="font-medium text-purple-900">Increase Marketing Budget</h5>
                    <p className="text-sm text-purple-700">Allocate 20% more to digital marketing based on predicted customer acquisition trends.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div>
                    <h5 className="font-medium text-purple-900">Stock Optimization</h5>
                    <p className="text-sm text-purple-700">Reorder popular inventory items 2 weeks earlier to meet predicted demand.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <ClockIcon className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <h5 className="font-medium text-purple-900">Staff Planning</h5>
                    <p className="text-sm text-purple-700">Consider hiring additional technicians for the upcoming busy season.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PredictiveAnalytics;

import React, { useState, useMemo } from 'react';
import { 
  ChartBarIcon, 
  ClockIcon, 
  CurrencyDollarIcon,
  UserGroupIcon,
  StarIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { Card } from '@/components/ui/card';

import type { Repair, Mechanic } from '../../types/repair';

// Recharts components
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

interface RepairAnalyticsProps {
  repairs: Repair[];
  mechanics?: Mechanic[];
  dateRange?: { start: Date; end: Date };
}

interface EfficiencyMetrics {
  averageRepairTime: number;
  onTimeCompletionRate: number;
  firstTimeFixRate: number;
  reworkRate: number;
  bayUtilization: number;
}

interface MechanicPerformance {
  id: string;
  name: string;
  repairsCompleted: number;
  averageTime: number;
  customerSatisfaction: number;
  revenueGenerated: number;
  specialization: string[];
}

interface RevenueAnalytics {
  totalRevenue: number;
  averageRepairCost: number;
  revenueByMonth: Array<{ month: string; revenue: number }>;
  revenueByCategory: Array<{ category: string; revenue: number }>;
  profitMargin: number;
}

interface PredictiveInsights {
  expectedRepairs: number;
  capacityUtilization: number;
  recommendedStaffing: number;
  seasonalTrends: string[];
  riskFactors: string[];
}

// Mock data for when API returns empty
const mockMechanics: Mechanic[] = [
  {
    id: 'tech1',
    tenantId: 'tenant1',
    name: 'John Smith',
    specialization: ['Engine Repair', 'Diagnostics'],
    hourlyRate: 45,
    availability: 'available',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'tech2',
    tenantId: 'tenant1',
    name: 'Mike Johnson',
    specialization: ['Electrical Systems', 'AC Repair'],
    hourlyRate: 42,
    availability: 'available',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'tech3',
    tenantId: 'tenant1',
    name: 'Sarah Wilson',
    specialization: ['Brake Systems', 'Suspension'],
    hourlyRate: 48,
    availability: 'busy',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'tech4',
    tenantId: 'tenant1',
    name: 'David Brown',
    specialization: ['Transmission', 'Clutch'],
    hourlyRate: 50,
    availability: 'available',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Mock satisfaction scores
const mockSatisfactionScores = {
  'tech1': 4.8,
  'tech2': 4.6,
  'tech3': 4.9,
  'tech4': 4.7
};

export const RepairAnalytics: React.FC<RepairAnalyticsProps> = ({
  repairs = [],
  mechanics = mockMechanics
}) => {

  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  // Calculate efficiency metrics
  const efficiencyMetrics = useMemo((): EfficiencyMetrics => {
    if (repairs.length === 0) {
      return {
        averageRepairTime: 0,
        onTimeCompletionRate: 0,
        firstTimeFixRate: 0,
        reworkRate: 0,
        bayUtilization: 0
      };
    }

    const completedRepairs = repairs.filter(repair => repair.status === 'completed');
    const onTimeRepairs = completedRepairs.filter(r => 
      r.actualCompletion && r.estimatedCompletion && 
      r.actualCompletion <= r.estimatedCompletion
    );

    // Calculate average repair time (mock calculation)
    const averageRepairTime = completedRepairs.length > 0 ? 
      Math.round(completedRepairs.reduce((sum) => sum + (Math.random() * 8 + 2), 0) / completedRepairs.length * 10) / 10 : 0;

    const onTimeCompletionRate = completedRepairs.length > 0 ? 
      Math.round((onTimeRepairs.length / completedRepairs.length) * 100) : 0;

    const firstTimeFixRate = Math.round(85 + Math.random() * 10); // Mock 85-95%
    const reworkRate = Math.round(5 + Math.random() * 10); // Mock 5-15%
    const bayUtilization = Math.round(70 + Math.random() * 25); // Mock 70-95%

    return {
      averageRepairTime,
      onTimeCompletionRate,
      firstTimeFixRate,
      reworkRate,
      bayUtilization
    };
  }, [repairs]);

  // Calculate mechanic performance
  const mechanicPerformance = useMemo((): MechanicPerformance[] => {
    return mechanics.map(mechanic => {
      const repairsCompleted = Math.floor(Math.random() * 20) + 5; // Mock 5-25 repairs
      const averageTime = Math.round((Math.random() * 6 + 2) * 10) / 10; // Mock 2-8 hours
      const customerSatisfaction = mockSatisfactionScores[mechanic.id as keyof typeof mockSatisfactionScores] || 4.5;
      const revenueGenerated = repairsCompleted * (mechanic.hourlyRate * averageTime);

      return {
        id: mechanic.id,
        name: mechanic.name,
        repairsCompleted,
        averageTime,
        customerSatisfaction,
        revenueGenerated,
        specialization: mechanic.specialization
      };
    });
  }, [mechanics]);

  // Calculate revenue analytics
  const revenueAnalytics = useMemo((): RevenueAnalytics => {
    const totalRevenue = repairs.reduce((sum, r) => sum + r.totalCost, 0);
    const averageRepairCost = repairs.length > 0 ? totalRevenue / repairs.length : 0;

    // Mock monthly revenue data
    const revenueByMonth = Array.from({ length: 12 }, (_, i) => ({
      month: new Date(2024, i).toLocaleDateString('en-US', { month: 'short' }),
      revenue: Math.floor(Math.random() * 50000) + 20000
    }));

    // Mock category revenue
    const revenueByCategory = [
      { category: 'Engine Repair', revenue: Math.floor(Math.random() * 30000) + 15000 },
      { category: 'Electrical', revenue: Math.floor(Math.random() * 25000) + 12000 },
      { category: 'Brake Systems', revenue: Math.floor(Math.random() * 20000) + 10000 },
      { category: 'Transmission', revenue: Math.floor(Math.random() * 18000) + 8000 },
      { category: 'AC/Heating', revenue: Math.floor(Math.random() * 15000) + 7000 }
    ];

    const profitMargin = Math.round(25 + Math.random() * 15); // Mock 25-40%

    return {
      totalRevenue,
      averageRepairCost,
      revenueByMonth,
      revenueByCategory,
      profitMargin
    };
  }, [repairs]);

  // Calculate predictive insights
  const predictiveInsights = useMemo((): PredictiveInsights => {
    const expectedRepairs = Math.floor(repairs.length * (1 + Math.random() * 0.3)); // 0-30% growth
    const capacityUtilization = Math.round(75 + Math.random() * 20); // 75-95%
    const recommendedStaffing = Math.ceil(mechanics.length * (capacityUtilization / 100));

    const seasonalTrends = [
      'AC repairs peak in summer months',
      'Brake system demand increases in winter',
      'Engine diagnostics higher in spring',
      'Pre-holiday maintenance surge expected'
    ];

    const riskFactors = [
      'Parts supply chain delays',
      'Technician skill gaps in new technologies',
      'Equipment maintenance requirements',
      'Customer satisfaction fluctuations'
    ];

    return {
      expectedRepairs,
      capacityUtilization,
      recommendedStaffing,
      seasonalTrends,
      riskFactors
    };
  }, [repairs, mechanics]);

  // Chart colors
  const chartColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];



  return (
    <div className="space-y-6">
      {/* Efficiency Metrics Overview */}
      <Card className="card-glass">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <ChartBarIcon className="w-6 h-6 text-primary" />
            <h3 className="text-responsive-lg font-semibold">Repair Efficiency Analytics</h3>
          </div>
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value as 'week' | 'month' | 'quarter' | 'year')}
            className="input-field text-responsive-sm"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
            <ClockIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-responsive-lg font-bold text-blue-600">
              {efficiencyMetrics.averageRepairTime}h
            </div>
            <div className="text-responsive-xs text-blue-700 dark:text-blue-300">Avg Repair Time</div>
          </div>

          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
            <CheckCircleIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-responsive-lg font-bold text-green-600">
              {efficiencyMetrics.onTimeCompletionRate}%
            </div>
            <div className="text-responsive-xs text-green-700 dark:text-green-300">On-Time Rate</div>
          </div>

          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
            <StarIcon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-responsive-lg font-bold text-purple-600">
              {efficiencyMetrics.firstTimeFixRate}%
            </div>
            <div className="text-responsive-xs text-purple-700 dark:text-purple-300">First-Time Fix</div>
          </div>

          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg">
            <ExclamationTriangleIcon className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <div className="text-responsive-lg font-bold text-orange-600">
              {efficiencyMetrics.reworkRate}%
            </div>
            <div className="text-responsive-xs text-orange-700 dark:text-orange-300">Rework Rate</div>
          </div>

          <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-lg">
            <ArrowTrendingUpIcon className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <div className="text-responsive-lg font-bold text-red-600">
              {efficiencyMetrics.bayUtilization}%
            </div>
            <div className="text-responsive-xs text-red-700 dark:text-red-300">Bay Utilization</div>
          </div>
        </div>
      </Card>

      {/* Revenue Analytics Chart */}
      <Card className="card-glass">
        <h4 className="text-responsive-base font-semibold mb-4 flex items-center space-x-2">
          <CurrencyDollarIcon className="w-5 h-5 text-green-600" />
          <span>Revenue Trends</span>
        </h4>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueAnalytics.revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <div className="text-responsive-lg font-bold text-green-600">
              ${revenueAnalytics.totalRevenue.toLocaleString()}
            </div>
            <div className="text-responsive-xs text-muted-foreground">Total Revenue</div>
          </div>
          <div className="text-center">
            <div className="text-responsive-lg font-bold text-blue-600">
              ${revenueAnalytics.averageRepairCost.toLocaleString()}
            </div>
            <div className="text-responsive-xs text-muted-foreground">Avg Repair Cost</div>
          </div>
          <div className="text-center">
            <div className="text-responsive-lg font-bold text-purple-600">
              {revenueAnalytics.profitMargin}%
            </div>
            <div className="text-responsive-xs text-muted-foreground">Profit Margin</div>
          </div>
        </div>
      </Card>

      {/* Mechanic Performance */}
      <Card className="card-glass">
        <h4 className="text-responsive-base font-semibold mb-4 flex items-center space-x-2">
          <UserGroupIcon className="w-5 h-5 text-blue-600" />
          <span>Mechanic Performance</span>
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left p-3 text-responsive-sm font-medium">Mechanic</th>
                <th className="text-left p-3 text-responsive-sm font-medium">Repairs</th>
                <th className="text-left p-3 text-responsive-sm font-medium">Avg Time</th>
                <th className="text-left p-3 text-responsive-sm font-medium">Satisfaction</th>
                <th className="text-left p-3 text-responsive-sm font-medium">Revenue</th>
                <th className="text-left p-3 text-responsive-sm font-medium">Specialization</th>
              </tr>
            </thead>
            <tbody>
              {mechanicPerformance.map((mechanic) => (
                <tr key={mechanic.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-3 text-responsive-sm font-medium">{mechanic.name}</td>
                  <td className="p-3 text-responsive-sm">{mechanic.repairsCompleted}</td>
                  <td className="p-3 text-responsive-sm">{mechanic.averageTime}h</td>
                  <td className="p-3 text-responsive-sm">
                    <div className="flex items-center space-x-1">
                      <StarIcon className="w-4 h-4 text-yellow-500 fill-current" />
                      <span>{mechanic.customerSatisfaction}</span>
                    </div>
                  </td>
                  <td className="p-3 text-responsive-sm">${mechanic.revenueGenerated.toLocaleString()}</td>
                  <td className="p-3 text-responsive-sm">
                    <div className="flex flex-wrap gap-1">
                      {mechanic.specialization.slice(0, 2).map((spec, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-responsive-xs rounded-full"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Revenue by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-glass">
          <h4 className="text-responsive-base font-semibold mb-4">Revenue by Category</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={revenueAnalytics.revenueByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="revenue"
                >
                  {revenueAnalytics.revenueByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Predictive Insights */}
        <Card className="card-glass">
          <h4 className="text-responsive-base font-semibold mb-4 flex items-center space-x-2">
            <ArrowTrendingUpIcon className="w-5 h-5 text-purple-600" />
            <span>Predictive Insights</span>
          </h4>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
                <div className="text-responsive-lg font-bold text-purple-600">
                  {predictiveInsights.expectedRepairs}
                </div>
                <div className="text-responsive-xs text-purple-700 dark:text-purple-300">Expected Repairs</div>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
                <div className="text-responsive-lg font-bold text-blue-600">
                  {predictiveInsights.recommendedStaffing}
                </div>
                <div className="text-responsive-xs text-blue-700 dark:text-blue-300">Staffing Needed</div>
              </div>
            </div>

            <div className="space-y-3">
              <h5 className="text-responsive-sm font-medium">Seasonal Trends</h5>
              <div className="space-y-2">
                {predictiveInsights.seasonalTrends.map((trend, index) => (
                  <div key={index} className="flex items-center space-x-2 text-responsive-xs text-muted-foreground">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>{trend}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h5 className="text-responsive-sm font-medium">Risk Factors</h5>
              <div className="space-y-2">
                {predictiveInsights.riskFactors.map((risk, index) => (
                  <div key={index} className="flex items-center space-x-2 text-responsive-xs text-muted-foreground">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>{risk}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Performance Radar Chart */}
      <Card className="card-glass">
        <h4 className="text-responsive-base font-semibold mb-4">Performance Overview</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={[
              {
                metric: 'Efficiency',
                value: efficiencyMetrics.onTimeCompletionRate,
                fullMark: 100
              },
              {
                metric: 'Quality',
                value: efficiencyMetrics.firstTimeFixRate,
                fullMark: 100
              },
              {
                metric: 'Utilization',
                value: efficiencyMetrics.bayUtilization,
                fullMark: 100
              },
              {
                metric: 'Satisfaction',
                value: Math.round(mechanicPerformance.reduce((sum, m) => sum + m.customerSatisfaction, 0) / mechanicPerformance.length * 20),
                fullMark: 100
              },
              {
                metric: 'Revenue',
                value: Math.min(100, Math.round((revenueAnalytics.totalRevenue / 500000) * 100)),
                fullMark: 100
              }
            ]}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar
                name="Performance"
                dataKey="value"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.3}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default RepairAnalytics;

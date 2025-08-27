import React, { useState, useMemo } from 'react';
import { 
  ChartBarIcon,
  CurrencyDollarIcon,
  StarIcon,
  WrenchScrewdriverIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { 
  LineChart, 
  Line, 
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
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import type { Repair } from '../../types/index';

interface MechanicPerformance {
  id: string;
  name: string;
  completedRepairs: number;
  averageTime: number;
  customerSatisfaction: number;
  revenue: number;
  efficiency: number;
}

interface RepairAnalyticsProps {
  repairs: Repair[];
  onClose?: () => void;
}

const RepairAnalytics: React.FC<RepairAnalyticsProps> = ({
  repairs,
  onClose
}) => {
  const [selectedMetric, setSelectedMetric] = useState<'efficiency' | 'revenue' | 'satisfaction'>('efficiency');
  // Note: success and showError are available but not used in this component
  // const { success, error: showError } = useToast();

  // Mock mechanics data for analytics
  const mockMechanics = useMemo((): MechanicPerformance[] => [
    {
      id: 'tech1',
      name: 'John Smith',
      completedRepairs: 45,
      averageTime: 2.5,
      customerSatisfaction: 4.8,
      revenue: 12500,
      efficiency: 92
    },
    {
      id: 'tech2',
      name: 'Mike Johnson',
      completedRepairs: 38,
      averageTime: 2.8,
      customerSatisfaction: 4.6,
      revenue: 10800,
      efficiency: 88
    },
    {
      id: 'tech3',
      name: 'Sarah Wilson',
      completedRepairs: 52,
      averageTime: 2.2,
      customerSatisfaction: 4.9,
      revenue: 14200,
      efficiency: 95
    },
    {
      id: 'tech4',
      name: 'David Brown',
      completedRepairs: 41,
      averageTime: 2.6,
      customerSatisfaction: 4.7,
      revenue: 11800,
      efficiency: 90
    }
  ], []);

  // Calculate analytics metrics
  const analyticsMetrics = useMemo(() => {
    const totalRepairs = repairs.length;
    const completedRepairs = repairs.filter(r => r.status === 'completed').length;
    const pendingRepairs = repairs.filter(r => r.status === 'pending').length;
    const inProgressRepairs = repairs.filter(r => r.status === 'in_progress').length;
    
    const totalRevenue = repairs.reduce((sum, r) => sum + r.totalCost, 0);
    const averageRepairCost = totalRepairs > 0 ? totalRevenue / totalRepairs : 0;
    
    const averageCompletionTime = completedRepairs > 0 ? 
      repairs.filter(r => r.status === 'completed' && r.actualCompletion && r.createdAt)
        .reduce((sum, r) => {
          const start = new Date(r.createdAt);
          const end = new Date(r.actualCompletion!);
          return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24); // Days
        }, 0) / completedRepairs : 0;

    // Calculate efficiency score
    const efficiencyScore = completedRepairs > 0 ? 
      Math.min(100, (completedRepairs / totalRepairs) * 100 + (averageCompletionTime < 3 ? 20 : 0)) : 0;

    // Calculate customer satisfaction (simulated)
    const satisfactionScore = Math.min(5, 4.2 + (efficiencyScore / 100) * 0.8);

    return {
      totalRepairs,
      completedRepairs,
      pendingRepairs,
      inProgressRepairs,
      totalRevenue,
      averageRepairCost,
      averageCompletionTime,
      efficiencyScore,
      satisfactionScore,
      completionRate: totalRepairs > 0 ? (completedRepairs / totalRepairs) * 100 : 0
    };
  }, [repairs]);

  // Generate chart data
  const chartData = useMemo(() => {
    // Weekly repair trends
    const weeklyData = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayRepairs = repairs.filter(r => {
        const repairDate = new Date(r.createdAt);
        return repairDate.toDateString() === date.toDateString();
      });
      
      weeklyData.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        repairs: dayRepairs.length,
        revenue: dayRepairs.reduce((sum, r) => sum + r.totalCost, 0),
        completed: dayRepairs.filter(r => r.status === 'completed').length
      });
    }

    // Monthly revenue data
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      const monthRepairs = repairs.filter(r => {
        const repairDate = new Date(r.createdAt);
        return repairDate.getMonth() === date.getMonth() && 
               repairDate.getFullYear() === date.getFullYear();
      });
      
      monthlyData.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        revenue: monthRepairs.reduce((sum, r) => sum + r.totalCost, 0),
        repairs: monthRepairs.length
      });
    }

    // Repair type distribution
    const repairTypes = repairs.reduce((acc, repair) => {
      const type = repair.reportedIssues.toLowerCase().includes('engine') ? 'Engine' :
                  repair.reportedIssues.toLowerCase().includes('brake') ? 'Brake' :
                  repair.reportedIssues.toLowerCase().includes('electrical') ? 'Electrical' :
                  repair.reportedIssues.toLowerCase().includes('ac') ? 'AC' : 'Other';
      
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const pieData = Object.entries(repairTypes).map(([name, value]) => ({ name, value }));

    return {
      weeklyData,
      monthlyData,
      pieData
    };
  }, [repairs]);

  // Mechanic performance data for charts
  const mechanicChartData = useMemo(() => {
    return mockMechanics.map(mechanic => ({
      name: mechanic.name,
      efficiency: mechanic.efficiency,
      revenue: mechanic.revenue,
      satisfaction: mechanic.customerSatisfaction * 20, // Convert to percentage
      completed: mechanic.completedRepairs
    }));
  }, [mockMechanics]);

  // COLORS for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <ChartBarIcon className="w-6 h-6 text-primary" />
          <h2 className="text-responsive-xl font-semibold text-slate-900 dark:text-slate-100">
            Repair Analytics Dashboard
          </h2>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            ✕
          </Button>
        )}
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-glass">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <WrenchScrewdriverIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Repairs</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {analyticsMetrics.totalRepairs}
              </p>
            </div>
          </div>
        </Card>

        <Card className="card-glass">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Completion Rate</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {analyticsMetrics.completionRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </Card>

        <Card className="card-glass">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <CurrencyDollarIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Revenue</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                ${analyticsMetrics.totalRevenue.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        <Card className="card-glass">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <StarIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Satisfaction</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {analyticsMetrics.satisfactionScore.toFixed(1)}/5
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Repair Trends */}
        <Card className="card-glass">
          <h3 className="text-responsive-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
            Weekly Repair Trends
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="repairs" 
                stroke="#8884d8" 
                strokeWidth={2}
                name="Total Repairs"
              />
              <Line 
                type="monotone" 
                dataKey="completed" 
                stroke="#82ca9d" 
                strokeWidth={2}
                name="Completed"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Monthly Revenue */}
        <Card className="card-glass">
          <h3 className="text-responsive-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
            Monthly Revenue
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#8884d8" name="Revenue ($)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Repair Type Distribution */}
        <Card className="card-glass">
          <h3 className="text-responsive-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
            Repair Type Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData.pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Mechanic Performance */}
        <Card className="card-glass">
          <h3 className="text-responsive-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
            Mechanic Performance
          </h3>
          <div className="space-y-4">
            <div className="flex space-x-2 mb-4">
              {(['efficiency', 'revenue', 'satisfaction'] as const).map((metric) => (
                <Button
                  key={metric}
                  onClick={() => setSelectedMetric(metric)}
                  variant={selectedMetric === metric ? 'default' : 'outline'}
                  size="sm"
                  className="capitalize"
                >
                  {metric}
                </Button>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={mechanicChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar 
                  dataKey={selectedMetric} 
                  fill={selectedMetric === 'efficiency' ? '#82ca9d' : 
                        selectedMetric === 'revenue' ? '#8884d8' : '#ffc658'} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Mechanic Performance Table */}
      <Card className="card-glass">
        <h3 className="text-responsive-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
          Mechanic Performance Details
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left p-3 text-sm font-medium text-slate-600 dark:text-slate-400">Mechanic</th>
                <th className="text-left p-3 text-sm font-medium text-slate-600 dark:text-slate-400">Completed</th>
                <th className="text-left p-3 text-sm font-medium text-slate-600 dark:text-slate-400">Avg Time (hrs)</th>
                <th className="text-left p-3 text-sm font-medium text-slate-600 dark:text-slate-400">Satisfaction</th>
                <th className="text-left p-3 text-sm font-medium text-slate-600 dark:text-slate-400">Revenue</th>
                <th className="text-left p-3 text-sm font-medium text-slate-600 dark:text-slate-400">Efficiency</th>
              </tr>
            </thead>
            <tbody>
              {mockMechanics.map((mechanic) => (
                <tr key={mechanic.id} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="p-3 text-sm font-medium text-slate-900 dark:text-slate-100">
                    {mechanic.name}
                  </td>
                  <td className="p-3 text-sm text-slate-600 dark:text-slate-400">
                    {mechanic.completedRepairs}
                  </td>
                  <td className="p-3 text-sm text-slate-600 dark:text-slate-400">
                    {mechanic.averageTime}
                  </td>
                  <td className="p-3 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center space-x-1">
                      <span>{mechanic.customerSatisfaction}</span>
                      <StarIcon className="w-4 h-4 text-yellow-400" />
                    </div>
                  </td>
                  <td className="p-3 text-sm text-slate-600 dark:text-slate-400">
                    ${mechanic.revenue.toLocaleString()}
                  </td>
                  <td className="p-3 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center space-x-2">
                      <span>{mechanic.efficiency}%</span>
                      <div className="w-16 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${mechanic.efficiency}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default RepairAnalytics;

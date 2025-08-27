import React, { useState } from 'react';
import { 
  CurrencyDollarIcon,
  TruckIcon,
  WrenchScrewdriverIcon,
  UserGroupIcon,
  CubeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  CheckCircleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { useVehicles } from '../hooks/useVehicles';
import { useSales } from '../hooks/useSales';
import { useRepairs } from '../hooks/useRepairs';
import { useCustomers } from '../hooks/useCustomers';
import { useInventory } from '../hooks/useInventory';
import { useInvoices } from '../hooks/useInvoices';
import MainChart from '../components/organisms/charts/MainChart';
import DateRangeFilter from '../components/organisms/DateRangeFilter';
import RecentActivity from '../components/organisms/RecentActivity';
import QuickActions from '../components/organisms/QuickActions';
import RepairAnalytics from '../components/analytics/RepairAnalytics';

const DashboardHome: React.FC = () => {
  const { vehicles } = useVehicles();
  const { sales } = useSales();
  const { repairs } = useRepairs();
  const { customers } = useCustomers();
  const { inventory } = useInventory();
  const { invoices } = useInvoices();

  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    end: new Date()
  });

  // Calculate business metrics based on date range
  const getBusinessMetrics = () => {
    const totalVehicles = vehicles.length;
    const availableVehicles = vehicles.filter(v => v.status === 'available').length;
    const soldVehicles = vehicles.filter(v => v.status === 'sold').length;
    
    // Filter data based on date range
    const filteredSales = sales.filter(sale => {
      const saleDate = new Date(sale.createdAt);
      return saleDate >= dateRange.start && saleDate <= dateRange.end;
    });
    
    const filteredRepairs = repairs.filter(repair => {
      const repairDate = new Date(repair.createdAt);
      return repairDate >= dateRange.start && repairDate <= dateRange.end;
    });

    const totalSales = filteredSales.reduce((sum, sale) => sum + sale.salePrice, 0);
    const totalRepairs = repairs.length;
    const completedRepairs = repairs.filter(r => r.status === 'completed').length;
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.vehiclesOwned.length > 0).length;
    const totalInventory = inventory.length;
    const lowStockItems = inventory.filter(item => item.currentStock <= item.reorderLevel).length;
    const totalInvoices = invoices.length;
    const totalInvoiceAmount = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;

    return {
      totalVehicles,
      availableVehicles,
      soldVehicles,
      totalSales,
      totalRepairs,
      completedRepairs,
      totalCustomers,
      activeCustomers,
      totalInventory,
      lowStockItems,
      totalInvoices,
      totalInvoiceAmount,
      paidInvoices,
      recentSales: filteredSales.length,
      recentRepairs: filteredRepairs.length,
    };
  };

  // Generate chart data for sales
  const getSalesChartData = () => {
    const days = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
    const chartData = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date(dateRange.start);
      date.setDate(date.getDate() + i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      const daySales = sales.filter(sale => {
        const saleDate = new Date(sale.createdAt);
        return saleDate.toDateString() === date.toDateString();
      });
      
      const totalDaySales = daySales.reduce((sum, sale) => sum + sale.salePrice, 0);
      
      chartData.push({
        name: dateStr,
        sales: totalDaySales / 1000, // Convert to K
        count: daySales.length
      });
    }
    
    return chartData;
  };

  // Generate chart data for repairs
  const getRepairsChartData = () => {
    const days = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
    const chartData = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date(dateRange.start);
      date.setDate(date.getDate() + i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      const dayRepairs = repairs.filter(repair => {
        const repairDate = new Date(repair.createdAt);
        return repairDate.toDateString() === date.toDateString();
      });
      
      const completedDayRepairs = dayRepairs.filter(repair => repair.status === 'completed').length;
      
      chartData.push({
        name: dateStr,
        completed: completedDayRepairs,
        total: dayRepairs.length
      });
    }
    
    return chartData;
  };

  const metrics = getBusinessMetrics();
  const salesChartData = getSalesChartData();
  const repairsChartData = getRepairsChartData();

  const StatCard = ({ title, value, icon: Icon, color, trend, description, gradient }: {
    title: string;
    value: string | number;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    color: string;
    trend?: { value: number; isPositive: boolean };
    description?: string;
    gradient?: string;
  }) => (
    <div className="card-glass p-6 rounded-xl shadow-layered hover:shadow-glow hover:-translate-y-2 transition-all duration-300 group cursor-pointer interactive">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-responsive-sm font-medium text-muted-foreground mb-2">{title}</p>
          <p className="text-responsive-2xl font-bold text-foreground mb-2">{value}</p>
          {description && (
            <p className="text-responsive-xs text-muted-foreground mb-3">{description}</p>
          )}
          {trend && (
            <div className="flex items-center">
              {trend.isPositive ? (
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-2" />
              ) : (
                <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-2" />
              )}
              <span className={`text-responsive-sm font-medium ${trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {trend.value}% from last period
              </span>
            </div>
          )}
        </div>
        <div className={`p-4 rounded-xl ${gradient || `bg-gradient-to-br ${color}`} group-hover:shadow-lg transition-all duration-300 transform group-hover:scale-110 shadow-md`}>
          <Icon className="h-8 w-8 text-white" />
        </div>
      </div>
    </div>
  );

  const handleDateRangeChange = (startDate: Date, endDate: Date) => {
    setDateRange({ start: startDate, end: endDate });
  };

  const handleViewSale = (saleId: string) => {
    console.log('View sale:', saleId);
    // Navigate to sale details
  };

  const handleViewRepair = (repairId: string) => {
    console.log('View repair:', repairId);
    // Navigate to repair details
  };

  return (
    <div className="space-y-8 responsive-p">
      {/* Header */}
      <div className="card-glass p-6 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <h1 className="text-responsive-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-responsive-lg text-muted-foreground">Business overview and key metrics for your automotive business</p>
      </div>

      {/* Date Range Filter */}
      <DateRangeFilter onDateRangeChange={handleDateRangeChange} />

      {/* Key Metrics */}
      <div className="fluid-grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Sales"
          value={`K${metrics.totalSales.toLocaleString()}`}
          icon={CurrencyDollarIcon}
          color="from-green-500 to-green-400"
          gradient="bg-gradient-to-br from-green-500 via-green-400 to-emerald-400"
          trend={{ value: 12, isPositive: true }}
          description={`${metrics.recentSales} sales in selected period`}
        />
        <StatCard
          title="Available Vehicles"
          value={metrics.availableVehicles}
          icon={TruckIcon}
          color="from-blue-500 to-blue-400"
          gradient="bg-gradient-to-br from-blue-500 via-blue-400 to-cyan-400"
          description={`${metrics.totalVehicles} total vehicles`}
        />
        <StatCard
          title="Active Repairs"
          value={metrics.totalRepairs - metrics.completedRepairs}
          icon={WrenchScrewdriverIcon}
          color="from-yellow-500 to-yellow-400"
          gradient="bg-gradient-to-br from-yellow-500 via-amber-400 to-orange-400"
          description={`${metrics.completedRepairs} completed`}
        />
        <StatCard
          title="Total Customers"
          value={metrics.totalCustomers}
          icon={UserGroupIcon}
          color="from-purple-500 to-purple-400"
          gradient="bg-gradient-to-br from-purple-500 via-violet-400 to-indigo-400"
          trend={{ value: 8, isPositive: true }}
          description={`${metrics.activeCustomers} active customers`}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="fluid-grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Inventory Items"
          value={metrics.totalInventory}
          icon={CubeIcon}
          color="from-indigo-500 to-indigo-400"
          gradient="bg-gradient-to-br from-indigo-500 via-purple-400 to-pink-400"
        />
        <StatCard
          title="Low Stock Items"
          value={metrics.lowStockItems}
          icon={ClockIcon}
          color="from-red-500 to-red-400"
          gradient="bg-gradient-to-br from-red-500 via-pink-400 to-rose-400"
        />
        <StatCard
          title="Paid Invoices"
          value={`${metrics.paidInvoices}/${metrics.totalInvoices}`}
          icon={CheckCircleIcon}
          color="from-green-600 to-green-500"
          gradient="bg-gradient-to-br from-green-600 via-emerald-500 to-teal-500"
        />
      </div>

      {/* Sales & Repairs Overview Charts */}
      <div className="card-glass p-6 rounded-xl shadow-layered">
        <h3 className="text-responsive-xl font-semibold text-foreground mb-6">Sales & Repairs Overview</h3>
        <div className="fluid-grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="text-responsive-lg font-medium text-muted-foreground">Daily Sales Performance</h4>
            <MainChart
              data={salesChartData}
              type="bar"
              dataKey="sales"
              title="Daily Sales (K)"
              height={300}
            />
          </div>
          <div className="space-y-4">
            <h4 className="text-responsive-lg font-medium text-muted-foreground">Repair Completion Trends</h4>
            <MainChart
              data={repairsChartData}
              type="line"
              dataKey="completed"
              title="Completed Repairs"
              height={300}
            />
          </div>
        </div>
      </div>

      {/* Repair Analytics */}
      <div className="card-glass p-6 rounded-xl shadow-layered">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-responsive-xl font-semibold text-foreground flex items-center space-x-2">
            <ChartBarIcon className="w-6 h-6 text-primary" />
            <span>Advanced Repair Analytics</span>
          </h3>
        </div>
        <RepairAnalytics
          repairs={repairs}
        />
      </div>

      {/* Recent Activity */}
      <RecentActivity
        sales={sales.slice(0, 5).map(sale => ({
          ...sale,
          createdAt: sale.createdAt instanceof Date ? sale.createdAt.toISOString() : sale.createdAt
        }))}
        repairs={repairs.slice(0, 5).map(repair => ({
          ...repair,
          createdAt: repair.createdAt instanceof Date ? repair.createdAt.toISOString() : repair.createdAt
        }))}
        onViewSale={handleViewSale}
        onViewRepair={handleViewRepair}
      />

      {/* Quick Actions */}
      <QuickActions />
    </div>
  );
};

export default DashboardHome; 
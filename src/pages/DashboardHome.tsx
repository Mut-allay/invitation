import React from 'react';
import { 
  CurrencyDollarIcon,
  TruckIcon,
  WrenchScrewdriverIcon,
  UserGroupIcon,
  CubeIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useVehicles } from '../hooks/useVehicles';
import { useSales } from '../hooks/useSales';
import { useRepairs } from '../hooks/useRepairs';
import { useCustomers } from '../hooks/useCustomers';
import { useInventory } from '../hooks/useInventory';
import { useInvoices } from '../hooks/useInvoices';

const DashboardHome: React.FC = () => {
  const { vehicles } = useVehicles();
  const { sales } = useSales();
  const { repairs } = useRepairs();
  const { customers } = useCustomers();
  const { inventory } = useInventory();
  const { invoices } = useInvoices();

  // Calculate business metrics
  const getBusinessMetrics = () => {
    const totalVehicles = vehicles.length;
    const availableVehicles = vehicles.filter(v => v.status === 'available').length;
    const soldVehicles = vehicles.filter(v => v.status === 'sold').length;
    const totalSales = sales.reduce((sum, sale) => sum + sale.salePrice, 0);
    const totalRepairs = repairs.length;
    const completedRepairs = repairs.filter(r => r.status === 'completed').length;
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.vehiclesOwned.length > 0).length;
    const totalInventory = inventory.length;
    const lowStockItems = inventory.filter(item => item.currentStock <= item.reorderLevel).length;
    const totalInvoices = invoices.length;
    const totalInvoiceAmount = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;

    // Calculate monthly trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentSales = sales.filter(sale => new Date(sale.createdAt) > thirtyDaysAgo);
    const recentRepairs = repairs.filter(repair => new Date(repair.createdAt) > thirtyDaysAgo);
    const recentCustomers = customers.filter(customer => new Date(customer.createdAt) > thirtyDaysAgo);

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
      recentSales: recentSales.length,
      recentRepairs: recentRepairs.length,
      recentCustomers: recentCustomers.length,
    };
  };

  const metrics = getBusinessMetrics();

  const StatCard = ({ title, value, icon: Icon, color, trend }: {
    title: string;
    value: string | number;
    icon: any;
    color: string;
    trend?: { value: number; isPositive: boolean };
  }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className="flex items-center mt-2">
              {trend.isPositive ? (
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trend.value}% from last month
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Business overview and key metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Sales"
          value={`K${metrics.totalSales.toLocaleString()}`}
          icon={CurrencyDollarIcon}
          color="bg-green-500"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Available Vehicles"
          value={metrics.availableVehicles}
          icon={TruckIcon}
          color="bg-blue-500"
        />
        <StatCard
          title="Active Repairs"
          value={metrics.totalRepairs - metrics.completedRepairs}
          icon={WrenchScrewdriverIcon}
          color="bg-yellow-500"
        />
        <StatCard
          title="Total Customers"
          value={metrics.totalCustomers}
          icon={UserGroupIcon}
          color="bg-purple-500"
          trend={{ value: 8, isPositive: true }}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Inventory Items"
          value={metrics.totalInventory}
          icon={CubeIcon}
          color="bg-indigo-500"
        />
        <StatCard
          title="Low Stock Items"
          value={metrics.lowStockItems}
          icon={ClockIcon}
          color="bg-red-500"
        />
        <StatCard
          title="Paid Invoices"
          value={`${metrics.paidInvoices}/${metrics.totalInvoices}`}
          icon={CheckCircleIcon}
          color="bg-green-600"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Sales</h3>
          <div className="space-y-3">
            {sales.slice(0, 5).map((sale) => (
              <div key={sale.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Sale #{sale.id.slice(-6)}</p>
                  <p className="text-sm text-gray-600">Customer ID: {sale.customerId.slice(-6)}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">K{sale.salePrice.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(sale.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Repairs */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Repairs</h3>
          <div className="space-y-3">
            {repairs.slice(0, 5).map((repair) => (
              <div key={repair.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Repair #{repair.id.slice(-6)}</p>
                  <p className="text-sm text-gray-600">{repair.reportedIssues.slice(0, 30)}...</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    repair.status === 'completed' ? 'bg-green-100 text-green-800' :
                    repair.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {repair.status.charAt(0).toUpperCase() + repair.status.slice(1).replace('_', ' ')}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(repair.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <TruckIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Add Vehicle</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <WrenchScrewdriverIcon className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">New Repair</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <UserGroupIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Add Customer</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <DocumentTextIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Create Invoice</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome; 
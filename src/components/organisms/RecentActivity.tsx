import React, { useState } from 'react';
import { 
  EyeIcon,
  CurrencyDollarIcon,
  WrenchScrewdriverIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface Sale {
  id: string;
  customerId: string;
  amount: number; // Changed from salePrice to match actual data
  createdAt: string;
}

interface Repair {
  id: string;
  reportedIssues: string;
  status: string;
  createdAt: string;
}

interface RecentActivityProps {
  sales: Sale[];
  repairs: Repair[];
  onViewSale?: (saleId: string) => void;
  onViewRepair?: (repairId: string) => void;
  className?: string;
}

const RecentActivity: React.FC<RecentActivityProps> = ({
  sales,
  repairs,
  onViewSale,
  onViewRepair,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'sales' | 'repairs'>('sales');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <ClockIcon className="h-4 w-4 text-blue-500" />;
      default:
        return <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>
      {/* Header with Tabs */}
      <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="flex">
          <button
            onClick={() => setActiveTab('sales')}
            className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-all duration-200 ${
              activeTab === 'sales'
                ? 'border-blue-500 text-blue-600 bg-white shadow-sm'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center space-x-3">
              <div className={`p-2 rounded-lg ${activeTab === 'sales' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <CurrencyDollarIcon className="h-5 w-5" />
              </div>
              <span className="font-semibold">Recent Sales</span>
              <span className="bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
                {sales.length}
              </span>
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('repairs')}
            className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-all duration-200 ${
              activeTab === 'repairs'
                ? 'border-blue-500 text-blue-600 bg-white shadow-sm'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center space-x-3">
              <div className={`p-2 rounded-lg ${activeTab === 'repairs' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <WrenchScrewdriverIcon className="h-5 w-5" />
              </div>
              <span className="font-semibold">Recent Repairs</span>
              <span className="bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
                {repairs.length}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'sales' ? (
          <div className="space-y-4">
            {sales.slice(0, 5).map((sale) => (
              <div
                key={sale.id}
                className="group flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 hover:shadow-md hover:-translate-y-1 border border-gray-200 hover:border-blue-200"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <p className="font-semibold text-gray-900">Sale #{sale.id.slice(-6)}</p>
                    <span className="text-xs text-gray-400">•</span>
                    <p className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">Customer ID: {sale.customerId.slice(-6)}</p>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {formatDate(sale.createdAt)}
                  </p>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-bold text-green-600 text-lg">
                      K{(sale.amount || 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">Sale Amount</p>
                  </div>
                  
                  {onViewSale && (
                    <button
                      onClick={() => onViewSale(sale.id)}
                      className="opacity-0 group-hover:opacity-100 transition-all duration-300 p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg hover:shadow-sm transform hover:scale-105"
                      title="View Details"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            {sales.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CurrencyDollarIcon className="h-8 w-8 text-gray-300" />
                </div>
                <p className="text-lg font-medium">No recent sales</p>
                <p className="text-sm">Sales will appear here once transactions are made</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {repairs.slice(0, 5).map((repair) => (
              <div
                key={repair.id}
                className="group flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-yellow-50 hover:to-orange-50 transition-all duration-300 hover:shadow-md hover:-translate-y-1 border border-gray-200 hover:border-yellow-200"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    <p className="font-semibold text-gray-900">Repair #{repair.id.slice(-6)}</p>
                    <span className="text-xs text-gray-400">•</span>
                    {getStatusIcon(repair.status)}
                    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(repair.status)}`}>
                      {repair.status.charAt(0).toUpperCase() + repair.status.slice(1).replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2 line-clamp-2 max-w-md">
                    {repair.reportedIssues}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(repair.createdAt)}
                  </p>
                </div>
                
                {onViewRepair && (
                  <button
                    onClick={() => onViewRepair(repair.id)}
                    className="opacity-0 group-hover:opacity-100 transition-all duration-300 p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg hover:shadow-sm transform hover:scale-105"
                    title="View Details"
                  >
                    <EyeIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            ))}
            
            {repairs.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <WrenchScrewdriverIcon className="h-8 w-8 text-gray-300" />
                </div>
                <p className="text-lg font-medium">No recent repairs</p>
                <p className="text-sm">Repair jobs will appear here once they are logged</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;

import React from 'react';
import { 
  EyeIcon, 
  WrenchScrewdriverIcon, 
  ClockIcon,
  CurrencyDollarIcon,
  UserIcon,
  TruckIcon
} from '@heroicons/react/24/outline';
import { Repair } from '../../types/repair';

interface RepairCardProps {
  repair: Repair;
  onView: () => void;
  onAddJobCard: () => void;
}

export const RepairCard: React.FC<RepairCardProps> = ({ repair, onView, onAddJobCard }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Repair #{repair.id.slice(-6)}
            </h3>
            <p className="text-sm text-gray-600">
              {formatDate(repair.createdAt)}
            </p>
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(repair.status)}`}>
            {repair.status.charAt(0).toUpperCase() + repair.status.slice(1).replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Reported Issues */}
        <div>
          <label className="text-sm font-medium text-gray-600">Reported Issues</label>
          <p className="text-gray-900 mt-1 line-clamp-2">{repair.reportedIssues}</p>
        </div>

        {/* Customer & Vehicle Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <UserIcon className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">Customer ID: {repair.customerId.slice(-6)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <TruckIcon className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">Vehicle ID: {repair.vehicleId.slice(-6)}</span>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">Total Cost:</span>
            <span className="text-lg font-bold text-green-600">
              K{repair.totalCost.toLocaleString()}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Labor:</span>
              <span className="text-gray-700">K{repair.laborCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Parts:</span>
              <span className="text-gray-700">K{repair.partsCost.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Estimated Completion */}
        {repair.estimatedCompletion && (
          <div className="flex items-center space-x-2">
            <ClockIcon className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              Estimated: {formatDate(repair.estimatedCompletion)}
            </span>
          </div>
        )}

        {/* Notes */}
        {repair.notes && (
          <div>
            <label className="text-sm font-medium text-gray-600">Notes</label>
            <p className="text-gray-900 mt-1 text-sm line-clamp-2">{repair.notes}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex space-x-2 p-4 border-t border-gray-200">
        <button
          onClick={onView}
          className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center"
        >
          <EyeIcon className="h-4 w-4 mr-1" />
          View
        </button>
        {repair.status !== 'completed' && repair.status !== 'cancelled' && (
          <button
            onClick={onAddJobCard}
            className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <WrenchScrewdriverIcon className="h-4 w-4 mr-1" />
            Add Job
          </button>
        )}
      </div>
    </div>
  );
}; 
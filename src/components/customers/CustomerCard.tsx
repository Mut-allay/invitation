import React from 'react';
import { 
  EyeIcon, 
  PencilIcon, 
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  TruckIcon
} from '@heroicons/react/24/outline';
import type { Customer } from '../../types/index';

interface CustomerCardProps {
  customer: Customer;
  onView: () => void;
  onEdit: () => void;
}

export const CustomerCard: React.FC<CustomerCardProps> = ({ customer, onView, onEdit }) => {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{customer.name}</h3>
            <p className="text-sm text-gray-600">Customer since {formatDate(customer.createdAt)}</p>
          </div>
          <div className="flex space-x-1">
            <button
              onClick={onView}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <EyeIcon className="h-4 w-4" />
            </button>
            <button
              onClick={onEdit}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Contact Info */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <PhoneIcon className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-900">{customer.phone}</span>
          </div>
          
          {customer.email && (
            <div className="flex items-center space-x-2">
              <EnvelopeIcon className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-900">{customer.email}</span>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <MapPinIcon className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600 line-clamp-1">{customer.address}</span>
          </div>
        </div>

        {/* Customer Status */}
        <div className="pt-2 border-t border-gray-100">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">Status</span>
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
              Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}; 
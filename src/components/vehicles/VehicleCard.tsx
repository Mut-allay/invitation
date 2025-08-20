import React from 'react';
import { EyeIcon, CurrencyDollarIcon, TruckIcon } from '@heroicons/react/24/outline';
import { Vehicle } from '../../types/vehicle';

interface VehicleCardProps {
  vehicle: Vehicle;
  onView: () => void;
  onEdit?: () => void;
  onSale: () => void;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, onView, onEdit, onSale }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'sold':
        return 'bg-red-100 text-red-800';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_repair':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Vehicle Image */}
      <div className="aspect-w-16 aspect-h-9 bg-gray-200">
        {vehicle.images && vehicle.images.length > 0 ? (
          <img
            src={vehicle.images[0]}
            alt={`${vehicle.make} ${vehicle.model}`}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
            <TruckIcon className="h-12 w-12 text-gray-400" />
          </div>
        )}
      </div>

      {/* Vehicle Info */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {vehicle.make} {vehicle.model}
            </h3>
            <p className="text-sm text-gray-600">{vehicle.year}</p>
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(vehicle.status)}`}>
            {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
          </span>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Registration:</span>
            <span className="font-medium">{vehicle.regNumber}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">VIN:</span>
            <span className="font-medium font-mono">{vehicle.vin}</span>
          </div>
          {vehicle.mileage && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Mileage:</span>
              <span className="font-medium">{vehicle.mileage.toLocaleString()} km</span>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="border-t border-gray-200 pt-3 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Selling Price:</span>
            <span className="text-lg font-bold text-green-600">
              K{vehicle.sellingPrice.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <button
            onClick={onView}
            className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center"
          >
            <EyeIcon className="h-4 w-4 mr-1" />
            View
          </button>
          {onEdit && (
            <button
              onClick={onEdit}
              className="flex-1 bg-yellow-100 text-yellow-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-yellow-200 transition-colors flex items-center justify-center"
            >
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
          )}
          {vehicle.status === 'available' && (
            <button
              onClick={onSale}
              className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <CurrencyDollarIcon className="h-4 w-4 mr-1" />
              Sell
            </button>
          )}
        </div>
      </div>
    </div>
  );
}; 
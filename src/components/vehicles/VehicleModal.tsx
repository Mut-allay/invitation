import React from 'react';
import { XMarkIcon, TruckIcon, CalendarIcon } from '@heroicons/react/24/outline';
import type { Vehicle } from '../../types/index';

interface VehicleModalProps {
  vehicle: Vehicle;
  isOpen: boolean;
  onClose: () => void;
}

export const VehicleModal: React.FC<VehicleModalProps> = ({ vehicle, isOpen, onClose }) => {
  if (!isOpen) return null;

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {vehicle.make} {vehicle.model}
            </h2>
            <p className="text-gray-600">{vehicle.year} • {vehicle.regNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Vehicle Images */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Images</h3>
              {vehicle.images && vehicle.images.length > 0 ? (
                <div className="space-y-4">
                  {vehicle.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${vehicle.make} ${vehicle.model} - Image ${index + 1}`}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  ))}
                </div>
              ) : (
                <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                  <TruckIcon className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>

            {/* Vehicle Details */}
            <div className="space-y-6">
              {/* Status */}
              <div>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(vehicle.status)}`}>
                  {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
                </span>
              </div>

              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Vehicle Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Make</label>
                    <p className="text-gray-900">{vehicle.make}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Model</label>
                    <p className="text-gray-900">{vehicle.model}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Year</label>
                    <p className="text-gray-900">{vehicle.year}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Registration</label>
                    <p className="text-gray-900">{vehicle.regNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">VIN</label>
                    <p className="text-gray-900 font-mono">{vehicle.vin}</p>
                  </div>
                  {vehicle.mileage && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Mileage</label>
                      <p className="text-gray-900">{(vehicle.mileage || 0).toLocaleString()} km</p>
                    </div>
                  )}
                  {vehicle.color && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Color</label>
                      <p className="text-gray-900">{vehicle.color}</p>
                    </div>
                  )}
                  {vehicle.fuelType && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Fuel Type</label>
                      <p className="text-gray-900 capitalize">{vehicle.fuelType}</p>
                    </div>
                  )}
                  {vehicle.transmission && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Transmission</label>
                      <p className="text-gray-900 capitalize">{vehicle.transmission}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Pricing</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cost Price:</span>
                    <span className="font-medium">K{(vehicle.costPrice || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Selling Price:</span>
                    <span className="font-bold text-green-600 text-lg">K{(vehicle.sellingPrice || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Profit Margin:</span>
                    <span className="font-medium text-green-600">
                      K{((vehicle.sellingPrice || 0) - (vehicle.costPrice || 0)).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {vehicle.description && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">Description</h3>
                  <p className="text-gray-700">{vehicle.description}</p>
                </div>
              )}

              {/* Features */}
              {vehicle.features && vehicle.features.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">Features</h3>
                  <div className="flex flex-wrap gap-2">
                    {vehicle.features.map((feature, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Dates */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">Dates</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Added: {vehicle.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Updated: {vehicle.updatedAt.toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}; 
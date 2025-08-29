import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TruckIcon, 
  CurrencyDollarIcon, 
  CalendarIcon, 
  MapPinIcon,
  CogIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import type { Vehicle } from '@/types/index';

interface VehicleDetailViewProps {
  vehicle: Vehicle;
  onEdit?: () => void;
  onSale?: () => void;
}

const VehicleDetailView: React.FC<VehicleDetailViewProps> = ({ vehicle, onEdit, onSale }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'sold':
        return 'bg-red-100 text-red-800';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      {/* Vehicle Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
            <TruckIcon className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{vehicle.make} {vehicle.model}</h2>
            <p className="text-gray-600">Vehicle ID: {vehicle.id}</p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 bg-gray-100 text-gray-800">
              Available
            </span>
          </div>
        </div>
        <div className="flex space-x-2">
          {onEdit && (
            <Button onClick={onEdit} variant="outline">
              Edit
            </Button>
          )}
          {onSale && (
            <Button onClick={onSale}>
              Start Sale
            </Button>
          )}
        </div>
      </div>

      {/* Vehicle Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TruckIcon className="h-5 w-5" />
            <span>Vehicle Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <DocumentTextIcon className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Registration Number</p>
                <p className="text-sm text-gray-600">{vehicle.regNumber}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <CogIcon className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">VIN</p>
                <p className="text-sm text-gray-600">{vehicle.vin}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Year</p>
                <p className="text-sm text-gray-600">{vehicle.year}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MapPinIcon className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Color</p>
                <p className="text-sm text-gray-600">{vehicle.color}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CurrencyDollarIcon className="h-5 w-5" />
            <span>Pricing Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-900">Cost Price</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(vehicle.costPrice || 0)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Selling Price</p>
              <p className="text-lg font-bold text-blue-600">{formatCurrency(vehicle.sellingPrice || 0)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Potential Profit</p>
              <p className="text-lg font-bold text-green-600">
                {formatCurrency((vehicle.sellingPrice || 0) - (vehicle.costPrice || 0))}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Profit Margin</p>
              <p className="text-lg font-bold text-green-600">
                {vehicle.costPrice ? ((((vehicle.sellingPrice || 0) - vehicle.costPrice) / vehicle.costPrice) * 100).toFixed(1) : '0.0'}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technical Specifications */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Specifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-900">Engine</p>
              <p className="text-sm text-gray-600">Not specified</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Transmission</p>
              <p className="text-sm text-gray-600">{vehicle.transmission || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Fuel Type</p>
              <p className="text-sm text-gray-600">{vehicle.fuelType || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Mileage</p>
              <p className="text-sm text-gray-600">{vehicle.mileage ? `${(vehicle.mileage || 0).toLocaleString()} km` : 'Not specified'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Condition & History */}
      <Card>
        <CardHeader>
          <CardTitle>Condition & History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-900 mb-2">Condition</p>
            <p className="text-sm text-gray-600">Not specified</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 mb-2">Notes</p>
            <p className="text-sm text-gray-600">{vehicle.description || 'No additional notes'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-12">
              View Photos
            </Button>
            <Button variant="outline" className="h-12">
              Service History
            </Button>
            <Button variant="outline" className="h-12">
              Update Status
            </Button>
            <Button variant="outline" className="h-12">
              Generate Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VehicleDetailView;

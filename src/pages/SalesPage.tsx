import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon,
  EyeIcon,
  CurrencyDollarIcon,
  TruckIcon
} from '@heroicons/react/24/outline';
import { VehicleCard } from '../components/vehicles/VehicleCard';
import { VehicleModal } from '../components/vehicles/VehicleModal';
import { SaleModal } from '../components/sales/SaleModal';
import { useVehicles } from '../hooks/useVehicles';
import { Vehicle } from '../types/vehicle';

const SalesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMake, setSelectedMake] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showSaleModal, setShowSaleModal] = useState(false);

  const { vehicles, loading, error } = useVehicles();

  const makes = [...new Set(vehicles.map(v => v.make))];
  const statuses = ['available', 'sold', 'reserved'];

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.regNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesMake = !selectedMake || vehicle.make === selectedMake;
    const matchesStatus = !selectedStatus || vehicle.status === selectedStatus;
    
    const matchesPrice = (!priceRange.min || vehicle.sellingPrice >= parseInt(priceRange.min)) &&
                        (!priceRange.max || vehicle.sellingPrice <= parseInt(priceRange.max));

    return matchesSearch && matchesMake && matchesStatus && matchesPrice;
  });

  const handleViewVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setShowVehicleModal(true);
  };

  const handleStartSale = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setShowSaleModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Management</h1>
          <p className="text-gray-600">Manage vehicle sales and customer transactions</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700">
          <PlusIcon className="h-5 w-5" />
          <span>Add Vehicle</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search vehicles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Make Filter */}
          <select
            value={selectedMake}
            onChange={(e) => setSelectedMake(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Makes</option>
            {makes.map(make => (
              <option key={make} value={make}>{make}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            {statuses.map(status => (
              <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
            ))}
          </select>

          {/* Price Range */}
          <div className="flex space-x-2">
            <input
              type="number"
              placeholder="Min Price"
              value={priceRange.min}
              onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
              className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="number"
              placeholder="Max Price"
              value={priceRange.max}
              onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
              className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TruckIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Available Vehicles</p>
              <p className="text-2xl font-bold text-gray-900">
                {vehicles.filter(v => v.status === 'available').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">
                K{vehicles.filter(v => v.status === 'available').reduce((sum, v) => sum + v.sellingPrice, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <EyeIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Reserved</p>
              <p className="text-2xl font-bold text-gray-900">
                {vehicles.filter(v => v.status === 'reserved').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicle Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading vehicles: {error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredVehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onView={() => handleViewVehicle(vehicle)}
              onSale={() => handleStartSale(vehicle)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {selectedVehicle && (
        <>
          <VehicleModal
            vehicle={selectedVehicle}
            isOpen={showVehicleModal}
            onClose={() => setShowVehicleModal(false)}
          />
          <SaleModal
            vehicle={selectedVehicle}
            isOpen={showSaleModal}
            onClose={() => setShowSaleModal(false)}
          />
        </>
      )}
    </div>
  );
};

export default SalesPage; 
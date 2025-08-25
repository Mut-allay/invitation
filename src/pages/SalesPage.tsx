import React, { useState } from 'react';
import { PlusIcon, MagnifyingGlassIcon, TruckIcon, CurrencyDollarIcon, EyeIcon } from '@heroicons/react/24/outline';
import { useVehicles } from '../hooks/useVehicles';
import { useSales } from '../hooks/useSales';
import { useCustomers } from '../hooks/useCustomers';
import { VehicleCard } from '../components/vehicles/VehicleCard';
import { VehicleModal } from '../components/vehicles/VehicleModal';
import { SaleModal } from '../components/sales/SaleModal';
import VehicleDetailView from '../components/vehicles/VehicleDetailView';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { getErrorMessage } from '@/lib/utils';
import type { Vehicle } from '../types/index';

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
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setShowVehicleModal(true);
  };

  const handleStartSale = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setShowSaleModal(true);
  };

  const handleEditFromDetail = () => {
    if (selectedVehicle) {
      handleEditVehicle(selectedVehicle);
    }
  };

  const handleSaleFromDetail = () => {
    if (selectedVehicle) {
      handleStartSale(selectedVehicle);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Left Pane - Vehicle List */}
        <ResizablePanel defaultSize={40} minSize={30}>
          <div className="h-full flex flex-col p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Sales Management</h1>
                <p className="text-muted-foreground">Manage vehicle sales and customer transactions</p>
              </div>
              <Button className="flex items-center space-x-2">
                <PlusIcon className="h-5 w-5" />
                <span>Add Vehicle</span>
              </Button>
            </div>

            {/* Search and Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Search */}
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search vehicles..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
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
                    <Input
                      type="number"
                      placeholder="Min Price"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                      className="w-1/2"
                    />
                    <Input
                      type="number"
                      placeholder="Max Price"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                      className="w-1/2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <TruckIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Available Vehicles</p>
                      <p className="text-2xl font-bold text-foreground">
                        {vehicles.filter(v => v.status === 'available').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                      <p className="text-2xl font-bold text-foreground">
                        K{vehicles.filter(v => v.status === 'available').reduce((sum, v) => sum + v.sellingPrice, 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <EyeIcon className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Reserved</p>
                      <p className="text-2xl font-bold text-foreground">
                        {vehicles.filter(v => v.status === 'reserved').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Vehicle List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : error ? (
                <Card>
                  <CardContent className="p-4">
                    <p className="text-destructive">Error loading vehicles: {getErrorMessage(error)}</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {filteredVehicles.map((vehicle) => (
                    <div
                      key={vehicle.id}
                      className={`cursor-pointer transition-all duration-200 ${
                        selectedVehicle?.id === vehicle.id
                          ? 'ring-2 ring-blue-500 ring-offset-2'
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => handleViewVehicle(vehicle)}
                    >
                      <VehicleCard
                        vehicle={vehicle}
                        onView={() => handleViewVehicle(vehicle)}
                        onSale={() => handleStartSale(vehicle)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ResizablePanel>

        {/* Resizable Handle */}
        <ResizableHandle withHandle />

        {/* Right Pane - Vehicle Detail */}
        <ResizablePanel defaultSize={60} minSize={40}>
          <div className="h-full bg-gray-50">
            {selectedVehicle ? (
              <VehicleDetailView
                vehicle={selectedVehicle}
                onEdit={handleEditFromDetail}
                onSale={handleSaleFromDetail}
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TruckIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Select a vehicle</h3>
                  <p className="text-muted-foreground">Choose a vehicle from the list to view its details</p>
                </div>
              </div>
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

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
import React from 'react';
import { useMockVehicles } from '../hooks/useMockVehicles';
import { Vehicle } from '../types/vehicle';

const VehicleDemo: React.FC = () => {
  const { 
    vehicles, 
    loading, 
    error, 
    searchVehicles, 
    filterByStatus,
    resetVehicles 
  } = useMockVehicles();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    if (query.trim()) {
      searchVehicles(query);
    } else {
      resetVehicles();
    }
  };

  const handleStatusFilter = (status: Vehicle['status'] | 'all') => {
    if (status === 'all') {
      resetVehicles();
    } else {
      filterByStatus(status);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading vehicles...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-xl">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Vehicle Management Demo
          </h1>
          <p className="text-gray-600">
            This is a UI/UX demo using mock data. No backend required!
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="flex-1 min-w-64">
              <input
                type="text"
                placeholder="Search vehicles..."
                onChange={handleSearch}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => handleStatusFilter('all')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                All
              </button>
              <button
                onClick={() => handleStatusFilter('available')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Available
              </button>
              <button
                onClick={() => handleStatusFilter('sold')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Sold
              </button>
              <button
                onClick={() => handleStatusFilter('reserved')}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Reserved
              </button>
              <button
                onClick={() => handleStatusFilter('in_repair')}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                In Repair
              </button>
            </div>
          </div>
        </div>

        {/* Vehicle Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              {/* Image */}
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                {vehicle.images && vehicle.images.length > 0 ? (
                  <img
                    src={vehicle.images[0]}
                    alt={`${vehicle.make} ${vehicle.model}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const nextSibling = target.nextElementSibling as HTMLElement;
                      if (nextSibling) {
                        nextSibling.style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <div className="hidden text-gray-500 text-center p-4">
                  <div className="text-4xl mb-2">🚗</div>
                  <div>No Image</div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {vehicle.make} {vehicle.model}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    vehicle.status === 'available' ? 'bg-green-100 text-green-800' :
                    vehicle.status === 'sold' ? 'bg-red-100 text-red-800' :
                    vehicle.status === 'reserved' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {vehicle.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <p className="text-gray-600 mb-4">{vehicle.year} • {vehicle.regNumber}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Cost Price:</span>
                    <span className="font-medium">K{(vehicle.costPrice || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Selling Price:</span>
                    <span className="font-medium text-green-600">K{(vehicle.sellingPrice || 0).toLocaleString()}</span>
                  </div>
                  {vehicle.mileage && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Mileage:</span>
                      <span className="font-medium">{(vehicle.mileage || 0).toLocaleString()} km</span>
                    </div>
                  )}
                </div>

                {vehicle.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {vehicle.description}
                  </p>
                )}

                {/* Features */}
                {vehicle.features && vehicle.features.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm text-gray-500 mb-2">Features:</div>
                    <div className="flex flex-wrap gap-1">
                      {vehicle.features.slice(0, 3).map((feature, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                        >
                          {feature}
                        </span>
                      ))}
                      {vehicle.features.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          +{vehicle.features.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    View Details
                  </button>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {vehicles.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🚗</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No vehicles found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Stats */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{vehicles.length}</div>
              <div className="text-sm text-gray-600">Total Vehicles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {vehicles.filter(v => v.status === 'available').length}
              </div>
              <div className="text-sm text-gray-600">Available</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {vehicles.filter(v => v.status === 'sold').length}
              </div>
              <div className="text-sm text-gray-600">Sold</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {vehicles.filter(v => v.status === 'reserved').length}
              </div>
              <div className="text-sm text-gray-600">Reserved</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDemo;

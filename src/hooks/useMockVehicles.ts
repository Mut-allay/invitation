import { useState, useEffect } from 'react';
import type { Vehicle } from '../types/index';

// Mock vehicle data
const mockVehicles: Vehicle[] = [
  {
    id: '1',
    tenantId: 'demo-tenant',
    vin: 'ABC123456789',
    regNumber: 'ABC123',
    make: 'Toyota',
    model: 'Corolla',
    year: 2020,
    status: 'available',
    costPrice: 15000,
    sellingPrice: 18000,
    images: [],
    description: 'Well maintained vehicle',
    mileage: 50000,
    fuelType: 'petrol',
    transmission: 'automatic',
    color: 'White',
    features: ['Air Conditioning', 'Bluetooth'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    tenantId: 'demo-tenant',
    vin: 'XYZ987654321',
    regNumber: 'XYZ987',
    make: 'Honda',
    model: 'Civic',
    year: 2021,
    status: 'sold',
    costPrice: 16000,
    sellingPrice: 19000,
    images: [],
    description: 'Excellent condition',
    mileage: 30000,
    fuelType: 'petrol',
    transmission: 'manual',
    color: 'Blue',
    features: ['Navigation', 'Backup Camera'],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-02-01'),
  },
];

export const useMockVehicles = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setVehicles(mockVehicles);
      setFilteredVehicles(mockVehicles);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const searchVehicles = (query: string) => {
    const filtered = vehicles.filter(vehicle =>
      vehicle.make.toLowerCase().includes(query.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(query.toLowerCase()) ||
      vehicle.regNumber.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredVehicles(filtered);
  };

  const filterByStatus = (status: Vehicle['status']) => {
    const filtered = vehicles.filter(vehicle => vehicle.status === status);
    setFilteredVehicles(filtered);
  };

  const resetVehicles = () => {
    setFilteredVehicles(vehicles);
  };

  return { 
    vehicles: filteredVehicles, 
    loading, 
    error,
    searchVehicles,
    filterByStatus,
    resetVehicles
  };
}; 
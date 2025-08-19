import { vehiclesApi } from '../vehiclesApi';
import { configureStore } from '@reduxjs/toolkit';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('vehiclesApi', () => {
  let store: ReturnType<typeof setupStore>;

  const setupStore = () => {
    return configureStore({
      reducer: {
        [vehiclesApi.reducerPath]: vehiclesApi.reducer,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(vehiclesApi.middleware),
    });
  };

  beforeEach(() => {
    store = setupStore();
    mockFetch.mockClear();
  });

  describe('getVehicles', () => {
    it('fetches vehicles successfully', async () => {
      const mockVehicles = [
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
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockVehicles,
        clone: function() { return this; },
      });

      const result = await store.dispatch(
        vehiclesApi.endpoints.getVehicles.initiate('demo-tenant')
      );

      expect(result.data).toEqual(mockVehicles);
      expect('data' in result).toBe(true);
    });

    it('handles network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await store.dispatch(
        vehiclesApi.endpoints.getVehicles.initiate('demo-tenant')
      );

      expect(result.error).toBeDefined();
      expect(result.isError).toBe(true);
    });
  });

  describe('getVehicle', () => {
    it('fetches a single vehicle successfully', async () => {
      const mockVehicle = {
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
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockVehicle,
        clone: function() { return this; },
      });

      const result = await store.dispatch(
        vehiclesApi.endpoints.getVehicle.initiate({
          tenantId: 'demo-tenant',
          vehicleId: '1',
        })
      );

      expect(result.data).toEqual(mockVehicle);
      expect('data' in result).toBe(true);
    });

    it('handles vehicle not found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        clone: function() { return this; },
      });

      const result = await store.dispatch(
        vehiclesApi.endpoints.getVehicle.initiate({
          tenantId: 'demo-tenant',
          vehicleId: 'non-existent',
        })
      );

      expect(result.error).toBeDefined();
      expect(result.isError).toBe(true);
    });
  });

  describe('createVehicle', () => {
    it('creates a vehicle successfully', async () => {
      const newVehicle = {
        tenantId: 'demo-tenant',
        vehicle: {
          vin: 'XYZ987654321',
          regNumber: 'XYZ987',
          make: 'Honda',
          model: 'Civic',
          year: 2021,
          costPrice: 16000,
          sellingPrice: 19000,
          description: 'New vehicle',
          mileage: 30000,
          fuelType: 'petrol' as const,
          transmission: 'manual' as const,
          color: 'Blue',
          features: ['Navigation'],
        },
      };

      const mockCreatedVehicle = {
        id: 'new-id',
        ...newVehicle.vehicle,
        tenantId: 'demo-tenant',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCreatedVehicle,
        clone: function() { return this; },
      });

      const result = await store.dispatch(
        vehiclesApi.endpoints.createVehicle.initiate(newVehicle)
      );

      expect(result.data).toEqual(mockCreatedVehicle);
      expect('data' in result).toBe(true);
    });
  });

  describe('updateVehicle', () => {
    it('updates a vehicle successfully', async () => {
      const updateData = {
        tenantId: 'demo-tenant',
        vehicleId: '1',
        vehicle: {
          sellingPrice: 20000,
          description: 'Updated description',
        },
      };

      const mockUpdatedVehicle = {
        id: '1',
        ...updateData.vehicle,
        tenantId: 'demo-tenant',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUpdatedVehicle,
        clone: function() { return this; },
      });

      const result = await store.dispatch(
        vehiclesApi.endpoints.updateVehicle.initiate(updateData)
      );

      expect(result.data).toEqual(mockUpdatedVehicle);
      expect('data' in result).toBe(true);
    });
  });

  describe('deleteVehicle', () => {
    it('deletes a vehicle successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
        clone: function() { return this; },
      });

      const result = await store.dispatch(
        vehiclesApi.endpoints.deleteVehicle.initiate({
          tenantId: 'demo-tenant',
          vehicleId: '1',
        })
      );

      expect(result.data).toEqual({ success: true });
      expect('data' in result).toBe(true);
    });
  });
}); 
import { vehiclesApi } from '../vehiclesApi';
import { setupServer } from 'msw/node';
import { handlers } from '../../../test/mocks/handlers';

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('vehiclesApi', () => {
  const store = vehiclesApi.util.getRunningQueriesThunk();

  beforeEach(() => {
    store.dispatch(vehiclesApi.util.resetApiState());
  });

  describe('getVehicles', () => {
    it('fetches vehicles successfully', async () => {
      const result = await store.dispatch(
        vehiclesApi.endpoints.getVehicles.initiate('demo-tenant')
      );

      expect(result.data).toEqual([
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
      ]);
      expect(result.isSuccess).toBe(true);
    });

    it('handles network errors', async () => {
      server.use(
        handlers.find(h => h.info.method === 'GET' && h.info.path.includes('/vehicles'))!
      );

      const result = await store.dispatch(
        vehiclesApi.endpoints.getVehicles.initiate('demo-tenant')
      );

      expect(result.error).toBeDefined();
      expect(result.isError).toBe(true);
    });
  });

  describe('getVehicle', () => {
    it('fetches a single vehicle successfully', async () => {
      const result = await store.dispatch(
        vehiclesApi.endpoints.getVehicle.initiate({
          tenantId: 'demo-tenant',
          vehicleId: '1',
        })
      );

      expect(result.data).toEqual({
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
      });
      expect(result.isSuccess).toBe(true);
    });

    it('handles vehicle not found', async () => {
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

      const result = await store.dispatch(
        vehiclesApi.endpoints.createVehicle.initiate(newVehicle)
      );

      expect(result.data).toEqual({
        id: 'new-id',
        ...newVehicle.vehicle,
        tenantId: 'demo-tenant',
      });
      expect(result.isSuccess).toBe(true);
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

      const result = await store.dispatch(
        vehiclesApi.endpoints.updateVehicle.initiate(updateData)
      );

      expect(result.data).toEqual({
        id: '1',
        ...updateData.vehicle,
        tenantId: 'demo-tenant',
      });
      expect(result.isSuccess).toBe(true);
    });
  });

  describe('deleteVehicle', () => {
    it('deletes a vehicle successfully', async () => {
      const result = await store.dispatch(
        vehiclesApi.endpoints.deleteVehicle.initiate({
          tenantId: 'demo-tenant',
          vehicleId: '1',
        })
      );

      expect(result.data).toEqual({ success: true });
      expect(result.isSuccess).toBe(true);
    });
  });
}); 
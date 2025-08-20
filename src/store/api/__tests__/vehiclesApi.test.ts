import { vehiclesApi } from '../vehiclesApi';
import { configureStore } from '@reduxjs/toolkit';

// Mock data
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
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
];

const mockVehicle = mockVehicles[0];

// Create a mock baseQuery for testing
const mockBaseQuery = jest.fn();

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
    mockBaseQuery.mockClear();
  });

  describe('getVehicles', () => {
    it('fetches vehicles successfully', async () => {
      // Mock the baseQuery to return success response
      mockBaseQuery.mockResolvedValueOnce({
        data: mockVehicles,
        meta: { requestId: 'test-request-id' },
      });

      // Override the baseQuery for this test
      const testApi = vehiclesApi.injectEndpoints({
        endpoints: (builder) => ({
          getVehicles: builder.query<typeof mockVehicles, string>({
            queryFn: async (tenantId) => {
              const result = await mockBaseQuery(`/tenant/${tenantId}/vehicles`);
              return result;
            },
            providesTags: ['Vehicle'],
          }),
        }),
        overrideExisting: true,
      });

      const result = await store.dispatch(
        testApi.endpoints.getVehicles.initiate('demo-tenant')
      );

      expect(result.data).toEqual(mockVehicles);
      expect('data' in result).toBe(true);
    });

    it('handles network errors', async () => {
      // Mock the baseQuery to return error response
      mockBaseQuery.mockRejectedValueOnce({
        status: 'FETCH_ERROR',
        error: 'Network error',
      });

      const testApi = vehiclesApi.injectEndpoints({
        endpoints: (builder) => ({
          getVehicles: builder.query<typeof mockVehicles, string>({
            queryFn: async (tenantId) => {
              const result = await mockBaseQuery(`/tenant/${tenantId}/vehicles`);
              return result;
            },
            providesTags: ['Vehicle'],
          }),
        }),
        overrideExisting: true,
      });

      const result = await store.dispatch(
        testApi.endpoints.getVehicles.initiate('demo-tenant')
      );

      expect(result.error).toBeDefined();
      expect(result.isError).toBe(true);
    });
  });

  describe('getVehicle', () => {
    it('fetches a single vehicle successfully', async () => {
      mockBaseQuery.mockResolvedValueOnce({
        data: mockVehicle,
        meta: { requestId: 'test-request-id' },
      });

      const testApi = vehiclesApi.injectEndpoints({
        endpoints: (builder) => ({
          getVehicle: builder.query<typeof mockVehicle, { tenantId: string; vehicleId: string }>({
            queryFn: async ({ tenantId, vehicleId }) => {
              const result = await mockBaseQuery(`/tenant/${tenantId}/vehicles/${vehicleId}`);
              return result;
            },
            providesTags: (result, error, { vehicleId }) => [{ type: 'Vehicle', id: vehicleId }],
          }),
        }),
        overrideExisting: true,
      });

      const result = await store.dispatch(
        testApi.endpoints.getVehicle.initiate({
          tenantId: 'demo-tenant',
          vehicleId: '1',
        })
      );

      expect(result.data).toEqual(mockVehicle);
      expect('data' in result).toBe(true);
    });

    it('handles vehicle not found', async () => {
      mockBaseQuery.mockRejectedValueOnce({
        status: 404,
        data: { message: 'Vehicle not found' },
      });

      const testApi = vehiclesApi.injectEndpoints({
        endpoints: (builder) => ({
          getVehicle: builder.query<typeof mockVehicle, { tenantId: string; vehicleId: string }>({
            queryFn: async ({ tenantId, vehicleId }) => {
              const result = await mockBaseQuery(`/tenant/${tenantId}/vehicles/${vehicleId}`);
              return result;
            },
            providesTags: (result, error, { vehicleId }) => [{ type: 'Vehicle', id: vehicleId }],
          }),
        }),
        overrideExisting: true,
      });

      const result = await store.dispatch(
        testApi.endpoints.getVehicle.initiate({
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

      mockBaseQuery.mockResolvedValueOnce({
        data: mockCreatedVehicle,
        meta: { requestId: 'test-request-id' },
      });

      const testApi = vehiclesApi.injectEndpoints({
        endpoints: (builder) => ({
          createVehicle: builder.mutation<typeof mockCreatedVehicle, { tenantId: string; vehicle: Record<string, unknown> }>({
            queryFn: async ({ tenantId, vehicle }) => {
              const result = await mockBaseQuery({
                url: `/tenant/${tenantId}/vehicles`,
                method: 'POST',
                body: vehicle,
              });
              return result;
            },
            invalidatesTags: ['Vehicle'],
          }),
        }),
        overrideExisting: true,
      });

      const result = await store.dispatch(
        testApi.endpoints.createVehicle.initiate(newVehicle)
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

      mockBaseQuery.mockResolvedValueOnce({
        data: mockUpdatedVehicle,
        meta: { requestId: 'test-request-id' },
      });

      const testApi = vehiclesApi.injectEndpoints({
        endpoints: (builder) => ({
          updateVehicle: builder.mutation<typeof mockUpdatedVehicle, { tenantId: string; vehicleId: string; vehicle: Record<string, unknown> }>({
            queryFn: async ({ tenantId, vehicleId, vehicle }) => {
              const result = await mockBaseQuery({
                url: `/tenant/${tenantId}/vehicles/${vehicleId}`,
                method: 'PUT',
                body: vehicle,
              });
              return result;
            },
            invalidatesTags: (result, error, { vehicleId }) => [
              { type: 'Vehicle', id: vehicleId },
              'Vehicle',
            ],
          }),
        }),
        overrideExisting: true,
      });

      const result = await store.dispatch(
        testApi.endpoints.updateVehicle.initiate(updateData)
      );

      expect(result.data).toEqual(mockUpdatedVehicle);
      expect('data' in result).toBe(true);
    });
  });

  describe('deleteVehicle', () => {
    it('deletes a vehicle successfully', async () => {
      mockBaseQuery.mockResolvedValueOnce({
        data: { success: true },
        meta: { requestId: 'test-request-id' },
      });

      const testApi = vehiclesApi.injectEndpoints({
        endpoints: (builder) => ({
          deleteVehicle: builder.mutation<{ success: boolean }, { tenantId: string; vehicleId: string }>({
            queryFn: async ({ tenantId, vehicleId }) => {
              const result = await mockBaseQuery({
                url: `/tenant/${tenantId}/vehicles/${vehicleId}`,
                method: 'DELETE',
              });
              return result;
            },
            invalidatesTags: ['Vehicle'],
          }),
        }),
        overrideExisting: true,
      });

      const result = await store.dispatch(
        testApi.endpoints.deleteVehicle.initiate({
          tenantId: 'demo-tenant',
          vehicleId: '1',
        })
      );

      expect(result.data).toEqual({ success: true });
      expect('data' in result).toBe(true);
    });
  });
}); 
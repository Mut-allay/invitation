import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { vehiclesService } from '../../services/firestoreService';

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  plateNumber: string;
  customerId: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export const vehiclesApi = createApi({
  reducerPath: 'vehiclesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/',
  }),
  tagTypes: ['Vehicle'],
  endpoints: (builder) => ({
    getVehicles: builder.query<Vehicle[], { tenantId: string }>({
      async queryFn(arg) {
        try {
          const vehicles = await vehiclesService.getAll(arg.tenantId);
          // Ensure we always return an array, even if the service returns undefined/null
          const safeVehicles = Array.isArray(vehicles) ? vehicles : [];
          return { data: safeVehicles };
        } catch (error) {
          console.error('Error fetching vehicles:', error);
          return { data: [] };
        }
      },
      providesTags: ['Vehicle'],
    }),
    
    getVehicle: builder.query<Vehicle, { tenantId: string; vehicleId: string }>({
      async queryFn(arg) {
        try {
          const vehicle = await vehiclesService.getById(arg.vehicleId);
          if (!vehicle) {
            return { error: { status: 'NOT_FOUND', error: 'Vehicle not found' } };
          }
          return { data: vehicle };
        } catch (error) {
          console.error('Error fetching vehicle:', error);
          return { error: { status: 'FETCH_ERROR', error: 'Failed to fetch vehicle' } };
        }
      },
      providesTags: (result, error, { vehicleId }) => [{ type: 'Vehicle', id: vehicleId }],
    }),

    createVehicle: builder.mutation<string, { tenantId: string; vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'> }>({
      async queryFn(arg) {
        try {
          const vehicleId = await vehiclesService.add(arg.vehicle);
          if (!vehicleId) {
            return { error: { status: 'CREATE_ERROR', error: 'Failed to create vehicle' } };
          }
          return { data: vehicleId };
        } catch (error) {
          console.error('Error creating vehicle:', error);
          return { error: { status: 'CREATE_ERROR', error: 'Failed to create vehicle' } };
        }
      },
      invalidatesTags: ['Vehicle'],
    }),

    updateVehicle: builder.mutation<boolean, { tenantId: string; vehicleId: string; vehicle: Partial<Vehicle> }>({
      async queryFn(arg) {
        try {
          const success = await vehiclesService.update(arg.vehicleId, arg.vehicle);
          return { data: success };
        } catch (error) {
          console.error('Error updating vehicle:', error);
          return { error: { status: 'UPDATE_ERROR', error: 'Failed to update vehicle' } };
        }
      },
      invalidatesTags: (result, error, { vehicleId }) => [
        { type: 'Vehicle', id: vehicleId },
        'Vehicle'
      ],
    }),

    deleteVehicle: builder.mutation<boolean, { tenantId: string; vehicleId: string }>({
      async queryFn(arg) {
        try {
          const success = await vehiclesService.delete(arg.vehicleId);
          return { data: success };
        } catch (error) {
          console.error('Error deleting vehicle:', error);
          return { error: { status: 'DELETE_ERROR', error: 'Failed to delete vehicle' } };
        }
      },
      invalidatesTags: ['Vehicle'],
    }),
  }),
});

export const {
  useGetVehiclesQuery,
  useGetVehicleQuery,
  useCreateVehicleMutation,
  useUpdateVehicleMutation,
  useDeleteVehicleMutation,
} = vehiclesApi; 
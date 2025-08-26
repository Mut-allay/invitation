import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Vehicle, VehicleFormData } from '../../types/index';

export const vehiclesApi = createApi({
  reducerPath: 'vehiclesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5001/garajiflow-dev/us-central1',
    prepareHeaders: (headers) => {
      // Add auth token to headers
      const token = localStorage.getItem('authToken');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Vehicle'],
  endpoints: (builder) => ({
    getVehicles: builder.query<Vehicle[], string>({
      query: (tenantId) => ({
        url: '/getVehicles',
        method: 'POST',
        body: { tenantId },
      }),
      providesTags: ['Vehicle'],
    }),
    
    getVehicle: builder.query<Vehicle, { tenantId: string; vehicleId: string }>({
      query: ({ tenantId, vehicleId }) => ({
        url: '/getVehicle',
        method: 'POST',
        body: { tenantId, vehicleId },
      }),
      providesTags: (result, error, { vehicleId }) => [{ type: 'Vehicle', id: vehicleId }],
    }),
    
    createVehicle: builder.mutation<Vehicle, { tenantId: string; vehicle: VehicleFormData }>({
      query: ({ tenantId, vehicle }) => ({
        url: '/createVehicle',
        method: 'POST',
        body: { tenantId, vehicle },
      }),
      invalidatesTags: ['Vehicle'],
    }),
    
    updateVehicle: builder.mutation<Vehicle, { tenantId: string; vehicleId: string; vehicle: Partial<VehicleFormData> }>({
      query: ({ tenantId, vehicleId, vehicle }) => ({
        url: '/updateVehicle',
        method: 'POST',
        body: { tenantId, vehicleId, vehicle },
      }),
      invalidatesTags: (result, error, { vehicleId }) => [
        { type: 'Vehicle', id: vehicleId },
        'Vehicle',
      ],
    }),
    
    deleteVehicle: builder.mutation<void, { tenantId: string; vehicleId: string }>({
      query: ({ tenantId, vehicleId }) => ({
        url: '/deleteVehicle',
        method: 'POST',
        body: { tenantId, vehicleId },
      }),
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
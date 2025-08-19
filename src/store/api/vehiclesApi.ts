import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Vehicle, VehicleFormData } from '../../types/vehicle';

export const vehiclesApi = createApi({
  reducerPath: 'vehiclesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1',
    prepareHeaders: (headers, { getState }) => {
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
      query: (tenantId) => `/tenant/${tenantId}/vehicles`,
      providesTags: ['Vehicle'],
    }),
    
    getVehicle: builder.query<Vehicle, { tenantId: string; vehicleId: string }>({
      query: ({ tenantId, vehicleId }) => `/tenant/${tenantId}/vehicles/${vehicleId}`,
      providesTags: (result, error, { vehicleId }) => [{ type: 'Vehicle', id: vehicleId }],
    }),
    
    createVehicle: builder.mutation<Vehicle, { tenantId: string; vehicle: VehicleFormData }>({
      query: ({ tenantId, vehicle }) => ({
        url: `/tenant/${tenantId}/vehicles`,
        method: 'POST',
        body: vehicle,
      }),
      invalidatesTags: ['Vehicle'],
    }),
    
    updateVehicle: builder.mutation<Vehicle, { tenantId: string; vehicleId: string; vehicle: Partial<VehicleFormData> }>({
      query: ({ tenantId, vehicleId, vehicle }) => ({
        url: `/tenant/${tenantId}/vehicles/${vehicleId}`,
        method: 'PUT',
        body: vehicle,
      }),
      invalidatesTags: (result, error, { vehicleId }) => [
        { type: 'Vehicle', id: vehicleId },
        'Vehicle',
      ],
    }),
    
    deleteVehicle: builder.mutation<void, { tenantId: string; vehicleId: string }>({
      query: ({ tenantId, vehicleId }) => ({
        url: `/tenant/${tenantId}/vehicles/${vehicleId}`,
        method: 'DELETE',
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
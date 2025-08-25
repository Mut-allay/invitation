import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Repair, RepairFormData } from '../../types/index';

export const repairsApi = createApi({
  reducerPath: 'repairsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('authToken');
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Repair'],
  endpoints: (builder) => ({
    getRepairs: builder.query<Repair[], string>({
      query: (tenantId) => `/tenant/${tenantId}/repairs`,
      providesTags: ['Repair'],
    }),
    getRepair: builder.query<Repair, { tenantId: string; repairId: string }>({
      query: ({ tenantId, repairId }) => `/tenant/${tenantId}/repairs/${repairId}`,
      providesTags: (result, error, { repairId }) => [{ type: 'Repair', id: repairId }],
    }),
    createRepair: builder.mutation<Repair, { tenantId: string; repair: RepairFormData }>({
      query: ({ tenantId, repair }) => ({
        url: `/tenant/${tenantId}/repairs`,
        method: 'POST',
        body: repair,
      }),
      invalidatesTags: ['Repair'],
    }),
    updateRepair: builder.mutation<Repair, { tenantId: string; repairId: string; repair: Partial<RepairFormData> }>({
      query: ({ tenantId, repairId, repair }) => ({
        url: `/tenant/${tenantId}/repairs/${repairId}`,
        method: 'PUT',
        body: repair,
      }),
      invalidatesTags: (result, error, { repairId }) => [
        { type: 'Repair', id: repairId },
        'Repair',
      ],
    }),
    deleteRepair: builder.mutation<void, { tenantId: string; repairId: string }>({
      query: ({ tenantId, repairId }) => ({
        url: `/tenant/${tenantId}/repairs/${repairId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Repair'],
    }),
  }),
});

export const {
  useGetRepairsQuery,
  useGetRepairQuery,
  useCreateRepairMutation,
  useUpdateRepairMutation,
  useDeleteRepairMutation,
} = repairsApi; 
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Repair, RepairFormData } from '../../types/index';

export const repairsApi = createApi({
  reducerPath: 'repairsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5001/garajiflow-dev/us-central1',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('authToken');
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Repair'],
  endpoints: (builder) => ({
    getRepairs: builder.query<Repair[], string>({
      query: (tenantId) => ({
        url: '/getRepairs',
        method: 'POST',
        body: { tenantId },
      }),
      providesTags: ['Repair'],
    }),
    getRepair: builder.query<Repair, { tenantId: string; repairId: string }>({
      query: ({ tenantId, repairId }) => ({
        url: '/getRepair',
        method: 'POST',
        body: { tenantId, repairId },
      }),
      providesTags: (result, error, { repairId }) => [{ type: 'Repair', id: repairId }],
    }),
    createRepair: builder.mutation<Repair, { tenantId: string; repair: RepairFormData }>({
      query: ({ tenantId, repair }) => ({
        url: '/createRepair',
        method: 'POST',
        body: { tenantId, repair },
      }),
      invalidatesTags: ['Repair'],
    }),
    updateRepair: builder.mutation<Repair, { tenantId: string; repairId: string; repair: Partial<RepairFormData> }>({
      query: ({ tenantId, repairId, repair }) => ({
        url: '/updateRepair',
        method: 'POST',
        body: { tenantId, repairId, repair },
      }),
      invalidatesTags: (result, error, { repairId }) => [
        { type: 'Repair', id: repairId },
        'Repair',
      ],
    }),
    deleteRepair: builder.mutation<void, { tenantId: string; repairId: string }>({
      query: ({ tenantId, repairId }) => ({
        url: '/deleteRepair',
        method: 'POST',
        body: { tenantId, repairId },
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
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Inventory, InventoryFormData } from '../../types/index';

export const inventoryApi = createApi({
  reducerPath: 'inventoryApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5001/garajiflow-dev/us-central1',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('authToken');
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Inventory'],
  endpoints: (builder) => ({
    getInventory: builder.query<Inventory[], string>({
      query: (tenantId) => ({
        url: '/getVehicles',
        method: 'POST',
        body: { tenantId },
      }),
      providesTags: ['Inventory'],
    }),
    getInventoryItem: builder.query<Inventory, { tenantId: string; itemId: string }>({
      query: ({ tenantId, itemId }) => ({
        url: '/getVehicle',
        method: 'POST',
        body: { tenantId, vehicleId: itemId },
      }),
      providesTags: (result, error, { itemId }) => [{ type: 'Inventory', id: itemId }],
    }),
    createInventoryItem: builder.mutation<Inventory, { tenantId: string; item: InventoryFormData }>({
      query: ({ tenantId, item }) => ({
        url: '/createVehicle',
        method: 'POST',
        body: { tenantId, vehicle: item },
      }),
      invalidatesTags: ['Inventory'],
    }),
    updateInventoryItem: builder.mutation<Inventory, { tenantId: string; itemId: string; item: Partial<InventoryFormData> }>({
      query: ({ tenantId, itemId, item }) => ({
        url: '/updateVehicle',
        method: 'POST',
        body: { tenantId, vehicleId: itemId, vehicle: item },
      }),
      invalidatesTags: (result, error, { itemId }) => [
        { type: 'Inventory', id: itemId },
        'Inventory',
      ],
    }),
    deleteInventoryItem: builder.mutation<void, { tenantId: string; itemId: string }>({
      query: ({ tenantId, itemId }) => ({
        url: '/deleteVehicle',
        method: 'POST',
        body: { tenantId, vehicleId: itemId },
      }),
      invalidatesTags: ['Inventory'],
    }),
  }),
});

export const {
  useGetInventoryQuery,
  useGetInventoryItemQuery,
  useCreateInventoryItemMutation,
  useUpdateInventoryItemMutation,
  useDeleteInventoryItemMutation,
} = inventoryApi; 
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Inventory, InventoryFormData } from '../../types/index';

export const inventoryApi = createApi({
  reducerPath: 'inventoryApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('authToken');
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Inventory'],
  endpoints: (builder) => ({
    getInventory: builder.query<Inventory[], string>({
      query: (tenantId) => `/tenant/${tenantId}/inventory`,
      providesTags: ['Inventory'],
    }),
    getInventoryItem: builder.query<Inventory, { tenantId: string; itemId: string }>({
      query: ({ tenantId, itemId }) => `/tenant/${tenantId}/inventory/${itemId}`,
      providesTags: (result, error, { itemId }) => [{ type: 'Inventory', id: itemId }],
    }),
    createInventoryItem: builder.mutation<Inventory, { tenantId: string; item: InventoryFormData }>({
      query: ({ tenantId, item }) => ({
        url: `/tenant/${tenantId}/inventory`,
        method: 'POST',
        body: item,
      }),
      invalidatesTags: ['Inventory'],
    }),
    updateInventoryItem: builder.mutation<Inventory, { tenantId: string; itemId: string; item: Partial<InventoryFormData> }>({
      query: ({ tenantId, itemId, item }) => ({
        url: `/tenant/${tenantId}/inventory/${itemId}`,
        method: 'PUT',
        body: item,
      }),
      invalidatesTags: (result, error, { itemId }) => [
        { type: 'Inventory', id: itemId },
        'Inventory',
      ],
    }),
    deleteInventoryItem: builder.mutation<void, { tenantId: string; itemId: string }>({
      query: ({ tenantId, itemId }) => ({
        url: `/tenant/${tenantId}/inventory/${itemId}`,
        method: 'DELETE',
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
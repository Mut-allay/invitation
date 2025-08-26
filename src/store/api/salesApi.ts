import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Sale, SaleFormData } from '../../types/index';

export const salesApi = createApi({
  reducerPath: 'salesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5001/garajiflow-dev/us-central1',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('authToken');
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Sale'],
  endpoints: (builder) => ({
    getSales: builder.query<Sale[], string>({
      query: (tenantId) => ({
        url: '/getSales',
        method: 'POST',
        body: { tenantId },
      }),
      providesTags: ['Sale'],
    }),
    getSale: builder.query<Sale, { tenantId: string; saleId: string }>({
      query: ({ tenantId, saleId }) => ({
        url: '/getSale',
        method: 'POST',
        body: { tenantId, saleId },
      }),
      providesTags: (result, error, { saleId }) => [{ type: 'Sale', id: saleId }],
    }),
    createSale: builder.mutation<Sale, { tenantId: string; sale: SaleFormData }>({
      query: ({ tenantId, sale }) => ({
        url: '/createSale',
        method: 'POST',
        body: { tenantId, sale },
      }),
      invalidatesTags: ['Sale'],
    }),
    updateSale: builder.mutation<Sale, { tenantId: string; saleId: string; sale: Partial<SaleFormData> }>({
      query: ({ tenantId, saleId, sale }) => ({
        url: '/updateSale',
        method: 'POST',
        body: { tenantId, saleId, sale },
      }),
      invalidatesTags: (result, error, { saleId }) => [
        { type: 'Sale', id: saleId },
        'Sale',
      ],
    }),
    deleteSale: builder.mutation<void, { tenantId: string; saleId: string }>({
      query: ({ tenantId, saleId }) => ({
        url: '/deleteSale',
        method: 'POST',
        body: { tenantId, saleId },
      }),
      invalidatesTags: ['Sale'],
    }),
  }),
});

export const {
  useGetSalesQuery,
  useGetSaleQuery,
  useCreateSaleMutation,
  useUpdateSaleMutation,
  useDeleteSaleMutation,
} = salesApi; 
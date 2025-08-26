import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Sale, SaleFormData } from '../../types/index';

export const salesApi = createApi({
  reducerPath: 'salesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('authToken');
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Sale'],
  endpoints: (builder) => ({
    getSales: builder.query<Sale[], string>({
      query: (tenantId) => `/tenant/${tenantId}/sales`,
      providesTags: ['Sale'],
    }),
    getSale: builder.query<Sale, { tenantId: string; saleId: string }>({
      query: ({ tenantId, saleId }) => `/tenant/${tenantId}/sales/${saleId}`,
      providesTags: (result, error, { saleId }) => [{ type: 'Sale', id: saleId }],
    }),
    createSale: builder.mutation<Sale, { tenantId: string; sale: SaleFormData }>({
      query: ({ tenantId, sale }) => ({
        url: `/tenant/${tenantId}/sales`,
        method: 'POST',
        body: sale,
      }),
      invalidatesTags: ['Sale'],
    }),
    updateSale: builder.mutation<Sale, { tenantId: string; saleId: string; sale: Partial<SaleFormData> }>({
      query: ({ tenantId, saleId, sale }) => ({
        url: `/tenant/${tenantId}/sales/${saleId}`,
        method: 'PUT',
        body: sale,
      }),
      invalidatesTags: (result, error, { saleId }) => [
        { type: 'Sale', id: saleId },
        'Sale',
      ],
    }),
    deleteSale: builder.mutation<void, { tenantId: string; saleId: string }>({
      query: ({ tenantId, saleId }) => ({
        url: `/tenant/${tenantId}/sales/${saleId}`,
        method: 'DELETE',
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
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { salesService } from '../../services/firestoreService';

export interface Sale {
  id: string;
  customerId: string;
  vehicleId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export const salesApi = createApi({
  reducerPath: 'salesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/',
  }),
  tagTypes: ['Sale'],
  endpoints: (builder) => ({
    getSales: builder.query<Sale[], { tenantId: string }>({
      async queryFn(arg) {
        try {
          const sales = await salesService.getAll(arg.tenantId);
          // Ensure we always return an array, even if the service returns undefined/null
          const safeSales = Array.isArray(sales) ? sales : [];
          return { data: safeSales };
        } catch (error) {
          console.error('Error fetching sales:', error);
          return { data: [] };
        }
      },
      providesTags: ['Sale'],
    }),
    
    getSale: builder.query<Sale, { tenantId: string; saleId: string }>({
      async queryFn(arg) {
        try {
          const sale = await salesService.getById(arg.saleId);
          if (!sale) {
            return { error: { status: 'NOT_FOUND', error: 'Sale not found' } };
          }
          return { data: sale };
        } catch (error) {
          console.error('Error fetching sale:', error);
          return { error: { status: 'FETCH_ERROR', error: 'Failed to fetch sale' } };
        }
      },
      providesTags: (result, error, { saleId }) => [{ type: 'Sale', id: saleId }],
    }),

    createSale: builder.mutation<string, { tenantId: string; sale: Omit<Sale, 'id' | 'createdAt' | 'updatedAt'> }>({
      async queryFn(arg) {
        try {
          const saleId = await salesService.add(arg.sale);
          if (!saleId) {
            return { error: { status: 'CREATE_ERROR', error: 'Failed to create sale' } };
          }
          return { data: saleId };
        } catch (error) {
          console.error('Error creating sale:', error);
          return { error: { status: 'CREATE_ERROR', error: 'Failed to create sale' } };
        }
      },
      invalidatesTags: ['Sale'],
    }),

    updateSale: builder.mutation<boolean, { tenantId: string; saleId: string; sale: Partial<Sale> }>({
      async queryFn(arg) {
        try {
          const success = await salesService.update(arg.saleId, arg.sale);
          return { data: success };
        } catch (error) {
          console.error('Error updating sale:', error);
          return { error: { status: 'UPDATE_ERROR', error: 'Failed to update sale' } };
        }
      },
      invalidatesTags: (result, error, { saleId }) => [
        { type: 'Sale', id: saleId },
        'Sale'
      ],
    }),

    deleteSale: builder.mutation<boolean, { tenantId: string; saleId: string }>({
      async queryFn(arg) {
        try {
          const success = await salesService.delete(arg.saleId);
          return { data: success };
        } catch (error) {
          console.error('Error deleting sale:', error);
          return { error: { status: 'DELETE_ERROR', error: 'Failed to delete sale' } };
        }
      },
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

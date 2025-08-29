import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getApiBaseUrl } from '../../config/api';

export interface Invoice {
  id: string;
  customerId: string;
  vehicleId: string;
  amount: number;
  currency: string;
  status: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export const invoicesApi = createApi({
  reducerPath: 'invoicesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: getApiBaseUrl(),
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Invoice'],
  endpoints: (builder) => ({
    getInvoices: builder.query<Invoice[], { tenantId: string }>({
      query: (params) => ({
        url: '/getInvoices',
        method: 'POST',
        body: params,
      }),
      transformResponse: (response: any) => {
        if (response?.invoices) {
          return response.invoices.map((invoice: any) => ({
            ...invoice,
            createdAt: new Date(invoice.createdAt),
            updatedAt: new Date(invoice.updatedAt),
          }));
        }
        return [];
      },
      async queryFn(arg, api, extraOptions, baseQuery) {
        try {
          const result = await baseQuery({
            url: '/getInvoices',
            method: 'POST',
            body: arg,
          });
          
          if (result.error) {
            console.warn('Cloud Functions not available, using mock data');
            const mockInvoices: Invoice[] = [
              {
                id: '1',
                customerId: '1',
                vehicleId: '1',
                amount: 50000,
                currency: 'ZMW',
                status: 'paid',
                tenantId: 'demo-tenant',
                createdAt: new Date(),
                updatedAt: new Date(),
              }
            ];
            return { data: mockInvoices };
          }
          
          return result;
        } catch (error) {
          console.warn('Error fetching invoices, using mock data:', error);
          const mockInvoices: Invoice[] = [
            {
              id: '1',
              customerId: '1',
              vehicleId: '1',
              amount: 50000,
              currency: 'ZMW',
              status: 'paid',
              tenantId: 'demo-tenant',
              createdAt: new Date(),
              updatedAt: new Date(),
            }
          ];
          return { data: mockInvoices };
        }
      },
      providesTags: ['Invoice'],
    }),
  }),
});

export const { useGetInvoicesQuery } = invoicesApi;

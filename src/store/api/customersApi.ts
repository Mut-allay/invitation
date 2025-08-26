import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Customer, CustomerFormData } from '../../types/index';

export const customersApi = createApi({
  reducerPath: 'customersApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5001/garajiflow-dev/us-central1',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('authToken');
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Customer'],
  endpoints: (builder) => ({
    getCustomers: builder.query<Customer[], string>({
      query: (tenantId) => ({
        url: '/getCustomers',
        method: 'POST',
        body: { tenantId },
      }),
      providesTags: ['Customer'],
    }),
    getCustomer: builder.query<Customer, { tenantId: string; customerId: string }>({
      query: ({ tenantId, customerId }) => ({
        url: '/getCustomer',
        method: 'POST',
        body: { tenantId, customerId },
      }),
      providesTags: (result, error, { customerId }) => [{ type: 'Customer', id: customerId }],
    }),
    createCustomer: builder.mutation<Customer, { tenantId: string; customer: CustomerFormData }>({
      query: ({ tenantId, customer }) => ({
        url: '/createCustomer',
        method: 'POST',
        body: { tenantId, customer },
      }),
      invalidatesTags: ['Customer'],
    }),
    updateCustomer: builder.mutation<Customer, { tenantId: string; customerId: string; customer: Partial<CustomerFormData> }>({
      query: ({ tenantId, customerId, customer }) => ({
        url: '/updateCustomer',
        method: 'POST',
        body: { tenantId, customerId, customer },
      }),
      invalidatesTags: (result, error, { customerId }) => [
        { type: 'Customer', id: customerId },
        'Customer',
      ],
    }),
    deleteCustomer: builder.mutation<void, { tenantId: string; customerId: string }>({
      query: ({ tenantId, customerId }) => ({
        url: '/deleteCustomer',
        method: 'POST',
        body: { tenantId, customerId },
      }),
      invalidatesTags: ['Customer'],
    }),
  }),
});

export const {
  useGetCustomersQuery,
  useGetCustomerQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
} = customersApi; 
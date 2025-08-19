import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Customer, CustomerFormData } from '../../types/customer';

export const customersApi = createApi({
  reducerPath: 'customersApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1',
    prepareHeaders: (headers, { getState }) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Customer'],
  endpoints: (builder) => ({
    getCustomers: builder.query<Customer[], string>({
      query: (tenantId) => `/tenant/${tenantId}/customers`,
      providesTags: ['Customer'],
    }),
    
    getCustomer: builder.query<Customer, { tenantId: string; customerId: string }>({
      query: ({ tenantId, customerId }) => `/tenant/${tenantId}/customers/${customerId}`,
      providesTags: (result, error, { customerId }) => [{ type: 'Customer', id: customerId }],
    }),
    
    createCustomer: builder.mutation<Customer, { tenantId: string; customer: CustomerFormData }>({
      query: ({ tenantId, customer }) => ({
        url: `/tenant/${tenantId}/customers`,
        method: 'POST',
        body: customer,
      }),
      invalidatesTags: ['Customer'],
    }),
    
    updateCustomer: builder.mutation<Customer, { tenantId: string; customerId: string; customer: Partial<CustomerFormData> }>({
      query: ({ tenantId, customerId, customer }) => ({
        url: `/tenant/${tenantId}/customers/${customerId}`,
        method: 'PUT',
        body: customer,
      }),
      invalidatesTags: (result, error, { customerId }) => [
        { type: 'Customer', id: customerId },
        'Customer',
      ],
    }),
    
    deleteCustomer: builder.mutation<void, { tenantId: string; customerId: string }>({
      query: ({ tenantId, customerId }) => ({
        url: `/tenant/${tenantId}/customers/${customerId}`,
        method: 'DELETE',
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
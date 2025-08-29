import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { customersService } from '../../services/firestoreService';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export const customersApi = createApi({
  reducerPath: 'customersApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/',
  }),
  tagTypes: ['Customer'],
  endpoints: (builder) => ({
    getCustomers: builder.query<Customer[], { tenantId: string }>({
      async queryFn(arg) {
        try {
          const customers = await customersService.getAll(arg.tenantId);
          // Ensure we always return an array, even if the service returns undefined/null
          const safeCustomers = Array.isArray(customers) ? customers : [];
          return { data: safeCustomers };
        } catch (error) {
          console.error('Error fetching customers:', error);
          return { data: [] };
        }
      },
      providesTags: ['Customer'],
    }),
    
    getCustomer: builder.query<Customer, { tenantId: string; customerId: string }>({
      async queryFn(arg) {
        try {
          const customer = await customersService.getById(arg.customerId);
          if (!customer) {
            return { error: { status: 'NOT_FOUND', error: 'Customer not found' } };
          }
          return { data: customer };
        } catch (error) {
          console.error('Error fetching customer:', error);
          return { error: { status: 'FETCH_ERROR', error: 'Failed to fetch customer' } };
        }
      },
      providesTags: (result, error, { customerId }) => [{ type: 'Customer', id: customerId }],
    }),

    createCustomer: builder.mutation<string, { tenantId: string; customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'> }>({
      async queryFn(arg) {
        try {
          const customerId = await customersService.add(arg.customer);
          if (!customerId) {
            return { error: { status: 'CREATE_ERROR', error: 'Failed to create customer' } };
          }
          return { data: customerId };
        } catch (error) {
          console.error('Error creating customer:', error);
          return { error: { status: 'CREATE_ERROR', error: 'Failed to create customer' } };
        }
      },
      invalidatesTags: ['Customer'],
    }),

    updateCustomer: builder.mutation<boolean, { tenantId: string; customerId: string; customer: Partial<Customer> }>({
      async queryFn(arg) {
        try {
          const success = await customersService.update(arg.customerId, arg.customer);
          return { data: success };
        } catch (error) {
          console.error('Error updating customer:', error);
          return { error: { status: 'UPDATE_ERROR', error: 'Failed to update customer' } };
        }
      },
      invalidatesTags: (result, error, { customerId }) => [
        { type: 'Customer', id: customerId },
        'Customer'
      ],
    }),

    deleteCustomer: builder.mutation<boolean, { tenantId: string; customerId: string }>({
      async queryFn(arg) {
        try {
          const success = await customersService.delete(arg.customerId);
          return { data: success };
        } catch (error) {
          console.error('Error deleting customer:', error);
          return { error: { status: 'DELETE_ERROR', error: 'Failed to delete customer' } };
        }
      },
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
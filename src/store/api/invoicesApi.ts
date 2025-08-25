import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Invoice, InvoiceFormData, Payment, PaymentFormData } from '../../types/index';

export const invoicesApi = createApi({
  reducerPath: 'invoicesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('authToken');
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Invoice'],
  endpoints: (builder) => ({
    getInvoices: builder.query<Invoice[], string>({
      query: (tenantId) => `/tenant/${tenantId}/invoices`,
      providesTags: ['Invoice'],
    }),
    getInvoice: builder.query<Invoice, { tenantId: string; invoiceId: string }>({
      query: ({ tenantId, invoiceId }) => `/tenant/${tenantId}/invoices/${invoiceId}`,
      providesTags: (result, error, { invoiceId }) => [{ type: 'Invoice', id: invoiceId }],
    }),
    createInvoice: builder.mutation<Invoice, { tenantId: string; invoice: InvoiceFormData }>({
      query: ({ tenantId, invoice }) => ({
        url: `/tenant/${tenantId}/invoices`,
        method: 'POST',
        body: invoice,
      }),
      invalidatesTags: ['Invoice'],
    }),
    updateInvoice: builder.mutation<Invoice, { tenantId: string; invoiceId: string; invoice: Partial<InvoiceFormData> }>({
      query: ({ tenantId, invoiceId, invoice }) => ({
        url: `/tenant/${tenantId}/invoices/${invoiceId}`,
        method: 'PUT',
        body: invoice,
      }),
      invalidatesTags: (result, error, { invoiceId }) => [
        { type: 'Invoice', id: invoiceId },
        'Invoice',
      ],
    }),
    deleteInvoice: builder.mutation<void, { tenantId: string; invoiceId: string }>({
      query: ({ tenantId, invoiceId }) => ({
        url: `/tenant/${tenantId}/invoices/${invoiceId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Invoice'],
    }),
    addPayment: builder.mutation<Payment, { tenantId: string; invoiceId: string; payment: PaymentFormData }>({
      query: ({ tenantId, invoiceId, payment }) => ({
        url: `/tenant/${tenantId}/invoices/${invoiceId}/payments`,
        method: 'POST',
        body: payment,
      }),
      invalidatesTags: (result, error, { invoiceId }) => [
        { type: 'Invoice', id: invoiceId },
      ],
    }),
  }),
});

export const {
  useGetInvoicesQuery,
  useGetInvoiceQuery,
  useCreateInvoiceMutation,
  useUpdateInvoiceMutation,
  useDeleteInvoiceMutation,
  useAddPaymentMutation,
} = invoicesApi; 
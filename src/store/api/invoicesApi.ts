import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Invoice, InvoiceFormData, Payment, PaymentFormData } from '../../types/invoice';

export const invoicesApi = createApi({
  reducerPath: 'invoicesApi',
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
  tagTypes: ['Invoice', 'Payment'],
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

    // Payment endpoints
    getPayments: builder.query<Payment[], { tenantId: string; invoiceId: string }>({
      query: ({ tenantId, invoiceId }) => `/tenant/${tenantId}/invoices/${invoiceId}/payments`,
      providesTags: ['Payment'],
    }),
    
    createPayment: builder.mutation<Payment, { tenantId: string; payment: PaymentFormData }>({
      query: ({ tenantId, payment }) => ({
        url: `/tenant/${tenantId}/payments`,
        method: 'POST',
        body: payment,
      }),
      invalidatesTags: ['Payment', 'Invoice'],
    }),

    // ZRA Integration
    submitToZRA: builder.mutation<{ markId: string; qrCode: string }, { tenantId: string; invoiceId: string }>({
      query: ({ tenantId, invoiceId }) => ({
        url: `/tenant/${tenantId}/invoices/${invoiceId}/submit-zra`,
        method: 'POST',
      }),
      invalidatesTags: ['Invoice'],
    }),
  }),
});

export const {
  useGetInvoicesQuery,
  useGetInvoiceQuery,
  useCreateInvoiceMutation,
  useUpdateInvoiceMutation,
  useDeleteInvoiceMutation,
  useGetPaymentsQuery,
  useCreatePaymentMutation,
  useSubmitToZRAMutation,
} = invoicesApi; 
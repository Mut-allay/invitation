import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Invoice, InvoiceFormData } from '../../types/index';

export const invoicesApi = createApi({
  reducerPath: 'invoicesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5001/garajiflow-dev/us-central1',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('authToken');
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Invoice'],
  endpoints: (builder) => ({
    getInvoices: builder.query<Invoice[], string>({
      query: (tenantId) => ({
        url: '/getInvoices',
        method: 'POST',
        body: { tenantId },
      }),
      providesTags: ['Invoice'],
    }),
    getInvoice: builder.query<Invoice, { tenantId: string; invoiceId: string }>({
      query: ({ tenantId, invoiceId }) => ({
        url: '/getInvoice',
        method: 'POST',
        body: { tenantId, invoiceId },
      }),
      providesTags: (result, error, { invoiceId }) => [{ type: 'Invoice', id: invoiceId }],
    }),
    createInvoice: builder.mutation<Invoice, { tenantId: string; invoice: InvoiceFormData }>({
      query: ({ tenantId, invoice }) => ({
        url: '/createInvoice',
        method: 'POST',
        body: { tenantId, invoice },
      }),
      invalidatesTags: ['Invoice'],
    }),
    updateInvoice: builder.mutation<Invoice, { tenantId: string; invoiceId: string; invoice: Partial<InvoiceFormData> }>({
      query: ({ tenantId, invoiceId, invoice }) => ({
        url: '/updateInvoice',
        method: 'POST',
        body: { tenantId, invoiceId, invoice },
      }),
      invalidatesTags: (result, error, { invoiceId }) => [
        { type: 'Invoice', id: invoiceId },
        'Invoice',
      ],
    }),
    deleteInvoice: builder.mutation<void, { tenantId: string; invoiceId: string }>({
      query: ({ tenantId, invoiceId }) => ({
        url: '/deleteInvoice',
        method: 'POST',
        body: { tenantId, invoiceId },
      }),
      invalidatesTags: ['Invoice'],
    }),
    submitToZRA: builder.mutation<any, { tenantId: string; invoiceId: string }>({
      query: ({ tenantId, invoiceId }) => ({
        url: '/submitToZRA',
        method: 'POST',
        body: { tenantId, invoiceId },
      }),
      invalidatesTags: (result, error, { invoiceId }) => [
        { type: 'Invoice', id: invoiceId },
        'Invoice',
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
  useSubmitToZRAMutation,
} = invoicesApi; 
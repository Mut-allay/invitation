import { createApi } from '@reduxjs/toolkit/query/react';
import { FirestoreService } from '../../services/firestoreService';

const firestoreService = new FirestoreService();

export interface Invoice {
  id: string;
  tenantId: string;
  invoiceNumber: string;
  customerId: string;
  vehicleId: string;
  totalAmount: number;
  subtotal: number;
  vatAmount: number;
  vatRate: number;
  taxBreakdown: { vat: number };
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate: Date;
  issueDate: Date;
  paidDate?: Date;
  paymentMethod?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const invoicesApi = createApi({
  reducerPath: 'invoicesApi',
  baseQuery: () => ({ data: null }),
  tagTypes: ['Invoice'],
  endpoints: (builder) => ({
    getInvoices: builder.query<Invoice[], { tenantId: string }>({
      async queryFn({ tenantId }) {
        try {
          const data = await firestoreService.getCollection('invoices', { tenantId });
          
          // Transform the data to match the Invoice interface
          const invoices = Array.isArray(data) ? data.map((invoice: any) => ({
            ...invoice,
            createdAt: invoice.createdAt?.toDate?.() || new Date(invoice.createdAt),
            updatedAt: invoice.updatedAt?.toDate?.() || new Date(invoice.updatedAt),
            dueDate: invoice.dueDate?.toDate?.() || new Date(invoice.dueDate),
            issueDate: invoice.issueDate?.toDate?.() || new Date(invoice.issueDate),
            paidDate: invoice.paidDate?.toDate?.() || new Date(invoice.paidDate),
          })) : [];
          
          return { data: invoices };
        } catch (error) {
          console.error('Error fetching invoices:', error);
          return { data: [] };
        }
      },
      providesTags: ['Invoice'],
    }),
  }),
});

export const { useGetInvoicesQuery } = invoicesApi;

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getAuth } from 'firebase/auth';
import {
    Payment,
    PaymentResponse,
    PaymentVerificationResponse,
    MobileMoneyPayment,
    BankTransferPayment,
    PaymentReceipt,
    MobileMoneyProvider,
    BankCode
} from '../../types/payment';
import { RootState } from '../index';

// Constants for API configuration
const PAYMENT_API_BASE_URL = process.env.VITE_PAYMENT_API_URL || 'https://api.garagiflow.com/payments';
const MOBILE_MONEY_API_BASE_URL = process.env.VITE_MOBILE_MONEY_API_URL || 'https://api.garagiflow.com/mobile-money';
const BANK_API_BASE_URL = process.env.VITE_BANK_API_URL || 'https://api.garagiflow.com/bank-transfer';

// Helper function to generate unique payment references
const generatePaymentReference = (prefix: string): string => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
};

// Payment API slice
export const paymentsApi = createApi({
    reducerPath: 'paymentsApi',
    baseQuery: fetchBaseQuery({
        baseUrl: PAYMENT_API_BASE_URL,
        prepareHeaders: (headers, { getState }) => {
            // Add authorization header from auth state
            // Get token from Firebase Auth instead of Redux store
            const token = getAuth().currentUser?.getIdToken() || '';
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['Payment'],
    endpoints: (builder) => ({
        // Initialize mobile money payment
        initiateMobileMoneyPayment: builder.mutation<PaymentResponse, {
            amount: number;
            provider: MobileMoneyProvider;
            phoneNumber: string;
            description?: string;
        }>({
            query: (data) => ({
                url: `${MOBILE_MONEY_API_BASE_URL}/initiate`,
                method: 'POST',
                body: {
                    ...data,
                    reference: generatePaymentReference('MM'),
                    currency: 'ZMW',
                    timestamp: new Date().toISOString(),
                },
            }),
            invalidatesTags: ['Payment'],
        }),

        // Verify mobile money payment status
        verifyMobileMoneyPayment: builder.query<PaymentVerificationResponse, {
            reference: string;
            provider: MobileMoneyProvider;
        }>({
            query: ({ reference, provider }) => ({
                url: `${MOBILE_MONEY_API_BASE_URL}/verify/${reference}`,
                params: { provider },
            }),
            providesTags: ['Payment'],
        }),

        // Initialize bank transfer
        initiateBankTransfer: builder.mutation<PaymentResponse, {
            amount: number;
            bankCode: BankCode;
            accountNumber: string;
            accountName: string;
            description?: string;
        }>({
            query: (data) => ({
                url: `${BANK_API_BASE_URL}/initiate`,
                method: 'POST',
                body: {
                    ...data,
                    reference: generatePaymentReference('BT'),
                    currency: 'ZMW',
                    timestamp: new Date().toISOString(),
                },
            }),
            invalidatesTags: ['Payment'],
        }),

        // Verify bank transfer status
        verifyBankTransfer: builder.query<PaymentVerificationResponse, {
            reference: string;
            bankCode: BankCode;
        }>({
            query: ({ reference, bankCode }) => ({
                url: `${BANK_API_BASE_URL}/verify/${reference}`,
                params: { bankCode },
            }),
            providesTags: ['Payment'],
        }),

        // Get payment receipt
        getPaymentReceipt: builder.query<PaymentReceipt, {
            paymentId: string;
        }>({
            query: ({ paymentId }) => ({
                url: `/receipts/${paymentId}`,
            }),
            providesTags: ['Payment'],
        }),

        // Get payment history
        getPaymentHistory: builder.query<Payment[], void>({
            query: () => ({
                url: '/history',
            }),
            providesTags: ['Payment'],
        }),

        // Cancel payment
        cancelPayment: builder.mutation<PaymentResponse, {
            paymentId: string;
            reason?: string;
        }>({
            query: (data) => ({
                url: `/cancel/${data.paymentId}`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Payment'],
        }),
    }),
});

// Export hooks for usage in components
export const {
    useInitiateMobileMoneyPaymentMutation,
    useVerifyMobileMoneyPaymentQuery,
    useInitiateBankTransferMutation,
    useVerifyBankTransferQuery,
    useGetPaymentReceiptQuery,
    useGetPaymentHistoryQuery,
    useCancelPaymentMutation,
} = paymentsApi;

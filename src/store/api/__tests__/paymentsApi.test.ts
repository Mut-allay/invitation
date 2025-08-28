import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { paymentsApi } from '../paymentsApi';

// Mock payment data
const mockMobileMoneyPayment = {
    id: 'test-payment-1',
    type: 'mobile_money',
    amount: 1000,
    currency: 'ZMW',
    status: 'completed',
    reference: 'MM-123456-ABC123',
    timestamp: new Date().toISOString(),
    provider: 'airtel',
    phoneNumber: '0977123456',
    transactionId: 'TXN123'
};

const mockBankTransfer = {
    id: 'test-payment-2',
    type: 'bank_transfer',
    amount: 2000,
    currency: 'ZMW',
    status: 'pending',
    reference: 'BT-123456-XYZ789',
    timestamp: new Date().toISOString(),
    bankCode: 'ZANACO',
    accountNumber: '1234567890123456',
    accountName: 'John Doe'
};

// Set up MSW server
const server = setupServer(
    // Mobile Money Payment Endpoints
    rest.post('https://api.garagiflow.com/mobile-money/initiate', (req, res, ctx) => {
        return res(
            ctx.json({
                success: true,
                payment: mockMobileMoneyPayment,
                message: 'Payment initiated successfully'
            })
        );
    }),

    rest.get('https://api.garagiflow.com/mobile-money/verify/:reference', (req, res, ctx) => {
        return res(
            ctx.json({
                verified: true,
                payment: mockMobileMoneyPayment,
                verificationId: 'VER123',
                verifiedAt: new Date().toISOString()
            })
        );
    }),

    // Bank Transfer Endpoints
    rest.post('https://api.garagiflow.com/bank-transfer/initiate', (req, res, ctx) => {
        return res(
            ctx.json({
                success: true,
                payment: mockBankTransfer,
                message: 'Bank transfer initiated successfully'
            })
        );
    }),

    rest.get('https://api.garagiflow.com/bank-transfer/verify/:reference', (req, res, ctx) => {
        return res(
            ctx.json({
                verified: true,
                payment: mockBankTransfer,
                verificationId: 'VER456',
                verifiedAt: new Date().toISOString()
            })
        );
    }),

    // Receipt Endpoint
    rest.get('https://api.garagiflow.com/payments/receipts/:paymentId', (req, res, ctx) => {
        return res(
            ctx.json({
                paymentId: req.params.paymentId,
                receiptNumber: 'REC-2024-001',
                customerName: 'John Doe',
                paymentDetails: mockMobileMoneyPayment,
                issuedAt: new Date().toISOString(),
                items: [
                    { description: 'Service A', amount: 500 },
                    { description: 'Service B', amount: 500 }
                ],
                subtotal: 1000,
                tax: 160,
                total: 1160
            })
        );
    })
);

// Enable API mocking before tests
beforeAll(() => server.listen());

// Reset any runtime request handlers we may add during the tests
afterEach(() => server.resetHandlers());

// Disable API mocking after the tests are done
afterAll(() => server.close());

// Create a wrapper component with Redux store
const createWrapper = () => {
    const store = configureStore({
        reducer: {
            [paymentsApi.reducerPath]: paymentsApi.reducer
        },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware().concat(paymentsApi.middleware)
    });

    return ({ children }: { children: React.ReactNode }) => (
        <Provider store= { store } > { children } </Provider>
  );
};

describe('PaymentsApi', () => {
    describe('Mobile Money Payments', () => {
        it('should initiate a mobile money payment successfully', async () => {
            const { result } = renderHook(
                () => paymentsApi.useInitiateMobileMoneyPaymentMutation(),
                { wrapper: createWrapper() }
            );

            const [initiateMobileMoneyPayment] = result.current;

            const response = await initiateMobileMoneyPayment({
                amount: 1000,
                provider: 'airtel',
                phoneNumber: '0977123456',
                description: 'Test payment'
            }).unwrap();

            expect(response.success).toBe(true);
            expect(response.payment.type).toBe('mobile_money');
            expect(response.payment.provider).toBe('airtel');
        });

        it('should verify a mobile money payment successfully', async () => {
            const { result } = renderHook(
                () => paymentsApi.useVerifyMobileMoneyPaymentQuery({
                    reference: 'MM-123456-ABC123',
                    provider: 'airtel'
                }),
                { wrapper: createWrapper() }
            );

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data?.verified).toBe(true);
            expect(result.current.data?.payment.reference).toBe('MM-123456-ABC123');
        });
    });

    describe('Bank Transfer Payments', () => {
        it('should initiate a bank transfer successfully', async () => {
            const { result } = renderHook(
                () => paymentsApi.useInitiateBankTransferMutation(),
                { wrapper: createWrapper() }
            );

            const [initiateBankTransfer] = result.current;

            const response = await initiateBankTransfer({
                amount: 2000,
                bankCode: 'ZANACO',
                accountNumber: '1234567890123456',
                accountName: 'John Doe',
                description: 'Test bank transfer'
            }).unwrap();

            expect(response.success).toBe(true);
            expect(response.payment.type).toBe('bank_transfer');
            expect(response.payment.bankCode).toBe('ZANACO');
        });

        it('should verify a bank transfer successfully', async () => {
            const { result } = renderHook(
                () => paymentsApi.useVerifyBankTransferQuery({
                    reference: 'BT-123456-XYZ789',
                    bankCode: 'ZANACO'
                }),
                { wrapper: createWrapper() }
            );

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data?.verified).toBe(true);
            expect(result.current.data?.payment.reference).toBe('BT-123456-XYZ789');
        });
    });

    describe('Payment Receipts', () => {
        it('should fetch a payment receipt successfully', async () => {
            const { result } = renderHook(
                () => paymentsApi.useGetPaymentReceiptQuery({
                    paymentId: 'test-payment-1'
                }),
                { wrapper: createWrapper() }
            );

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data?.receiptNumber).toBeDefined();
            expect(result.current.data?.customerName).toBe('John Doe');
            expect(result.current.data?.items).toHaveLength(2);
            expect(result.current.data?.total).toBe(1160);
        });
    });
});

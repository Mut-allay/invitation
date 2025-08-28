import { describe, it, expect, beforeAll, afterEach, afterAll, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import MobileMoneyPayment from '../MobileMoneyPayment';
import BankTransferPayment from '../BankTransferPayment';
import { paymentsApi } from '../../../store/api/paymentsApi';

// Mock payment data
const mockPayments = {
    airtel: {
        id: 'test-payment-1',
        reference: 'AM-123456',
        status: 'completed',
        provider: 'airtel',
        amount: 1000,
        phoneNumber: '0977123456'
    },
    mtn: {
        id: 'test-payment-2',
        reference: 'MM-123456',
        status: 'completed',
        provider: 'mtn',
        amount: 1500,
        phoneNumber: '0966123456'
    },
    zamtel: {
        id: 'test-payment-3',
        reference: 'ZM-123456',
        status: 'completed',
        provider: 'zamtel',
        amount: 2000,
        phoneNumber: '0955123456'
    }
};

// Set up MSW server
const server = setupServer(
    // Mobile Money endpoints
    http.post('*/mobile-money/initiate', async ({ request }) => {
        const body = await request.json();
        const { provider } = body;

        if (!provider || !['airtel', 'mtn', 'zamtel'].includes(provider)) {
            return new HttpResponse(null, { status: 400 });
        }

        return HttpResponse.json({
            success: true,
            payment: mockPayments[provider as keyof typeof mockPayments]
        });
    }),

    http.get('*/mobile-money/verify/:reference', ({ params }) => {
        const { reference } = params;

        if (!reference || typeof reference !== 'string') {
            return new HttpResponse(null, { status: 400 });
        }

        return HttpResponse.json({
            success: true,
            payment: {
                id: 'test-payment-1',
                reference,
                status: 'completed',
                provider: 'airtel',
                amount: 1000,
                phoneNumber: '0977123456'
            }
        });
    }),

    // Bank Transfer endpoints
    http.post('*/bank-transfer/initiate', async () => {
        return HttpResponse.json({
            success: true,
            payment: {
                id: 'test-bank-1',
                reference: 'BT-123456',
                status: 'pending',
                bankCode: 'ZANACO',
                amount: 2000,
                accountNumber: '1234567890123456'
            }
        });
    }),

    http.get('*/bank-transfer/verify/:reference', ({ params }) => {
        const { reference } = params;

        if (!reference || typeof reference !== 'string') {
            return new HttpResponse(null, { status: 400 });
        }

        return HttpResponse.json({
            verified: true,
            status: 'completed',
            reference
        });
    })
);

// Start server before all tests
beforeAll(() => server.listen());

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Close server after all tests
afterAll(() => server.close());

// Test component props
const mockMobileMoneyProps = {
    amount: 1000,
    onPaymentComplete: vi.fn(),
    onCancel: vi.fn(),
    isLoading: false
};

const mockBankTransferProps = {
    amount: 2000,
    onPaymentComplete: vi.fn(),
    onCancel: vi.fn()
};

// Helper function to create a wrapper with Redux store
const createWrapper = () => {
    const store = configureStore({
        reducer: {
            [paymentsApi.reducerPath]: paymentsApi.reducer
        },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware().concat(paymentsApi.middleware)
    });

    return ({ children }: { children: React.ReactNode }) => (
        <Provider store={store}>{children}</Provider>
    );
};

describe('Payment Integration Tests', () => {
    describe('Mobile Money Payment', () => {
        it('completes Airtel Money payment flow', async () => {
            render(<MobileMoneyPayment {...mockMobileMoneyProps} />, { wrapper: createWrapper() });

            // Select Airtel Money
            fireEvent.click(screen.getByText('Airtel Money'));

            // Enter phone number
            const phoneInput = screen.getByLabelText('Phone Number');
            fireEvent.change(phoneInput, { target: { value: '0977123456' } });

            // Continue to confirmation
            fireEvent.click(screen.getByText('Continue'));

            // Confirm payment
            const confirmButton = screen.getByRole('button', { name: /confirm payment/i });
            fireEvent.click(confirmButton);

            // Wait for success
            await waitFor(
                () => {
                    expect(screen.getByText(/payment successful/i)).toBeInTheDocument();
                },
                { timeout: 15000 }
            );

            expect(mockMobileMoneyProps.onPaymentComplete).toHaveBeenCalled();
        });

        it('completes MTN Money payment flow', async () => {
            render(<MobileMoneyPayment {...mockMobileMoneyProps} />, { wrapper: createWrapper() });

            // Select MTN Money
            fireEvent.click(screen.getByText('MTN Money'));

            // Enter phone number
            const phoneInput = screen.getByLabelText('Phone Number');
            fireEvent.change(phoneInput, { target: { value: '0966123456' } });

            // Continue to confirmation
            fireEvent.click(screen.getByText('Continue'));

            // Confirm payment
            const confirmButton = screen.getByRole('button', { name: /confirm payment/i });
            fireEvent.click(confirmButton);

            // Wait for success
            await waitFor(
                () => {
                    expect(screen.getByText(/payment successful/i)).toBeInTheDocument();
                },
                { timeout: 15000 }
            );

            expect(mockMobileMoneyProps.onPaymentComplete).toHaveBeenCalled();
        });

        it('completes Zamtel Money payment flow', async () => {
            render(<MobileMoneyPayment {...mockMobileMoneyProps} />, { wrapper: createWrapper() });

            // Select Zamtel Money
            fireEvent.click(screen.getByText('Zamtel Money'));

            // Enter phone number
            const phoneInput = screen.getByLabelText('Phone Number');
            fireEvent.change(phoneInput, { target: { value: '0955123456' } });

            // Continue to confirmation
            fireEvent.click(screen.getByText('Continue'));

            // Confirm payment
            const confirmButton = screen.getByRole('button', { name: /confirm payment/i });
            fireEvent.click(confirmButton);

            // Wait for success
            await waitFor(
                () => {
                    expect(screen.getByText(/payment successful/i)).toBeInTheDocument();
                },
                { timeout: 15000 }
            );

            expect(mockMobileMoneyProps.onPaymentComplete).toHaveBeenCalled();
        });

        it('handles invalid phone number', async () => {
            render(<MobileMoneyPayment {...mockMobileMoneyProps} />, { wrapper: createWrapper() });

            // Select Airtel Money
            fireEvent.click(screen.getByText('Airtel Money'));

            // Enter invalid phone number
            const phoneInput = screen.getByLabelText('Phone Number');
            fireEvent.change(phoneInput, { target: { value: '12345' } });

            expect(screen.getByText('Please enter a valid phone number')).toBeInTheDocument();
            expect(screen.getByText('Continue')).toBeDisabled();
        });
    });

    describe('Bank Transfer Payment', () => {
        it('completes bank transfer flow', async () => {
            render(<BankTransferPayment {...mockBankTransferProps} />, { wrapper: createWrapper() });

            // Select bank
            fireEvent.click(screen.getByText('Zambia National Commercial Bank'));

            // Enter account details
            fireEvent.change(screen.getByLabelText('Account Number'), {
                target: { value: '1234567890123456' }
            });
            fireEvent.change(screen.getByLabelText('Account Holder Name'), {
                target: { value: 'John Doe' }
            });

            // Continue to confirmation
            fireEvent.click(screen.getByText('Continue'));

            // Confirm transfer
            fireEvent.click(screen.getByText('Confirm Transfer'));

            // Wait for success
            await waitFor(
                () => {
                    expect(screen.getByText(/transfer initiated successfully/i)).toBeInTheDocument();
                },
                { timeout: 15000 }
            );

            expect(mockBankTransferProps.onPaymentComplete).toHaveBeenCalled();
        });

        it('handles invalid account number', async () => {
            render(<BankTransferPayment {...mockBankTransferProps} />, { wrapper: createWrapper() });

            // Select bank
            fireEvent.click(screen.getByText('Zambia National Commercial Bank'));

            // Enter invalid account number
            fireEvent.change(screen.getByLabelText('Account Number'), {
                target: { value: '12345' }
            });
            fireEvent.change(screen.getByLabelText('Account Holder Name'), {
                target: { value: 'John Doe' }
            });

            // Try to continue
            fireEvent.click(screen.getByText('Continue'));

            expect(screen.getByText('Please enter a valid 16-digit account number')).toBeInTheDocument();
        });
    });

    describe('Error Handling', () => {
        it('handles network errors', async () => {
            // Mock network error
            server.use(
                http.post('*/mobile-money/initiate', () => {
                    return new HttpResponse(
                        JSON.stringify({
                            success: false,
                            error: 'Payment failed. Please try again.'
                        }),
                        { status: 500 }
                    );
                })
            );

            render(<MobileMoneyPayment {...mockMobileMoneyProps} />, { wrapper: createWrapper() });

            // Select Airtel Money
            fireEvent.click(screen.getByText('Airtel Money'));

            // Enter phone number
            const phoneInput = screen.getByLabelText('Phone Number');
            fireEvent.change(phoneInput, { target: { value: '0977123456' } });

            // Continue to confirmation
            fireEvent.click(screen.getByText('Continue'));

            // Confirm payment
            const confirmButton = screen.getByRole('button', { name: /confirm payment/i });
            fireEvent.click(confirmButton);

            // Wait for processing state
            await waitFor(() => {
                expect(screen.getByText(/processing payment/i)).toBeInTheDocument();
            });

            // Wait for error state
            await waitFor(
                () => {
                    expect(screen.getByRole('heading', { name: /payment failed/i })).toBeInTheDocument();
                },
                { timeout: 15000 }
            );
        });

        it('handles verification failure', async () => {
            // Mock verification failure
            server.use(
                http.post('*/mobile-money/initiate', () => {
                    return HttpResponse.json({
                        success: true,
                        payment: {
                            id: 'test-payment-1',
                            reference: 'AM-123456',
                            status: 'pending',
                            provider: 'airtel',
                            amount: 1000,
                            phoneNumber: '0977123456'
                        }
                    });
                }),
                http.get('*/mobile-money/verify/:reference', () => {
                    return new HttpResponse(
                        JSON.stringify({
                            success: false,
                            error: 'Payment verification failed'
                        }),
                        { status: 400 }
                    );
                })
            );

            render(<MobileMoneyPayment {...mockMobileMoneyProps} />, { wrapper: createWrapper() });

            // Select Airtel Money
            fireEvent.click(screen.getByText('Airtel Money'));

            // Enter phone number
            const phoneInput = screen.getByLabelText('Phone Number');
            fireEvent.change(phoneInput, { target: { value: '0977123456' } });

            // Continue to confirmation
            fireEvent.click(screen.getByText('Continue'));

            // Confirm payment
            const confirmButton = screen.getByRole('button', { name: /confirm payment/i });
            fireEvent.click(confirmButton);

            // Wait for processing state
            await waitFor(() => {
                expect(screen.getByText('Processing Payment...')).toBeInTheDocument();
            });

            // Wait for error state
            await waitFor(
                () => {
                    expect(screen.getByText(/payment failed/i)).toBeInTheDocument();
                    expect(screen.getByText(/payment verification failed/i)).toBeInTheDocument();
                },
                { timeout: 15000 }
            );
        });
    });
});

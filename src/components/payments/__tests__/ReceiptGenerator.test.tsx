import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import ReceiptGenerator from '../ReceiptGenerator';
import { paymentsApi } from '../../../store/api/paymentsApi';

// Mock receipt data
const mockReceipt = {
    paymentId: 'test-payment-1',
    receiptNumber: 'REC-2024-001',
    customerName: 'John Doe',
    paymentDetails: {
        id: 'test-payment-1',
        type: 'mobile_money',
        amount: 1000,
        currency: 'ZMW',
        status: 'completed',
        reference: 'MM-123456-ABC123',
        timestamp: new Date().toISOString(),
        provider: 'airtel',
        phoneNumber: '0977123456'
    },
    issuedAt: new Date().toISOString(),
    items: [
        { description: 'Service A', amount: 500 },
        { description: 'Service B', amount: 500 }
    ],
    subtotal: 1000,
    tax: 160,
    total: 1160
};

// Set up MSW server
const server = setupServer(
    rest.get('https://api.garagiflow.com/payments/receipts/:paymentId', (req, res, ctx) => {
        return res(ctx.json(mockReceipt));
    })
);

// Enable API mocking before tests
beforeAll(() => server.listen());

// Reset any runtime request handlers we may add during the tests
afterEach(() => server.resetHandlers());

// Disable API mocking after the tests are done
afterAll(() => server.close());

// Mock window.print
const mockPrint = jest.fn();
Object.defineProperty(window, 'print', { value: mockPrint });

// Mock URL.createObjectURL and URL.revokeObjectURL
const mockCreateObjectURL = jest.fn();
const mockRevokeObjectURL = jest.fn();
Object.defineProperty(window.URL, 'createObjectURL', { value: mockCreateObjectURL });
Object.defineProperty(window.URL, 'revokeObjectURL', { value: mockRevokeObjectURL });

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

describe('ReceiptGenerator', () => {
    it('renders loading state initially', () => {
        render(<ReceiptGenerator paymentId="test-payment-1" />, { wrapper: createWrapper() });

        expect(screen.getByTestId('loading-animation')).toBeInTheDocument();
    });

    it('displays receipt details after loading', async () => {
        render(<ReceiptGenerator paymentId="test-payment-1" />, { wrapper: createWrapper() });

        await waitFor(() => {
            expect(screen.getByText('GARAGIFLOW AUTO SERVICES')).toBeInTheDocument();
        });

        expect(screen.getByText('REC-2024-001')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Mobile Money (airtel)')).toBeInTheDocument();
        expect(screen.getByText('Service A')).toBeInTheDocument();
        expect(screen.getByText('Service B')).toBeInTheDocument();
        expect(screen.getByText('ZMW 1,160.00')).toBeInTheDocument();
    });

    it('handles print functionality', async () => {
        render(<ReceiptGenerator paymentId="test-payment-1" />, { wrapper: createWrapper() });

        await waitFor(() => {
            expect(screen.getByText('Print')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Print'));
        expect(mockPrint).toHaveBeenCalled();
    });

    it('handles download functionality', async () => {
        render(<ReceiptGenerator paymentId="test-payment-1" />, { wrapper: createWrapper() });

        await waitFor(() => {
            expect(screen.getByText('Download')).toBeInTheDocument();
        });

        // Mock document.createElement and its methods
        const mockLink = {
            href: '',
            download: '',
            click: jest.fn(),
        };
        jest.spyOn(document, 'createElement').mockImplementation(() => mockLink as any);
        jest.spyOn(document.body, 'appendChild').mockImplementation(() => { });
        jest.spyOn(document.body, 'removeChild').mockImplementation(() => { });

        fireEvent.click(screen.getByText('Download'));

        expect(mockCreateObjectURL).toHaveBeenCalled();
        expect(mockLink.click).toHaveBeenCalled();
        expect(mockRevokeObjectURL).toHaveBeenCalled();
    });

    it('displays error state when receipt fetch fails', async () => {
        server.use(
            rest.get('https://api.garagiflow.com/payments/receipts/:paymentId', (req, res, ctx) => {
                return res(ctx.status(500));
            })
        );

        render(<ReceiptGenerator paymentId="test-payment-1" />, { wrapper: createWrapper() });

        await waitFor(() => {
            expect(screen.getByText('Failed to load receipt. Please try again later.')).toBeInTheDocument();
        });
    });

    it('formats currency amounts correctly', async () => {
        render(<ReceiptGenerator paymentId="test-payment-1" />, { wrapper: createWrapper() });

        await waitFor(() => {
            expect(screen.getByText('ZMW 1,000.00')).toBeInTheDocument(); // Subtotal
            expect(screen.getByText('ZMW 160.00')).toBeInTheDocument(); // VAT
            expect(screen.getByText('ZMW 1,160.00')).toBeInTheDocument(); // Total
        });
    });

    it('formats dates correctly', async () => {
        render(<ReceiptGenerator paymentId="test-payment-1" />, { wrapper: createWrapper() });

        await waitFor(() => {
            const dateElement = screen.getByText((content) => {
                return /\w+ \d{1,2}, \d{4}/.test(content); // Matches date format like "March 15, 2024"
            });
            expect(dateElement).toBeInTheDocument();
        });
    });
});

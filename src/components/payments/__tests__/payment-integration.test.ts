import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

// Mock Firebase config for testing
const mockFirebaseConfig = {
    apiKey: 'test-api-key',
    authDomain: 'test-project.firebaseapp.com',
    projectId: 'test-project',
    storageBucket: 'test-project.appspot.com',
    messagingSenderId: 'test-sender-id',
    appId: 'test-app-id'
};

// Initialize Firebase
const app = initializeApp(mockFirebaseConfig);
const auth = getAuth(app);
const functions = getFunctions(app);

// Test data for different providers
const testPayments = {
    airtel: {
        amount: 1000,
        provider: 'airtel',
        phoneNumber: '0977123456',
        description: 'Test Airtel Money payment'
    },
    mtn: {
        amount: 1500,
        provider: 'mtn',
        phoneNumber: '0966123456',
        description: 'Test MTN Money payment'
    },
    zamtel: {
        amount: 2000,
        provider: 'zamtel',
        phoneNumber: '0955123456',
        description: 'Test Zamtel Money payment'
    }
};

// Mock server
const server = setupServer(
    // Airtel Money endpoints
    rest.post('*/mobile-money/initiate', (req, res, ctx) => {
        return res(ctx.json({
            success: true,
            payment: {
                id: 'test-payment-1',
                reference: 'AM-123456',
                status: 'pending',
                ...testPayments.airtel
            }
        }));
    }),
    rest.get('*/mobile-money/verify/*', (req, res, ctx) => {
        return res(ctx.json({
            verified: true,
            status: 'completed',
            reference: 'AM-123456'
        }));
    }),

    // MTN Money endpoints
    rest.post('*/mobile-money/mtn/initiate', (req, res, ctx) => {
        return res(ctx.json({
            success: true,
            payment: {
                id: 'test-payment-2',
                reference: 'MM-123456',
                status: 'pending',
                ...testPayments.mtn
            }
        }));
    }),
    rest.get('*/mobile-money/mtn/verify/*', (req, res, ctx) => {
        return res(ctx.json({
            verified: true,
            status: 'completed',
            reference: 'MM-123456'
        }));
    }),

    // Zamtel Money endpoints
    rest.post('*/mobile-money/zamtel/initiate', (req, res, ctx) => {
        return res(ctx.json({
            success: true,
            payment: {
                id: 'test-payment-3',
                reference: 'ZM-123456',
                status: 'pending',
                ...testPayments.zamtel
            }
        }));
    }),
    rest.get('*/mobile-money/zamtel/verify/*', (req, res, ctx) => {
        return res(ctx.json({
            verified: true,
            status: 'completed',
            reference: 'ZM-123456'
        }));
    })
);

// Start server before all tests
beforeAll(() => server.listen());

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Close server after all tests
afterAll(() => server.close());

describe('Mobile Money Payment Integration', () => {
    // Test Airtel Money
    describe('Airtel Money', () => {
        it('should complete full payment flow', async () => {
            const initiateMobileMoneyPayment = httpsCallable(functions, 'initiateMobileMoneyPayment');
            const verifyMobileMoneyPayment = httpsCallable(functions, 'verifyMobileMoneyPayment');

            // Initialize payment
            const initResponse = await initiateMobileMoneyPayment(testPayments.airtel);
            expect(initResponse.data).toHaveProperty('success', true);
            expect(initResponse.data).toHaveProperty('payment.reference');

            // Verify payment
            const verifyResponse = await verifyMobileMoneyPayment({
                reference: (initResponse.data as any).payment.reference,
                provider: 'airtel'
            });
            expect(verifyResponse.data).toHaveProperty('verified', true);
        });

        it('should handle invalid phone number', async () => {
            const initiateMobileMoneyPayment = httpsCallable(functions, 'initiateMobileMoneyPayment');

            await expect(initiateMobileMoneyPayment({
                ...testPayments.airtel,
                phoneNumber: '12345'
            })).rejects.toThrow();
        });
    });

    // Test MTN Money
    describe('MTN Money', () => {
        it('should complete full payment flow', async () => {
            const initiateMobileMoneyPayment = httpsCallable(functions, 'initiateMobileMoneyPayment');
            const verifyMobileMoneyPayment = httpsCallable(functions, 'verifyMobileMoneyPayment');

            // Initialize payment
            const initResponse = await initiateMobileMoneyPayment(testPayments.mtn);
            expect(initResponse.data).toHaveProperty('success', true);
            expect(initResponse.data).toHaveProperty('payment.reference');

            // Verify payment
            const verifyResponse = await verifyMobileMoneyPayment({
                reference: (initResponse.data as any).payment.reference,
                provider: 'mtn'
            });
            expect(verifyResponse.data).toHaveProperty('verified', true);
        });

        it('should handle invalid phone number', async () => {
            const initiateMobileMoneyPayment = httpsCallable(functions, 'initiateMobileMoneyPayment');

            await expect(initiateMobileMoneyPayment({
                ...testPayments.mtn,
                phoneNumber: '12345'
            })).rejects.toThrow();
        });
    });

    // Test Zamtel Money
    describe('Zamtel Money', () => {
        it('should complete full payment flow', async () => {
            const initiateMobileMoneyPayment = httpsCallable(functions, 'initiateMobileMoneyPayment');
            const verifyMobileMoneyPayment = httpsCallable(functions, 'verifyMobileMoneyPayment');

            // Initialize payment
            const initResponse = await initiateMobileMoneyPayment(testPayments.zamtel);
            expect(initResponse.data).toHaveProperty('success', true);
            expect(initResponse.data).toHaveProperty('payment.reference');

            // Verify payment
            const verifyResponse = await verifyMobileMoneyPayment({
                reference: (initResponse.data as any).payment.reference,
                provider: 'zamtel'
            });
            expect(verifyResponse.data).toHaveProperty('verified', true);
        });

        it('should handle invalid phone number', async () => {
            const initiateMobileMoneyPayment = httpsCallable(functions, 'initiateMobileMoneyPayment');

            await expect(initiateMobileMoneyPayment({
                ...testPayments.zamtel,
                phoneNumber: '12345'
            })).rejects.toThrow();
        });
    });

    // Test error scenarios
    describe('Error Scenarios', () => {
        it('should handle network errors', async () => {
            // Simulate network error
            server.use(
                rest.post('*/mobile-money/initiate', (req, res, ctx) => {
                    return res.networkError('Failed to connect');
                })
            );

            const initiateMobileMoneyPayment = httpsCallable(functions, 'initiateMobileMoneyPayment');
            await expect(initiateMobileMoneyPayment(testPayments.airtel)).rejects.toThrow();
        });

        it('should handle invalid payment verification', async () => {
            const verifyMobileMoneyPayment = httpsCallable(functions, 'verifyMobileMoneyPayment');

            await expect(verifyMobileMoneyPayment({
                reference: 'invalid-reference',
                provider: 'airtel'
            })).rejects.toThrow();
        });

        it('should handle insufficient amount', async () => {
            const initiateMobileMoneyPayment = httpsCallable(functions, 'initiateMobileMoneyPayment');

            await expect(initiateMobileMoneyPayment({
                ...testPayments.airtel,
                amount: 0
            })).rejects.toThrow();
        });
    });
});

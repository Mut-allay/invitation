import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.test' });

// Initialize Firebase with test configuration
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
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

// Mock server responses
const server = setupServer(
    // Airtel Money responses
    rest.post('/mobile-money/airtel/initiate', (req, res, ctx) => {
        return res(ctx.json({
            success: true,
            payment: {
                reference: 'AM-123456',
                status: 'pending',
                ...testPayments.airtel
            }
        }));
    }),
    rest.get('/mobile-money/airtel/verify/:reference', (req, res, ctx) => {
        return res(ctx.json({
            verified: true,
            status: 'completed',
            reference: req.params.reference
        }));
    }),

    // MTN Money responses
    rest.post('/mobile-money/mtn/initiate', (req, res, ctx) => {
        return res(ctx.json({
            success: true,
            payment: {
                reference: 'MM-123456',
                status: 'pending',
                ...testPayments.mtn
            }
        }));
    }),
    rest.get('/mobile-money/mtn/verify/:reference', (req, res, ctx) => {
        return res(ctx.json({
            verified: true,
            status: 'completed',
            reference: req.params.reference
        }));
    }),

    // Zamtel Money responses
    rest.post('/mobile-money/zamtel/initiate', (req, res, ctx) => {
        return res(ctx.json({
            success: true,
            payment: {
                reference: 'ZM-123456',
                status: 'pending',
                ...testPayments.zamtel
            }
        }));
    }),
    rest.get('/mobile-money/zamtel/verify/:reference', (req, res, ctx) => {
        return res(ctx.json({
            verified: true,
            status: 'completed',
            reference: req.params.reference
        }));
    })
);

// Helper function to wait
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Test mobile money payment flow for a specific provider
async function testProviderPaymentFlow(provider: 'airtel' | 'mtn' | 'zamtel') {
    const testData = testPayments[provider];
    console.log(`\n🔄 Testing ${provider.toUpperCase()} Money Payment Flow...`);

    try {
        // Step 1: Initialize payment
        console.log(`📱 Initiating ${provider} payment...`);
        const initiateMobileMoneyPayment = httpsCallable(functions, 'initiateMobileMoneyPayment');
        const initResponse = await initiateMobileMoneyPayment(testData);
        console.log('✅ Payment Initiated:', initResponse.data);

        // Step 2: Simulate user confirming payment on their phone
        console.log('⏳ Simulating user payment confirmation...');
        await wait(3000);

        // Step 3: Verify payment
        console.log('🔍 Verifying payment status...');
        const verifyMobileMoneyPayment = httpsCallable(functions, 'verifyMobileMoneyPayment');
        const verifyResponse = await verifyMobileMoneyPayment({
            reference: (initResponse.data as any).payment.reference,
            provider: testData.provider
        });
        console.log('✅ Payment Verified:', verifyResponse.data);

        // Step 4: Get receipt
        console.log('📄 Generating receipt...');
        const getPaymentReceipt = httpsCallable(functions, 'getPaymentReceipt');
        const receiptResponse = await getPaymentReceipt({
            paymentId: (initResponse.data as any).payment.id
        });
        console.log('✅ Receipt Generated:', receiptResponse.data);

        return {
            success: true,
            provider,
            initResponse: initResponse.data,
            verifyResponse: verifyResponse.data,
            receiptResponse: receiptResponse.data
        };
    } catch (error) {
        console.error(`❌ ${provider.toUpperCase()} Money Test Failed:`, error);
        return {
            success: false,
            provider,
            error
        };
    }
}

// Test error scenarios for a specific provider
async function testProviderErrorScenarios(provider: 'airtel' | 'mtn' | 'zamtel') {
    console.log(`\n🔄 Testing ${provider.toUpperCase()} Money Error Scenarios...`);
    const testData = testPayments[provider];

    try {
        // Test invalid phone number
        console.log('📱 Testing invalid phone number...');
        const initiateMobileMoneyPayment = httpsCallable(functions, 'initiateMobileMoneyPayment');
        try {
            await initiateMobileMoneyPayment({
                ...testData,
                phoneNumber: '12345' // Invalid number
            });
            console.error('❌ Invalid phone number test failed: Expected error not thrown');
            return false;
        } catch (error) {
            console.log('✅ Invalid phone number handled correctly');
        }

        // Test insufficient amount
        console.log('💰 Testing insufficient amount...');
        try {
            await initiateMobileMoneyPayment({
                ...testData,
                amount: 0.5 // Below minimum
            });
            console.error('❌ Insufficient amount test failed: Expected error not thrown');
            return false;
        } catch (error) {
            console.log('✅ Insufficient amount handled correctly');
        }

        // Test invalid payment verification
        console.log('🔍 Testing invalid payment verification...');
        const verifyMobileMoneyPayment = httpsCallable(functions, 'verifyMobileMoneyPayment');
        try {
            await verifyMobileMoneyPayment({
                reference: 'invalid-reference',
                provider: testData.provider
            });
            console.error('❌ Invalid reference test failed: Expected error not thrown');
            return false;
        } catch (error) {
            console.log('✅ Invalid reference handled correctly');
        }

        return true;
    } catch (error) {
        console.error(`❌ ${provider.toUpperCase()} Money Error Scenarios Failed:`, error);
        return false;
    }
}

// Main test runner
async function runMobileMoneyTests() {
    try {
        // Enable API mocking
        server.listen();

        // Sign in with test account
        await signInWithEmailAndPassword(
            auth,
            process.env.TEST_USER_EMAIL || '',
            process.env.TEST_USER_PASSWORD || ''
        );
        console.log('✅ Test user authenticated');

        // Test all providers
        const providers = ['airtel', 'mtn', 'zamtel'] as const;
        const results = await Promise.all(
            providers.map(provider => testProviderPaymentFlow(provider))
        );

        // Test error scenarios
        const errorResults = await Promise.all(
            providers.map(provider => testProviderErrorScenarios(provider))
        );

        // Print summary
        console.log('\n📊 Test Summary:');
        providers.forEach((provider, index) => {
            console.log(`\n${provider.toUpperCase()} Money Tests:`);
            console.log(`Payment Flow: ${results[index].success ? '✅ Passed' : '❌ Failed'}`);
            console.log(`Error Scenarios: ${errorResults[index] ? '✅ Passed' : '❌ Failed'}`);
        });

        const allPassed = results.every(r => r.success) && errorResults.every(r => r);
        console.log('\n🎯 Final Result:', allPassed ? '✅ All tests passed!' : '❌ Some tests failed');

    } catch (error) {
        console.error('❌ Test Runner Failed:', error);
    } finally {
        // Clean up
        await auth.signOut();
        console.log('\n👋 Test user signed out');
        server.close();
    }
}

// Run the tests
runMobileMoneyTests();

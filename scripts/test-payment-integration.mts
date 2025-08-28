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

        return {
            success: true,
            provider,
            initResponse: initResponse.data,
            verifyResponse: verifyResponse.data
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

// Main test runner
async function runMobileMoneyTests() {
    try {
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

        // Print summary
        console.log('\n📊 Test Summary:');
        providers.forEach((provider, index) => {
            console.log(`\n${provider.toUpperCase()} Money Tests:`);
            console.log(`Payment Flow: ${results[index].success ? '✅ Passed' : '❌ Failed'}`);
        });

        const allPassed = results.every(r => r.success);
        console.log('\n🎯 Final Result:', allPassed ? '✅ All tests passed!' : '❌ Some tests failed');

    } catch (error) {
        console.error('❌ Test Runner Failed:', error);
    } finally {
        // Clean up
        await auth.signOut();
        console.log('\n👋 Test user signed out');
    }
}

// Run the tests
runMobileMoneyTests();

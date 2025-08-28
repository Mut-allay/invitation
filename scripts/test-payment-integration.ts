import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

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

// Test data
const testMobileMoneyPayment = {
    amount: 1000,
    provider: 'airtel',
    phoneNumber: '0977123456',
    description: 'Test mobile money payment'
};

const testBankTransfer = {
    amount: 2000,
    bankCode: 'ZANACO',
    accountNumber: '1234567890123456',
    accountName: 'John Doe',
    description: 'Test bank transfer'
};

// Helper function to wait for a specified time
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Test mobile money payment
async function testMobileMoneyFlow() {
    console.log('\n🔄 Testing Mobile Money Payment Flow...');

    try {
        // Initialize payment
        const initiateMobileMoneyPayment = httpsCallable(functions, 'initiateMobileMoneyPayment');
        const initResponse = await initiateMobileMoneyPayment(testMobileMoneyPayment);
        console.log('✅ Payment Initiated:', initResponse.data);

        // Wait for a moment to simulate payment processing
        console.log('⏳ Waiting for payment processing...');
        await wait(5000);

        // Verify payment
        const verifyMobileMoneyPayment = httpsCallable(functions, 'verifyMobileMoneyPayment');
        const verifyResponse = await verifyMobileMoneyPayment({
            reference: (initResponse.data as any).payment.reference,
            provider: testMobileMoneyPayment.provider
        });
        console.log('✅ Payment Verified:', verifyResponse.data);

        return true;
    } catch (error) {
        console.error('❌ Mobile Money Test Failed:', error);
        return false;
    }
}

// Test bank transfer
async function testBankTransferFlow() {
    console.log('\n🔄 Testing Bank Transfer Flow...');

    try {
        // Initialize transfer
        const initiateBankTransfer = httpsCallable(functions, 'initiateBankTransfer');
        const initResponse = await initiateBankTransfer(testBankTransfer);
        console.log('✅ Transfer Initiated:', initResponse.data);

        // Wait for a moment to simulate transfer processing
        console.log('⏳ Waiting for transfer processing...');
        await wait(5000);

        // Verify transfer
        const verifyBankTransfer = httpsCallable(functions, 'verifyBankTransfer');
        const verifyResponse = await verifyBankTransfer({
            reference: (initResponse.data as any).payment.reference,
            bankCode: testBankTransfer.bankCode
        });
        console.log('✅ Transfer Verified:', verifyResponse.data);

        return true;
    } catch (error) {
        console.error('❌ Bank Transfer Test Failed:', error);
        return false;
    }
}

// Test receipt generation
async function testReceiptGeneration() {
    console.log('\n🔄 Testing Receipt Generation...');

    try {
        const getPaymentReceipt = httpsCallable(functions, 'getPaymentReceipt');
        const response = await getPaymentReceipt({ paymentId: 'test-payment-1' });
        console.log('✅ Receipt Generated:', response.data);

        return true;
    } catch (error) {
        console.error('❌ Receipt Generation Test Failed:', error);
        return false;
    }
}

// Test error scenarios
async function testErrorScenarios() {
    console.log('\n🔄 Testing Error Scenarios...');
    let passed = true;

    try {
        // Test invalid mobile money provider
        const initiateMobileMoneyPayment = httpsCallable(functions, 'initiateMobileMoneyPayment');
        try {
            await initiateMobileMoneyPayment({
                ...testMobileMoneyPayment,
                provider: 'invalid'
            });
            console.error('❌ Invalid provider test failed: Expected error not thrown');
            passed = false;
        } catch (error) {
            console.log('✅ Invalid provider handled correctly');
        }

        // Test invalid bank code
        const initiateBankTransfer = httpsCallable(functions, 'initiateBankTransfer');
        try {
            await initiateBankTransfer({
                ...testBankTransfer,
                bankCode: 'INVALID'
            });
            console.error('❌ Invalid bank code test failed: Expected error not thrown');
            passed = false;
        } catch (error) {
            console.log('✅ Invalid bank code handled correctly');
        }

        // Test invalid payment verification
        const verifyMobileMoneyPayment = httpsCallable(functions, 'verifyMobileMoneyPayment');
        try {
            await verifyMobileMoneyPayment({
                reference: 'invalid-reference',
                provider: 'airtel'
            });
            console.error('❌ Invalid reference test failed: Expected error not thrown');
            passed = false;
        } catch (error) {
            console.log('✅ Invalid reference handled correctly');
        }

        return passed;
    } catch (error) {
        console.error('❌ Error Scenarios Test Failed:', error);
        return false;
    }
}

// Main test runner
async function runTests() {
    try {
        // Sign in with test account
        await signInWithEmailAndPassword(
            auth,
            process.env.TEST_USER_EMAIL || '',
            process.env.TEST_USER_PASSWORD || ''
        );
        console.log('✅ Test user authenticated');

        // Run all tests
        const results = await Promise.all([
            testMobileMoneyFlow(),
            testBankTransferFlow(),
            testReceiptGeneration(),
            testErrorScenarios()
        ]);

        // Print summary
        console.log('\n📊 Test Summary:');
        console.log('Mobile Money Flow:', results[0] ? '✅ Passed' : '❌ Failed');
        console.log('Bank Transfer Flow:', results[1] ? '✅ Passed' : '❌ Failed');
        console.log('Receipt Generation:', results[2] ? '✅ Passed' : '❌ Failed');
        console.log('Error Scenarios:', results[3] ? '✅ Passed' : '❌ Failed');

        const allPassed = results.every(result => result);
        console.log('\n🎯 Final Result:', allPassed ? '✅ All tests passed!' : '❌ Some tests failed');

    } catch (error) {
        console.error('❌ Test Runner Failed:', error);
    } finally {
        // Sign out after tests
        await auth.signOut();
        console.log('\n👋 Test user signed out');
    }
}

// Run the tests
runTests();

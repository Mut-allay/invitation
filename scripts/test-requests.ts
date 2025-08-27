import { createInterface } from 'readline';
import * as admin from 'firebase-admin';
import functionsTest from 'firebase-functions-test';
import functionsModule from '../functions/lib/index';

const rl = createInterface({
    input: process.stdin,
    output: process.stdout
});

// Initialize Firebase Admin with emulator config
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
process.env.FIREBASE_STORAGE_EMULATOR_HOST = 'localhost:9199';
process.env.FUNCTIONS_EMULATOR = 'true';

// Initialize Firebase Admin
admin.initializeApp({
    projectId: 'garaji-flow-test',
    storageBucket: 'garaji-flow-test.appspot.com'
});

// Initialize Firebase Functions Test SDK
const testEnv = functionsTest({
    projectId: 'garaji-flow-test'
});

// Create a test user
const testUser = {
    uid: 'test-user',
    email: 'test@example.com',
    token: {
        tenant_id: 'test-tenant'
    }
};

// Import test data
import { coreData, paymentData, zraData, analyticsData } from './test-data';

// Combined test data
const testData = {
    ...coreData,
    mtnPayment: paymentData.mtn,
    airtelPayment: paymentData.airtel,
    zamtelPayment: paymentData.zamtel,
    bankTransfer: paymentData.bank,
    cashPayment: paymentData.cash,
    zraInvoice: zraData.invoice,
    vatCalculation: zraData.vat,
    tpinValidation: zraData.tpin,
    businessMetrics: analyticsData.metrics,
    predictiveAnalytics: analyticsData.predictive,
    auditLog: analyticsData.audit
};

async function makeRequest(functionName: string, data?: unknown) {
    try {
        console.log(`\n📡 Calling function ${functionName}...`);
        console.log('Request Data:', data || 'No data');

        // Get the function from the test environment
        const wrapped = testEnv.wrap(functionsModule[functionName as keyof typeof functionsModule]);

        // Call the function with test context
        const result = await wrapped(data, { auth: testUser });

        console.log('\n✅ Response received:');
        console.log(JSON.stringify(result, null, 2));
        return result;
    } catch (error: unknown) {
        const testError = error as { message: string; details?: unknown };
        console.error('\n❌ Error:', testError.message);
        if (testError.details) {
            console.error('Details:', testError.details);
        }
        throw error;
    }
}

const tests = {
    async testVehicle() {
        // Create vehicle
        const vehicle = await makeRequest('createVehicle', testData.vehicle);
        return vehicle;
    },

    async testCustomer() {
        // Create customer
        const customer = await makeRequest('createCustomer', testData.customer);
        return customer;
    },

    async testMTNPayment() {
        // Test MTN payment
        console.log('\n🔵 Testing MTN payment...');
        const payment = await makeRequest('initiatePayment', testData.mtnPayment);
        return payment;
    },

    async testAirtelPayment() {
        // Test Airtel payment
        console.log('\n🔴 Testing Airtel payment...');
        const payment = await makeRequest('initiatePayment', testData.airtelPayment);
        return payment;
    },

    async testZamtelPayment() {
        // Test Zamtel payment
        console.log('\n🟢 Testing Zamtel payment...');
        const payment = await makeRequest('initiatePayment', testData.zamtelPayment);
        return payment;
    },

    async testBankTransfer() {
        // Test bank transfer
        const payment = await makeRequest('initiatePayment', testData.bankTransfer);
        return payment;
    },

    async testZRAInvoice() {
        // Test ZRA invoice generation
        console.log('\n📄 Testing ZRA invoice generation...');
        const invoice = await makeRequest('createSmartInvoice', testData.zraInvoice);
        return invoice;
    },

    async testCashPayment() {
        // Test cash payment recording
        console.log('\n💵 Testing cash payment recording...');
        const payment = await makeRequest('recordCashPayment', testData.cashPayment);
        return payment;
    },

    async testVATCalculation() {
        // Test VAT calculation
        console.log('\n💰 Testing VAT calculation...');
        const vatResult = await makeRequest('calculateVAT', testData.vatCalculation);
        return vatResult;
    },

    async testTPINValidation() {
        // Test TPIN validation
        console.log('\n🔍 Testing TPIN validation...');
        const tpinResult = await makeRequest('validateTPIN', testData.tpinValidation);
        return tpinResult;
    },

    async testBusinessMetrics() {
        // Test business metrics
        console.log('\n📊 Testing business metrics...');
        const metrics = await makeRequest('getBusinessMetrics', testData.businessMetrics);
        return metrics;
    },

    async testPredictiveAnalytics() {
        // Test predictive analytics
        console.log('\n🔮 Testing predictive analytics...');
        const prediction = await makeRequest('predictInventoryNeeds', testData.predictiveAnalytics);
        return prediction;
    },

    async testAuditLogging() {
        // Test audit logging
        console.log('\n📝 Testing audit logging...');
        const auditResult = await makeRequest('logAuditEvent', testData.auditLog);
        return auditResult;
    },

    async testFullFlow() {
        // 1. Create vehicle
        console.log('\n🚗 Step 1: Creating vehicle...');
        const vehicle = await this.testVehicle();

        // 2. Create customer
        console.log('\n👤 Step 2: Creating customer...');
        const customer = await this.testCustomer();

        // 3. Create sale
        console.log('\n💰 Step 3: Creating sale...');
        const sale = await makeRequest('createSale', {
            vehicleId: vehicle.id,
            customerId: customer.id,
            price: vehicle.price,
            paymentMethod: 'MOBILE_MONEY'
        });

        // 4. Process payment
        console.log('\n💳 Step 4: Processing payment...');
        const payment = await makeRequest('initiatePayment', {
            ...testData.mtnPayment,
            amount: vehicle.price,
            metadata: { saleId: sale.id }
        });

        // 5. Generate invoice
        console.log('\n📄 Step 5: Generating ZRA invoice...');
        const invoice = await makeRequest('createSmartInvoice', {
            ...testData.zraInvoice,
            items: [{
                description: `Vehicle Purchase - ${vehicle.make} ${vehicle.model}`,
                quantity: 1,
                unitPrice: vehicle.price,
                vatRate: 16
            }]
        });

        return { vehicle, customer, sale, payment, invoice };
    }
};

async function showMenu() {
    const testMenu = [
        'Vehicle Creation',
        'Customer Creation',
        'MTN Payment',
        'Airtel Payment',
        'Zamtel Payment',
        'Bank Transfer',
        'Cash Payment',
        'ZRA Invoice',
        'VAT Calculation',
        'TPIN Validation',
        'Business Metrics',
        'Predictive Analytics',
        'Audit Logging',
        'Full Sales Flow',
        'Exit'
    ];

    console.log('\n🧪 Test Menu:');
    testMenu.forEach((item, index) => {
        console.log(`${index + 1}. Test ${item}`);
    });

    const answer = await new Promise<string>(resolve => {
        rl.question('\nSelect a test (1-15): ', resolve);
    });

    try {
        switch (answer) {
            case '1':
                await tests.testVehicle();
                break;
            case '2':
                await tests.testCustomer();
                break;
            case '3':
                await tests.testMTNPayment();
                break;
            case '4':
                await tests.testAirtelPayment();
                break;
            case '5':
                await tests.testZamtelPayment();
                break;
            case '6':
                await tests.testBankTransfer();
                break;
            case '7':
                await tests.testCashPayment();
                break;
            case '8':
                await tests.testZRAInvoice();
                break;
            case '9':
                await tests.testVATCalculation();
                break;
            case '10':
                await tests.testTPINValidation();
                break;
            case '11':
                await tests.testBusinessMetrics();
                break;
            case '12':
                await tests.testPredictiveAnalytics();
                break;
            case '13':
                await tests.testAuditLogging();
                break;
            case '14':
                await tests.testFullFlow();
                break;
            case '15':
                console.log('Goodbye! 👋');
                rl.close();
                return;
            default:
                console.log('Invalid option');
        }
    } catch (error) {
        console.error('Test failed:', error);
    }

    await showMenu();
}

// Start the test menu
console.log('🚀 Starting Test Interface...');
showMenu().catch(console.error);
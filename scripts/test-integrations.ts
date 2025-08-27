import axios from 'axios';

// Configuration
const config = {
    emulatorHost: 'http://localhost:5001/demo-garajiflow/us-central1',
    auth: {
        uid: 'test-user',
        token: {
            tenant_id: 'test-tenant'
        }
    }
};

// Test data
const testData = {
    vehicle: {
        make: 'Toyota',
        model: 'Corolla',
        year: 2020,
        vin: 'TEST1234567890',
        status: 'AVAILABLE',
        price: 25000
    },
    customer: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+260970000000',
        tpin: '1234567890'
    },
    payment: {
        mtn: {
            provider: 'MTN',
            phoneNumber: '260970000000',
            amount: 1000,
            currency: 'ZMW'
        },
        airtel: {
            provider: 'AIRTEL',
            phoneNumber: '260760000000',
            amount: 1000,
            currency: 'ZMW'
        },
        bank: {
            amount: 1000,
            currency: 'ZMW',
            sourceAccount: {
                accountNumber: '1234567890',
                accountName: 'Test Account',
                bankCode: 'ZANACO',
                branchCode: 'MAIN'
            },
            destinationAccount: {
                accountNumber: '0987654321',
                accountName: 'Recipient Account',
                bankCode: 'STANBIC',
                branchCode: 'MAIN'
            },
            reference: 'TEST-REF-001'
        }
    }
};

// Helper function to make authenticated requests
const makeRequest = async (endpoint: string, method: 'GET' | 'POST', data?: unknown) => {
    try {
        const response = await axios({
            method,
            url: `${config.emulatorHost}${endpoint}`,
            data,
            headers: {
                'Authorization': `Bearer test-token`,
                'X-Firebase-Auth': JSON.stringify(config.auth)
            }
        });
        return response.data;
    } catch (error: unknown) {
        const axiosError = error as { response?: { data: unknown }; message: string };
        console.error(`Error calling ${endpoint}:`, axiosError.response?.data || axiosError.message);
        throw error;
    }
};

// Test functions
async function testZRAIntegration() {
    console.log('\n🧪 Testing ZRA Integration...');

    try {
        // Test TPIN validation
        console.log('\nValidating TPIN...');
        const tpinValidation = await makeRequest('/validateTpin', 'POST', {
            tpin: testData.customer.tpin
        });
        console.log('✅ TPIN validation successful:', tpinValidation);

        // Test Smart Invoice generation
        console.log('\nGenerating Smart Invoice...');
        const invoice = await makeRequest('/createSmartInvoice', 'POST', {
            tpin: testData.customer.tpin,
            invoiceNumber: 'TEST-INV-001',
            items: [
                {
                    description: 'Vehicle Purchase',
                    quantity: 1,
                    unitPrice: testData.vehicle.price,
                    vatRate: 16
                }
            ]
        });
        console.log('✅ Smart Invoice generated:', invoice);

    } catch {
        console.error('❌ ZRA Integration test failed');
    }
}

async function testPaymentIntegrations() {
    console.log('\n🧪 Testing Payment Integrations...');

    try {
        // Test MTN Money
        console.log('\nTesting MTN Money payment...');
        const mtnPayment = await makeRequest('/initiatePayment', 'POST', testData.payment.mtn);
        console.log('✅ MTN Money payment initiated:', mtnPayment);

        // Test Airtel Money
        console.log('\nTesting Airtel Money payment...');
        const airtelPayment = await makeRequest('/initiatePayment', 'POST', testData.payment.airtel);
        console.log('✅ Airtel Money payment initiated:', airtelPayment);

        // Test Bank Transfer
        console.log('\nTesting Bank Transfer...');
        const bankTransfer = await makeRequest('/initiateTransfer', 'POST', testData.payment.bank);
        console.log('✅ Bank Transfer initiated:', bankTransfer);

    } catch {
        console.error('❌ Payment Integration test failed');
    }
}

async function testFullSalesFlow() {
    console.log('\n🧪 Testing Full Sales Flow...');

    try {
        // 1. Create Vehicle
        console.log('\nCreating vehicle...');
        const vehicle = await makeRequest('/createVehicle', 'POST', testData.vehicle);
        console.log('✅ Vehicle created:', vehicle);

        // 2. Create Customer
        console.log('\nCreating customer...');
        const customer = await makeRequest('/createCustomer', 'POST', testData.customer);
        console.log('✅ Customer created:', customer);

        // 3. Create Sale
        console.log('\nCreating sale...');
        const sale = await makeRequest('/createSale', 'POST', {
            vehicleId: vehicle.id,
            customerId: customer.id,
            price: vehicle.price,
            paymentMethod: 'MTN'
        });
        console.log('✅ Sale created:', sale);

        // 4. Process Payment
        console.log('\nProcessing payment...');
        const payment = await makeRequest('/initiatePayment', 'POST', {
            ...testData.payment.mtn,
            amount: vehicle.price,
            metadata: { saleId: sale.id }
        });
        console.log('✅ Payment processed:', payment);

        // 5. Generate Invoice
        console.log('\nGenerating invoice...');
        const invoice = await makeRequest('/createSmartInvoice', 'POST', {
            tpin: customer.tpin,
            invoiceNumber: `INV-${sale.id}`,
            items: [
                {
                    description: `Vehicle Purchase - ${vehicle.make} ${vehicle.model}`,
                    quantity: 1,
                    unitPrice: vehicle.price,
                    vatRate: 16
                }
            ]
        });
        console.log('✅ Invoice generated:', invoice);

    } catch {
        console.error('❌ Full Sales Flow test failed');
    }
}

// Run all tests
async function runAllTests() {
    console.log('🚀 Starting Integration Tests...');

    await testZRAIntegration();
    await testPaymentIntegrations();
    await testFullSalesFlow();

    console.log('\n✨ Integration Tests Completed');
}

// Run tests if called directly
if (require.main === module) {
    runAllTests().catch(console.error);
}

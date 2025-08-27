// Core business data
export const coreData = {
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
        phone: '260967000000',
        address: '123 Main St, Lusaka'
    }
};

// Payment data
export const paymentData = {
    mtn: {
        provider: 'MTN' as const,
        phoneNumber: '260967000000',
        amount: 1000,
        currency: 'ZMW' as const
    },
    airtel: {
        provider: 'AIRTEL' as const,
        phoneNumber: '260977000000',
        amount: 1000,
        currency: 'ZMW' as const
    },
    zamtel: {
        provider: 'ZAMTEL' as const,
        phoneNumber: '260950000000',
        amount: 1000,
        currency: 'ZMW' as const
    },
    bank: {
        bank: 'ZANACO' as const,
        accountNumber: '1234567890',
        accountName: 'John Doe',
        amount: 1000,
        currency: 'ZMW' as const,
        metadata: { purpose: 'test payment' }
    },
    cash: {
        amount: 1000,
        receiptNumber: 'RCPT-001',
        collectedBy: 'John Doe',
        metadata: {
            location: 'Main Branch',
            paymentMethod: 'CASH'
        }
    }
};

// ZRA data
export const zraData = {
    invoice: {
        customerId: 'test-customer',
        items: [{
            description: 'Vehicle Purchase',
            quantity: 1,
            unitPrice: 25000,
            vatRate: 16
        }]
    },
    vat: {
        items: [{
            amount: 1000,
            vatRate: 16
        }, {
            amount: 500,
            vatRate: 0 // VAT exempt
        }],
        customerType: 'business' as const
    },
    tpin: {
        tpin: '1234567890'
    }
};

// Analytics data
export const analyticsData = {
    metrics: {
        dateRange: {
            start: '2025-01-01',
            end: '2025-12-31'
        },
        metrics: ['sales', 'profit', 'inventory'] as const
    },
    predictive: {
        category: 'vehicles',
        timeFrame: 90 // days
    },
    audit: {
        action: 'PAYMENT_RECEIVED',
        entityType: 'PAYMENT',
        entityId: 'PAY-001',
        changes: {
            status: 'COMPLETED',
            amount: 1000
        }
    }
};

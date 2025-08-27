import { ZRAService } from '../zra';
import type { SmartInvoice, VATCalculation, TPINValidation } from '../zra';

describe('ZRA Integration', () => {
    let service: ZRAService;

    beforeEach(() => {
        service = new ZRAService();
        process.env.NODE_ENV = 'development';
    });

    describe('Smart Invoice', () => {
        const validInvoice: SmartInvoice = {
            customerId: 'test-customer',
            items: [{
                description: 'Vehicle Purchase',
                quantity: 1,
                unitPrice: 25000,
                vatRate: 16
            }]
        };

        it('should create smart invoice successfully', async () => {
            const response = await service.createSmartInvoice(validInvoice);
            expect(response.id).toBeDefined();
            expect(response.status).toBe('DRAFT');
            expect(response.items[0].vatAmount).toBe(4000); // 16% of 25000
            expect(response.items[0].total).toBe(29000); // 25000 + 4000
            expect(response.totalVat).toBe(4000);
            expect(response.totalAmount).toBe(29000);
        });

        it('should reject invalid VAT rate', async () => {
            const invalidInvoice = {
                customerId: 'test-customer',
                items: [{
                    description: 'Vehicle Purchase',
                    quantity: 1,
                    unitPrice: 25000,
                    vatRate: 101 // Max is 100
                }]
            };

            await expect(service.createSmartInvoice(invalidInvoice))
                .rejects
                .toThrow();
        });
    });

    describe('VAT Calculation', () => {
        const validCalculation: VATCalculation = {
            items: [{
                amount: 1000,
                vatRate: 16
            }, {
                amount: 500,
                vatRate: 0 // VAT exempt
            }],
            customerType: 'business'
        };

        it('should calculate VAT correctly', async () => {
            const response = await service.calculateVAT(validCalculation);
            expect(response.items[0].vatAmount).toBe(160); // 16% of 1000
            expect(response.items[0].total).toBe(1160); // 1000 + 160
            expect(response.items[1].vatAmount).toBe(0); // VAT exempt
            expect(response.items[1].total).toBe(500); // No VAT
            expect(response.totals.subTotal).toBe(1500); // 1000 + 500
            expect(response.totals.vatTotal).toBe(160); // Only first item has VAT
            expect(response.totals.grandTotal).toBe(1660); // 1500 + 160
        });

        it('should handle individual customers', async () => {
            const calculation = {
                ...validCalculation,
                customerType: 'individual' as const
            };

            const response = await service.calculateVAT(calculation);
            expect(response.customerType).toBe('individual');
        });
    });

    describe('TPIN Validation', () => {
        const validTPIN: TPINValidation = {
            tpin: '1234567890'
        };

        it('should validate TPIN successfully', async () => {
            const response = await service.validateTPIN(validTPIN);
            expect(response.isValid).toBe(true);
            expect(response.businessName).toBeDefined();
            expect(response.status).toBe('ACTIVE');
        });

        it('should reject invalid TPIN format', async () => {
            const invalidTPIN = {
                tpin: '123' // Must be 10 digits
            };

            await expect(service.validateTPIN(invalidTPIN))
                .rejects
                .toThrow();
        });
    });
});

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZRAService = exports.TPINValidationSchema = exports.VATCalculationSchema = exports.SmartInvoiceSchema = exports.SmartInvoiceItemSchema = void 0;
const zod_1 = require("zod");
const uuid_1 = require("uuid");
// Smart Invoice types
exports.SmartInvoiceItemSchema = zod_1.z.object({
    description: zod_1.z.string(),
    quantity: zod_1.z.number().positive(),
    unitPrice: zod_1.z.number().positive(),
    vatRate: zod_1.z.number().min(0).max(100)
});
exports.SmartInvoiceSchema = zod_1.z.object({
    customerId: zod_1.z.string(),
    items: zod_1.z.array(exports.SmartInvoiceItemSchema)
});
// VAT calculation types
exports.VATCalculationSchema = zod_1.z.object({
    items: zod_1.z.array(zod_1.z.object({
        amount: zod_1.z.number().positive(),
        vatRate: zod_1.z.number().min(0).max(100)
    })),
    customerType: zod_1.z.enum(['individual', 'business']).optional()
});
// TPIN validation types
exports.TPINValidationSchema = zod_1.z.object({
    tpin: zod_1.z.string().regex(/^\d{10}$/) // 10-digit TPIN
});
class ZRAService {
    constructor() {
        // Configuration will be used in production
        if (process.env.NODE_ENV === 'production') {
            if (!process.env.ZRA_API_KEY)
                throw new Error('ZRA_API_KEY is required in production');
            if (!process.env.ZRA_API_URL)
                throw new Error('ZRA_API_URL is required in production');
        }
    }
    async createSmartInvoice(invoice) {
        // Validate request
        exports.SmartInvoiceSchema.parse(invoice);
        if (process.env.NODE_ENV !== 'production') {
            // Return mock data in sandbox mode
            const processedItems = invoice.items.map(item => (Object.assign(Object.assign({}, item), { vatAmount: Math.round(item.unitPrice * item.quantity * (item.vatRate / 100)), total: Math.round(item.unitPrice * item.quantity * (1 + item.vatRate / 100)) })));
            const totalVat = processedItems.reduce((sum, item) => sum + item.vatAmount, 0);
            const totalAmount = processedItems.reduce((sum, item) => sum + item.total, 0);
            return {
                id: (0, uuid_1.v4)(),
                customerId: invoice.customerId,
                items: processedItems,
                totalAmount,
                totalVat,
                status: 'DRAFT'
            };
        }
        // In real implementation, this would call the ZRA API
        throw new Error('ZRA Smart Invoice creation not implemented for production');
    }
    async calculateVAT(calculation) {
        // Validate request
        exports.VATCalculationSchema.parse(calculation);
        const processedItems = calculation.items.map(item => {
            const vatAmount = Math.round(item.amount * (item.vatRate / 100));
            return Object.assign(Object.assign({}, item), { vatAmount, total: item.amount + vatAmount });
        });
        const subTotal = processedItems.reduce((sum, item) => sum + item.amount, 0);
        const vatTotal = processedItems.reduce((sum, item) => sum + item.vatAmount, 0);
        const grandTotal = subTotal + vatTotal;
        return {
            items: processedItems,
            totals: {
                subTotal,
                vatTotal,
                grandTotal
            },
            customerType: calculation.customerType
        };
    }
    async validateTPIN(validation) {
        // Validate request
        exports.TPINValidationSchema.parse(validation);
        if (process.env.NODE_ENV !== 'production') {
            // Return mock data in sandbox mode
            return {
                isValid: true,
                businessName: 'Test Business Ltd',
                registrationDate: '2020-01-01',
                status: 'ACTIVE'
            };
        }
        // In real implementation, this would call the ZRA API
        throw new Error('ZRA TPIN validation not implemented for production');
    }
}
exports.ZRAService = ZRAService;
//# sourceMappingURL=zra.js.map
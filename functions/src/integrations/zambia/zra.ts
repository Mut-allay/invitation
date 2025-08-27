import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

// Smart Invoice types
export const SmartInvoiceItemSchema = z.object({
    description: z.string(),
    quantity: z.number().positive(),
    unitPrice: z.number().positive(),
    vatRate: z.number().min(0).max(100)
});

export type SmartInvoiceItem = z.infer<typeof SmartInvoiceItemSchema>;

export const SmartInvoiceSchema = z.object({
    customerId: z.string(),
    items: z.array(SmartInvoiceItemSchema)
});

export type SmartInvoice = z.infer<typeof SmartInvoiceSchema>;

export interface SmartInvoiceResponse {
    id: string;
    customerId: string;
    items: Array<SmartInvoiceItem & {
        vatAmount: number;
        total: number;
    }>;
    totalAmount: number;
    totalVat: number;
    status: 'DRAFT' | 'SUBMITTED' | 'APPROVED';
}

// VAT calculation types
export const VATCalculationSchema = z.object({
    items: z.array(z.object({
        amount: z.number().positive(),
        vatRate: z.number().min(0).max(100)
    })),
    customerType: z.enum(['individual', 'business']).optional()
});

export type VATCalculation = z.infer<typeof VATCalculationSchema>;

export interface VATCalculationResponse {
    items: Array<{
        amount: number;
        vatRate: number;
        vatAmount: number;
        total: number;
    }>;
    totals: {
        subTotal: number;
        vatTotal: number;
        grandTotal: number;
    };
    customerType?: 'individual' | 'business';
}

// TPIN validation types
export const TPINValidationSchema = z.object({
    tpin: z.string().regex(/^\d{10}$/) // 10-digit TPIN
});

export type TPINValidation = z.infer<typeof TPINValidationSchema>;

export interface TPINValidationResponse {
    isValid: boolean;
    businessName?: string;
    registrationDate?: string;
    status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

export class ZRAService {
    private apiKey: string;
    private baseUrl: string;

    constructor() {
        this.apiKey = process.env.ZRA_API_KEY || '';
        this.baseUrl = process.env.ZRA_API_URL || 'https://api.zra.org.zm/v1';
    }

    public async createSmartInvoice(invoice: SmartInvoice): Promise<SmartInvoiceResponse> {
        // Validate request
        SmartInvoiceSchema.parse(invoice);

        if (process.env.NODE_ENV !== 'production') {
            // Return mock data in sandbox mode
            const processedItems = invoice.items.map(item => ({
                ...item,
                vatAmount: item.unitPrice * item.quantity * (item.vatRate / 100),
                total: item.unitPrice * item.quantity * (1 + item.vatRate / 100)
            }));

            const totalVat = processedItems.reduce((sum, item) => sum + item.vatAmount, 0);
            const totalAmount = processedItems.reduce((sum, item) => sum + item.total, 0);

            return {
                id: uuidv4(),
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

    public async calculateVAT(calculation: VATCalculation): Promise<VATCalculationResponse> {
        // Validate request
        VATCalculationSchema.parse(calculation);

        const processedItems = calculation.items.map(item => {
            const vatAmount = item.amount * (item.vatRate / 100);
            return {
                ...item,
                vatAmount,
                total: item.amount + vatAmount
            };
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

    public async validateTPIN(validation: TPINValidation): Promise<TPINValidationResponse> {
        // Validate request
        TPINValidationSchema.parse(validation);

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

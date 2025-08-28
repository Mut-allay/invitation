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
    constructor() {
        // Configuration will be used in production
        if (process.env.NODE_ENV === 'production') {
            if (!process.env.ZRA_API_KEY) throw new Error('ZRA_API_KEY is required in production');
            if (!process.env.ZRA_API_URL) throw new Error('ZRA_API_URL is required in production');
        }
    }

    public async createSmartInvoice(invoice: SmartInvoice): Promise<SmartInvoiceResponse> {
        // Validate request
        SmartInvoiceSchema.parse(invoice);

        if (process.env.NODE_ENV !== 'production') {
            // Return mock data in sandbox mode
            const processedItems = invoice.items.map(item => ({
                ...item,
                vatAmount: Math.round(item.unitPrice * item.quantity * (item.vatRate / 100)),
                total: Math.round(item.unitPrice * item.quantity * (1 + item.vatRate / 100))
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
            const vatAmount = Math.round(item.amount * (item.vatRate / 100));
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

    // Generate QR code for ZRA compliance
    public async generateQRCode(invoiceData: any): Promise<string> {
        // In a real implementation, this would generate a proper QR code
        // For now, return a simple SVG representation
        const qrData = {
            invoiceNumber: invoiceData.invoiceNumber,
            businessTpin: invoiceData.businessTpin,
            customerTpin: invoiceData.customerTpin,
            totalAmount: invoiceData.totalAmount,
            totalVat: invoiceData.totalVat,
            invoiceDate: invoiceData.invoiceDate,
            zraReference: invoiceData.zraReference
        };
        
        const qrString = JSON.stringify(qrData);
        return `data:image/svg+xml;base64,${Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="white"/><text x="50" y="50" text-anchor="middle" font-size="8">ZRA:${invoiceData.invoiceNumber}</text></svg>`).toString('base64')}`;
    }

    // Check ZRA API status
    public async checkStatus(): Promise<{ status: 'ONLINE' | 'OFFLINE'; message: string }> {
        if (process.env.NODE_ENV !== 'production') {
            // Return mock status in sandbox mode
            return {
                status: 'ONLINE',
                message: 'ZRA API is available (sandbox mode)'
            };
        }

        // In real implementation, this would ping the ZRA API
        throw new Error('ZRA status check not implemented for production');
    }

    // Get ZRA VAT rates
    public async getVATRates(): Promise<Array<{ value: number; label: string; description: string }>> {
        return [
            { value: 0, label: '0% (Exempt)', description: 'VAT Exempt items' },
            { value: 16, label: '16% (Standard)', description: 'Standard VAT rate in Zambia' }
        ];
    }

    // Generate compliance report
    public async generateComplianceReport(period: string): Promise<any> {
        // Mock compliance report data
        const now = new Date();
        const report = {
            period,
            totalInvoices: Math.floor(Math.random() * 100) + 10,
            totalAmount: Math.floor(Math.random() * 100000) + 10000,
            totalVAT: Math.floor(Math.random() * 16000) + 1600,
            submittedInvoices: Math.floor(Math.random() * 80) + 5,
            pendingInvoices: Math.floor(Math.random() * 20) + 1,
            complianceStatus: ['COMPLIANT', 'NON_COMPLIANT', 'PENDING'][Math.floor(Math.random() * 3)] as 'COMPLIANT' | 'NON_COMPLIANT' | 'PENDING',
            lastSubmissionDate: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000)
        };

        return report;
    }
}

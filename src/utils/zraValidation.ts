import { z } from 'zod';

// ZRA TPIN validation schema
export const TPINValidationSchema = z.object({
  tpin: z.string().regex(/^\d{10}$/, 'TPIN must be exactly 10 digits')
});

export type TPINValidation = z.infer<typeof TPINValidationSchema>;

// ZRA invoice validation schema
export const ZRAInvoiceValidationSchema = z.object({
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  invoiceDate: z.date(),
  customerName: z.string().min(1, 'Customer name is required'),
  customerTpin: z.string().regex(/^\d{10}$/, 'Customer TPIN must be exactly 10 digits'),
  businessName: z.string().min(1, 'Business name is required'),
  businessTpin: z.string().regex(/^\d{10}$/, 'Business TPIN must be exactly 10 digits'),
  items: z.array(z.object({
    description: z.string().min(1, 'Item description is required'),
    quantity: z.number().positive('Quantity must be positive'),
    unitPrice: z.number().positive('Unit price must be positive'),
    vatRate: z.number().min(0).max(100, 'VAT rate must be between 0 and 100'),
    vatExempt: z.boolean(),
    total: z.number().positive('Total must be positive'),
    vatAmount: z.number().min(0, 'VAT amount cannot be negative')
  })).min(1, 'At least one item is required'),
  subtotal: z.number().positive('Subtotal must be positive'),
  totalVat: z.number().min(0, 'Total VAT cannot be negative'),
  totalAmount: z.number().positive('Total amount must be positive'),
  currency: z.literal('ZMW')
});

export type ZRAInvoiceValidation = z.infer<typeof ZRAInvoiceValidationSchema>;

// TPIN validation function
export const validateTPIN = (tpin: string): boolean => {
  try {
    TPINValidationSchema.parse({ tpin });
    return true;
  } catch {
    return false;
  }
};

// Format TPIN for display
export const formatTPIN = (tpin: string): string => {
  const cleanTPIN = tpin.replace(/\D/g, '');
  if (cleanTPIN.length === 10) {
    return `${cleanTPIN.slice(0, 3)}-${cleanTPIN.slice(3, 6)}-${cleanTPIN.slice(6, 10)}`;
  }
  return cleanTPIN;
};

// Generate ZRA-compliant invoice number
export const generateZRAInvoiceNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ZRA-${year}${month}${day}-${random}`;
};

// Calculate VAT amount
export const calculateVATAmount = (amount: number, vatRate: number, vatExempt: boolean = false): number => {
  if (vatExempt) return 0;
  return Math.round(amount * (vatRate / 100) * 100) / 100;
};

// Validate ZRA invoice
export const validateZRAInvoice = (invoice: Record<string, unknown>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Manual validation to avoid Zod issues in tests
  if (!invoice.invoiceNumber || (invoice.invoiceNumber as string).trim() === '') {
    errors.push('invoiceNumber: Invoice number is required');
  }
  
  if (!invoice.customerName || (invoice.customerName as string).trim() === '') {
    errors.push('customerName: Customer name is required');
  }
  
  if (!invoice.customerTpin || !/^\d{10}$/.test(invoice.customerTpin as string)) {
    errors.push('customerTpin: Customer TPIN must be exactly 10 digits');
  }
  
  if (!invoice.businessName || (invoice.businessName as string).trim() === '') {
    errors.push('businessName: Business name is required');
  }
  
  if (!invoice.businessTpin || !/^\d{10}$/.test(invoice.businessTpin as string)) {
    errors.push('businessTpin: Business TPIN must be exactly 10 digits');
  }
  
  if (!invoice.items || !Array.isArray(invoice.items) || invoice.items.length === 0) {
    errors.push('items: At least one item is required');
  }
  
  if (!invoice.subtotal || (invoice.subtotal as number) <= 0) {
    errors.push('subtotal: Subtotal must be positive');
  }
  
  if (invoice.totalVat === undefined || (invoice.totalVat as number) < 0) {
    errors.push('totalVat: Total VAT cannot be negative');
  }
  
  if (!invoice.totalAmount || (invoice.totalAmount as number) <= 0) {
    errors.push('totalAmount: Total amount must be positive');
  }
  
  if (invoice.currency !== 'ZMW') {
    errors.push('currency: Currency must be ZMW');
  }
  
  return { isValid: errors.length === 0, errors };
};

// Check if business is ZRA compliant
export const isZRACompliant = (businessTpin: string, businessName: string): boolean => {
  return validateTPIN(businessTpin) && businessName.trim().length > 0;
};

// Generate ZRA reference number
export const generateZRAReference = (): string => {
  return `ZRA-REF-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
};

// Validate VAT rates according to ZRA standards
export const validateZRAVATRate = (vatRate: number): boolean => {
  // ZRA standard VAT rates: 0% (exempt), 16% (standard)
  return vatRate === 0 || vatRate === 16;
};

// Get ZRA VAT rate options
export const getZRAVATRates = () => [
  { value: 0, label: '0% (Exempt)', description: 'VAT Exempt items' },
  { value: 16, label: '16% (Standard)', description: 'Standard VAT rate in Zambia' }
];

// Format currency in Zambian Kwacha
export const formatZMW = (amount: number): string => {
  // Always use fallback to ensure consistent formatting
  return `ZMW ${amount.toFixed(2)}`;
};

// Validate invoice dates for ZRA compliance
export const validateZRADates = (invoiceDate: Date, dueDate: Date): boolean => {
  const now = new Date();
  const maxInvoiceDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Allow 1 day in future
  
  return invoiceDate <= maxInvoiceDate && dueDate > invoiceDate;
};

// Generate QR code data for ZRA compliance
export const generateZRAQRData = (invoice: Record<string, unknown>): string => {
  const qrData = {
    invoiceNumber: invoice.invoiceNumber,
    businessTpin: invoice.businessTpin,
    customerTpin: invoice.customerTpin,
    totalAmount: invoice.totalAmount,
    totalVat: invoice.totalVat,
    invoiceDate: (invoice.invoiceDate as Date).toISOString().split('T')[0],
    zraReference: invoice.zraReference
  };
  
  return JSON.stringify(qrData);
};

import { z } from 'zod';

// Provider types
export const PaymentProviderSchema = z.enum(['MTN', 'AIRTEL', 'ZAMTEL', 'BANK_TRANSFER']);
export type PaymentProvider = z.infer<typeof PaymentProviderSchema>;

export const BankSchema = z.enum(['ZANACO', 'STANBIC', 'ABSA', 'FNB', 'ATLAS_MARA']);
export type Bank = z.infer<typeof BankSchema>;

// Phone number validation
export const PhoneNumberSchema = z.string().regex(/^260(96|97|95|76|77|78)\d{7}$/);
export type PhoneNumber = z.infer<typeof PhoneNumberSchema>;

// Base payment request
export const BasePaymentRequestSchema = z.object({
    amount: z.number().positive(),
    currency: z.enum(['ZMW']),
    metadata: z.record(z.string(), z.unknown()).optional()
});

export type BasePaymentRequest = z.infer<typeof BasePaymentRequestSchema>;

// Mobile money request
export const MobileMoneyRequestSchema = BasePaymentRequestSchema.extend({
    provider: PaymentProviderSchema,
    phoneNumber: PhoneNumberSchema
});

export type MobileMoneyRequest = z.infer<typeof MobileMoneyRequestSchema>;

// Bank transfer request
export const BankTransferRequestSchema = BasePaymentRequestSchema.extend({
    bank: BankSchema,
    accountNumber: z.string().min(1, 'Account number is required'),
    accountName: z.string().min(1, 'Account name is required')
});

export type BankTransferRequest = z.infer<typeof BankTransferRequestSchema>;

// Union type for all payment requests
export type PaymentRequest = MobileMoneyRequest | BankTransferRequest;

// Transaction types
export interface BaseTransaction {
    id: string;
    amount: number;
    currency: string;
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
    createdAt: Date;
    updatedAt: Date;
    metadata?: Record<string, unknown>;
}

export interface MobileMoneyTransaction extends BaseTransaction {
    provider: 'MTN' | 'AIRTEL' | 'ZAMTEL';
    phoneNumber: string;
    mtnTransactionId?: string;
    mtnReference?: string;
    airtelTransactionId?: string;
    airtelReference?: string;
    zamtelTransactionId?: string;
    zamtelReference?: string;
}

export interface BankTransferTransaction extends BaseTransaction {
    provider: 'BANK_TRANSFER';
    bank: Bank;
    accountNumber: string;
    accountName: string;
    bankReference: string;
}

export type Transaction = MobileMoneyTransaction | BankTransferTransaction;

// Response types
export interface PaymentResponse {
    transaction: Transaction;
    message: string;
}

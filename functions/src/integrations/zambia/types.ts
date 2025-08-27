import { z } from 'zod';

// Provider types
export const PaymentProviderSchema = z.enum(['MTN', 'AIRTEL', 'ZAMTEL', 'BANK_TRANSFER']);
export type PaymentProvider = z.infer<typeof PaymentProviderSchema>;

export const BankSchema = z.enum(['ZANACO', 'STANBIC', 'ABSA', 'FNB', 'ATLAS_MARA']);
export type Bank = z.infer<typeof BankSchema>;

// Base payment request
export const BasePaymentRequestSchema = z.object({
    amount: z.number().positive(),
    currency: z.enum(['ZMW']),
    metadata: z.record(z.string(), z.unknown()).optional()
});

export type BasePaymentRequest = z.infer<typeof BasePaymentRequestSchema>;

// Bank transfer request
export const BankTransferRequestSchema = BasePaymentRequestSchema.extend({
    bank: BankSchema,
    accountNumber: z.string(),
    accountName: z.string()
});

export type BankTransferRequest = z.infer<typeof BankTransferRequestSchema>;

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

export interface BankTransferTransaction extends BaseTransaction {
    provider: 'BANK_TRANSFER';
    bank: Bank;
    accountNumber: string;
    accountName: string;
    bankReference: string;
}

export type Transaction = BankTransferTransaction;

// Response types
export interface PaymentResponse {
    transaction: Transaction;
    message: string;
}
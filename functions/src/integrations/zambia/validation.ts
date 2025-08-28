
import { BankSchema, BankTransferRequestSchema } from './types';

export const validateBank = (bank: string): boolean => {
    try {
        BankSchema.parse(bank);
        return true;
    } catch {
        return false;
    }
};

export const validateBankTransferRequest = (request: unknown): void => {
    const result = BankTransferRequestSchema.safeParse(request);
    if (!result.success) {
        throw new Error(`Invalid bank transfer request: ${result.error.message}`);
    }
};
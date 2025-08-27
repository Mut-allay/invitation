import {
    PaymentProviderSchema,
    BankSchema,
    MobileMoneyRequestSchema,
    BankTransferRequestSchema,
    PaymentRequest,
    MobileMoneyRequest,
    BankTransferRequest
} from './types';

// Provider prefixes for phone numbers
const prefixMap = {
    MTN: ['96', '76'],
    AIRTEL: ['97', '77'],
    ZAMTEL: ['95', '78']
};

export const validateMobileMoneyProvider = (provider: string): boolean => {
    try {
        PaymentProviderSchema.parse(provider);
        return ['MTN', 'AIRTEL', 'ZAMTEL'].includes(provider);
    } catch {
        return false;
    }
};

export const validateBank = (bank: string): boolean => {
    try {
        BankSchema.parse(bank);
        return true;
    } catch {
        return false;
    }
};

export const isValidPhoneNumberForProvider = (phoneNumber: string, provider: string): boolean => {
    if (!validateMobileMoneyProvider(provider)) {
        return false;
    }

    const validPrefixes = prefixMap[provider as keyof typeof prefixMap];
    if (!validPrefixes) {
        return false;
    }

    // Remove country code and check prefix
    const numberWithoutCode = phoneNumber.slice(3);
    return validPrefixes.some(prefix => numberWithoutCode.startsWith(prefix));
};

export const validateMobileMoneyRequest = (request: unknown): void => {
    const result = MobileMoneyRequestSchema.safeParse(request);
    if (!result.success) {
        throw new Error(`Invalid mobile money request: ${result.error.message}`);
    }

    if (!isValidPhoneNumberForProvider(result.data.phoneNumber, result.data.provider)) {
        throw new Error(`Invalid phone number for provider ${result.data.provider}`);
    }
};

export const validateBankTransferRequest = (request: unknown): void => {
    const result = BankTransferRequestSchema.safeParse(request);
    if (!result.success) {
        throw new Error(`Invalid bank transfer request: ${result.error.message}`);
    }
};

export const isMobileMoneyRequest = (request: PaymentRequest): request is MobileMoneyRequest => {
    return 'provider' in request && 'phoneNumber' in request;
};

export const isBankTransferRequest = (request: PaymentRequest): request is BankTransferRequest => {
    return 'bank' in request && 'accountNumber' in request;
};

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBankTransferRequest = exports.isMobileMoneyRequest = exports.validateBankTransferRequest = exports.validateMobileMoneyRequest = exports.isValidPhoneNumberForProvider = exports.validateBank = exports.validateMobileMoneyProvider = void 0;
const types_1 = require("./types");
// Provider prefixes for phone numbers
const prefixMap = {
    MTN: ['96', '76'],
    AIRTEL: ['97', '77'],
    ZAMTEL: ['95', '78']
};
const validateMobileMoneyProvider = (provider) => {
    try {
        types_1.PaymentProviderSchema.parse(provider);
        return ['MTN', 'AIRTEL', 'ZAMTEL'].includes(provider);
    }
    catch (_a) {
        return false;
    }
};
exports.validateMobileMoneyProvider = validateMobileMoneyProvider;
const validateBank = (bank) => {
    try {
        types_1.BankSchema.parse(bank);
        return true;
    }
    catch (_a) {
        return false;
    }
};
exports.validateBank = validateBank;
const isValidPhoneNumberForProvider = (phoneNumber, provider) => {
    if (!(0, exports.validateMobileMoneyProvider)(provider)) {
        return false;
    }
    const validPrefixes = prefixMap[provider];
    if (!validPrefixes) {
        return false;
    }
    // Remove country code and check prefix
    const numberWithoutCode = phoneNumber.slice(3);
    return validPrefixes.some(prefix => numberWithoutCode.startsWith(prefix));
};
exports.isValidPhoneNumberForProvider = isValidPhoneNumberForProvider;
const validateMobileMoneyRequest = (request) => {
    const result = types_1.MobileMoneyRequestSchema.safeParse(request);
    if (!result.success) {
        throw new Error(`Invalid mobile money request: ${result.error.message}`);
    }
    if (!(0, exports.isValidPhoneNumberForProvider)(result.data.phoneNumber, result.data.provider)) {
        throw new Error(`Invalid phone number for provider ${result.data.provider}`);
    }
};
exports.validateMobileMoneyRequest = validateMobileMoneyRequest;
const validateBankTransferRequest = (request) => {
    const result = types_1.BankTransferRequestSchema.safeParse(request);
    if (!result.success) {
        throw new Error(`Invalid bank transfer request: ${result.error.message}`);
    }
};
exports.validateBankTransferRequest = validateBankTransferRequest;
const isMobileMoneyRequest = (request) => {
    return 'provider' in request && 'phoneNumber' in request;
};
exports.isMobileMoneyRequest = isMobileMoneyRequest;
const isBankTransferRequest = (request) => {
    return 'bank' in request && 'accountNumber' in request;
};
exports.isBankTransferRequest = isBankTransferRequest;
//# sourceMappingURL=validation.js.map
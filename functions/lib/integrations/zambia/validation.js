"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBankTransferRequest = exports.validateBank = void 0;
const types_1 = require("./types");
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
const validateBankTransferRequest = (request) => {
    const result = types_1.BankTransferRequestSchema.safeParse(request);
    if (!result.success) {
        throw new Error(`Invalid bank transfer request: ${result.error.message}`);
    }
};
exports.validateBankTransferRequest = validateBankTransferRequest;
//# sourceMappingURL=validation.js.map
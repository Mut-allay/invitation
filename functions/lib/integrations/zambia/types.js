"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BankTransferRequestSchema = exports.BasePaymentRequestSchema = exports.BankSchema = exports.PaymentProviderSchema = void 0;
const zod_1 = require("zod");
// Provider types
exports.PaymentProviderSchema = zod_1.z.enum(['MTN', 'AIRTEL', 'ZAMTEL', 'BANK_TRANSFER']);
exports.BankSchema = zod_1.z.enum(['ZANACO', 'STANBIC', 'ABSA', 'FNB', 'ATLAS_MARA']);
// Base payment request
exports.BasePaymentRequestSchema = zod_1.z.object({
    amount: zod_1.z.number().positive(),
    currency: zod_1.z.enum(['ZMW']),
    metadata: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).optional()
});
// Bank transfer request
exports.BankTransferRequestSchema = exports.BasePaymentRequestSchema.extend({
    bank: exports.BankSchema,
    accountNumber: zod_1.z.string(),
    accountName: zod_1.z.string()
});
//# sourceMappingURL=types.js.map
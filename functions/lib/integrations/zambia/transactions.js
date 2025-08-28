"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionTracker = exports.TransactionTrackingSchema = void 0;
const firebase_admin_1 = require("@/config/firebase-admin");
const zod_1 = require("zod");
// Schema for transaction tracking
exports.TransactionTrackingSchema = zod_1.z.object({
    id: zod_1.z.string(),
    provider: zod_1.z.enum(['MTN', 'AIRTEL', 'ZAMTEL', 'BANK_TRANSFER']),
    status: zod_1.z.enum(['PENDING', 'COMPLETED', 'FAILED']),
    amount: zod_1.z.number(),
    currency: zod_1.z.string(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
    metadata: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).optional()
});
class TransactionTracker {
    constructor() {
        this.collection = firebase_admin_1.db.collection('transactions');
    }
    async createTransaction(transaction) {
        await this.collection.doc(transaction.id).set(transaction);
    }
    async updateTransaction(transaction) {
        await this.collection.doc(transaction.id).update(Object.assign(Object.assign({}, transaction), { updatedAt: new Date() }));
    }
    async getTransaction(id) {
        const doc = await this.collection.doc(id).get();
        return doc.exists ? doc.data() : null;
    }
}
exports.TransactionTracker = TransactionTracker;
//# sourceMappingURL=transactions.js.map
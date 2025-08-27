import { db } from '@/config/firebase-admin';
import { z } from 'zod';
import type { Transaction } from './types';

// Schema for transaction tracking
export const TransactionTrackingSchema = z.object({
    id: z.string(),
    provider: z.enum(['MTN', 'AIRTEL', 'ZAMTEL', 'BANK_TRANSFER']),
    status: z.enum(['PENDING', 'COMPLETED', 'FAILED']),
    amount: z.number(),
    currency: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
    metadata: z.record(z.string(), z.unknown()).optional()
});

export class TransactionTracker {
    private collection: FirebaseFirestore.CollectionReference;

    constructor() {
        this.collection = db.collection('transactions');
    }

    public async createTransaction(transaction: Transaction): Promise<void> {
        await this.collection.doc(transaction.id).set(transaction);
    }

    public async updateTransaction(transaction: Transaction): Promise<void> {
        await this.collection.doc(transaction.id).update({
            ...transaction,
            updatedAt: new Date()
        });
    }

    public async getTransaction(id: string): Promise<Transaction | null> {
        const doc = await this.collection.doc(id).get();
        return doc.exists ? (doc.data() as Transaction) : null;
    }
}

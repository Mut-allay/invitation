import { v4 as uuidv4 } from 'uuid';
import type { MobileMoneyRequest, MobileMoneyTransaction, PaymentResponse } from '../types';

export class MTNService {
    private accessToken: string | null = null;

    constructor() {
        // Configuration will be used in production
        if (process.env.NODE_ENV === 'production') {
            if (!process.env.MTN_API_KEY) throw new Error('MTN_API_KEY is required in production');
            if (!process.env.MTN_API_URL) throw new Error('MTN_API_URL is required in production');
        }
    }

    private async ensureAccessToken(): Promise<string> {
        if (process.env.NODE_ENV !== 'production') {
            return 'test-token';
        }

        if (this.accessToken) {
            return this.accessToken;
        }

        // In real implementation, make API call to get token
        throw new Error('MTN token acquisition not implemented for production');
    }

    public async initiatePayment(request: MobileMoneyRequest): Promise<PaymentResponse> {
        const transactionId = uuidv4();

        if (process.env.NODE_ENV !== 'production') {
            // Return mock data in sandbox mode
            const transaction: MobileMoneyTransaction = {
                id: transactionId,
                amount: request.amount,
                currency: request.currency,
                status: 'PENDING',
                provider: 'MTN',
                phoneNumber: request.phoneNumber,
                createdAt: new Date(),
                updatedAt: new Date(),
                mtnTransactionId: transactionId,
                mtnReference: transactionId,
                metadata: request.metadata
            };

            return {
                transaction,
                message: 'Payment request initiated successfully'
            };
        }

        // Get access token and make API call to initiate payment
        const token = await this.ensureAccessToken();
        // In production, token would be used for API call
        console.debug('Using token:', token);
        // In real implementation, this would call the MTN API
        throw new Error('MTN payment initiation not implemented for production');
    }

    public async checkPaymentStatus(transactionId: string): Promise<MobileMoneyTransaction> {
        if (process.env.NODE_ENV !== 'production') {
            // Return mock successful transaction in sandbox mode
            return {
                id: transactionId,
                amount: 1000,
                currency: 'ZMW',
                status: 'COMPLETED',
                provider: 'MTN',
                phoneNumber: '260967000000',
                createdAt: new Date(),
                updatedAt: new Date(),
                mtnTransactionId: transactionId,
                mtnReference: transactionId
            };
        }

        // Get access token and make API call to check status
        const token = await this.ensureAccessToken();
        // In production, token would be used for API call
        console.debug('Using token:', token);
        // In real implementation, this would call the MTN API
        throw new Error('MTN payment status check not implemented for production');
    }
}

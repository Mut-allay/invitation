import { v4 as uuidv4 } from 'uuid';
import type { MobileMoneyRequest, MobileMoneyTransaction, PaymentResponse } from '../types';

export class AirtelService {
    private accessToken: string | null = null;

    constructor() {
        // Configuration will be used in production
        if (process.env.NODE_ENV === 'production') {
            if (!process.env.AIRTEL_CLIENT_ID) throw new Error('AIRTEL_CLIENT_ID is required in production');
            if (!process.env.AIRTEL_CLIENT_SECRET) throw new Error('AIRTEL_CLIENT_SECRET is required in production');
            if (!process.env.AIRTEL_API_URL) throw new Error('AIRTEL_API_URL is required in production');
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
        throw new Error('Airtel token acquisition not implemented for production');
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
                provider: 'AIRTEL',
                phoneNumber: request.phoneNumber,
                createdAt: new Date(),
                updatedAt: new Date(),
                airtelTransactionId: transactionId,
                airtelReference: transactionId,
                metadata: request.metadata
            };

            return {
                transaction,
                message: 'Payment request initiated successfully'
            };
        }

        // Get access token and prepare for API call
        const token = await this.ensureAccessToken();
        // In production, token would be used for API call
        console.debug('Using token:', token);

        // Make API call to initiate payment
        // In real implementation, this would call the Airtel API
        throw new Error('Airtel payment initiation not implemented for production');
    }

    public async checkPaymentStatus(transactionId: string): Promise<MobileMoneyTransaction> {
        if (process.env.NODE_ENV !== 'production') {
            // Return mock successful transaction in sandbox mode
            return {
                id: transactionId,
                amount: 1000,
                currency: 'ZMW',
                status: 'COMPLETED',
                provider: 'AIRTEL',
                phoneNumber: '260977000000',
                createdAt: new Date(),
                updatedAt: new Date(),
                airtelTransactionId: transactionId,
                airtelReference: transactionId
            };
        }

        // Get access token and prepare for API call
        const token = await this.ensureAccessToken();
        // In production, token would be used for API call
        console.debug('Using token:', token);

        // Make API call to check status
        // In real implementation, this would call the Airtel API
        throw new Error('Airtel payment status check not implemented for production');
    }
}

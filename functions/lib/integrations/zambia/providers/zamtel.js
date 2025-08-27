"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZamtelService = void 0;
const uuid_1 = require("uuid");
class ZamtelService {
    constructor() {
        this.accessToken = null;
        // Configuration will be used in production
        if (process.env.NODE_ENV === 'production') {
            if (!process.env.ZAMTEL_API_KEY)
                throw new Error('ZAMTEL_API_KEY is required in production');
            if (!process.env.ZAMTEL_API_URL)
                throw new Error('ZAMTEL_API_URL is required in production');
        }
    }
    async ensureAccessToken() {
        if (process.env.NODE_ENV !== 'production') {
            return 'test-token';
        }
        if (this.accessToken) {
            return this.accessToken;
        }
        // In real implementation, make API call to get token
        throw new Error('Zamtel token acquisition not implemented for production');
    }
    async initiatePayment(request) {
        const transactionId = (0, uuid_1.v4)();
        if (process.env.NODE_ENV !== 'production') {
            // Return mock data in sandbox mode
            const transaction = {
                id: transactionId,
                amount: request.amount,
                currency: request.currency,
                status: 'PENDING',
                provider: 'ZAMTEL',
                phoneNumber: request.phoneNumber,
                createdAt: new Date(),
                updatedAt: new Date(),
                zamtelTransactionId: transactionId,
                zamtelReference: transactionId,
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
        // In real implementation, this would call the Zamtel API
        throw new Error('Zamtel payment initiation not implemented for production');
    }
    async checkPaymentStatus(transactionId) {
        if (process.env.NODE_ENV !== 'production') {
            // Return mock successful transaction in sandbox mode
            return {
                id: transactionId,
                amount: 1000,
                currency: 'ZMW',
                status: 'COMPLETED',
                provider: 'ZAMTEL',
                phoneNumber: '260950000000',
                createdAt: new Date(),
                updatedAt: new Date(),
                zamtelTransactionId: transactionId,
                zamtelReference: transactionId
            };
        }
        // Get access token and prepare for API call
        const token = await this.ensureAccessToken();
        // In production, token would be used for API call
        console.debug('Using token:', token);
        // Make API call to check status
        // In real implementation, this would call the Zamtel API
        throw new Error('Zamtel payment status check not implemented for production');
    }
}
exports.ZamtelService = ZamtelService;
//# sourceMappingURL=zamtel.js.map
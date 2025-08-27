import { MobileMoneyService } from '../mobileMoney';
import type { MobileMoneyRequest } from '../types';

describe('Mobile Money Integration', () => {
    let service: MobileMoneyService;

    beforeEach(() => {
        service = new MobileMoneyService();
        process.env.NODE_ENV = 'development';
    });

    describe('MTN Integration', () => {
        const validRequest: MobileMoneyRequest = {
            provider: 'MTN',
            phoneNumber: '260967000000',
            amount: 1000,
            currency: 'ZMW'
        };

        it('should initiate payment successfully', async () => {
            const response = await service.initiatePayment(validRequest);
            expect(response.transaction).toBeDefined();
            expect(response.transaction.status).toBe('PENDING');
            expect(response.transaction.provider).toBe('MTN');
            expect(response.message).toBe('Payment request initiated successfully');
        });
    });

    describe('Airtel Integration', () => {
        const validRequest: MobileMoneyRequest = {
            provider: 'AIRTEL',
            phoneNumber: '260977000000',
            amount: 1000,
            currency: 'ZMW'
        };

        it('should initiate payment successfully', async () => {
            const response = await service.initiatePayment(validRequest);
            expect(response.transaction).toBeDefined();
            expect(response.transaction.status).toBe('PENDING');
            expect(response.transaction.provider).toBe('AIRTEL');
            expect(response.message).toBe('Payment request initiated successfully');
        });
    });

    describe('Zamtel Integration', () => {
        const validRequest: MobileMoneyRequest = {
            provider: 'ZAMTEL',
            phoneNumber: '260950000000',
            amount: 1000,
            currency: 'ZMW'
        };

        it('should initiate payment successfully', async () => {
            const response = await service.initiatePayment(validRequest);
            expect(response.transaction).toBeDefined();
            expect(response.transaction.status).toBe('PENDING');
            expect(response.transaction.provider).toBe('ZAMTEL');
            expect(response.message).toBe('Payment request initiated successfully');
        });
    });

    describe('Validation', () => {
        it('should reject invalid phone numbers', async () => {
            const invalidRequest: MobileMoneyRequest = {
                provider: 'MTN',
                phoneNumber: '260123456789', // Invalid prefix
                amount: 1000,
                currency: 'ZMW'
            };

            await expect(service.initiatePayment(invalidRequest))
                .rejects
                .toThrow('Invalid phone number for provider MTN');
        });

        it('should reject invalid currency', async () => {
            const invalidRequest = {
                provider: 'MTN',
                phoneNumber: '260967000000',
                amount: 1000,
                currency: 'USD' // Only ZMW supported
            };

            await expect(service.initiatePayment(invalidRequest as MobileMoneyRequest))
                .rejects
                .toThrow();
        });

        it('should reject negative amounts', async () => {
            const invalidRequest = {
                provider: 'MTN',
                phoneNumber: '260967000000',
                amount: -1000,
                currency: 'ZMW'
            };

            await expect(service.initiatePayment(invalidRequest as MobileMoneyRequest))
                .rejects
                .toThrow();
        });
    });
});

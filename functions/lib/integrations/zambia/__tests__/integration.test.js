"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bankTransfer_1 = require("../bankTransfer");
describe('Bank Transfer Integration', () => {
    let service;
    beforeEach(() => {
        service = new bankTransfer_1.BankTransferService();
        process.env.NODE_ENV = 'development';
    });
    describe('Bank Transfer', () => {
        const validRequest = {
            bank: 'ZANACO',
            accountNumber: '1234567890',
            accountName: 'John Doe',
            amount: 1000,
            currency: 'ZMW',
            metadata: { purpose: 'test payment' }
        };
        it('should initiate transfer successfully', async () => {
            const response = await service.initiateTransfer(validRequest);
            expect(response.transaction).toBeDefined();
            expect(response.transaction.status).toBe('PENDING');
            expect(response.transaction.provider).toBe('BANK_TRANSFER');
            expect(response.transaction.bank).toBe('ZANACO');
            expect(response.message).toBe('Bank transfer request initiated successfully');
        });
        it('should check transfer status successfully', async () => {
            const response = await service.initiateTransfer(validRequest);
            const status = await service.checkTransferStatus(response.transaction.id);
            expect(status.status).toBe('COMPLETED');
            expect(status.provider).toBe('BANK_TRANSFER');
            expect(status.bank).toBe('ZANACO');
        });
    });
    describe('Validation', () => {
        it('should reject invalid bank', async () => {
            const invalidRequest = {
                bank: 'INVALID_BANK',
                accountNumber: '1234567890',
                accountName: 'John Doe',
                amount: 1000,
                currency: 'ZMW'
            };
            await expect(service.initiateTransfer(invalidRequest))
                .rejects
                .toThrow();
        });
        it('should reject invalid currency', async () => {
            const invalidRequest = {
                bank: 'ZANACO',
                accountNumber: '1234567890',
                accountName: 'John Doe',
                amount: 1000,
                currency: 'USD' // Only ZMW supported
            };
            await expect(service.initiateTransfer(invalidRequest))
                .rejects
                .toThrow();
        });
        it('should reject negative amounts', async () => {
            const invalidRequest = {
                bank: 'ZANACO',
                accountNumber: '1234567890',
                accountName: 'John Doe',
                amount: -1000,
                currency: 'ZMW'
            };
            await expect(service.initiateTransfer(invalidRequest))
                .rejects
                .toThrow();
        });
        it('should reject empty account number', async () => {
            const invalidRequest = {
                bank: 'ZANACO',
                accountNumber: '',
                accountName: 'John Doe',
                amount: 1000,
                currency: 'ZMW'
            };
            await expect(service.initiateTransfer(invalidRequest))
                .rejects
                .toThrow();
        });
        it('should reject empty account name', async () => {
            const invalidRequest = {
                bank: 'ZANACO',
                accountNumber: '1234567890',
                accountName: '',
                amount: 1000,
                currency: 'ZMW'
            };
            await expect(service.initiateTransfer(invalidRequest))
                .rejects
                .toThrow();
        });
    });
});
//# sourceMappingURL=integration.test.js.map
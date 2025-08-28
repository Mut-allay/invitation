"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bankTransfer_1 = require("../bankTransfer");
const mobileMoney_1 = require("../mobileMoney");
describe('Zambia Payment Integration', () => {
    let bankService;
    let mobileMoneyService;
    beforeEach(() => {
        bankService = new bankTransfer_1.BankTransferService();
        mobileMoneyService = new mobileMoney_1.MobileMoneyService();
        process.env.NODE_ENV = 'development';
    });
    describe('Bank Transfer Integration', () => {
        const validBankRequest = {
            bank: 'ZANACO',
            accountNumber: '1234567890',
            accountName: 'John Doe',
            amount: 1000,
            currency: 'ZMW',
            metadata: { purpose: 'test payment' }
        };
        it('should initiate bank transfer successfully', async () => {
            const response = await bankService.initiateTransfer(validBankRequest);
            expect(response.transaction).toBeDefined();
            expect(response.transaction.status).toBe('PENDING');
            expect(response.transaction.provider).toBe('BANK_TRANSFER');
            expect(response.transaction.bank).toBe('ZANACO');
            expect(response.message).toBe('Bank transfer request initiated successfully');
        });
        it('should check bank transfer status successfully', async () => {
            const response = await bankService.initiateTransfer(validBankRequest);
            const status = await bankService.checkTransferStatus(response.transaction.id);
            expect(status.status).toBe('COMPLETED');
            expect(status.provider).toBe('BANK_TRANSFER');
            expect(status.bank).toBe('ZANACO');
        });
        it('should reject invalid bank', async () => {
            const invalidRequest = {
                bank: 'INVALID_BANK',
                accountNumber: '1234567890',
                accountName: 'John Doe',
                amount: 1000,
                currency: 'ZMW'
            };
            await expect(bankService.initiateTransfer(invalidRequest))
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
            await expect(bankService.initiateTransfer(invalidRequest))
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
            await expect(bankService.initiateTransfer(invalidRequest))
                .rejects
                .toThrow();
        });
    });
    describe('Mobile Money Integration', () => {
        describe('MTN Integration', () => {
            const validMTNRequest = {
                provider: 'MTN',
                phoneNumber: '260967000000',
                amount: 1000,
                currency: 'ZMW'
            };
            it('should initiate MTN payment successfully', async () => {
                const response = await mobileMoneyService.initiatePayment(validMTNRequest);
                expect(response.transaction).toBeDefined();
                expect(response.transaction.status).toBe('PENDING');
                expect(response.transaction.provider).toBe('MTN');
                expect(response.message).toBe('Payment request initiated successfully');
            });
        });
        describe('Airtel Integration', () => {
            const validAirtelRequest = {
                provider: 'AIRTEL',
                phoneNumber: '260977000000',
                amount: 1000,
                currency: 'ZMW'
            };
            it('should initiate Airtel payment successfully', async () => {
                const response = await mobileMoneyService.initiatePayment(validAirtelRequest);
                expect(response.transaction).toBeDefined();
                expect(response.transaction.status).toBe('PENDING');
                expect(response.transaction.provider).toBe('AIRTEL');
                expect(response.message).toBe('Payment request initiated successfully');
            });
        });
        describe('Zamtel Integration', () => {
            const validZamtelRequest = {
                provider: 'ZAMTEL',
                phoneNumber: '260950000000',
                amount: 1000,
                currency: 'ZMW'
            };
            it('should initiate Zamtel payment successfully', async () => {
                const response = await mobileMoneyService.initiatePayment(validZamtelRequest);
                expect(response.transaction).toBeDefined();
                expect(response.transaction.status).toBe('PENDING');
                expect(response.transaction.provider).toBe('ZAMTEL');
                expect(response.message).toBe('Payment request initiated successfully');
            });
        });
        it('should reject invalid phone numbers', async () => {
            const invalidRequest = {
                provider: 'MTN',
                phoneNumber: '260123456789', // Invalid prefix
                amount: 1000,
                currency: 'ZMW'
            };
            await expect(mobileMoneyService.initiatePayment(invalidRequest))
                .rejects
                .toThrow('Invalid phone number for provider MTN');
        });
    });
    describe('Common Validation', () => {
        it('should reject invalid currency', async () => {
            const invalidBankRequest = {
                bank: 'ZANACO',
                accountNumber: '1234567890',
                accountName: 'John Doe',
                amount: 1000,
                currency: 'USD' // Only ZMW supported
            };
            const invalidMobileRequest = {
                provider: 'MTN',
                phoneNumber: '260967000000',
                amount: 1000,
                currency: 'USD' // Only ZMW supported
            };
            await expect(bankService.initiateTransfer(invalidBankRequest))
                .rejects
                .toThrow();
            await expect(mobileMoneyService.initiatePayment(invalidMobileRequest))
                .rejects
                .toThrow();
        });
        it('should reject negative amounts', async () => {
            const invalidBankRequest = {
                bank: 'ZANACO',
                accountNumber: '1234567890',
                accountName: 'John Doe',
                amount: -1000,
                currency: 'ZMW'
            };
            const invalidMobileRequest = {
                provider: 'MTN',
                phoneNumber: '260967000000',
                amount: -1000,
                currency: 'ZMW'
            };
            await expect(bankService.initiateTransfer(invalidBankRequest))
                .rejects
                .toThrow();
            await expect(mobileMoneyService.initiatePayment(invalidMobileRequest))
                .rejects
                .toThrow();
        });
    });
});
//# sourceMappingURL=integration.test.js.map
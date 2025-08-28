// Payment method types
export type MobileMoneyProvider = 'airtel' | 'mtn' | 'zamtel';
export type BankCode = 'ZANACO' | 'FNB' | 'STANBIC' | 'BARCLAYS' | 'INVESTRUST' | 'CAVMONT';

// Payment status types
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

// Base payment interface
export interface BasePayment {
    id: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    reference: string;
    timestamp: Date;
    description?: string;
}

// Mobile money specific payment
export interface MobileMoneyPayment extends BasePayment {
    type: 'mobile_money';
    provider: MobileMoneyProvider;
    phoneNumber: string;
    transactionId?: string;
}

// Bank transfer specific payment
export interface BankTransferPayment extends BasePayment {
    type: 'bank_transfer';
    bankCode: BankCode;
    accountNumber: string;
    accountName: string;
    transferId?: string;
}

// Union type for all payment types
export type Payment = MobileMoneyPayment | BankTransferPayment;

// Payment receipt data
export interface PaymentReceipt {
    paymentId: string;
    receiptNumber: string;
    customerName: string;
    paymentDetails: Payment;
    issuedAt: Date;
    items?: Array<{
        description: string;
        amount: number;
    }>;
    subtotal: number;
    tax: number;
    total: number;
}

// Payment API response types
export interface PaymentResponse {
    success: boolean;
    payment: Payment;
    message?: string;
    error?: string;
}

// Payment verification response
export interface PaymentVerificationResponse {
    verified: boolean;
    payment: Payment;
    verificationId: string;
    verifiedAt: Date;
    message?: string;
}

// Payment gateway configuration
export interface PaymentGatewayConfig {
    apiKey: string;
    environment: 'sandbox' | 'production';
    timeout?: number;
    webhookUrl?: string;
}

// Mobile money provider configuration
export interface MobileMoneyConfig {
    provider: MobileMoneyProvider;
    merchantId: string;
    apiKey: string;
    notificationUrl: string;
}

// Bank transfer configuration
export interface BankTransferConfig {
    bankCode: BankCode;
    merchantAccountNumber: string;
    merchantName: string;
    callbackUrl: string;
}

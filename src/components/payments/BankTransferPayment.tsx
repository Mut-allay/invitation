import React, { useState } from 'react';
import { 
  CreditCardIcon, 
  BuildingOfficeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

// Zambian banks with their codes and colors
const ZAMBIAN_BANKS = [
  {
    id: 'zambia_national_commercial_bank',
    name: 'Zambia National Commercial Bank',
    code: 'ZANACO',
    color: 'bg-blue-600',
    logo: '🏦'
  },
  {
    id: 'first_national_bank',
    name: 'First National Bank',
    code: 'FNB',
    color: 'bg-green-600',
    logo: '🏦'
  },
  {
    id: 'stanbic_bank',
    name: 'Stanbic Bank Zambia',
    code: 'STANBIC',
    color: 'bg-red-600',
    logo: '🏦'
  },
  {
    id: 'barclays_bank',
    name: 'Barclays Bank Zambia',
    code: 'BARCLAYS',
    color: 'bg-blue-800',
    logo: '🏦'
  },
  {
    id: 'investrust_bank',
    name: 'Investrust Bank',
    code: 'INVESTRUST',
    color: 'bg-purple-600',
    logo: '🏦'
  },
  {
    id: 'cavmont_bank',
    name: 'Cavmont Bank',
    code: 'CAVMONT',
    color: 'bg-orange-600',
    logo: '🏦'
  }
];

interface BankTransferPaymentProps {
  amount: number;
  onPaymentComplete: (result: {
    success: boolean;
    reference: string;
    bankCode: string;
    accountNumber: string;
    amount: number;
    timestamp: Date;
  }) => void;
  onCancel: () => void;
}

type PaymentStep = 'select-bank' | 'account-details' | 'confirm' | 'processing' | 'success' | 'error';

const BankTransferPayment: React.FC<BankTransferPaymentProps> = ({
  amount,
  onPaymentComplete,
  onCancel
}) => {
  const [paymentStep, setPaymentStep] = useState<PaymentStep>('select-bank');
  const [selectedBank, setSelectedBank] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Format amount in Zambian Kwacha
  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('en-ZM', {
      style: 'currency',
      currency: 'ZMW',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Format account number with spaces
  const formatAccountNumber = (value: string): string => {
    const cleaned = value.replace(/\s/g, '');
    const match = cleaned.match(/^(\d{4})(\d{4})(\d{4})(\d{4})$/);
    if (match) {
      return `${match[1]} ${match[2]} ${match[3]} ${match[4]}`;
    }
    return value;
  };

  // Validate Zambian account number (16 digits)
  const validateAccountNumber = (accountNumber: string): boolean => {
    const cleaned = accountNumber.replace(/\s/g, '');
    return /^\d{16}$/.test(cleaned);
  };

  // Generate transaction reference
  const generateReference = (): string => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `BT-${timestamp}-${random}`;
  };

  const handleBankSelect = (bankId: string) => {
    setSelectedBank(bankId);
    setPaymentStep('account-details');
    setError('');
  };

  const handleAccountDetailsSubmit = () => {
    if (!accountNumber || !accountName) {
      setError('Please fill in all required fields');
      return;
    }

    if (!validateAccountNumber(accountNumber)) {
      setError('Please enter a valid 16-digit account number');
      return;
    }

    setPaymentStep('confirm');
    setError('');
  };

  const handleConfirmPayment = async () => {
    setIsLoading(true);
    setPaymentStep('processing');

    try {
      // Simulate bank transfer processing
      await new Promise(resolve => setTimeout(resolve, 3000));

      const reference = generateReference();
      const bank = ZAMBIAN_BANKS.find(b => b.id === selectedBank);

      onPaymentComplete({
        success: true,
        reference,
        bankCode: bank?.code || '',
        accountNumber: accountNumber.replace(/\s/g, ''),
        amount,
        timestamp: new Date()
      });

      setPaymentStep('success');
    } catch (err) {
      setError('Bank transfer failed. Please try again.');
      setPaymentStep('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    switch (paymentStep) {
      case 'account-details':
        setPaymentStep('select-bank');
        setSelectedBank('');
        break;
      case 'confirm':
        setPaymentStep('account-details');
        break;
      case 'error':
        setPaymentStep('confirm');
        setError('');
        break;
      default:
        onCancel();
    }
  };

  const selectedBankData = ZAMBIAN_BANKS.find(b => b.id === selectedBank);

  // Select Bank Step
  if (paymentStep === 'select-bank') {
    return (
      <div className="card max-w-md mx-auto">
        <div className="text-center mb-6">
          <BuildingOfficeIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Bank Transfer Payment
          </h3>
          <p className="text-gray-600 mb-4">
            Pay {formatAmount(amount)} via bank transfer
          </p>
        </div>

        <div className="space-y-3 mb-6">
          {ZAMBIAN_BANKS.map((bank) => (
            <button
              key={bank.id}
              onClick={() => handleBankSelect(bank.id)}
              className="w-full p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-colors duration-200 text-left"
              aria-label={`Select ${bank.name} for bank transfer`}
            >
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full ${bank.color} flex items-center justify-center text-white text-lg mr-3`}>
                  {bank.logo}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{bank.name}</h4>
                  <p className="text-sm text-gray-600">Transfer via {bank.code}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={onCancel}
          className="btn-secondary w-full"
          aria-label="Cancel bank transfer payment"
        >
          Cancel
        </button>
      </div>
    );
  }

  // Account Details Step
  if (paymentStep === 'account-details') {
    return (
      <div className="card max-w-md mx-auto">
        <div className="text-center mb-6">
          <BuildingOfficeIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {selectedBankData?.name} Transfer
          </h3>
          <p className="text-gray-600">
            Enter your account details to receive payment instructions.
          </p>
        </div>

        <div className="mb-6">
          <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-2">
            Account Number
          </label>
          <div className="relative">
            <CreditCardIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              id="accountNumber"
              value={accountNumber}
              onChange={(e) => setAccountNumber(formatAccountNumber(e.target.value))}
              placeholder="e.g., 1234 5678 9012 3456"
              className="input-field pl-10"
              maxLength={19}
              aria-describedby="accountNumberHelp"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1" id="accountNumberHelp">
            Enter your 16-digit {selectedBankData?.name} account number
          </p>
        </div>

        <div className="mb-6">
          <label htmlFor="accountName" className="block text-sm font-medium text-gray-700 mb-2">
            Account Holder Name
          </label>
          <input
            type="text"
            id="accountName"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            placeholder="e.g., John Doe"
            className="input-field"
            aria-describedby="accountNameHelp"
          />
          <p className="text-xs text-gray-500 mt-1" id="accountNameHelp">
            Enter the name as it appears on your bank account
          </p>
        </div>

        {error && (
          <p className="text-red-600 text-sm mb-4">{error}</p>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleBack}
            className="btn-secondary flex-1"
            aria-label="Go back to bank selection"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back
          </button>
          <button
            onClick={handleAccountDetailsSubmit}
            className="btn-primary flex-1"
            disabled={!accountNumber || !accountName}
            aria-label="Continue to payment confirmation"
          >
            Continue
            <ArrowRightIcon className="h-4 w-4 ml-2" />
          </button>
        </div>
      </div>
    );
  }

  // Confirmation Step
  if (paymentStep === 'confirm') {
    return (
      <div className="card max-w-md mx-auto">
        <div className="text-center mb-6">
          <BuildingOfficeIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Confirm Bank Transfer
          </h3>
          <p className="text-gray-600">
            Please review your transfer details before proceeding.
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Bank:</span>
              <span className="font-medium">{selectedBankData?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Account Number:</span>
              <span className="font-medium font-mono">{accountNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Account Name:</span>
              <span className="font-medium">{accountName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount:</span>
              <span className="font-medium text-lg">{formatAmount(amount)}</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-blue-900 mb-2">Transfer Instructions:</h4>
          <ol className="text-sm text-blue-800 space-y-1">
            <li>1. Log into your {selectedBankData?.name} online banking</li>
            <li>2. Navigate to "Transfer" or "Send Money"</li>
            <li>3. Enter the account details shown above</li>
            <li>4. Transfer {formatAmount(amount)} to complete payment</li>
          </ol>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleBack}
            className="btn-secondary flex-1"
            aria-label="Go back to account details"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back
          </button>
          <button
            onClick={handleConfirmPayment}
            className="btn-primary flex-1"
            aria-label="Confirm bank transfer payment"
          >
            Confirm Transfer
            <ArrowRightIcon className="h-4 w-4 ml-2" />
          </button>
        </div>
      </div>
    );
  }

  // Processing Step
  if (paymentStep === 'processing') {
    return (
      <div className="card max-w-md mx-auto text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Processing Transfer
        </h3>
        <p className="text-gray-600">
          Please wait while we process your bank transfer request...
        </p>
      </div>
    );
  }

  // Success Step
  if (paymentStep === 'success') {
    return (
      <div className="card max-w-md mx-auto text-center">
        <CheckCircleIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Transfer Initiated Successfully!
        </h3>
        <p className="text-gray-600 mb-4">
          Your bank transfer has been initiated. Please complete the transfer in your bank app.
        </p>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-green-900 mb-2">Transfer Details:</h4>
          <div className="text-sm text-green-800 space-y-1">
            <p><strong>Reference:</strong> BT-{Date.now().toString().slice(-6)}</p>
            <p><strong>Bank:</strong> {selectedBankData?.name}</p>
            <p><strong>Amount:</strong> {formatAmount(amount)}</p>
            <p><strong>Status:</strong> Pending</p>
          </div>
        </div>

        <button
          onClick={onCancel}
          className="btn-primary w-full"
          aria-label="Close payment window"
        >
          Done
        </button>
      </div>
    );
  }

  // Error Step
  if (paymentStep === 'error') {
    return (
      <div className="card max-w-md mx-auto text-center">
        <XCircleIcon className="h-12 w-12 text-red-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Transfer Failed
        </h3>
        <p className="text-gray-600 mb-4">
          {error || 'An error occurred while processing your transfer.'}
        </p>
        
        <div className="flex gap-2">
          <button
            onClick={handleBack}
            className="btn-secondary flex-1"
            aria-label="Try again"
          >
            Try Again
          </button>
          <button
            onClick={onCancel}
            className="btn-primary flex-1"
            aria-label="Cancel payment"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default BankTransferPayment;

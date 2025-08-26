import React, { useState } from 'react';
import { 
  BanknotesIcon, 
  CalculatorIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  PrinterIcon
} from '@heroicons/react/24/outline';

interface CashPaymentProps {
  amount: number;
  onPaymentComplete: (result: {
    success: boolean;
    reference: string;
    amountReceived: number;
    change: number;
    receiptNumber: string;
    timestamp: Date;
  }) => void;
  onCancel: () => void;
}

type PaymentStep = 'enter-amount' | 'confirm' | 'processing' | 'success' | 'error';

const CashPayment: React.FC<CashPaymentProps> = ({
  amount,
  onPaymentComplete,
  onCancel
}) => {
  const [paymentStep, setPaymentStep] = useState<PaymentStep>('enter-amount');
  const [amountReceived, setAmountReceived] = useState<number>(0);
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

  // Calculate change
  const calculateChange = (): number => {
    return Math.max(0, amountReceived - amount);
  };

  // Generate receipt number
  const generateReceiptNumber = (): string => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `RCP-${timestamp}-${random}`;
  };

  // Generate transaction reference
  const generateReference = (): string => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `CASH-${timestamp}-${random}`;
  };

  // Common Zambian currency denominations
  const ZAMBIAN_DENOMINATIONS = [
    { value: 100, label: 'K100', color: 'bg-green-600' },
    { value: 50, label: 'K50', color: 'bg-blue-600' },
    { value: 20, label: 'K20', color: 'bg-purple-600' },
    { value: 10, label: 'K10', color: 'bg-orange-600' },
    { value: 5, label: 'K5', color: 'bg-red-600' },
    { value: 2, label: 'K2', color: 'bg-yellow-600' },
    { value: 1, label: 'K1', color: 'bg-gray-600' },
    { value: 0.5, label: '50n', color: 'bg-gray-500' },
    { value: 0.1, label: '10n', color: 'bg-gray-400' }
  ];

  const handleAmountReceivedChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    setAmountReceived(numValue);
    setError('');
  };

  const handleQuickAdd = (denomination: number) => {
    setAmountReceived(prev => prev + denomination);
    setError('');
  };

  const handleConfirmPayment = async () => {
    if (amountReceived < amount) {
      setError(`Amount received (${formatAmount(amountReceived)}) is less than required amount (${formatAmount(amount)})`);
      return;
    }

    setIsLoading(true);
    setPaymentStep('processing');

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      const reference = generateReference();
      const receiptNumber = generateReceiptNumber();
      const change = calculateChange();

      onPaymentComplete({
        success: true,
        reference,
        amountReceived,
        change,
        receiptNumber,
        timestamp: new Date()
      });

      setPaymentStep('success');
    } catch (err) {
      setError('Payment processing failed. Please try again.');
      setPaymentStep('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    switch (paymentStep) {
      case 'confirm':
        setPaymentStep('enter-amount');
        break;
      case 'error':
        setPaymentStep('confirm');
        setError('');
        break;
      default:
        onCancel();
    }
  };

  const change = calculateChange();
  const isAmountSufficient = amountReceived >= amount;

  // Enter Amount Step
  if (paymentStep === 'enter-amount') {
    return (
      <div className="card max-w-md mx-auto">
        <div className="text-center mb-6">
          <BanknotesIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Cash Payment
          </h3>
          <p className="text-gray-600 mb-4">
            Amount due: {formatAmount(amount)}
          </p>
        </div>

        <div className="mb-6">
          <label htmlFor="amountReceived" className="block text-sm font-medium text-gray-700 mb-2">
            Amount Received
          </label>
          <div className="relative">
            <CalculatorIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="number"
              id="amountReceived"
              value={amountReceived || ''}
              onChange={(e) => handleAmountReceivedChange(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="input-field pl-10"
              aria-describedby="amountHelp"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1" id="amountHelp">
            Enter the amount received from the customer
          </p>
        </div>

        {/* Quick Add Buttons */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Add:</h4>
          <div className="grid grid-cols-3 gap-2">
            {ZAMBIAN_DENOMINATIONS.slice(0, 6).map((denom) => (
              <button
                key={denom.value}
                onClick={() => handleQuickAdd(denom.value)}
                className={`${denom.color} text-white text-sm py-2 px-3 rounded-lg hover:opacity-90 transition-opacity`}
                aria-label={`Add ${denom.label}`}
              >
                +{denom.label}
              </button>
            ))}
          </div>
        </div>

        {/* Amount Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Amount Due:</span>
              <span className="font-medium">{formatAmount(amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount Received:</span>
              <span className="font-medium">{formatAmount(amountReceived)}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-gray-600">Change:</span>
              <span className={`font-medium ${change > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                {formatAmount(change)}
              </span>
            </div>
          </div>
        </div>

        {error && (
          <p className="text-red-600 text-sm mb-4">{error}</p>
        )}

        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="btn-secondary flex-1"
            aria-label="Cancel cash payment"
          >
            Cancel
          </button>
          <button
            onClick={() => setPaymentStep('confirm')}
            className="btn-primary flex-1"
            disabled={!isAmountSufficient}
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
          <DocumentTextIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Confirm Cash Payment
          </h3>
          <p className="text-gray-600">
            Please review the payment details before proceeding.
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Amount Due:</span>
              <span className="font-medium">{formatAmount(amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount Received:</span>
              <span className="font-medium">{formatAmount(amountReceived)}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-gray-600">Change:</span>
              <span className={`font-medium ${change > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                {formatAmount(change)}
              </span>
            </div>
          </div>
        </div>

        {change > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-green-900 mb-2">Change Breakdown:</h4>
            <div className="text-sm text-green-800">
              <p>Please provide change of {formatAmount(change)} to the customer.</p>
              <p className="mt-2 text-xs">Recommended denominations:</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {ZAMBIAN_DENOMINATIONS
                  .filter(denom => denom.value <= change)
                  .slice(0, 4)
                  .map(denom => (
                    <span key={denom.value} className="bg-green-200 px-2 py-1 rounded text-xs">
                      {denom.label}
                    </span>
                  ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleBack}
            className="btn-secondary flex-1"
            aria-label="Go back to amount entry"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back
          </button>
          <button
            onClick={handleConfirmPayment}
            className="btn-primary flex-1"
            aria-label="Confirm cash payment"
          >
            Confirm Payment
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Processing Payment
        </h3>
        <p className="text-gray-600">
          Please wait while we process your cash payment...
        </p>
      </div>
    );
  }

  // Success Step
  if (paymentStep === 'success') {
    const receiptNumber = generateReceiptNumber();
    const reference = generateReference();

    return (
      <div className="card max-w-md mx-auto text-center">
        <CheckCircleIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Payment Successful!
        </h3>
        <p className="text-gray-600 mb-4">
          Cash payment has been recorded successfully.
        </p>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-green-900 mb-2">Payment Details:</h4>
          <div className="text-sm text-green-800 space-y-1">
            <p><strong>Receipt #:</strong> {receiptNumber}</p>
            <p><strong>Reference:</strong> {reference}</p>
            <p><strong>Amount Paid:</strong> {formatAmount(amount)}</p>
            <p><strong>Amount Received:</strong> {formatAmount(amountReceived)}</p>
            <p><strong>Change Given:</strong> {formatAmount(change)}</p>
            <p><strong>Date:</strong> {new Date().toLocaleDateString('en-ZM')}</p>
            <p><strong>Time:</strong> {new Date().toLocaleTimeString('en-ZM')}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="btn-secondary flex-1"
            aria-label="Print receipt"
          >
            <PrinterIcon className="h-4 w-4 mr-2" />
            Print Receipt
          </button>
          <button
            onClick={onCancel}
            className="btn-primary flex-1"
            aria-label="Close payment window"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  // Error Step
  if (paymentStep === 'error') {
    return (
      <div className="card max-w-md mx-auto text-center">
        <XCircleIcon className="h-12 w-12 text-red-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Payment Failed
        </h3>
        <p className="text-gray-600 mb-4">
          {error || 'An error occurred while processing your payment.'}
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

export default CashPayment;

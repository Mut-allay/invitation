import React, { useState } from 'react';
import { 
  PhoneIcon, 
  CheckCircleIcon, 
  XMarkIcon, 
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';

interface MobileMoneyPaymentProps {
  amount: number;
  onPaymentComplete: (paymentData: {
    provider: string;
    phoneNumber: string;
    amount: number;
    reference: string;
    status: string;
  }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

type PaymentStep = 'provider-selection' | 'phone-input' | 'confirmation' | 'processing' | 'success' | 'error';

type MobileMoneyProvider = 'airtel' | 'mtn' | 'zamtel';

interface ProviderInfo {
  id: MobileMoneyProvider;
  name: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}

const providers: ProviderInfo[] = [
  {
    id: 'airtel',
    name: 'Airtel Money',
    color: 'bg-red-500 hover:bg-red-600',
    icon: PhoneIcon
  },
  {
    id: 'mtn',
    name: 'MTN Money',
    color: 'bg-yellow-500 hover:bg-yellow-600',
    icon: PhoneIcon
  },
  {
    id: 'zamtel',
    name: 'Zamtel Money',
    color: 'bg-blue-500 hover:bg-blue-600',
    icon: PhoneIcon
  }
];

const MobileMoneyPayment: React.FC<MobileMoneyPaymentProps> = ({
  amount,
  onPaymentComplete,
  onCancel,
  isLoading = false
}) => {
  const [currentStep, setCurrentStep] = useState<PaymentStep>('provider-selection');
  const [selectedProvider, setSelectedProvider] = useState<MobileMoneyProvider | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [paymentError, setPaymentError] = useState('');

  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('en-ZM', {
      style: 'currency',
      currency: 'ZMW'
    }).format(amount);
  };

  const validatePhoneNumber = (phone: string): boolean => {
    // Zambian mobile number validation: 10 digits starting with 0
    const phoneRegex = /^0[789]\d{8}$/;
    return phoneRegex.test(phone);
  };

  const handleProviderSelect = (provider: MobileMoneyProvider) => {
    setSelectedProvider(provider);
    setCurrentStep('phone-input');
    setPhoneError('');
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhoneNumber(value);
    
    if (value && !validatePhoneNumber(value)) {
      setPhoneError('Please enter a valid phone number');
    } else {
      setPhoneError('');
    }
  };

  const handleContinue = () => {
    if (!validatePhoneNumber(phoneNumber)) {
      setPhoneError('Please enter a valid phone number');
      return;
    }
    setCurrentStep('confirmation');
  };

  const handleBack = () => {
    if (currentStep === 'phone-input') {
      setCurrentStep('provider-selection');
      setSelectedProvider(null);
      setPhoneNumber('');
      setPhoneError('');
    } else if (currentStep === 'confirmation') {
      setCurrentStep('phone-input');
    }
  };

  const handleConfirmPayment = async () => {
    try {
      setCurrentStep('processing');
      setPaymentError('');

      // Initiate payment
      const initiateResponse = await fetch('/api/mobile-money/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          provider: selectedProvider,
          phoneNumber,
          amount
        })
      });

      if (!initiateResponse.ok) {
        const errorData = await initiateResponse.json();
        throw new Error(errorData.error || 'Payment failed. Please try again.');
      }

      const initiateData = await initiateResponse.json();
      
      if (!initiateData.success) {
        throw new Error(initiateData.error || 'Payment failed. Please try again.');
      }

      // Verify payment
      const verifyResponse = await fetch(`/api/mobile-money/verify/${initiateData.payment.reference}`);
      
      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json();
        throw new Error(errorData.error || 'Payment verification failed');
      }

      const verifyData = await verifyResponse.json();
      
      if (!verifyData.success) {
        throw new Error(verifyData.error || 'Payment verification failed');
      }

      onPaymentComplete({
        provider: selectedProvider!,
        phoneNumber,
        amount,
        reference: initiateData.payment.reference,
        status: 'success'
      });
      
      setCurrentStep('success');
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : 'Payment failed. Please try again.');
      setCurrentStep('error');
    }
  };

  const handleCancel = () => {
    onCancel();
  };

  const renderProviderSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Mobile Money Payment</h2>
        <p className="text-gray-600">
          Pay {formatAmount(amount)} using mobile money
        </p>
      </div>

      <div className="space-y-4">
        {providers.map((provider) => (
          <button
            key={provider.id}
            onClick={() => handleProviderSelect(provider.id)}
            disabled={isLoading}
            className={`w-full p-4 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors ${
              isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className={`p-2 rounded-full ${provider.color} text-white`}>
                <provider.icon className="w-6 h-6" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-gray-900">{provider.name}</h3>
                <p className="text-sm text-gray-500">Fast and secure payment</p>
              </div>
              <ArrowLeftIcon className="w-5 h-5 text-gray-400 rotate-180" />
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={handleCancel}
        disabled={isLoading}
        className="w-full py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
      >
        Cancel
      </button>
    </div>
  );

  const renderPhoneInput = () => {
    const provider = providers.find(p => p.id === selectedProvider);
    
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <button
            onClick={handleBack}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{provider?.name} Payment</h2>
            <p className="text-sm text-gray-600">Enter your phone number to receive payment instructions.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="phone-number" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="phone-number"
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                placeholder="e.g., 0977123456"
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  phoneError ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={isLoading}
              />
            </div>
            {phoneError && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                {phoneError}
              </p>
            )}
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start space-x-3">
              <CreditCardIcon className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Payment Amount</h4>
                <p className="text-blue-700">{formatAmount(amount)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleContinue}
            disabled={!phoneNumber || !!phoneError || isLoading}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="w-full py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };

  const renderConfirmation = () => {
    const provider = providers.find(p => p.id === selectedProvider);
    
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <button
            onClick={handleBack}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Confirm Payment</h2>
            <p className="text-sm text-gray-600">Please review your payment details before confirming.</p>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Provider:</span>
            <span className="font-medium">{provider?.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Phone Number:</span>
            <span className="font-medium">{phoneNumber}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Amount:</span>
            <span className="font-bold text-lg">{formatAmount(amount)}</span>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleConfirmPayment}
            disabled={isLoading}
            className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            Confirm Payment
          </button>
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="w-full py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };

  const renderProcessing = () => (
    <div className="text-center space-y-6">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Processing Payment...</h2>
        <p className="text-gray-600">Please wait while we process your payment.</p>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center space-y-6">
      <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircleIcon className="w-8 h-8 text-green-600" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
        <p className="text-gray-600">Your payment has been processed successfully.</p>
      </div>
      <div className="bg-green-50 p-4 rounded-lg">
        <p className="text-green-800 font-medium">{formatAmount(amount)}</p>
        <p className="text-green-700 text-sm">Payment completed</p>
      </div>
    </div>
  );

  const renderError = () => (
    <div className="text-center space-y-6">
      <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
        <XMarkIcon className="w-8 h-8 text-red-600" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Payment Failed</h2>
        <p className="text-gray-600">{paymentError}</p>
      </div>
      <div className="space-y-3">
        <button
          onClick={() => setCurrentStep('confirmation')}
          className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
        <button
          onClick={handleCancel}
          className="w-full py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      {currentStep === 'provider-selection' && renderProviderSelection()}
      {currentStep === 'phone-input' && renderPhoneInput()}
      {currentStep === 'confirmation' && renderConfirmation()}
      {currentStep === 'processing' && renderProcessing()}
      {currentStep === 'success' && renderSuccess()}
      {currentStep === 'error' && renderError()}
    </div>
  );
};

export default MobileMoneyPayment;

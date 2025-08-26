import React, { useState, useEffect } from 'react';
import { PhoneIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface ZambianPhoneValidatorProps {
  value: string;
  onChange: (value: string) => void;
  onValidationChange?: (isValid: boolean, provider?: string) => void;
  className?: string;
  placeholder?: string;
  required?: boolean;
}

interface PhoneProvider {
  name: string;
  prefixes: string[];
  color: string;
}

const phoneProviders: PhoneProvider[] = [
  {
    name: 'MTN',
    prefixes: ['096', '097', '076', '077'],
    color: 'text-yellow-600'
  },
  {
    name: 'Airtel',
    prefixes: ['095', '096', '075', '076'],
    color: 'text-red-600'
  },
  {
    name: 'Zamtel',
    prefixes: ['095', '096', '075', '076'],
    color: 'text-blue-600'
  }
];

const ZambianPhoneValidator: React.FC<ZambianPhoneValidatorProps> = ({
  value,
  onChange,
  onValidationChange,
  className = '',
  placeholder = 'Enter phone number',
  required = false
}) => {
  const [isValid, setIsValid] = useState(false);
  const [provider, setProvider] = useState<string>('');
  const [touched, setTouched] = useState(false);

  const validatePhoneNumber = (phone: string): { isValid: boolean; provider?: string } => {
    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Check if it's a valid Zambian mobile number
    if (cleanPhone.length === 9 && cleanPhone.startsWith('0')) {
      const prefix = cleanPhone.substring(0, 3);
      const foundProvider = phoneProviders.find(p => p.prefixes.includes(prefix));
      
      if (foundProvider) {
        return { isValid: true, provider: foundProvider.name };
      }
    }
    
    return { isValid: false };
  };

  const formatPhoneNumber = (phone: string): string => {
    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Format as Zambian mobile number
    if (cleanPhone.length <= 3) {
      return cleanPhone;
    } else if (cleanPhone.length <= 6) {
      return `${cleanPhone.substring(0, 3)} ${cleanPhone.substring(3)}`;
    } else {
      return `${cleanPhone.substring(0, 3)} ${cleanPhone.substring(3, 6)} ${cleanPhone.substring(6, 9)}`;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const formattedValue = formatPhoneNumber(inputValue);
    onChange(formattedValue);
  };

  const handleBlur = () => {
    setTouched(true);
  };

  useEffect(() => {
    const validation = validatePhoneNumber(value);
    setIsValid(validation.isValid);
    setProvider(validation.provider || '');
    onValidationChange?.(validation.isValid, validation.provider);
  }, [value, onValidationChange]);

  const getProviderColor = () => {
    const foundProvider = phoneProviders.find(p => p.name === provider);
    return foundProvider?.color || '';
  };

  return (
    <div className={className}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <PhoneIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="tel"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          required={required}
          className={`block w-full pl-10 pr-10 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
            touched && !isValid ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          {touched && (
            <>
              {isValid ? (
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
              ) : (
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
              )}
            </>
          )}
        </div>
      </div>
      
      {touched && value && (
        <div className="mt-1">
          {isValid ? (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-green-600">Valid Zambian mobile number</span>
              {provider && (
                <span className={`text-sm font-medium ${getProviderColor()}`}>
                  ({provider})
                </span>
              )}
            </div>
          ) : (
            <p className="text-sm text-red-600">
              Please enter a valid Zambian mobile number (e.g., 096 123 456)
            </p>
          )}
        </div>
      )}
      
      <div className="mt-2">
        <p className="text-xs text-gray-500">
          Supported providers: MTN, Airtel, Zamtel
        </p>
      </div>
    </div>
  );
};

export default ZambianPhoneValidator;

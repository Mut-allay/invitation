import React, { useState } from 'react';
import { 
  GlobeAltIcon, 
  CurrencyDollarIcon, 
  PhoneIcon, 
  UserGroupIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import ZambianLanguageSelector from '../components/local/ZambianLanguageSelector';
import ZambianCurrencyFormatter from '../components/local/ZambianCurrencyFormatter';
import ZambianPhoneValidator from '../components/local/ZambianPhoneValidator';
import ZambianBusinessWorkflow from '../components/local/ZambianBusinessWorkflow';

const ZambianMarketDemo: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneValidation, setPhoneValidation] = useState({ isValid: false, provider: '' });
  const [workflowType, setWorkflowType] = useState<'sale' | 'repair' | 'service'>('sale');

  const sampleAmounts = [15000, 250000, 5000000, 12500000];

  const handleWorkflowComplete = () => {
    alert('Zambian business workflow completed successfully!');
  };

  const handleStepComplete = (stepId: string) => {
    console.log(`Step completed: ${stepId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🇿🇲 Zambian Market Customization
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Experience how Garaji Flow adapts to Zambian business practices, local languages, 
            currency formatting, and traditional workflows for the local market.
          </p>
        </div>

        {/* Language Selector Demo */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <GlobeAltIcon className="h-5 w-5 text-gray-500" />
              <h2 className="text-xl font-semibold text-gray-900">Multi-Language Support</h2>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Support for English, Bemba, and Nyanja languages
            </p>
          </div>
          <div className="p-6">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Current Language:</span>
              <ZambianLanguageSelector
                currentLanguage={selectedLanguage}
                onLanguageChange={setSelectedLanguage}
              />
            </div>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Selected:</strong> {selectedLanguage === 'en' ? 'English' : 
                  selectedLanguage === 'bem' ? 'Bemba (Ichibemba)' : 'Nyanja (Chichewa)'}
              </p>
            </div>
          </div>
        </div>

        {/* Currency Formatter Demo */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <CurrencyDollarIcon className="h-5 w-5 text-gray-500" />
              <h2 className="text-xl font-semibold text-gray-900">Zambian Currency Formatting</h2>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Proper ZMW formatting with local conventions
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Sample Amounts:</h3>
                <div className="space-y-2">
                  {sampleAmounts.map((amount, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="text-sm text-gray-600">K {amount.toLocaleString()}</span>
                      <ZambianCurrencyFormatter amount={amount} size="md" />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Different Sizes:</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Small:</span>
                    <ZambianCurrencyFormatter amount={15000} size="sm" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Medium:</span>
                    <ZambianCurrencyFormatter amount={15000} size="md" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Large:</span>
                    <ZambianCurrencyFormatter amount={15000} size="lg" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Phone Validator Demo */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <PhoneIcon className="h-5 w-5 text-gray-500" />
              <h2 className="text-xl font-semibold text-gray-900">Zambian Phone Validation</h2>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Validates and formats Zambian mobile numbers for MTN, Airtel, and Zamtel
            </p>
          </div>
          <div className="p-6">
            <div className="max-w-md">
              <ZambianPhoneValidator
                value={phoneNumber}
                onChange={setPhoneNumber}
                onValidationChange={(isValid, provider) => 
                  setPhoneValidation({ isValid, provider: provider || '' })
                }
                placeholder="Enter Zambian mobile number"
              />
              
              {phoneValidation.isValid && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-green-700">
                      Valid {phoneValidation.provider} number
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Business Workflow Demo */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <UserGroupIcon className="h-5 w-5 text-gray-500" />
              <h2 className="text-xl font-semibold text-gray-900">Zambian Business Workflow</h2>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Traditional Zambian business practices adapted for modern operations
            </p>
          </div>
          <div className="p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Workflow Type:
              </label>
              <div className="flex space-x-4">
                {(['sale', 'repair', 'service'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setWorkflowType(type)}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      workflowType === type
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            <ZambianBusinessWorkflow
              workflowType={workflowType}
              onStepComplete={handleStepComplete}
              onWorkflowComplete={handleWorkflowComplete}
            />
          </div>
        </div>

        {/* Features Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Zambian Market Features Summary</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Localization Features</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center space-x-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-500" />
                    <span>Multi-language support (English, Bemba, Nyanja)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-500" />
                    <span>Zambian Kwacha (ZMW) currency formatting</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-500" />
                    <span>Local phone number validation (MTN, Airtel, Zamtel)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-500" />
                    <span>Traditional business workflow adaptation</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Business Integration</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center space-x-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-500" />
                    <span>ZRA compliance and tax regulations</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-500" />
                    <span>Mobile money payment integration</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-500" />
                    <span>Local business practice workflows</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-500" />
                    <span>Traditional customer relationship management</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZambianMarketDemo;

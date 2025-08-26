import React, { useState, useEffect } from 'react';
import {
  CalculatorIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

// ZRA VAT rates and exemption categories
const ZRA_VAT_RATES = [
  {
    rate: 0,
    label: 'VAT Exempt',
    description: 'Basic food items, medical supplies, educational materials',
    color: 'text-gray-600'
  },
  {
    rate: 16,
    label: 'Standard Rate',
    description: 'Most goods and services in Zambia',
    color: 'text-blue-600'
  }
];

// VAT exemption categories as per ZRA guidelines
const VAT_EXEMPTION_CATEGORIES = [
  'Basic food items (maize meal, rice, sugar, etc.)',
  'Medical and pharmaceutical supplies',
  'Educational materials and books',
  'Agricultural inputs and equipment',
  'Export services',
  'Financial services',
  'Insurance services',
  'Public transport services',
  'Residential rental services'
];

interface VATCalculation {
  amount: number;
  vatRate: number;
  isExempt: boolean;
  vatAmount: number;
  totalWithVAT: number;
  totalWithoutVAT: number;
}

interface VATCalculatorProps {
  initialAmount?: number;
  initialVATRate?: number;
  onCalculationChange?: (calculation: VATCalculation) => void;
  showExemptionInfo?: boolean;
  className?: string;
}

const VATCalculator: React.FC<VATCalculatorProps> = ({
  initialAmount = 0,
  initialVATRate = 16,
  onCalculationChange,
  showExemptionInfo = false,
  className = ''
}) => {
  const [amount, setAmount] = useState<number>(initialAmount);
  const [vatRate, setVATRate] = useState<number>(initialVATRate);
  const [calculationType, setCalculationType] = useState<'inclusive' | 'exclusive'>('exclusive');
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Format currency in Zambian Kwacha
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-ZM', {
      style: 'currency',
      currency: 'ZMW',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Calculate VAT amounts
  const calculateVAT = (): VATCalculation => {
    const isExempt = vatRate === 0;
    let vatAmount: number;
    let totalWithVAT: number;
    let totalWithoutVAT: number;

    if (isExempt) {
      vatAmount = 0;
      totalWithVAT = amount;
      totalWithoutVAT = amount;
    } else if (calculationType === 'inclusive') {
      // Amount includes VAT - calculate backwards
      totalWithVAT = amount;
      totalWithoutVAT = amount / (1 + vatRate / 100);
      vatAmount = totalWithVAT - totalWithoutVAT;
    } else {
      // Amount excludes VAT - calculate forwards
      totalWithoutVAT = amount;
      vatAmount = amount * (vatRate / 100);
      totalWithVAT = amount + vatAmount;
    }

    return {
      amount,
      vatRate,
      isExempt,
      vatAmount,
      totalWithVAT,
      totalWithoutVAT
    };
  };

  const calculation = calculateVAT();

  // Notify parent component of calculation changes
  useEffect(() => {
    if (onCalculationChange) {
      onCalculationChange(calculation);
    }
  }, [amount, vatRate, calculationType, onCalculationChange]);

  // Calculate VAT percentage of total
  const getVATPercentageOfTotal = (): number => {
    if (calculation.totalWithVAT === 0) return 0;
    return (calculation.vatAmount / calculation.totalWithVAT) * 100;
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center mb-4">
        <CalculatorIcon className="h-6 w-6 text-blue-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">ZRA VAT Calculator</h3>
      </div>

      {/* Input Section */}
      <div className="space-y-4 mb-6">
        {/* Amount Input */}
        <div>
          <label htmlFor="vatAmount" className="block text-sm font-medium text-gray-700 mb-1">
            Amount (ZMW)
          </label>
          <input
            type="number"
            id="vatAmount"
            value={amount || ''}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            className="input-field"
            placeholder="Enter amount"
            min="0"
            step="0.01"
            aria-describedby="amountHelp"
          />
          <p id="amountHelp" className="text-xs text-gray-500 mt-1">
            Enter the amount in Zambian Kwacha
          </p>
        </div>

        {/* Calculation Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount Type
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="calculationType"
                value="exclusive"
                checked={calculationType === 'exclusive'}
                onChange={(e) => setCalculationType(e.target.value as 'inclusive' | 'exclusive')}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Exclusive of VAT</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="calculationType"
                value="inclusive"
                checked={calculationType === 'inclusive'}
                onChange={(e) => setCalculationType(e.target.value as 'inclusive' | 'exclusive')}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Inclusive of VAT</span>
            </label>
          </div>
        </div>

        {/* VAT Rate Selection */}
        <div>
          <label htmlFor="vatRate" className="block text-sm font-medium text-gray-700 mb-1">
            VAT Rate
          </label>
          <select
            id="vatRate"
            value={vatRate}
            onChange={(e) => setVATRate(parseFloat(e.target.value))}
            className="input-field"
            aria-describedby="vatRateHelp"
          >
            {ZRA_VAT_RATES.map((rate) => (
              <option key={rate.rate} value={rate.rate}>
                {rate.rate}% - {rate.label}
              </option>
            ))}
          </select>
          <p id="vatRateHelp" className="text-xs text-gray-500 mt-1">
            {ZRA_VAT_RATES.find(r => r.rate === vatRate)?.description}
          </p>
        </div>
      </div>

      {/* Results Section */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">VAT Calculation Results</h4>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Amount (excl. VAT):</span>
            <span className="font-medium">{formatCurrency(calculation.totalWithoutVAT)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">
              VAT ({calculation.isExempt ? 'Exempt' : `${vatRate}%`}):
            </span>
            <span className={`font-medium ${calculation.isExempt ? 'text-gray-500' : 'text-blue-600'}`}>
              {formatCurrency(calculation.vatAmount)}
            </span>
          </div>
          
          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
            <span className="text-sm font-semibold text-gray-900">Total (incl. VAT):</span>
            <span className="text-lg font-bold text-gray-900">
              {formatCurrency(calculation.totalWithVAT)}
            </span>
          </div>
        </div>

        {/* VAT Percentage Information */}
        {!calculation.isExempt && calculation.totalWithVAT > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center text-xs text-gray-600">
              <InformationCircleIcon className="h-4 w-4 mr-1" />
              <span>
                VAT represents {getVATPercentageOfTotal().toFixed(1)}% of the total amount
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Detailed Breakdown Toggle */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          aria-expanded={showBreakdown}
          aria-controls="breakdown-details"
        >
          <InformationCircleIcon className="h-4 w-4 mr-1" />
          {showBreakdown ? 'Hide' : 'Show'} Calculation Details
        </button>

        {calculation.isExempt && (
          <div className="flex items-center text-sm text-green-600">
            <CheckCircleIcon className="h-4 w-4 mr-1" />
            <span>VAT Exempt</span>
          </div>
        )}
      </div>

      {/* Detailed Breakdown */}
      {showBreakdown && (
        <div id="breakdown-details" className="bg-blue-50 rounded-lg p-4 mb-4">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">Calculation Breakdown</h4>
          
          {calculation.isExempt ? (
            <div className="text-sm text-blue-800">
              <p>This item is VAT exempt according to ZRA regulations.</p>
              <p className="mt-1">No VAT is charged on this transaction.</p>
            </div>
          ) : (
            <div className="text-sm text-blue-800 space-y-1">
              {calculationType === 'exclusive' ? (
                <>
                  <p>Base Amount: {formatCurrency(amount)}</p>
                  <p>VAT Calculation: {formatCurrency(amount)} × {vatRate}% = {formatCurrency(calculation.vatAmount)}</p>
                  <p>Total: {formatCurrency(amount)} + {formatCurrency(calculation.vatAmount)} = {formatCurrency(calculation.totalWithVAT)}</p>
                </>
              ) : (
                <>
                  <p>Total Amount (incl. VAT): {formatCurrency(amount)}</p>
                  <p>VAT Factor: 1 + ({vatRate}% ÷ 100) = {(1 + vatRate / 100).toFixed(4)}</p>
                  <p>Base Amount: {formatCurrency(amount)} ÷ {(1 + vatRate / 100).toFixed(4)} = {formatCurrency(calculation.totalWithoutVAT)}</p>
                  <p>VAT Amount: {formatCurrency(calculation.totalWithVAT)} - {formatCurrency(calculation.totalWithoutVAT)} = {formatCurrency(calculation.vatAmount)}</p>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* VAT Exemption Information */}
      {showExemptionInfo && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-yellow-900 mb-2">
                ZRA VAT Exemption Categories
              </h4>
              <p className="text-sm text-yellow-800 mb-2">
                The following items are typically exempt from VAT in Zambia:
              </p>
              <ul className="text-xs text-yellow-800 space-y-1">
                {VAT_EXEMPTION_CATEGORIES.map((category, index) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-block w-1 h-1 rounded-full bg-yellow-600 mt-2 mr-2 flex-shrink-0"></span>
                    <span>{category}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-yellow-700 mt-2 italic">
                Note: This is not an exhaustive list. Consult ZRA guidelines for complete exemption criteria.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ZRA Compliance Note */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        <p>Calculations based on ZRA VAT regulations. Standard rate: 16%</p>
      </div>
    </div>
  );
};

export default VATCalculator;

import React from 'react';

interface Step1Props {
  formData: any;
  updateFormData: (data: any) => void;
  errors?: string;
}

const Step1: React.FC<Step1Props> = ({ formData, updateFormData, errors }) => {
  const handleInputChange = (field: string, value: string) => {
    updateFormData({ [field]: value });
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="make" className="block text-sm font-medium text-gray-700 mb-1">
          Vehicle Make *
        </label>
        <input
          type="text"
          id="make"
          value={formData.make || ''}
          onChange={(e) => handleInputChange('make', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., Toyota"
          required
        />
      </div>

      <div>
        <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
          Vehicle Model *
        </label>
        <input
          type="text"
          id="model"
          value={formData.model || ''}
          onChange={(e) => handleInputChange('model', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., Corolla"
          required
        />
      </div>

      <div>
        <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
          Year *
        </label>
        <input
          type="number"
          id="year"
          value={formData.year || ''}
          onChange={(e) => handleInputChange('year', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., 2020"
          min="1900"
          max={new Date().getFullYear() + 1}
          required
        />
      </div>

      <div>
        <label htmlFor="regNumber" className="block text-sm font-medium text-gray-700 mb-1">
          Registration Number *
        </label>
        <input
          type="text"
          id="regNumber"
          value={formData.regNumber || ''}
          onChange={(e) => handleInputChange('regNumber', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., ABC123"
          required
        />
      </div>

      {errors && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{errors}</p>
        </div>
      )}
    </div>
  );
};

export default Step1;

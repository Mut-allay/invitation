import React from 'react';

interface ServiceFormData {
  serviceType?: string;
  priority?: string;
  reportedIssues?: string;
  estimatedCost?: string;
  estimatedDuration?: string;
}

interface Step3Props {
  formData: ServiceFormData;
  updateFormData: (data: Partial<ServiceFormData>) => void;
  errors?: string;
}

const Step3: React.FC<Step3Props> = ({ formData, updateFormData, errors }) => {
  const handleInputChange = (field: string, value: string) => {
    updateFormData({ [field]: value });
  };

  const handleTextareaChange = (field: string, value: string) => {
    updateFormData({ [field]: value });
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700 mb-1">
          Service Type *
        </label>
        <select
          id="serviceType"
          value={formData.serviceType || ''}
          onChange={(e) => handleInputChange('serviceType', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        >
          <option value="">Select service type</option>
          <option value="maintenance">Regular Maintenance</option>
          <option value="repair">Repair</option>
          <option value="inspection">Inspection</option>
          <option value="emergency">Emergency Service</option>
        </select>
      </div>

      <div>
        <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
          Priority Level *
        </label>
        <select
          id="priority"
          value={formData.priority || ''}
          onChange={(e) => handleInputChange('priority', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        >
          <option value="">Select priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      <div>
        <label htmlFor="reportedIssues" className="block text-sm font-medium text-gray-700 mb-1">
          Reported Issues *
        </label>
        <textarea
          id="reportedIssues"
          value={formData.reportedIssues || ''}
          onChange={(e) => handleTextareaChange('reportedIssues', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Describe the issues reported by the customer"
          rows={4}
          required
        />
      </div>

      <div>
        <label htmlFor="estimatedCost" className="block text-sm font-medium text-gray-700 mb-1">
          Estimated Cost (K)
        </label>
        <input
          type="number"
          id="estimatedCost"
          value={formData.estimatedCost || ''}
          onChange={(e) => handleInputChange('estimatedCost', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., 500"
          min="0"
          step="0.01"
        />
      </div>

      <div>
        <label htmlFor="estimatedDuration" className="block text-sm font-medium text-gray-700 mb-1">
          Estimated Duration (hours)
        </label>
        <input
          type="number"
          id="estimatedDuration"
          value={formData.estimatedDuration || ''}
          onChange={(e) => handleInputChange('estimatedDuration', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., 2"
          min="0.5"
          step="0.5"
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

export default Step3;

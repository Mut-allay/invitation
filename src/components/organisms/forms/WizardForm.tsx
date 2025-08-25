import React, { useState, ReactNode } from 'react';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

interface WizardStep {
  id: string;
  title: string;
  component: ReactNode;
  validation?: () => boolean | Promise<boolean>;
}

interface WizardFormProps {
  steps: WizardStep[];
  onComplete: (formData: any) => void;
  title?: string;
  className?: string;
}

const WizardForm: React.FC<WizardFormProps> = ({
  steps,
  onComplete,
  title = 'Multi-Step Form',
  className = ''
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isValidating, setIsValidating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const currentStepData = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  const updateFormData = (stepId: string, data: any) => {
    setFormData(prev => ({
      ...prev,
      [stepId]: { ...prev[stepId], ...data }
    }));
  };

  const validateCurrentStep = async (): Promise<boolean> => {
    if (!currentStepData.validation) return true;
    
    setIsValidating(true);
    setErrors({});
    
    try {
      const isValid = await currentStepData.validation();
      if (!isValid) {
        setErrors({ [currentStepData.id]: 'Please complete all required fields' });
      }
      return isValid;
    } catch (error) {
      setErrors({ [currentStepData.id]: 'Validation failed' });
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid && !isLastStep) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    const isValid = await validateCurrentStep();
    if (isValid) {
      onComplete(formData);
    }
  };

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep) return 'current';
    return 'upcoming';
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      </div>

      {/* Progress Indicator */}
      <div className="px-6 py-4 border-b border-gray-200">
        <nav aria-label="Progress">
          <ol className="flex items-center space-x-4">
            {steps.map((step, index) => {
              const status = getStepStatus(index);
              return (
                <li key={step.id} className="flex items-center">
                  <div className="flex items-center">
                    {status === 'completed' ? (
                      <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckIcon className="w-5 h-5 text-white" />
                      </div>
                    ) : status === 'current' ? (
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-white">{index + 1}</span>
                      </div>
                    ) : (
                      <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-500">{index + 1}</span>
                      </div>
                    )}
                    <span className={`ml-3 text-sm font-medium ${
                      status === 'completed' ? 'text-green-600' :
                      status === 'current' ? 'text-blue-600' :
                      'text-gray-500'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="ml-4 flex-shrink-0 w-6 h-0.5 bg-gray-200" />
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      {/* Step Content */}
      <div className="px-6 py-6">
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Step {currentStep + 1} of {steps.length}: {currentStepData.title}
          </h3>
        </div>

        {/* Error Display */}
        {errors[currentStepData.id] && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{errors[currentStepData.id]}</p>
          </div>
        )}

        {/* Step Component */}
        <div className="min-h-[200px]">
          {React.cloneElement(currentStepData.component as React.ReactElement, {
            formData: formData[currentStepData.id] || {},
            updateFormData: (data: any) => updateFormData(currentStepData.id, data),
            errors: errors[currentStepData.id]
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
        <button
          type="button"
          onClick={handleBack}
          disabled={isFirstStep}
          className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg border ${
            isFirstStep
              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500'
          }`}
        >
          <ChevronLeftIcon className="w-4 h-4 mr-2" />
          Back
        </button>

        <div className="flex space-x-3">
          {!isLastStep ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={isValidating}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRightIcon className="w-4 h-4 ml-2" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isValidating}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isValidating ? 'Submitting...' : 'Submit'}
              <CheckIcon className="w-4 h-4 ml-2" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WizardForm;

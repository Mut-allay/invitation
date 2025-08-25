import React from 'react';
import WizardForm from '../components/organisms/forms/WizardForm';
import Step1 from '../components/organisms/forms/Step1';
import Step2 from '../components/organisms/forms/Step2';
import Step3 from '../components/organisms/forms/Step3';

const WizardDemo: React.FC = () => {
  const handleFormComplete = (formData: any) => {
    console.log('Form completed with data:', formData);
    alert('Form submitted successfully! Check console for data.');
  };

  const steps = [
    {
      id: 'vehicle-details',
      title: 'Vehicle Details',
      component: <Step1 />,
      validation: () => {
        // Add validation logic here
        return true;
      }
    },
    {
      id: 'customer-details',
      title: 'Customer Information',
      component: <Step2 />,
      validation: () => {
        // Add validation logic here
        return true;
      }
    },
    {
      id: 'service-details',
      title: 'Service Information',
      component: <Step3 />,
      validation: () => {
        // Add validation logic here
        return true;
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Wizard Form Demo</h1>
        <p className="text-gray-600">Multi-step form for creating new service records</p>
      </div>

      {/* Wizard Form */}
      <div className="max-w-4xl mx-auto">
        <WizardForm
          steps={steps}
          onComplete={handleFormComplete}
          title="New Service Record"
        />
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">How to use:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Fill out each step with the required information</li>
          <li>• Use the Next/Back buttons to navigate between steps</li>
          <li>• The progress indicator shows your current position</li>
          <li>• Click Submit on the final step to complete the form</li>
        </ul>
      </div>
    </div>
  );
};

export default WizardDemo;

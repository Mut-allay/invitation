import React, { useState } from 'react';
import { 
  UserGroupIcon, 
  HandshakeIcon, 
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  isCompleted: boolean;
  isRequired: boolean;
  localCustom?: string;
}

interface ZambianBusinessWorkflowProps {
  workflowType: 'sale' | 'repair' | 'service';
  onStepComplete?: (stepId: string) => void;
  onWorkflowComplete?: () => void;
  className?: string;
}

const ZambianBusinessWorkflow: React.FC<ZambianBusinessWorkflowProps> = ({
  workflowType,
  onStepComplete,
  onWorkflowComplete,
  className = ''
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<WorkflowStep[]>(() => {
    const baseSteps: WorkflowStep[] = [
      {
        id: 'greeting',
        title: 'Traditional Greeting',
        description: 'Exchange traditional greetings and establish rapport',
        icon: UserGroupIcon,
        isCompleted: false,
        isRequired: true,
        localCustom: 'Use appropriate greetings in local language (Bemba/Nyanja)'
      },
      {
        id: 'negotiation',
        title: 'Price Negotiation',
        description: 'Discuss pricing with room for traditional bargaining',
        icon: HandshakeIcon,
        isCompleted: false,
        isRequired: true,
        localCustom: 'Allow for traditional bargaining practices'
      },
      {
        id: 'documentation',
        title: 'Documentation & Records',
        description: 'Complete necessary paperwork and records',
        icon: DocumentTextIcon,
        isCompleted: false,
        isRequired: true,
        localCustom: 'Ensure ZRA compliance and local business registration'
      },
      {
        id: 'payment',
        title: 'Payment Processing',
        description: 'Process payment using preferred local methods',
        icon: CheckCircleIcon,
        isCompleted: false,
        isRequired: true,
        localCustom: 'Support mobile money, cash, and bank transfers'
      },
      {
        id: 'followup',
        title: 'Follow-up & Relationship',
        description: 'Maintain customer relationship for future business',
        icon: ClockIcon,
        isCompleted: false,
        isRequired: false,
        localCustom: 'Traditional relationship building for repeat customers'
      }
    ];

    // Add workflow-specific steps
    if (workflowType === 'repair') {
      baseSteps.splice(2, 0, {
        id: 'diagnosis',
        title: 'Vehicle Diagnosis',
        description: 'Assess vehicle condition and identify issues',
        icon: ExclamationTriangleIcon,
        isCompleted: false,
        isRequired: true,
        localCustom: 'Explain issues in simple terms customer can understand'
      });
    }

    return baseSteps;
  });

  const handleStepComplete = (stepId: string) => {
    setSteps(prevSteps => 
      prevSteps.map(step => 
        step.id === stepId 
          ? { ...step, isCompleted: true }
          : step
      )
    );
    
    onStepComplete?.(stepId);
    
    // Check if all required steps are completed
    const allRequiredCompleted = steps
      .filter(step => step.isRequired)
      .every(step => step.id === stepId ? true : step.isCompleted);
    
    if (allRequiredCompleted) {
      onWorkflowComplete?.();
    }
  };

  const getStepStatus = (step: WorkflowStep, index: number) => {
    if (step.isCompleted) {
      return 'completed';
    } else if (index === currentStep) {
      return 'current';
    } else if (index < currentStep) {
      return 'upcoming';
    } else {
      return 'upcoming';
    }
  };

  const getStepClasses = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'current':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-500';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Zambian Business Workflow - {workflowType.charAt(0).toUpperCase() + workflowType.slice(1)}
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Traditional Zambian business practices adapted for modern operations
        </p>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {steps.map((step, index) => {
            const status = getStepStatus(step, index);
            const Icon = step.icon;
            
            return (
              <div
                key={step.id}
                className={`flex items-start space-x-4 p-4 rounded-lg border-2 transition-colors ${getStepClasses(status)}`}
              >
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    status === 'completed' ? 'bg-green-500' : 
                    status === 'current' ? 'bg-blue-500' : 'bg-gray-300'
                  }`}>
                    {status === 'completed' ? (
                      <CheckCircleIcon className="w-5 h-5 text-white" />
                    ) : (
                      <Icon className="w-5 h-5 text-white" />
                    )}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">
                      {step.title}
                      {step.isRequired && (
                        <span className="ml-2 text-xs text-red-500">*</span>
                      )}
                    </h4>
                    {status === 'current' && (
                      <button
                        onClick={() => handleStepComplete(step.id)}
                        className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
                      >
                        Complete
                      </button>
                    )}
                  </div>
                  
                  <p className="text-sm mt-1">{step.description}</p>
                  
                  {step.localCustom && (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-xs text-yellow-800">
                        <strong>Local Custom:</strong> {step.localCustom}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Progress: {steps.filter(s => s.isCompleted).length} of {steps.length} steps
            </span>
            <span>
              {Math.round((steps.filter(s => s.isCompleted).length / steps.length) * 100)}% Complete
            </span>
          </div>
          
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${(steps.filter(s => s.isCompleted).length / steps.length) * 100}%`
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZambianBusinessWorkflow;

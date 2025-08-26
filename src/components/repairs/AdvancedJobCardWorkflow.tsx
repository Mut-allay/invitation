import React, { useState, useEffect } from 'react';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  PlayIcon,
  StopIcon
} from '@heroicons/react/24/outline';
import { Button } from '../ui/button';
import type { 
  RepairStatus, 
  CompletionData, 
  WorkflowStep, 
  QualityCheckpoint,
  Mechanic,
  Bay 
} from '../../types/repair';

interface JobCardWorkflowProps {
  repairId: string;
  onStatusChange: (status: RepairStatus) => void;
  onComplete: (data: CompletionData) => void;
}

interface WorkflowState {
  currentStep: number;
  steps: WorkflowStep[];
  qualityCheckpoints: QualityCheckpoint[];
  currentStatus: RepairStatus['status'];
  assignedMechanic?: Mechanic;
  assignedBay?: Bay;
  startTime?: Date;
  estimatedCompletion?: Date;
}

export const AdvancedJobCardWorkflow: React.FC<JobCardWorkflowProps> = ({
  repairId,
  onStatusChange,
  onComplete
}) => {
  const [workflowState, setWorkflowState] = useState<WorkflowState>({
    currentStep: 0,
    steps: [],
    qualityCheckpoints: [],
    currentStatus: 'pending'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data - in real implementation, this would come from API
  // const mockMechanics: Mechanic[] = [...];
  // const mockBays: Bay[] = [...];

  // Initialize workflow steps
  useEffect(() => {
    const defaultSteps: WorkflowStep[] = [
      {
        id: '1',
        repairId,
        stepNumber: 1,
        stepName: 'Initial Inspection',
        description: 'Conduct initial vehicle inspection and diagnosis',
        status: 'pending',
        estimatedDuration: 30,
        dependencies: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        repairId,
        stepNumber: 2,
        stepName: 'Parts Procurement',
        description: 'Order and receive required parts',
        status: 'pending',
        estimatedDuration: 60,
        dependencies: ['1'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        repairId,
        stepNumber: 3,
        stepName: 'Repair Execution',
        description: 'Perform the actual repair work',
        status: 'pending',
        estimatedDuration: 120,
        dependencies: ['2'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '4',
        repairId,
        stepNumber: 4,
        stepName: 'Quality Check',
        description: 'Verify repair quality and safety',
        status: 'pending',
        estimatedDuration: 45,
        dependencies: ['3'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '5',
        repairId,
        stepNumber: 5,
        stepName: 'Final Testing',
        description: 'Test vehicle functionality and performance',
        status: 'pending',
        estimatedDuration: 30,
        dependencies: ['4'],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const defaultQualityCheckpoints: QualityCheckpoint[] = [
      {
        id: '1',
        repairId,
        checkpointType: 'safety',
        status: 'pending',
        inspectorId: '',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        repairId,
        checkpointType: 'performance',
        status: 'pending',
        inspectorId: '',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        repairId,
        checkpointType: 'final',
        status: 'pending',
        inspectorId: '',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    setWorkflowState(prev => ({
      ...prev,
      steps: defaultSteps,
      qualityCheckpoints: defaultQualityCheckpoints
    }));
  }, [repairId]);

  const handleStartWorkflow = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const newStatus: RepairStatus = {
        id: Date.now().toString(),
        repairId,
        status: 'in_progress',
        timestamp: new Date(),
        updatedBy: 'current-user'
      };

      setWorkflowState(prev => ({
        ...prev,
        currentStatus: 'in_progress',
        startTime: new Date(),
        estimatedCompletion: new Date(Date.now() + 4 * 60 * 60 * 1000) // 4 hours from now
      }));

      onStatusChange(newStatus);
    } catch {
      setError('Failed to start workflow');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStepAction = async (stepId: string, action: 'start' | 'complete' | 'skip') => {
    setIsLoading(true);
    setError(null);

    try {
      setWorkflowState(prev => {
        const updatedSteps = prev.steps.map(step => {
          if (step.id === stepId) {
            const updatedStep = { ...step };
            
            switch (action) {
              case 'start':
                updatedStep.status = 'in_progress';
                updatedStep.assignedTo = 'current-user';
                break;
              case 'complete':
                updatedStep.status = 'completed';
                updatedStep.completedAt = new Date();
                updatedStep.actualDuration = 30; // Mock duration
                break;
              case 'skip':
                updatedStep.status = 'skipped';
                break;
            }
            
            return updatedStep;
          }
          return step;
        });

        // Update current step
        const currentStepIndex = updatedSteps.findIndex(step => step.id === stepId);
        const nextStepIndex = currentStepIndex + 1;
        
        return {
          ...prev,
          steps: updatedSteps,
          currentStep: nextStepIndex < updatedSteps.length ? nextStepIndex : prev.currentStep
        };
      });
    } catch {
      setError('Failed to update step');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQualityCheck = async (checkpointId: string, status: QualityCheckpoint['status']) => {
    setIsLoading(true);
    setError(null);

    try {
      setWorkflowState(prev => ({
        ...prev,
        qualityCheckpoints: prev.qualityCheckpoints.map(checkpoint => 
          checkpoint.id === checkpointId 
            ? { ...checkpoint, status, completedAt: new Date(), inspectorId: 'current-user' }
            : checkpoint
        )
      }));
    } catch {
      setError('Failed to update quality check');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteWorkflow = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const completionData: CompletionData = {
        repairId,
        actualCompletion: new Date(),
        finalCost: 500, // Mock cost
        qualityCheckPassed: workflowState.qualityCheckpoints.every(cp => cp.status === 'passed'),
        customerSatisfaction: 5,
        notes: 'Repair completed successfully'
      };

      const newStatus: RepairStatus = {
        id: Date.now().toString(),
        repairId,
        status: 'completed',
        timestamp: new Date(),
        updatedBy: 'current-user'
      };

      onStatusChange(newStatus);
      onComplete(completionData);
    } catch {
      setError('Failed to complete workflow');
    } finally {
      setIsLoading(false);
    }
  };

  const getStepIcon = (step: WorkflowStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <PlayIcon className="h-5 w-5 text-blue-500" />;
      case 'skipped':
        return <StopIcon className="h-5 w-5 text-gray-400" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStepButton = (step: WorkflowStep) => {
    const canStart = step.status === 'pending' && 
      step.dependencies.every(depId => 
        workflowState.steps.find(s => s.id === depId)?.status === 'completed'
      );

    switch (step.status) {
      case 'pending':
        return (
          <Button
            size="sm"
            disabled={!canStart || isLoading}
            onClick={() => handleStepAction(step.id, 'start')}
          >
            Start
          </Button>
        );
      case 'in_progress':
        return (
          <Button
            size="sm"
            variant="outline"
            disabled={isLoading}
            onClick={() => handleStepAction(step.id, 'complete')}
          >
            Complete
          </Button>
        );
      default:
        return null;
    }
  };

  const canCompleteWorkflow = workflowState.steps.every(step => 
    step.status === 'completed' || step.status === 'skipped'
  ) && workflowState.qualityCheckpoints.every(cp => cp.status === 'passed');

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Advanced Job Card Workflow</h3>
          <p className="text-sm text-gray-600">Repair #{repairId.slice(-6)}</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${
            workflowState.currentStatus === 'completed' ? 'bg-green-100 text-green-800' :
            workflowState.currentStatus === 'in_progress' ? 'bg-blue-100 text-blue-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {workflowState.currentStatus.replace('_', ' ').toUpperCase()}
          </span>
          {workflowState.currentStatus === 'pending' && (
            <Button
              onClick={handleStartWorkflow}
              disabled={isLoading}
            >
              Start Workflow
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Workflow Steps */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Workflow Steps</h4>
        <div className="space-y-3">
          {workflowState.steps.map((step) => (
            <div
              key={step.id}
              className={`p-4 border rounded-lg ${
                step.status === 'completed' ? 'border-green-200 bg-green-50' :
                step.status === 'in_progress' ? 'border-blue-200 bg-blue-50' :
                'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStepIcon(step)}
                  <div>
                    <h5 className="font-medium text-gray-900">
                      Step {step.stepNumber}: {step.stepName}
                    </h5>
                    <p className="text-sm text-gray-600">{step.description}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-xs text-gray-500">
                        Est: {step.estimatedDuration}min
                      </span>
                      {step.actualDuration && (
                        <span className="text-xs text-gray-500">
                          Actual: {step.actualDuration}min
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStepButton(step)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quality Checkpoints */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
          <ShieldCheckIcon className="h-5 w-5 mr-2" />
          Quality Checkpoints
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {workflowState.qualityCheckpoints.map(checkpoint => (
            <div
              key={checkpoint.id}
              className={`p-3 border rounded-lg ${
                checkpoint.status === 'passed' ? 'border-green-200 bg-green-50' :
                checkpoint.status === 'failed' ? 'border-red-200 bg-red-50' :
                'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  {checkpoint.checkpointType.replace('_', ' ').toUpperCase()}
                </span>
                {checkpoint.status === 'passed' && (
                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                )}
              </div>
              {checkpoint.status === 'pending' && (
                <div className="space-y-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleQualityCheck(checkpoint.id, 'passed')}
                    disabled={isLoading}
                  >
                    Pass
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleQualityCheck(checkpoint.id, 'failed')}
                    disabled={isLoading}
                  >
                    Fail
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Completion */}
      {canCompleteWorkflow && (
        <div className="border-t pt-4">
          <Button
            onClick={handleCompleteWorkflow}
            disabled={isLoading}
            className="w-full"
          >
            Complete Repair Workflow
          </Button>
        </div>
      )}
    </div>
  );
}; 
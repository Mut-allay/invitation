import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  CogIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  UserIcon,
  ArrowPathIcon,
  PlayIcon,
  PauseIcon,
  StopIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '../../contexts/toast-hooks';
import { getErrorMessage } from '@/lib/utils';
import type { Repair, WorkflowStep, Mechanic, Bay } from '../../types/repair';

interface WorkflowRule {
  id: string;
  name: string;
  condition: {
    field: keyof Repair;
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
    value: string | number | boolean;
  };
  actions: WorkflowAction[];
  priority: number;
  isActive: boolean;
}

interface WorkflowAction {
  type: 'assign_mechanic' | 'change_status' | 'send_notification' | 'escalate' | 'schedule_bay';
  params: Record<string, string | number | boolean | undefined>;
}

interface WorkflowState {
  repairId: string;
  currentStep: number;
  steps: WorkflowStep[];
  assignedMechanic?: string;
  assignedBay?: string;
  status: 'running' | 'paused' | 'completed' | 'error' | 'stopped';
  lastUpdated: Date;
  escalations: Escalation[];
}

interface Escalation {
  id: string;
  type: 'overdue' | 'quality_issue' | 'parts_delay' | 'customer_complaint';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  createdAt: Date;
  resolvedAt?: Date;
  assignedTo?: string;
}

interface SmartWorkflowEngineProps {
  repair: Repair;
  mechanics: Mechanic[];
  bays: Bay[];
  onWorkflowUpdate: (workflowState: WorkflowState) => void;
}

// Mock data for when API returns empty
const mockMechanics: Mechanic[] = [
  {
    id: 'tech1',
    tenantId: 'tenant1',
    name: 'John Smith',
    specialization: ['Engine Repair', 'Diagnostics'],
    hourlyRate: 45,
    availability: 'available',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'tech2',
    tenantId: 'tenant1',
    name: 'Mike Johnson',
    specialization: ['Electrical Systems', 'AC Repair'],
    hourlyRate: 42,
    availability: 'available',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'tech3',
    tenantId: 'tenant1',
    name: 'Sarah Wilson',
    specialization: ['Brake Systems', 'Suspension'],
    hourlyRate: 48,
    availability: 'busy',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const mockBays: Bay[] = [
  {
    id: 'bay1',
    tenantId: 'tenant1',
    name: 'Bay A - Engine',
    type: 'standard',
    status: 'available',
    capacity: 1,
    equipment: ['Lift', 'Diagnostic Tool', 'Air Compressor'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'bay2',
    tenantId: 'tenant1',
    name: 'Bay B - Electrical',
    type: 'diagnostic',
    status: 'occupied',
    capacity: 1,
    equipment: ['Electrical Tester', 'Oscilloscope', 'Battery Charger'],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Default workflow rules
const defaultWorkflowRules: WorkflowRule[] = [
  {
    id: 'rule1',
    name: 'Auto-assign Engine Repairs',
    condition: {
      field: 'reportedIssues',
      operator: 'contains',
      value: 'engine'
    },
    actions: [
      {
        type: 'assign_mechanic',
        params: { specialization: 'Engine Repair' }
      }
    ],
    priority: 1,
    isActive: true
  },
  {
    id: 'rule2',
    name: 'Escalate Overdue Repairs',
    condition: {
      field: 'estimatedCompletion',
      operator: 'less_than',
      value: new Date().toISOString()
    },
    actions: [
      {
        type: 'escalate',
        params: { type: 'overdue', severity: 'high' }
      }
    ],
    priority: 2,
    isActive: true
  },
  {
    id: 'rule3',
    name: 'Assign Available Bay',
    condition: {
      field: 'status',
      operator: 'equals',
      value: 'pending'
    },
    actions: [
      {
        type: 'schedule_bay',
        params: { type: 'standard' }
      }
    ],
    priority: 3,
    isActive: true
  }
];

export const SmartWorkflowEngine: React.FC<SmartWorkflowEngineProps> = ({
  repair,
  mechanics = mockMechanics,
  bays = mockBays,
  onWorkflowUpdate
}) => {
  const { success: showSuccess, error: showError } = useToast();
  const [workflowState, setWorkflowState] = useState<WorkflowState>(() => ({
    repairId: repair.id,
    currentStep: 0,
    steps: generateDefaultWorkflowSteps(repair),
    status: 'running',
    lastUpdated: new Date(),
    escalations: []
  }));
  
  const rules = defaultWorkflowRules;
  const [isProcessing, setIsProcessing] = useState(false);

  // Memoized workflow steps
  const workflowSteps = useMemo(() => {
    return generateDefaultWorkflowSteps(repair);
  }, [repair]);

  // Auto-assign mechanic based on rules
  const autoAssignMechanic = useCallback((repair: Repair): string | undefined => {
    const applicableRules = rules.filter(rule => 
      rule.isActive && evaluateCondition(repair, rule.condition)
    );

    for (const rule of applicableRules.sort((a, b) => a.priority - b.priority)) {
      for (const action of rule.actions) {
        if (action.type === 'assign_mechanic') {
          const availableMechanics = mechanics.filter(m => 
            m.availability === 'available' && 
            m.specialization.some(spec => 
              action.params.specialization && typeof action.params.specialization === 'string' ? 
                spec.toLowerCase().includes(action.params.specialization.toLowerCase()) : 
                true
            )
          );

          if (availableMechanics.length > 0) {
            // Assign to mechanic with highest rating or lowest hourly rate
            const selectedMechanic = availableMechanics.sort((a, b) => 
              (b.hourlyRate || 0) - (a.hourlyRate || 0)
            )[0];
            return selectedMechanic.id;
          }
        }
      }
    }
    return undefined;
  }, [rules, mechanics]);

  // Auto-assign bay based on rules
  const autoAssignBay = useCallback((repair: Repair): string | undefined => {
    const applicableRules = rules.filter(rule => 
      rule.isActive && evaluateCondition(repair, rule.condition)
    );

    for (const rule of applicableRules.sort((a, b) => a.priority - b.priority)) {
      for (const action of rule.actions) {
        if (action.type === 'schedule_bay') {
          const availableBays = bays.filter(bay => 
            bay.status === 'available' && 
            (action.params.type ? bay.type === action.params.type : true)
          );

          if (availableBays.length > 0) {
            return availableBays[0].id;
          }
        }
      }
    }
    return undefined;
  }, [rules, bays]);

  // Check for escalations
  const checkEscalations = useCallback((repair: Repair): Escalation[] => {
    const newEscalations: Escalation[] = [];

    // Check for overdue repairs
    if (repair.estimatedCompletion && repair.estimatedCompletion < new Date()) {
      newEscalations.push({
        id: `esc_${Date.now()}`,
        type: 'overdue',
        severity: 'high',
        message: `Repair ${repair.id} is overdue by ${Math.ceil((new Date().getTime() - repair.estimatedCompletion.getTime()) / (1000 * 60 * 60 * 24))} days`,
        createdAt: new Date()
      });
    }

    // Check for long-running repairs
    const daysSinceCreation = Math.ceil((new Date().getTime() - repair.createdAt.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceCreation > 7 && repair.status === 'in_progress') {
      newEscalations.push({
        id: `esc_${Date.now()}_1`,
        type: 'parts_delay',
        severity: 'medium',
        message: `Repair ${repair.id} has been in progress for ${daysSinceCreation} days`,
        createdAt: new Date()
      });
    }

    return newEscalations;
  }, []);

  // Process workflow rules
  const processWorkflowRules = useCallback(async () => {
    setIsProcessing(true);
    try {
      const assignedMechanic = autoAssignMechanic(repair);
      const assignedBay = autoAssignBay(repair);
      const escalations = checkEscalations(repair);

      const updatedState: WorkflowState = {
        ...workflowState,
        assignedMechanic,
        assignedBay,
        escalations: [...workflowState.escalations, ...escalations],
        lastUpdated: new Date()
      };

      setWorkflowState(updatedState);
      onWorkflowUpdate(updatedState);

      if (assignedMechanic) {
        showSuccess(`Automatically assigned mechanic to repair ${repair.id}`);
      }

      if (escalations.length > 0) {
        showError(`${escalations.length} new escalation(s) created`);
      }
    } catch (error) {
      showError(getErrorMessage(error));
    } finally {
      setIsProcessing(false);
    }
  }, [repair, workflowState, autoAssignMechanic, autoAssignBay, checkEscalations, onWorkflowUpdate, showSuccess, showError]);

  // Control workflow execution
  const controlWorkflow = useCallback((action: 'start' | 'pause' | 'stop') => {
    setWorkflowState(prev => ({
      ...prev,
      status: action === 'start' ? 'running' : action === 'pause' ? 'paused' : 'stopped'
    }));
  }, []);

  // Auto-process rules when repair status changes
  useEffect(() => {
    if (workflowState.status === 'running') {
      processWorkflowRules();
    }
  }, [repair.status, workflowState.status]);

  // Auto-process every 5 minutes when running
  useEffect(() => {
    if (workflowState.status === 'running') {
      const interval = setInterval(() => {
        processWorkflowRules();
      }, 5 * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [workflowState.status]);

  return (
    <div className="space-y-4">
      <Card className="card-glass">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <CogIcon className="w-6 h-6 text-primary" />
            <h3 className="text-responsive-lg font-semibold">Smart Workflow Engine</h3>
          </div>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => controlWorkflow('start')}
              disabled={workflowState.status === 'running'}
              className="btn-ghost"
            >
              <PlayIcon className="w-4 h-4 mr-1" />
              Start
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => controlWorkflow('pause')}
              disabled={workflowState.status !== 'running'}
              className="btn-ghost"
            >
              <PauseIcon className="w-4 h-4 mr-1" />
              Pause
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => controlWorkflow('stop')}
              className="btn-ghost"
            >
              <StopIcon className="w-4 h-4 mr-1" />
              Stop
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <UserIcon className="w-4 h-4 text-muted-foreground" />
              <span className="text-responsive-sm">Assigned Mechanic:</span>
            </div>
            <div className="font-medium">
              {workflowState.assignedMechanic ? 
                mechanics.find(m => m.id === workflowState.assignedMechanic)?.name || 'Unknown' :
                'Not assigned'
              }
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <ClockIcon className="w-4 h-4 text-muted-foreground" />
              <span className="text-responsive-sm">Status:</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                workflowState.status === 'running' ? 'bg-green-500' :
                workflowState.status === 'paused' ? 'bg-yellow-500' :
                'bg-red-500'
              }`} />
              <span className="font-medium capitalize">{workflowState.status}</span>
            </div>
          </div>
        </div>

        <Button
          onClick={processWorkflowRules}
          disabled={isProcessing}
          className="btn-primary w-full"
        >
          {isProcessing ? (
            <>
              <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CogIcon className="w-4 h-4 mr-2" />
              Process Rules
            </>
          )}
        </Button>
      </Card>

      {/* Workflow Steps */}
      <Card className="card-glass">
        <h4 className="text-responsive-base font-semibold mb-3">Workflow Steps</h4>
        <div className="space-y-2">
          {workflowSteps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                index === workflowState.currentStep ? 'border-primary bg-primary/5' :
                step.status === 'completed' ? 'border-green-200 bg-green-50' :
                'border-slate-200 bg-slate-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  step.status === 'completed' ? 'bg-green-500 text-white' :
                  index === workflowState.currentStep ? 'bg-primary text-white' :
                  'bg-slate-300 text-slate-600'
                }`}>
                  {step.status === 'completed' ? '✓' : index + 1}
                </div>
                <div>
                  <div className="font-medium text-responsive-sm">{step.stepName}</div>
                  <div className="text-responsive-xs text-muted-foreground">{step.description}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-responsive-xs text-muted-foreground">
                  {step.estimatedDuration} min
                </div>
                <div className="text-responsive-xs font-medium capitalize">{step.status}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Escalations */}
      {workflowState.escalations.length > 0 && (
        <Card className="card-glass">
          <h4 className="text-responsive-base font-semibold mb-3 flex items-center space-x-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
            <span>Escalations ({workflowState.escalations.length})</span>
          </h4>
          <div className="space-y-2">
            {workflowState.escalations.map(escalation => (
              <div
                key={escalation.id}
                className={`p-3 rounded-lg border-l-4 ${
                  escalation.severity === 'critical' ? 'border-red-500 bg-red-50' :
                  escalation.severity === 'high' ? 'border-orange-500 bg-orange-50' :
                  escalation.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                  'border-blue-500 bg-blue-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-responsive-sm">{escalation.type.replace('_', ' ')}</div>
                    <div className="text-responsive-xs text-muted-foreground">{escalation.message}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-responsive-xs px-2 py-1 rounded-full ${
                      escalation.severity === 'critical' ? 'bg-red-100 text-red-800' :
                      escalation.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                      escalation.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {escalation.severity}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

// Helper functions
function generateDefaultWorkflowSteps(repair: Repair): WorkflowStep[] {
  return [
    {
      id: 'step1',
      repairId: repair.id,
      stepNumber: 1,
      stepName: 'Initial Assessment',
      description: 'Review reported issues and create diagnostic plan',
      status: 'completed',
      estimatedDuration: 30,
      dependencies: [],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'step2',
      repairId: repair.id,
      stepNumber: 2,
      stepName: 'Diagnostics',
      description: 'Run diagnostic tests and identify root cause',
      status: repair.status === 'pending' ? 'pending' : 'in_progress',
      estimatedDuration: 60,
      dependencies: ['step1'],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'step3',
      repairId: repair.id,
      stepNumber: 3,
      stepName: 'Parts Ordering',
      description: 'Order required parts and materials',
      status: 'pending',
      estimatedDuration: 45,
      dependencies: ['step2'],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'step4',
      repairId: repair.id,
      stepNumber: 4,
      stepName: 'Repair Execution',
      description: 'Perform the actual repair work',
      status: 'pending',
      estimatedDuration: 120,
      dependencies: ['step3'],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'step5',
      repairId: repair.id,
      stepNumber: 5,
      stepName: 'Quality Check',
      description: 'Test and verify repair quality',
      status: 'pending',
      estimatedDuration: 30,
      dependencies: ['step4'],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'step6',
      repairId: repair.id,
      stepNumber: 6,
      stepName: 'Final Inspection',
      description: 'Complete final inspection and documentation',
      status: 'pending',
      estimatedDuration: 15,
      dependencies: ['step5'],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
}

function evaluateCondition(repair: Repair, condition: WorkflowRule['condition']): boolean {
  const value = repair[condition.field];
  
  switch (condition.operator) {
    case 'equals':
      return value === condition.value;
    case 'not_equals':
      return value !== condition.value;
    case 'contains':
      return typeof value === 'string' && typeof condition.value === 'string' && 
             value.toLowerCase().includes(condition.value.toLowerCase());
    case 'greater_than':
      return typeof value === 'number' && typeof condition.value === 'number' && value > condition.value;
    case 'less_than':
      return typeof value === 'number' && typeof condition.value === 'number' && value < condition.value;
    default:
      return false;
  }
}

export default SmartWorkflowEngine;

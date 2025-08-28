import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { 
  CogIcon, 
  ArrowPathIcon,
  PlayIcon,
  PauseIcon,
  BoltIcon,
  ChartBarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

import type { Repair, Mechanic, Bay } from '../../types/index';

interface WorkflowRule {
  id: string;
  name: string;
  condition: string;
  action: string;
  priority: number;
  isActive: boolean;
  createdAt: Date;
}

interface WorkflowState {
  repairId: string;
  currentState: string;
  assignedMechanic?: string;
  assignedBay?: string;
  startTime?: Date;
  estimatedDuration?: number;
  escalationLevel: number;
  lastUpdated: Date;
}

interface SmartWorkflowEngineProps {
  repair: Repair;
  mechanics: Mechanic[];
  bays: Bay[];
  onWorkflowUpdate: (repairId: string, updates: Partial<Repair>) => void;
  onClose: () => void;
}

const SmartWorkflowEngine: React.FC<SmartWorkflowEngineProps> = ({
  repair,
  mechanics,
  bays,
  onWorkflowUpdate,
  onClose
}) => {
  const [workflowState, setWorkflowState] = useState<WorkflowState>({
    repairId: repair.id,
    currentState: repair.status,
    escalationLevel: 0,
    lastUpdated: new Date()
  });
  
  const [rules] = useState<WorkflowRule[]>([
    {
      id: 'rule1',
      name: 'Auto-assign Pending Repairs',
      condition: 'status === "pending" && !assignedMechanic',
      action: 'assignMechanic',
      priority: 1,
      isActive: true,
      createdAt: new Date()
    },
    {
      id: 'rule2',
      name: 'Escalate Overdue Repairs',
      condition: 'estimatedCompletion < now && status === "in_progress"',
      action: 'escalate',
      priority: 2,
      isActive: true,
      createdAt: new Date()
    },
    {
      id: 'rule3',
      name: 'Auto-complete Quality Check',
      condition: 'status === "quality_check" && qualityScore >= 8',
      action: 'complete',
      priority: 3,
      isActive: true,
      createdAt: new Date()
    }
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [executionLog, setExecutionLog] = useState<string[]>([]);
  const [performanceMode, setPerformanceMode] = useState<'balanced' | 'speed' | 'quality'>('balanced');
  const [automationStats, setAutomationStats] = useState({
    totalExecutions: 0,
    successfulExecutions: 0,
    failedExecutions: 0,
    averageExecutionTime: 0
  });
  const performanceMonitorRef = useRef<NodeJS.Timeout | null>(null);

  // Memoized available mechanics with performance ranking
  const availableMechanics = useMemo(() => {
    const available = mechanics.filter((m: Mechanic) => m.availability === 'available');
    
    // Rank mechanics by performance (simulated)
    return available.map(mechanic => ({
      ...mechanic,
      performanceScore: Math.random() * 100 + 50, // Simulated performance score
      specializationMatch: repair.reportedIssues.toLowerCase().includes(mechanic.specialization[0]?.toLowerCase() || '') ? 1 : 0
    })).sort((a, b) => (b.performanceScore + b.specializationMatch * 20) - (a.performanceScore + a.specializationMatch * 20));
  }, [mechanics, repair.reportedIssues]);

  // Enhanced auto-assign mechanic with performance optimization
  const autoAssignMechanic = useCallback((repair: Repair) => {
    if (availableMechanics.length === 0) return null;

    // Advanced assignment logic based on performance mode
    let selectedMechanic = availableMechanics[0];

    if (performanceMode === 'quality') {
      // Prioritize quality - select mechanic with highest performance score
      selectedMechanic = availableMechanics.reduce((best, current) => 
        (current.hourlyRate > best.hourlyRate) ? current : best
      );
    } else if (performanceMode === 'speed') {
      // Prioritize speed - select first available with specialization match
      selectedMechanic = availableMechanics.find(m => 
        m.specialization.some(s => 
          repair.reportedIssues.toLowerCase().includes(s.toLowerCase())
        )
      ) || availableMechanics[0];
    } else {
      // Balanced approach - consider both performance and specialization
      selectedMechanic = availableMechanics[0];
    }

    return selectedMechanic;
  }, [availableMechanics, performanceMode]);

  // Memoized available bays
  const availableBays = useMemo(() => 
    bays.filter((b: Bay) => b.status === 'available'), 
    [bays]
  );



  // Auto-assign bay based on repair type
  const autoAssignBay = useCallback((repair: Repair) => {
    if (availableBays.length === 0) return null;

    // Simple logic: assign diagnostic bay for electrical issues, standard for others
    const isElectrical = repair.reportedIssues.toLowerCase().includes('electrical') || 
                        repair.reportedIssues.toLowerCase().includes('ac');
    
    const preferredBay = availableBays.find((b: Bay) => 
      isElectrical ? b.type === 'diagnostic' : b.type === 'standard'
    );

    return preferredBay || availableBays[0];
  }, [availableBays]);

  // Execute workflow rules
  const executeWorkflowRules = useCallback(async () => {
    if (!isRunning) return;

    try {
      const log: string[] = [];
      let hasUpdates = false;

      // Rule 1: Auto-assign pending repairs
      if (workflowState.currentState === 'pending' && !workflowState.assignedMechanic) {
        const mechanic = autoAssignMechanic(repair);
        const bay = autoAssignBay(repair);
        
        if (mechanic && bay) {
          setWorkflowState((prev: WorkflowState) => ({
            ...prev,
            assignedMechanic: mechanic.id,
            assignedBay: bay.id,
            currentState: 'in_progress',
            startTime: new Date()
          }));
          
          onWorkflowUpdate(repair.id, {
            status: 'in_progress'
          });
          
          log.push(`✅ Auto-assigned ${mechanic.name} to ${bay.name}`);
          hasUpdates = true;
        }
      }

      // Rule 2: Escalate overdue repairs
      if (repair.estimatedCompletion && 
          new Date() > repair.estimatedCompletion && 
          workflowState.currentState === 'in_progress') {
        
        setWorkflowState((prev: WorkflowState) => ({
          ...prev,
          escalationLevel: prev.escalationLevel + 1
        }));
        
        log.push(`⚠️ Escalated overdue repair (Level ${workflowState.escalationLevel + 1})`);
        hasUpdates = true;
      }

      // Rule 3: Auto-complete quality check (simplified)
      if (workflowState.currentState === 'quality_check') {
        // Simulate quality score
        const qualityScore = Math.random() * 10;
        if (qualityScore >= 8) {
          setWorkflowState((prev: WorkflowState) => ({
            ...prev,
            currentState: 'completed'
          }));
          
          onWorkflowUpdate(repair.id, {
            status: 'completed',
            actualCompletion: new Date()
          });
          
          log.push(`✅ Auto-completed quality check (Score: ${qualityScore.toFixed(1)})`);
          hasUpdates = true;
        }
      }

      if (hasUpdates) {
        setExecutionLog(prev => [...prev, ...log]);
        setAutomationStats(prev => ({
          ...prev,
          totalExecutions: prev.totalExecutions + 1,
          successfulExecutions: prev.successfulExecutions + 1
        }));
      } else {
        log.push('ℹ️ No workflow rules triggered');
        setAutomationStats(prev => ({
          ...prev,
          totalExecutions: prev.totalExecutions + 1
        }));
      }

      setExecutionLog(prev => [...prev, ...log]);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setExecutionLog(prev => [...prev, `❌ Error: ${errorMsg}`]);
    }
  }, [isRunning, workflowState, repair, autoAssignMechanic, autoAssignBay, onWorkflowUpdate]);

  // Start/stop workflow engine
  const toggleWorkflow = useCallback(() => {
    setIsRunning(!isRunning);
    if (!isRunning) {
      setExecutionLog((prev: string[]) => [...prev, '🚀 Workflow engine started']);
    } else {
      setExecutionLog((prev: string[]) => [...prev, '⏹️ Workflow engine stopped']);
    }
  }, [isRunning]);

  // Reset workflow state
  const resetWorkflow = useCallback(() => {
    setWorkflowState({
      repairId: repair.id,
      currentState: repair.status,
      escalationLevel: 0,
      lastUpdated: new Date()
    });
    setExecutionLog([]);
  }, [repair.id, repair.status]);

  // Execute rules periodically when running
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(executeWorkflowRules, 5000); // Every 5 seconds
    return () => clearInterval(interval);
  }, [isRunning, executeWorkflowRules]);

  // Performance monitoring
  useEffect(() => {
    if (isRunning) {
      performanceMonitorRef.current = setInterval(() => {
        setAutomationStats(prev => ({
          ...prev,
          averageExecutionTime: prev.averageExecutionTime + Math.random() * 10
        }));
      }, 10000); // Every 10 seconds
    } else {
      if (performanceMonitorRef.current) {
        clearInterval(performanceMonitorRef.current);
        performanceMonitorRef.current = null;
      }
    }

    return () => {
      if (performanceMonitorRef.current) {
        clearInterval(performanceMonitorRef.current);
      }
    };
  }, [isRunning]);

  // Get current mechanic name
  const currentMechanic = useMemo(() => 
    workflowState.assignedMechanic ? 
    mechanics.find(m => m.id === workflowState.assignedMechanic) : null,
    [workflowState.assignedMechanic, mechanics]
  );

  // Get current bay name
  const currentBay = useMemo(() => 
    workflowState.assignedBay ? 
    bays.find(b => b.id === workflowState.assignedBay) : null,
    [workflowState.assignedBay, bays]
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <CogIcon className="w-6 h-6 text-primary" />
            <h2 className="text-responsive-xl font-semibold text-slate-900 dark:text-slate-100">
              Smart Workflow Engine
            </h2>
            <div className="flex items-center space-x-2">
              <BoltIcon className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Performance Mode: {performanceMode}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            ✕
          </Button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Left Panel - Workflow State */}
          <div className="w-1/2 p-6 border-r border-slate-200 dark:border-slate-700 overflow-y-auto">
            <div className="space-y-6">
              {/* Current State */}
              <Card className="card-glass">
                <h3 className="text-responsive-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
                  Current Workflow State
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      workflowState.currentState === 'completed' ? 'bg-green-100 text-green-800' :
                      workflowState.currentState === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      workflowState.currentState === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {workflowState.currentState.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Escalation Level:</span>
                    <span className="text-responsive-base font-medium text-slate-900 dark:text-slate-100">
                      {workflowState.escalationLevel}
                    </span>
                  </div>

                  {currentMechanic && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Assigned Mechanic:</span>
                      <span className="text-responsive-base font-medium text-slate-900 dark:text-slate-100">
                        {currentMechanic.name}
                      </span>
                    </div>
                  )}

                  {currentBay && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Assigned Bay:</span>
                      <span className="text-responsive-base font-medium text-slate-900 dark:text-slate-100">
                        {currentBay.name}
                      </span>
                    </div>
                  )}

                  {workflowState.startTime && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Start Time:</span>
                      <span className="text-responsive-sm text-slate-900 dark:text-slate-100">
                        {workflowState.startTime.toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                </div>
              </Card>

              {/* Performance Mode Selection */}
              <Card className="card-glass">
                <h3 className="text-responsive-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
                  Performance Mode
                </h3>
                <div className="space-y-3">
                  {(['balanced', 'speed', 'quality'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setPerformanceMode(mode)}
                      className={`w-full p-3 rounded-lg border transition-all ${
                        performanceMode === mode 
                          ? 'border-primary bg-primary/10 text-primary' 
                          : 'border-slate-200 dark:border-slate-700 hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="capitalize font-medium">{mode}</span>
                        {mode === 'balanced' && <ChartBarIcon className="w-4 h-4" />}
                        {mode === 'speed' && <BoltIcon className="w-4 h-4" />}
                        {mode === 'quality' && <ExclamationTriangleIcon className="w-4 h-4" />}
                      </div>
                    </button>
                  ))}
                </div>
              </Card>

              {/* Automation Statistics */}
              <Card className="card-glass">
                <h3 className="text-responsive-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
                  Automation Statistics
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Total Executions:</span>
                    <span className="text-responsive-base font-medium text-slate-900 dark:text-slate-100">
                      {automationStats.totalExecutions}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Success Rate:</span>
                    <span className="text-responsive-base font-medium text-slate-900 dark:text-slate-100">
                      {automationStats.totalExecutions > 0 ? 
                        ((automationStats.successfulExecutions / automationStats.totalExecutions) * 100).toFixed(1) : 0}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Avg Execution Time:</span>
                    <span className="text-responsive-base font-medium text-slate-900 dark:text-slate-100">
                      {automationStats.averageExecutionTime.toFixed(0)}ms
                    </span>
                  </div>
                </div>
              </Card>

              {/* Workflow Rules */}
              <Card className="card-glass">
                <h3 className="text-responsive-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
                  Active Rules
                </h3>
                <div className="space-y-3">
                  {rules.filter(rule => rule.isActive).map(rule => (
                    <div key={rule.id} className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {rule.name}
                        </span>
                        <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                          P{rule.priority}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                        If: {rule.condition}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Then: {rule.action}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          {/* Right Panel - Controls & Logs */}
          <div className="w-1/2 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Controls */}
              <Card className="card-glass">
                <h3 className="text-responsive-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
                  Workflow Controls
                </h3>
                <div className="flex space-x-3 mb-4">
                  <Button
                    onClick={toggleWorkflow}
                    className={`flex-1 ${
                      isRunning ? 'btn-secondary' : 'btn-primary'
                    }`}
                  >
                    {isRunning ? (
                      <>
                        <PauseIcon className="w-4 h-4 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <PlayIcon className="w-4 h-4 mr-2" />
                        Start
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={resetWorkflow}
                    variant="ghost"
                    className="flex-1"
                  >
                    <ArrowPathIcon className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                </div>

                <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                  <div className={`w-3 h-3 rounded-full ${
                    isRunning ? 'bg-green-500 animate-pulse' : 'bg-slate-400'
                  }`} />
                  <span>{isRunning ? 'Running' : 'Stopped'}</span>
                </div>
              </Card>

              {/* Execution Log */}
              <Card className="card-glass">
                <h3 className="text-responsive-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
                  Execution Log
                </h3>
                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3 h-64 overflow-y-auto">
                  {executionLog.length === 0 ? (
                    <p className="text-slate-500 dark:text-slate-400 text-center py-8">
                      No execution logs yet. Start the workflow to see activity.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {executionLog.map((log, index) => (
                        <div key={index} className="text-sm font-mono text-slate-700 dark:text-slate-300">
                          <span className="text-slate-500 dark:text-slate-400">
                            {new Date().toLocaleTimeString()}
                          </span>
                          {' '}{log}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartWorkflowEngine;

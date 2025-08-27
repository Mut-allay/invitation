import React, { useState, useCallback, useMemo } from 'react';
import { 
  CheckCircleIcon,
  CameraIcon,
  DocumentCheckIcon,
  StarIcon,
  EyeIcon,
  ArrowRightIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

import type { Repair } from '../../types/index';

interface QualityCheckpoint {
  id: string;
  name: string;
  description: string;
  isRequired: boolean;
  isCompleted: boolean;
  completedBy?: string;
  completedAt?: Date;
  notes?: string;
  photos: string[];
}

interface QualityChecklist {
  id: string;
  name: string;
  items: QualityCheckpoint[];
  totalItems: number;
  completedItems: number;
  isApproved: boolean;
  approvedBy?: string;
  approvedAt?: Date;
}

interface QualityControlSystemProps {
  repair: Repair;
  onQualityUpdate: (repairId: string, qualityData: unknown) => void;
  onClose: () => void;
}

const QualityControlSystem: React.FC<QualityControlSystemProps> = ({
  repair,
  onQualityUpdate,
  onClose
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [checklists, setChecklists] = useState<QualityChecklist[]>([
    {
      id: 'pre-repair',
      name: 'Pre-Repair Inspection',
      items: [
        {
          id: 'safety-check',
          name: 'Safety Equipment Check',
          description: 'Verify all safety equipment is in place and functional',
          isRequired: true,
          isCompleted: false,
          photos: []
        },
        {
          id: 'vehicle-inspection',
          name: 'Vehicle Condition Assessment',
          description: 'Document vehicle condition before repair begins',
          isRequired: true,
          isCompleted: false,
          photos: []
        },
        {
          id: 'tools-verification',
          name: 'Tools and Equipment Verification',
          description: 'Ensure all required tools and equipment are available',
          isRequired: true,
          isCompleted: false,
          photos: []
        }
      ],
      totalItems: 3,
      completedItems: 0,
      isApproved: false
    },
    {
      id: 'during-repair',
      name: 'During Repair Quality Checks',
      items: [
        {
          id: 'work-progress',
          name: 'Work Progress Documentation',
          description: 'Document key repair steps and progress',
          isRequired: true,
          isCompleted: false,
          photos: []
        },
        {
          id: 'parts-verification',
          name: 'Parts Quality Verification',
          description: 'Verify all parts meet quality standards',
          isRequired: true,
          isCompleted: false,
          photos: []
        },
        {
          id: 'safety-compliance',
          name: 'Safety Compliance Check',
          description: 'Ensure safety protocols are followed throughout repair',
          isRequired: true,
          isCompleted: false,
          photos: []
        }
      ],
      totalItems: 3,
      completedItems: 0,
      isApproved: false
    },
    {
      id: 'post-repair',
      name: 'Post-Repair Quality Assurance',
      items: [
        {
          id: 'final-inspection',
          name: 'Final Vehicle Inspection',
          description: 'Comprehensive inspection of completed repair work',
          isRequired: true,
          isCompleted: false,
          photos: []
        },
        {
          id: 'test-drive',
          name: 'Test Drive Verification',
          description: 'Verify vehicle performance and functionality',
          isRequired: true,
          isCompleted: false,
          photos: []
        },
        {
          id: 'documentation-review',
          name: 'Documentation Review',
          description: 'Review and complete all required documentation',
          isRequired: true,
          isCompleted: false,
          photos: []
        }
      ],
      totalItems: 3,
      completedItems: 0,
      isApproved: false
    }
  ]);

  const [qualityScore, setQualityScore] = useState(0);

  // Calculate overall quality metrics
  const qualityMetrics = useMemo(() => {
    const totalCheckpoints = checklists.reduce((sum, list) => sum + list.totalItems, 0);
    const completedCheckpoints = checklists.reduce((sum, list) => sum + list.completedItems, 0);
    const completionRate = totalCheckpoints > 0 ? (completedCheckpoints / totalCheckpoints) * 100 : 0;
    
    // Calculate quality score based on completion and approval status
    let score = completionRate;
    const approvedLists = checklists.filter(list => list.isApproved).length;
    score += (approvedLists / checklists.length) * 20; // Bonus for approvals
    
    return {
      totalCheckpoints,
      completedCheckpoints,
      completionRate,
      qualityScore: Math.min(100, Math.round(score)),
      approvedLists,
      totalLists: checklists.length
    };
  }, [checklists]);

  // Handle checkpoint completion
  const toggleCheckpoint = useCallback((checklistId: string, checkpointId: string) => {
    setChecklists(prev => prev.map(checklist => {
      if (checklist.id === checklistId) {
        const updatedItems = checklist.items.map(item => {
          if (item.id === checkpointId) {
            const isCompleted = !item.isCompleted;
            return {
              ...item,
              isCompleted,
              completedBy: isCompleted ? 'Current User' : undefined,
              completedAt: isCompleted ? new Date() : undefined
            };
          }
          return item;
        });
        
        const completedItems = updatedItems.filter(item => item.isCompleted).length;
        
        return {
          ...checklist,
          items: updatedItems,
          completedItems
        };
      }
      return checklist;
    }));
  }, []);

  // Handle photo upload (simulated)
  const handlePhotoUpload = useCallback((checkpointId: string) => {
    // Simulate photo upload
    const newPhoto = `photo_${Date.now()}.jpg`;
    
    // Update checkpoint with photo
    setChecklists(prev => prev.map(checklist => ({
      ...checklist,
      items: checklist.items.map(item => {
        if (item.id === checkpointId) {
          return {
            ...item,
            photos: [...item.photos, newPhoto]
          };
        }
        return item;
      })
    })));
  }, []);

  // Handle checklist approval
  const approveChecklist = useCallback((checklistId: string) => {
    setChecklists(prev => prev.map(checklist => {
      if (checklist.id === checklistId) {
        return {
          ...checklist,
          isApproved: true,
          approvedBy: 'Current User',
          approvedAt: new Date()
        };
      }
      return checklist;
    }));
  }, []);

  // Handle quality score update
  const updateQualityScore = useCallback((score: number) => {
    setQualityScore(score);
    onQualityUpdate(repair.id, { qualityScore: score });
  }, [repair.id, onQualityUpdate]);

  // Navigate between steps
  const nextStep = useCallback(() => {
    if (currentStep < checklists.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep, checklists.length]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const currentChecklist = checklists[currentStep];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <DocumentCheckIcon className="w-6 h-6 text-primary" />
            <h2 className="text-responsive-xl font-semibold text-slate-900 dark:text-slate-100">
              Quality Control System
            </h2>
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
          {/* Left Panel - Quality Metrics */}
          <div className="w-1/3 p-6 border-r border-slate-200 dark:border-slate-700 overflow-y-auto">
            <div className="space-y-6">
              {/* Quality Score */}
              <Card className="card-glass">
                <h3 className="text-responsive-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
                  Quality Score
                </h3>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {qualityMetrics.qualityScore}%
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-4">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${qualityMetrics.qualityScore}%` }}
                    />
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {qualityMetrics.completedCheckpoints} of {qualityMetrics.totalCheckpoints} checkpoints completed
                  </div>
                </div>
              </Card>

              {/* Progress Overview */}
              <Card className="card-glass">
                <h3 className="text-responsive-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
                  Progress Overview
                </h3>
                <div className="space-y-3">
                  {checklists.map((checklist, index) => (
                    <div key={checklist.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          index === currentStep ? 'bg-primary text-white' :
                          checklist.isApproved ? 'bg-green-100 text-green-800' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 dark:text-slate-100">
                            {checklist.name}
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">
                            {checklist.completedItems}/{checklist.totalItems} items
                          </div>
                        </div>
                      </div>
                      {checklist.isApproved && (
                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                  ))}
                </div>
              </Card>

              {/* Quality Score Input */}
              <Card className="card-glass">
                <h3 className="text-responsive-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
                  Manual Quality Score
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => updateQualityScore(star * 20)}
                        className={`text-2xl ${
                          qualityScore >= star * 20 ? 'text-yellow-400' : 'text-slate-300'
                        } hover:text-yellow-400 transition-colors`}
                      >
                        <StarIcon className="w-6 h-6" />
                      </button>
                    ))}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Current score: {qualityScore}/100
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Right Panel - Checklist Details */}
          <div className="w-2/3 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Step Navigation */}
              <div className="flex items-center justify-between">
                <Button
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  variant="ghost"
                  className="flex items-center space-x-2"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  Previous
                </Button>
                
                <div className="text-center">
                  <h3 className="text-responsive-lg font-semibold text-slate-900 dark:text-slate-100">
                    {currentChecklist.name}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Step {currentStep + 1} of {checklists.length}
                  </p>
                </div>
                
                <Button
                  onClick={nextStep}
                  disabled={currentStep === checklists.length - 1}
                  variant="ghost"
                  className="flex items-center space-x-2"
                >
                  Next
                  <ArrowRightIcon className="w-4 h-4" />
                </Button>
              </div>

              {/* Checklist Items */}
              <Card className="card-glass">
                <div className="space-y-4">
                  {currentChecklist.items.map((item) => (
                    <div key={item.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <button
                              onClick={() => toggleCheckpoint(currentChecklist.id, item.id)}
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                item.isCompleted 
                                  ? 'bg-green-500 border-green-500 text-white' 
                                  : 'border-slate-300 hover:border-green-500'
                              }`}
                            >
                              {item.isCompleted && <CheckCircleIcon className="w-4 h-4" />}
                            </button>
                            <div>
                              <h4 className="font-medium text-slate-900 dark:text-slate-100">
                                {item.name}
                                {item.isRequired && (
                                  <span className="text-red-500 ml-1">*</span>
                                )}
                              </h4>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                {item.description}
                              </p>
                            </div>
                          </div>
                          
                          {item.isCompleted && (
                            <div className="ml-9 space-y-2">
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                Completed by {item.completedBy} on {item.completedAt?.toLocaleString()}
                              </div>
                              
                              {/* Photo Upload Section */}
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <CameraIcon className="w-4 h-4 text-slate-500" />
                                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Documentation Photos
                                  </span>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <Button
                                    onClick={() => handlePhotoUpload(item.id)}
                                    size="sm"
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    <CameraIcon className="w-4 h-4 mr-1" />
                                    Add Photo
                                  </Button>
                                  
                                  {item.photos.length > 0 && (
                                    <span className="text-xs text-slate-500">
                                      {item.photos.length} photo(s)
                                    </span>
                                  )}
                                </div>
                                
                                {/* Photo Preview */}
                                {item.photos.length > 0 && (
                                  <div className="flex space-x-2 overflow-x-auto">
                                    {item.photos.map((photo, index) => (
                                      <div key={index} className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                                        <EyeIcon className="w-4 h-4 text-slate-500" />
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                              
                              {item.notes && (
                                <div className="text-sm text-slate-600 dark:text-slate-400">
                                  <strong>Notes:</strong> {item.notes}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Approval Section */}
              <Card className="card-glass">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-slate-100">
                      Checklist Approval
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {currentChecklist.completedItems}/{currentChecklist.totalItems} items completed
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {currentChecklist.isApproved ? (
                      <div className="flex items-center space-x-2 text-green-600">
                        <CheckCircleIcon className="w-5 h-5" />
                        <span className="text-sm font-medium">Approved</span>
                      </div>
                    ) : (
                      <Button
                        onClick={() => approveChecklist(currentChecklist.id)}
                        disabled={currentChecklist.completedItems < currentChecklist.totalItems}
                        className="btn-primary"
                      >
                        <CheckCircleIcon className="w-4 h-4 mr-2" />
                        Approve Checklist
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QualityControlSystem;

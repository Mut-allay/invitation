import React, { useState, useCallback, useMemo } from 'react';
import { 
  CameraIcon, 
  CheckCircleIcon,
  DocumentCheckIcon,
  ChartBarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '../../contexts/toast-hooks';
import { getErrorMessage } from '@/lib/utils';
import type { Repair } from '../../types/repair';

interface QualityChecklist {
  id: string;
  category: 'safety' | 'performance' | 'cosmetic' | 'documentation';
  items: ChecklistItem[];
  isCompleted: boolean;
  completedBy?: string;
  completedAt?: Date;
}

interface ChecklistItem {
  id: string;
  description: string;
  isChecked: boolean;
  notes?: string;
  photos?: string[];
  requiresPhoto: boolean;
}

interface PhotoDocument {
  id: string;
  url: string;
  description: string;
  category: 'before' | 'during' | 'after' | 'issue' | 'solution';
  uploadedBy: string;
  uploadedAt: Date;
  tags: string[];
}

interface QualityMetrics {
  overallScore: number;
  safetyScore: number;
  performanceScore: number;
  cosmeticScore: number;
  documentationScore: number;
  totalCheckpoints: number;
  completedCheckpoints: number;
  failedCheckpoints: number;
  averageCompletionTime: number;
}

interface QualityControlSystemProps {
  repair: Repair;
  onQualityUpdate: (metrics: QualityMetrics) => void;
}

// Mock data for when API returns empty
const mockInspectors = [
  { id: 'insp1', name: 'Quality Manager', role: 'Senior Inspector' },
  { id: 'insp2', name: 'Team Lead', role: 'Lead Inspector' },
  { id: 'insp3', name: 'Technician', role: 'Inspector' }
];

// Default quality checklists
const defaultChecklists: QualityChecklist[] = [
  {
    id: 'safety',
    category: 'safety',
    isCompleted: false,
    items: [
      {
        id: 'safety1',
        description: 'All safety equipment properly installed',
        isChecked: false,
        requiresPhoto: true
      },
      {
        id: 'safety2',
        description: 'Brake system functionality verified',
        isChecked: false,
        requiresPhoto: false
      },
      {
        id: 'safety3',
        description: 'Steering system integrity confirmed',
        isChecked: false,
        requiresPhoto: false
      },
      {
        id: 'safety4',
        description: 'Tire condition and pressure checked',
        isChecked: false,
        requiresPhoto: true
      }
    ]
  },
  {
    id: 'performance',
    category: 'performance',
    isCompleted: false,
    items: [
      {
        id: 'perf1',
        description: 'Engine performance test completed',
        isChecked: false,
        requiresPhoto: true
      },
      {
        id: 'perf2',
        description: 'Transmission operation verified',
        isChecked: false,
        requiresPhoto: false
      },
      {
        id: 'perf3',
        description: 'Electrical systems tested',
        isChecked: false,
        requiresPhoto: false
      },
      {
        id: 'perf4',
        description: 'AC/Heating system operational',
        isChecked: false,
        requiresPhoto: false
      }
    ]
  },
  {
    id: 'cosmetic',
    category: 'cosmetic',
    isCompleted: false,
    items: [
      {
        id: 'cosm1',
        description: 'Exterior damage documented',
        isChecked: false,
        requiresPhoto: true
      },
      {
        id: 'cosm2',
        description: 'Interior cleanliness verified',
        isChecked: false,
        requiresPhoto: true
      },
      {
        id: 'cosm3',
        description: 'Paint and finish quality checked',
        isChecked: false,
        requiresPhoto: true
      }
    ]
  },
  {
    id: 'documentation',
    category: 'documentation',
    isCompleted: false,
    items: [
      {
        id: 'doc1',
        description: 'All work orders completed',
        isChecked: false,
        requiresPhoto: false
      },
      {
        id: 'doc2',
        description: 'Parts usage documented',
        isChecked: false,
        requiresPhoto: false
      },
      {
        id: 'doc3',
        description: 'Customer communication logged',
        isChecked: false,
        requiresPhoto: false
      }
    ]
  }
];

export const QualityControlSystem: React.FC<QualityControlSystemProps> = ({
  repair,
  onQualityUpdate
}) => {
  const { success: showSuccess, error: showError } = useToast();
  const [checklists, setChecklists] = useState<QualityChecklist[]>(defaultChecklists);
  const [photos, setPhotos] = useState<PhotoDocument[]>([]);
  const [currentInspector, setCurrentInspector] = useState<string>('insp1');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('safety');

  // Calculate score for a specific category
  const calculateCategoryScore = useCallback((category: string): number => {
    const checklist = checklists.find(list => list.category === category);
    if (!checklist) return 0;
    
    const totalItems = checklist.items.length;
    const completedItems = checklist.items.filter(item => item.isChecked).length;
    
    return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  }, [checklists]);

  // Calculate average completion time
  const calculateAverageCompletionTime = useCallback((): number => {
    const completedChecklists = checklists.filter(list => list.isCompleted);
    if (completedChecklists.length === 0) return 0;
    
    // Mock calculation - in real app, this would use actual timestamps
    return Math.round(completedChecklists.length * 45); // 45 minutes per checklist
  }, [checklists]);

  // Calculate quality metrics
  const qualityMetrics = useMemo((): QualityMetrics => {
    const totalItems = checklists.reduce((sum, list) => sum + list.items.length, 0);
    const completedItems = checklists.reduce((sum, list) => 
      sum + list.items.filter(item => item.isChecked).length, 0
    );
    const failedItems = totalItems - completedItems;
    
    const categoryScores = {
      safety: calculateCategoryScore('safety'),
      performance: calculateCategoryScore('performance'),
      cosmetic: calculateCategoryScore('cosmetic'),
      documentation: calculateCategoryScore('documentation')
    };

    const overallScore = Math.round(
      Object.values(categoryScores).reduce((sum, score) => sum + score, 0) / 4
    );

    return {
      overallScore,
      safetyScore: categoryScores.safety,
      performanceScore: categoryScores.performance,
      cosmeticScore: categoryScores.cosmetic,
      documentationScore: categoryScores.documentation,
      totalCheckpoints: totalItems,
      completedCheckpoints: completedItems,
      failedCheckpoints: failedItems,
      averageCompletionTime: calculateAverageCompletionTime()
    };
  }, [checklists, calculateCategoryScore, calculateAverageCompletionTime]);

  // Handle checklist item toggle
  const toggleChecklistItem = useCallback((listId: string, itemId: string) => {
    setChecklists(prev => prev.map(list => {
      if (list.id === listId) {
        const updatedItems = list.items.map(item => {
          if (item.id === itemId) {
            return { ...item, isChecked: !item.isChecked };
          }
          return item;
        });
        
        const isCompleted = updatedItems.every(item => item.isChecked);
        return {
          ...list,
          items: updatedItems,
          isCompleted,
          completedBy: isCompleted ? currentInspector : undefined,
          completedAt: isCompleted ? new Date() : undefined
        };
      }
      return list;
    }));
  }, [currentInspector]);

  // Handle photo upload
  const handlePhotoUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      // Mock photo upload - in real app, this would upload to storage
      const newPhotos: PhotoDocument[] = Array.from(files).map((file, index) => ({
        id: `photo_${Date.now()}_${index}`,
        url: URL.createObjectURL(file), // Mock URL
        description: `Photo for ${selectedCategory} inspection`,
        category: 'during' as const,
        uploadedBy: currentInspector,
        uploadedAt: new Date(),
        tags: [selectedCategory, repair.id]
      }));

      setPhotos(prev => [...prev, ...newPhotos]);
      
      showSuccess(`${files.length} photo(s) uploaded successfully`);
    } catch (error) {
      showError(getErrorMessage(error));
    } finally {
      setIsUploading(false);
    }
  }, [selectedCategory, currentInspector, repair.id, showSuccess, showError]);

  // Handle notes update
  const updateItemNotes = useCallback((listId: string, itemId: string, notes: string) => {
    setChecklists(prev => prev.map(list => {
      if (list.id === listId) {
        const updatedItems = list.items.map(item => {
          if (item.id === itemId) {
            return { ...item, notes };
          }
          return item;
        });
        return { ...list, items: updatedItems };
      }
      return list;
    }));
  }, []);

  // Handle final approval
  const handleFinalApproval = useCallback(() => {
    const allCompleted = checklists.every(list => list.isCompleted);
    
    if (!allCompleted) {
      showError('All quality checklists must be completed before final approval');
      return;
    }

    if (qualityMetrics.overallScore < 80) {
      showError('Overall quality score must be at least 80% for approval');
      return;
    }

    showSuccess('All quality checks passed. Repair approved for completion.');

    // Update repair status in real app
    onQualityUpdate(qualityMetrics);
  }, [checklists, qualityMetrics, onQualityUpdate, showSuccess, showError]);

  // Update metrics when checklists change
  React.useEffect(() => {
    onQualityUpdate(qualityMetrics);
  }, [qualityMetrics, onQualityUpdate]);

  return (
    <div className="space-y-6">
      {/* Quality Metrics Overview */}
      <Card className="card-glass">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <ChartBarIcon className="w-6 h-6 text-primary" />
            <h3 className="text-responsive-lg font-semibold">Quality Control Metrics</h3>
          </div>
          <div className="text-right">
            <div className="text-responsive-2xl font-bold text-primary">
              {qualityMetrics.overallScore}%
            </div>
            <div className="text-responsive-sm text-muted-foreground">Overall Score</div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-responsive-lg font-semibold text-green-600">
              {qualityMetrics.safetyScore}%
            </div>
            <div className="text-responsive-xs text-muted-foreground">Safety</div>
          </div>
          <div className="text-center">
            <div className="text-responsive-lg font-semibold text-blue-600">
              {qualityMetrics.performanceScore}%
            </div>
            <div className="text-responsive-xs text-muted-foreground">Performance</div>
          </div>
          <div className="text-center">
            <div className="text-responsive-lg font-semibold text-purple-600">
              {qualityMetrics.cosmeticScore}%
            </div>
            <div className="text-responsive-xs text-muted-foreground">Cosmetic</div>
          </div>
          <div className="text-center">
            <div className="text-responsive-lg font-semibold text-orange-600">
              {qualityMetrics.documentationScore}%
            </div>
            <div className="text-responsive-xs text-muted-foreground">Documentation</div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between text-responsive-sm">
            <span>Progress: {qualityMetrics.completedCheckpoints}/{qualityMetrics.totalCheckpoints}</span>
            <span>Failed: {qualityMetrics.failedCheckpoints}</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(qualityMetrics.completedCheckpoints / qualityMetrics.totalCheckpoints) * 100}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Inspector Selection */}
      <Card className="card-glass">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-responsive-base font-semibold">Quality Inspector</h4>
          <select
            value={currentInspector}
            onChange={(e) => setCurrentInspector(e.target.value)}
            className="input-field text-responsive-sm"
          >
            {mockInspectors.map(inspector => (
              <option key={inspector.id} value={inspector.id}>
                {inspector.name} - {inspector.role}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Quality Checklists */}
      <Card className="card-glass">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-responsive-base font-semibold">Quality Checklists</h4>
          <div className="flex space-x-2">
            {['safety', 'performance', 'cosmetic', 'documentation'].map(category => (
              <Button
                key={category}
                size="sm"
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className="btn-ghost"
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {checklists
            .filter(list => list.category === selectedCategory)
            .map(list => (
              <div key={list.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-responsive-sm font-medium capitalize">
                    {list.category} Checklist
                  </h5>
                  <div className="flex items-center space-x-2">
                    {list.isCompleted && (
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    )}
                    <span className="text-responsive-xs text-muted-foreground">
                      {list.items.filter(item => item.isChecked).length}/{list.items.length}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  {list.items.map(item => (
                    <div key={item.id} className="flex items-start space-x-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                      <input
                        type="checkbox"
                        checked={item.isChecked}
                        onChange={() => toggleChecklistItem(list.id, item.id)}
                        className="mt-1 w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                      />
                      <div className="flex-1">
                        <div className="text-responsive-sm font-medium">{item.description}</div>
                        {item.requiresPhoto && (
                          <div className="flex items-center space-x-2 mt-2">
                            <CameraIcon className="w-4 h-4 text-muted-foreground" />
                            <span className="text-responsive-xs text-muted-foreground">Photo required</span>
                          </div>
                        )}
                        <Input
                          placeholder="Add notes..."
                          value={item.notes || ''}
                          onChange={(e) => updateItemNotes(list.id, item.id, e.target.value)}
                          className="input-field mt-2 text-responsive-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </Card>

      {/* Photo Documentation */}
      <Card className="card-glass">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-responsive-base font-semibold">Photo Documentation</h4>
          <div className="flex items-center space-x-2">
            <Input
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoUpload}
              disabled={isUploading}
              className="hidden"
              id="photo-upload"
            />
            <label htmlFor="photo-upload">
              <Button
                size="sm"
                variant="outline"
                disabled={isUploading}
                className="btn-ghost cursor-pointer"
              >
                {isUploading ? (
                  <>
                    <ClockIcon className="w-4 h-4 mr-1 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <CameraIcon className="w-4 h-4 mr-1" />
                    Upload Photos
                  </>
                )}
              </Button>
            </label>
          </div>
        </div>

        {photos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map(photo => (
              <div key={photo.id} className="relative group">
                <img
                  src={photo.url}
                  alt={photo.description}
                  className="w-full h-24 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                  <div className="text-white text-center p-2">
                    <div className="text-responsive-xs font-medium">{photo.description}</div>
                    <div className="text-responsive-xs opacity-75">{photo.category}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {photos.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <CameraIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-responsive-sm">No photos uploaded yet</p>
            <p className="text-responsive-xs">Upload photos to document the repair process</p>
          </div>
        )}
      </Card>

      {/* Final Approval */}
      <Card className="card-glass">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-responsive-base font-semibold">Final Quality Approval</h4>
            <p className="text-responsive-xs text-muted-foreground">
              All checklists must be completed and overall score ≥ 80%
            </p>
          </div>
          <Button
            onClick={handleFinalApproval}
            disabled={qualityMetrics.overallScore < 80 || !checklists.every(list => list.isCompleted)}
            className="btn-primary"
          >
            <DocumentCheckIcon className="w-4 h-4 mr-2" />
            Approve Quality
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default QualityControlSystem;

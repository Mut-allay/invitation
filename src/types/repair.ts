export interface Repair {
  id: string;
  tenantId: string;
  customerId: string;
  vehicleId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  description: string; // Changed from reportedIssues to match actual data
  estimatedCompletion?: Date;
  actualCompletion?: Date;
  totalCost: number;
  laborCost: number;
  partsCost: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;
}

export interface JobCard {
  id: string;
  repairId: string;
  mechanicId: string;
  description: string;
  estimatedHours: number;
  actualHours?: number;
  rate: number;
  totalLabor: number;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface PartUsed {
  id: string;
  repairId: string;
  inventoryId: string;
  qty: number;
  unitCost: number;
  totalCost: number;
  createdAt: Date;
}

export interface RepairFormData {
  customerId: string;
  vehicleId: string;
  reportedIssues: string;
  estimatedCompletion?: Date;
  notes?: string;
}

export interface JobCardFormData {
  mechanicId: string;
  description: string;
  estimatedHours: number;
  rate: number;
}

export interface PartUsedFormData {
  inventoryId: string;
  qty: number;
  unitCost: number;
}

// Advanced Job Card Management System Types

export interface RepairStatus {
  id: string;
  repairId: string;
  status: 'pending' | 'in_progress' | 'quality_check' | 'completed' | 'cancelled';
  mechanicId?: string;
  bayId?: string;
  notes?: string;
  timestamp: Date;
  updatedBy: string;
}

export interface CompletionData {
  repairId: string;
  actualCompletion: Date;
  finalCost: number;
  qualityCheckPassed: boolean;
  customerSatisfaction?: number;
  notes?: string;
}

export interface Mechanic {
  id: string;
  tenantId: string;
  name: string;
  specialization: string[];
  hourlyRate: number;
  availability: 'available' | 'busy' | 'off_duty';
  currentBayId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Bay {
  id: string;
  tenantId: string;
  name: string;
  type: 'standard' | 'heavy_duty' | 'diagnostic' | 'body_shop';
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  currentRepairId?: string;
  currentMechanicId?: string;
  capacity: number;
  equipment: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface BaySchedule {
  id: string;
  bayId: string;
  repairId: string;
  mechanicId: string;
  startTime: Date;
  endTime: Date;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PartsInventory {
  id: string;
  tenantId: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  currentStock: number;
  reorderLevel: number;
  unitCost: number;
  supplierId: string;
  location: string;
  status: 'available' | 'low_stock' | 'out_of_stock' | 'discontinued';
  createdAt: Date;
  updatedAt: Date;
}

export interface PartsUsage {
  id: string;
  repairId: string;
  partsInventoryId: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  usedBy: string;
  usedAt: Date;
  notes?: string;
}

export interface QualityCheckpoint {
  id: string;
  repairId: string;
  checkpointType: 'safety' | 'performance' | 'cosmetic' | 'final';
  status: 'pending' | 'passed' | 'failed' | 'requires_attention';
  inspectorId: string;
  notes?: string;
  photos?: string[];
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowStep {
  id: string;
  repairId: string;
  stepNumber: number;
  stepName: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  assignedTo?: string;
  estimatedDuration: number; // in minutes
  actualDuration?: number;
  dependencies: string[]; // step IDs that must be completed first
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Form Data Types for Advanced Features
export interface AdvancedJobCardFormData {
  repairId: string;
  mechanicId: string;
  bayId: string;
  estimatedStartTime: Date;
  estimatedEndTime: Date;
  workflowSteps: Omit<WorkflowStep, 'id' | 'repairId' | 'status' | 'createdAt' | 'updatedAt'>[];
  qualityCheckpoints: Omit<QualityCheckpoint, 'id' | 'repairId' | 'status' | 'createdAt' | 'updatedAt'>[];
}

export interface BaySchedulingFormData {
  bayId: string;
  repairId: string;
  mechanicId: string;
  startTime: Date;
  endTime: Date;
  notes?: string;
}

export interface PartsManagementFormData {
  repairId: string;
  parts: {
    partsInventoryId: string;
    quantity: number;
    notes?: string;
  }[];
} 
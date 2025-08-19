export interface Repair {
  id: string;
  tenantId: string;
  customerId: string;
  vehicleId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  reportedIssues: string;
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
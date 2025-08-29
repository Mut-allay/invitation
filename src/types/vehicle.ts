export interface Vehicle {
  id: string;
  tenantId: string;
  make: string;
  model: string;
  year: number;
  plateNumber: string; // Changed from regNumber to match actual data
  customerId?: string; // Added to match actual data
  createdAt: Date;
  updatedAt: Date;
}

export interface VehicleFormData {
  vin: string;
  regNumber: string;
  make: string;
  model: string;
  year: number;
  costPrice: number;
  sellingPrice: number;
  description?: string;
  mileage?: number;
  fuelType?: 'petrol' | 'diesel' | 'hybrid' | 'electric';
  transmission?: 'manual' | 'automatic';
  color?: string;
  features?: string[];
} 
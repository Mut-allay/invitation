export interface Vehicle {
  id: string;
  tenantId: string;
  vin: string;
  regNumber: string;
  make: string;
  model: string;
  year: number;
  status: 'available' | 'sold' | 'reserved' | 'in_repair';
  costPrice: number;
  sellingPrice: number;
  images: string[];
  description?: string;
  mileage?: number;
  fuelType?: 'petrol' | 'diesel' | 'hybrid' | 'electric';
  transmission?: 'manual' | 'automatic';
  color?: string;
  features?: string[];
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
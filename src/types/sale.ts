export interface Sale {
  id: string;
  tenantId: string;
  customerId: string;
  vehicleId: string;
  amount: number; // Changed from salePrice to match actual data
  currency: string;
  paymentMethod: 'cash' | 'bank_transfer' | 'mobile_money';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SaleFormData {
  customerId: string;
  vehicleId: string;
  amount: number; // Changed from salePrice to match actual data
  currency: string;
  paymentMethod: 'cash' | 'bank_transfer' | 'mobile_money';
  notes?: string;
} 
export interface Sale {
  id: string;
  tenantId: string;
  customerId: string;
  vehicleId: string;
  salePrice: number;
  deposit: number;
  balance: number;
  status: 'pending' | 'completed' | 'cancelled';
  paymentMethod: 'cash' | 'bank_transfer' | 'mobile_money';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SaleFormData {
  customerId: string;
  vehicleId: string;
  salePrice: number;
  deposit: number;
  balance: number;
  paymentMethod: 'cash' | 'bank_transfer' | 'mobile_money';
  notes?: string;
} 
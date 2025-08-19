export interface Inventory {
  id: string;
  tenantId: string;
  type: 'part' | 'tool' | 'consumable';
  sku: string;
  name: string;
  description?: string;
  currentStock: number;
  reorderLevel: number;
  supplierId: string;
  cost: number;
  sellingPrice: number;
  unit: string;
  category?: string;
  location?: string;
  barcode?: string;
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryFormData {
  type: 'part' | 'tool' | 'consumable';
  sku: string;
  name: string;
  description?: string;
  currentStock: number;
  reorderLevel: number;
  supplierId: string;
  cost: number;
  sellingPrice: number;
  unit: string;
  category?: string;
  location?: string;
  barcode?: string;
}

export interface Supplier {
  id: string;
  tenantId: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  paymentTerms: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SupplierFormData {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  paymentTerms: string;
} 
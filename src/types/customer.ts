export interface Customer {
  id: string;
  tenantId: string;
  name: string;
  phone: string;
  nrc: string;
  address: string;
  email?: string;
  vehiclesOwned: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerFormData {
  name: string;
  phone: string;
  nrc: string;
  address: string;
  email?: string;
} 
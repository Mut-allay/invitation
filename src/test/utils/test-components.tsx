import React from 'react';
import { render } from '@testing-library/react';
import { AuthContext } from '../../contexts/auth-context';
import { ToastProvider } from '../../contexts/toast-provider';
import type { AuthContextType } from '../../contexts/auth-types';
import { UserRole } from '../../contexts/auth-types';

// Mock auth context
export const mockAuthContext: AuthContextType = {
  user: null,
  userProfile: null,
  loading: false,
  login: jest.fn(),
  logout: jest.fn(),
  register: jest.fn(),
  resetPassword: jest.fn(),
  hasPermission: jest.fn(() => true),
};

// Mock toast context
export const mockToastContext = {
  success: jest.fn(),
  error: jest.fn(),
  warning: jest.fn(),
  info: jest.fn(),
};

// Test wrapper component
export const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthContext.Provider value={mockAuthContext}>
      <ToastProvider>
        {children}
      </ToastProvider>
    </AuthContext.Provider>
  );
};

// Custom render function with providers
export const renderWithProviders = (ui: React.ReactElement) => {
  return render(ui, { wrapper: TestWrapper });
};

// Mock user data
export const mockUser = {
  uid: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User',
};

export const mockUserProfile = {
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  role: UserRole.ADMIN,
  tenantId: 'test-tenant',
};

// Mock vehicle data
export const mockVehicle = {
  id: 'vehicle-1',
  make: 'Toyota',
  model: 'Camry',
  year: 2020,
  vin: '1HGBH41JXMN109186',
  licensePlate: 'ABC123',
  color: 'Silver',
  mileage: 50000,
  customerId: 'customer-1',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

// Mock customer data
export const mockCustomer = {
  id: 'customer-1',
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+1234567890',
  address: '123 Main St',
  city: 'Anytown',
  state: 'CA',
  zipCode: '12345',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

// Mock repair data
export const mockRepair = {
  id: 'repair-1',
  vehicleId: 'vehicle-1',
  customerId: 'customer-1',
  description: 'Oil change and inspection',
  status: 'completed',
  estimatedCost: 150,
  actualCost: 145,
  startDate: new Date('2024-01-01'),
  completedDate: new Date('2024-01-02'),
  mechanicId: 'mechanic-1',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-02'),
};

// Mock invoice data
export const mockInvoice = {
  id: 'invoice-1',
  customerId: 'customer-1',
  vehicleId: 'vehicle-1',
  repairId: 'repair-1',
  amount: 145,
  tax: 14.5,
  total: 159.5,
  status: 'paid',
  dueDate: new Date('2024-01-15'),
  paidDate: new Date('2024-01-10'),
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-10'),
};

// Mock inventory item data
export const mockInventoryItem = {
  id: 'item-1',
  name: 'Oil Filter',
  partNumber: 'OF-001',
  category: 'Filters',
  quantity: 50,
  unitPrice: 15.99,
  supplier: 'Auto Parts Co',
  reorderPoint: 10,
  location: 'Shelf A1',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

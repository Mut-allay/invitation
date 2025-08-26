import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement } from 'react';
import { AllTheProviders } from './test-components';

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export specific items instead of everything
export {
  screen,
  waitFor,
  fireEvent,
  within,
  getByText,
  getByLabelText,
  getByTestId,
  queryByText,
  queryByLabelText,
  queryByTestId,
  findByText,
  findByLabelText,
  findByTestId,
  waitForElementToBeRemoved,
  act,
  cleanup,
  renderHook,

} from '@testing-library/react';
export { customRender as render };

// Export test utilities
export const createMockUser = (overrides = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  tenantId: 'demo-tenant',
  role: 'admin',
  ...overrides,
});

export const createMockVehicle = (overrides = {}) => ({
  id: '1',
  tenantId: 'demo-tenant',
  vin: 'ABC123456789',
  regNumber: 'ABC123',
  make: 'Toyota',
  model: 'Corolla',
  year: 2020,
  status: 'available' as const,
  costPrice: 15000,
  sellingPrice: 18000,
  images: [],
  description: 'Well maintained vehicle',
  mileage: 50000,
  fuelType: 'petrol' as const,
  transmission: 'automatic' as const,
  color: 'White',
  features: ['Air Conditioning', 'Bluetooth'],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

export const createMockCustomer = (overrides = {}) => ({
  id: '1',
  tenantId: 'demo-tenant',
  name: 'John Doe',
  phone: '+260123456789',
  email: 'john@example.com',
  nrc: '123456/78/9',
  address: '123 Main St, Lusaka',
  vehiclesOwned: ['1'],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

export const createMockSale = (overrides = {}) => ({
  id: '1',
  tenantId: 'demo-tenant',
  vehicleId: '1',
  customerId: '1',
  salePrice: 18000,
  deposit: 5000,
  paymentMethod: 'bank_transfer' as const,
  saleDate: new Date('2024-01-15'),
  notes: 'Excellent customer',
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-15'),
  ...overrides,
});

export const createMockRepair = (overrides = {}) => ({
  id: '1',
  tenantId: 'demo-tenant',
  customerId: '1',
  vehicleId: '1',
  status: 'in_progress' as const,
  reportedIssues: 'Engine making strange noise',
  estimatedCompletion: new Date('2024-02-01'),
  totalCost: 500,
  laborCost: 300,
  partsCost: 200,
  notes: 'Need to check engine',
  createdAt: new Date('2024-01-20'),
  updatedAt: new Date('2024-01-20'),
  ...overrides,
});

export const createMockInventory = (overrides = {}) => ({
  id: '1',
  tenantId: 'demo-tenant',
  type: 'part' as const,
  sku: 'ENG001',
  name: 'Engine Oil Filter',
  description: 'High quality oil filter',
  currentStock: 50,
  reorderLevel: 10,
  supplierId: '1',
  cost: 25,
  sellingPrice: 35,
  unit: 'piece',
  category: 'Engine Parts',
  location: 'Warehouse A',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

export const createMockInvoice = (overrides = {}) => ({
  id: '1',
  tenantId: 'demo-tenant',
  invoiceNumber: 'INV-2024-001',
  saleId: '1',
  customerId: '1',
  vehicleId: '1',
  totalAmount: 18000,
  subtotal: 15517.24,
  vatAmount: 2482.76,
  vatRate: 0.16,
  taxBreakdown: { vat: 2482.76 },
  status: 'paid' as const,
  dueDate: new Date('2024-02-15'),
  issueDate: new Date('2024-01-15'),
  paidDate: new Date('2024-01-15'),
  paymentMethod: 'bank_transfer' as const,
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-15'),
  ...overrides,
}); 
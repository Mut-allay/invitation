import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { vehiclesApi } from '../../store/api/vehiclesApi';
import { customersApi } from '../../store/api/customersApi';
import { salesApi } from '../../store/api/salesApi';
import { repairsApi } from '../../store/api/repairsApi';
import { inventoryApi } from '../../store/api/inventoryApi';
import { invoicesApi } from '../../store/api/invoicesApi';
import { uploadApi } from '../../store/api/uploadApi';
// Mock partsOrdersApi since it has Firebase dependencies
const mockPartsOrdersApi = {
  reducerPath: 'partsOrdersApi',
  reducer: (state = {}, action: any) => state,
  middleware: () => (next: any) => (action: any) => next(action),
  endpoints: {},
  useGetPartsOrdersQuery: () => ({ data: [], isLoading: false, error: null }),
  useCreatePartsOrderMutation: () => [
    jest.fn().mockImplementation(() => Promise.resolve({ data: { id: 'test-order-id' } })),
    { isLoading: false, error: null }
  ],
  useUpdatePartsOrderMutation: () => [
    jest.fn().mockImplementation(() => Promise.resolve({ data: { id: 'test-order-id' } })),
    { isLoading: false, error: null }
  ],
  useDeletePartsOrderMutation: () => [
    jest.fn().mockImplementation(() => Promise.resolve({ data: { success: true } })),
    { isLoading: false, error: null }
  ],
};
import { AuthProvider, AuthContext } from '../../contexts/AuthContext';

// Create a test store with all API slices
const createTestStore = () => {
  return configureStore({
    reducer: {
      [vehiclesApi.reducerPath]: vehiclesApi.reducer,
      [customersApi.reducerPath]: customersApi.reducer,
      [salesApi.reducerPath]: salesApi.reducer,
      [repairsApi.reducerPath]: repairsApi.reducer,
      [inventoryApi.reducerPath]: inventoryApi.reducer,
      [invoicesApi.reducerPath]: invoicesApi.reducer,
      [uploadApi.reducerPath]: uploadApi.reducer,
      [mockPartsOrdersApi.reducerPath]: mockPartsOrdersApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        vehiclesApi.middleware,
        customersApi.middleware,
        salesApi.middleware,
        repairsApi.middleware,
        inventoryApi.middleware,
        invoicesApi.middleware,
        uploadApi.middleware,
        mockPartsOrdersApi.middleware,
      ),
  });
};

// Mock auth context - commented out as it's not currently used
// const mockAuthContext = {
//   user: {
//     id: 'test-user-id',
//     email: 'test@example.com',
//     tenantId: 'demo-tenant',
//     role: 'admin',
//   },
//   login: jest.fn(),
//   logout: jest.fn(),
//   loading: false,
// };

// Mock AuthProvider for testing - doesn't depend on Firebase auth state
const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const mockAuthContext = {
    user: null,
    loading: false, // Always false in tests
    login: jest.fn(),
    logout: jest.fn(),
  };

  return (
    <AuthContext.Provider value={mockAuthContext}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const store = createTestStore();

  return (
    <Provider store={store}>
      <MockAuthProvider>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </MockAuthProvider>
    </Provider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';
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
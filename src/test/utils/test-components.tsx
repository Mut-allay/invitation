import React from 'react';
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
import { AuthContext } from '../../contexts/auth-context-definition';

// Mock partsOrdersApi since it has Firebase dependencies
const mockPartsOrdersApi = {
  reducerPath: 'partsOrdersApi',
  reducer: (state = {}) => state,
  middleware: () => (next: unknown) => (action: unknown) => next(action as unknown),
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

// Mock AuthProvider for testing - doesn't depend on Firebase auth state
export const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
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
export const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
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

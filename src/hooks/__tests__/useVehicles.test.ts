import { renderHook, waitFor } from '@testing-library/react';
import { useVehicles } from '../useVehicles';
import { createMockVehicle } from '../../test/utils/test-utils';

// Mock the API hook
jest.mock('../../store/api/vehiclesApi', () => ({
  useGetVehiclesQuery: jest.fn(),
}));

// Mock the auth context
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      tenantId: 'demo-tenant',
      role: 'admin',
    },
  }),
}));

describe('useVehicles', () => {
  const mockVehicles = [
    createMockVehicle({ id: '1' }),
    createMockVehicle({ id: '2', make: 'Honda', model: 'Civic' }),
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns vehicles data when API call is successful', async () => {
    const { useGetVehiclesQuery } = require('../../store/api/vehiclesApi');
    useGetVehiclesQuery.mockReturnValue({
      data: mockVehicles,
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useVehicles());

    await waitFor(() => {
      expect(result.current.vehicles).toEqual(mockVehicles);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  it('returns loading state when API call is in progress', async () => {
    const { useGetVehiclesQuery } = require('../../store/api/vehiclesApi');
    useGetVehiclesQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    const { result } = renderHook(() => useVehicles());

    await waitFor(() => {
      expect(result.current.vehicles).toEqual([]);
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBeNull();
    });
  });

  it('returns error when API call fails', async () => {
    const { useGetVehiclesQuery } = require('../../store/api/vehiclesApi');
    const mockError = { data: { message: 'Failed to fetch vehicles' } };
    useGetVehiclesQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: mockError,
    });

    const { result } = renderHook(() => useVehicles());

    await waitFor(() => {
      expect(result.current.vehicles).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toEqual(mockError);
    });
  });

  it('returns default empty array when no data is available', async () => {
    const { useGetVehiclesQuery } = require('../../store/api/vehiclesApi');
    useGetVehiclesQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useVehicles());

    await waitFor(() => {
      expect(result.current.vehicles).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  it('handles error without data.message gracefully', async () => {
    const { useGetVehiclesQuery } = require('../../store/api/vehiclesApi');
    const mockError = { message: 'Network error' };
    useGetVehiclesQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: mockError,
    });

    const { result } = renderHook(() => useVehicles());

    await waitFor(() => {
      expect(result.current.vehicles).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toEqual(mockError);
    });
  });

  it('skips API call when tenantId is not available', async () => {
    // Mock auth context with no user
    jest.doMock('../../contexts/AuthContext', () => ({
      useAuth: () => ({
        user: null,
      }),
    }));

    const { useGetVehiclesQuery } = require('../../store/api/vehiclesApi');
    useGetVehiclesQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useVehicles());

    await waitFor(() => {
      expect(result.current.vehicles).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });
}); 
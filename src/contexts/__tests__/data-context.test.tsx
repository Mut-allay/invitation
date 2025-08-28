import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DataProvider, useData } from '../data-context';
import type { Vehicle } from '../../types/vehicle';

// Mock the auth context
jest.mock('../auth-hooks', () => ({
  useAuth: () => ({
    userProfile: {
      tenantId: 'test-tenant',
      uid: 'test-user',
    },
  }),
}));

// Test component to access context
const TestComponent = () => {
  const { state, getCachedData, setCachedData, clearCache, addSubscription, removeSubscription, clearAllSubscriptions, updateVehicle, addVehicle, removeVehicle } = useData();
  
  return (
    <div>
      <div data-testid="vehicles-count">{state.vehicles.data.length}</div>
      <div data-testid="vehicles-loading">{state.vehicles.loading.toString()}</div>
      <div data-testid="vehicles-error">{state.vehicles.error || 'no-error'}</div>
      <div data-testid="cache-keys">{Object.keys(state.cache).join(',')}</div>
      <div data-testid="subscription-count">{Object.keys(state.realTimeSubscriptions).length}</div>
      <button 
        onClick={() => setCachedData('test-key', { test: 'data' })}
        data-testid="set-cache"
      >
        Set Cache
      </button>
      <button 
        onClick={() => clearCache()}
        data-testid="clear-cache"
      >
        Clear Cache
      </button>
      <button 
        onClick={() => getCachedData('test-key')}
        data-testid="get-cache"
      >
        Get Cache
      </button>
      <button 
        onClick={() => addSubscription('test-sub', jest.fn())}
        data-testid="add-subscription"
      >
        Add Subscription
      </button>
      <button 
        onClick={() => addSubscription('test-sub-2', jest.fn())}
        data-testid="add-subscription-2"
      >
        Add Subscription 2
      </button>
      <button 
        onClick={() => removeSubscription('test-sub')}
        data-testid="remove-subscription"
      >
        Remove Subscription
      </button>
      <button 
        onClick={() => clearAllSubscriptions()}
        data-testid="clear-subscriptions"
      >
        Clear Subscriptions
      </button>
      <button 
        onClick={() => {
          const mockVehicle: Vehicle = {
            id: 'test-1',
            tenantId: 'test-tenant',
            make: 'Toyota',
            model: 'Camry',
            year: 2020,
            regNumber: 'ABC123',
            vin: '123456789',
            status: 'available',
            costPrice: 15000,
            sellingPrice: 18000,
            description: 'Test vehicle',
            mileage: 50000,
            fuelType: 'petrol',
            transmission: 'automatic',
            color: 'Blue',
            features: ['Navigation'],
            images: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          addVehicle(mockVehicle);
        }}
        data-testid="add-vehicle"
      >
        Add Vehicle
      </button>
      <button 
        onClick={() => {
          const mockVehicle: Vehicle = {
            id: 'test-1',
            tenantId: 'test-tenant',
            make: 'Updated Toyota',
            model: 'Camry',
            year: 2020,
            regNumber: 'ABC123',
            vin: '123456789',
            status: 'available',
            costPrice: 15000,
            sellingPrice: 18000,
            description: 'Test vehicle',
            mileage: 50000,
            fuelType: 'petrol',
            transmission: 'automatic',
            color: 'Blue',
            features: ['Navigation'],
            images: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          updateVehicle(mockVehicle);
        }}
        data-testid="update-vehicle"
      >
        Update Vehicle
      </button>
      <button 
        onClick={() => removeVehicle('test-1')}
        data-testid="remove-vehicle"
      >
        Remove Vehicle
      </button>
    </div>
  );
};

// Wrapper component for testing
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <DataProvider>
    {children}
  </DataProvider>
);

describe('DataContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('provides initial state', () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    expect(screen.getByTestId('vehicles-count')).toHaveTextContent('0');
    expect(screen.getByTestId('vehicles-loading')).toHaveTextContent('false');
    expect(screen.getByTestId('vehicles-error')).toHaveTextContent('no-error');
    expect(screen.getByTestId('cache-keys')).toHaveTextContent('');
    expect(screen.getByTestId('subscription-count')).toHaveTextContent('0');
  });

  it('manages cache operations', async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    // Set cache
    fireEvent.click(screen.getByTestId('set-cache'));
    
    await waitFor(() => {
      expect(screen.getByTestId('cache-keys')).toHaveTextContent('test-key');
    });

    // Clear cache
    fireEvent.click(screen.getByTestId('clear-cache'));
    
    await waitFor(() => {
      expect(screen.getByTestId('cache-keys')).toHaveTextContent('');
    });
  });

  it('manages subscriptions', async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    // Add subscription
    fireEvent.click(screen.getByTestId('add-subscription'));
    
    await waitFor(() => {
      expect(screen.getByTestId('subscription-count')).toHaveTextContent('1');
    });

    // Remove subscription
    fireEvent.click(screen.getByTestId('remove-subscription'));
    
    await waitFor(() => {
      expect(screen.getByTestId('subscription-count')).toHaveTextContent('0');
    });

    // Add multiple subscriptions and clear all
    fireEvent.click(screen.getByTestId('add-subscription'));
    fireEvent.click(screen.getByTestId('add-subscription-2'));
    
    await waitFor(() => {
      expect(screen.getByTestId('subscription-count')).toHaveTextContent('2');
    });

    fireEvent.click(screen.getByTestId('clear-subscriptions'));
    
    await waitFor(() => {
      expect(screen.getByTestId('subscription-count')).toHaveTextContent('0');
    });
  });

  it('handles vehicle operations', async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    // Add vehicle
    fireEvent.click(screen.getByTestId('add-vehicle'));
    
    await waitFor(() => {
      expect(screen.getByTestId('vehicles-count')).toHaveTextContent('1');
    });

    // Update vehicle
    fireEvent.click(screen.getByTestId('update-vehicle'));
    
    await waitFor(() => {
      expect(screen.getByTestId('vehicles-count')).toHaveTextContent('1');
    });

    // Remove vehicle
    fireEvent.click(screen.getByTestId('remove-vehicle'));
    
    await waitFor(() => {
      expect(screen.getByTestId('vehicles-count')).toHaveTextContent('0');
    });
  });

  it('throws error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useData must be used within a DataProvider');
    
    consoleSpy.mockRestore();
  });
}); 
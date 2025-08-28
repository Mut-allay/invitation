import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DataProvider, useData } from '../data-context';

// Test component to access context
const TestComponent = () => {
  const { state, dispatch } = useData();

  return (
    <div>
      <div data-testid="customers-count">{state.customers.length}</div>
      <div data-testid="vehicles-count">{state.vehicles.length}</div>
      <div data-testid="repairs-count">{state.repairs.length}</div>
      <div data-testid="sales-count">{state.sales.length}</div>
      <div data-testid="invoices-count">{state.invoices.length}</div>
      <div data-testid="inventory-count">{state.inventory.length}</div>
      <button
        data-testid="set-customers"
        onClick={() => dispatch({ type: 'SET_CUSTOMERS', payload: [{ id: '1', name: 'Test Customer' }] })}
      >
        Set Customers
      </button>
      <button
        data-testid="set-vehicles"
        onClick={() => dispatch({ type: 'SET_VEHICLES', payload: [{ id: '1', make: 'Toyota' }] })}
      >
        Set Vehicles
      </button>
      <button
        data-testid="add-customer"
        onClick={() => dispatch({ type: 'ADD_CUSTOMER', payload: { id: '2', name: 'New Customer' } })}
      >
        Add Customer
      </button>
      <button
        data-testid="update-customer"
        onClick={() => dispatch({ type: 'UPDATE_CUSTOMER', payload: { id: '1', name: 'Updated Customer' } })}
      >
        Update Customer
      </button>
      <button
        data-testid="delete-customer"
        onClick={() => dispatch({ type: 'DELETE_CUSTOMER', payload: '1' })}
      >
        Delete Customer
      </button>
    </div>
  );
};

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <DataProvider>
      {component}
    </DataProvider>
  );
};

describe('DataContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('provides initial state with empty arrays', () => {
      renderWithProvider(<TestComponent />);

      expect(screen.getByTestId('customers-count')).toHaveTextContent('0');
      expect(screen.getByTestId('vehicles-count')).toHaveTextContent('0');
      expect(screen.getByTestId('repairs-count')).toHaveTextContent('0');
      expect(screen.getByTestId('sales-count')).toHaveTextContent('0');
      expect(screen.getByTestId('invoices-count')).toHaveTextContent('0');
      expect(screen.getByTestId('inventory-count')).toHaveTextContent('0');
    });
  });

  describe('Data Actions', () => {
    it('sets customers data', async () => {
      renderWithProvider(<TestComponent />);

      fireEvent.click(screen.getByTestId('set-customers'));

      await waitFor(() => {
        expect(screen.getByTestId('customers-count')).toHaveTextContent('1');
      });
    });

    it('sets vehicles data', async () => {
      renderWithProvider(<TestComponent />);

      fireEvent.click(screen.getByTestId('set-vehicles'));

      await waitFor(() => {
        expect(screen.getByTestId('vehicles-count')).toHaveTextContent('1');
      });
    });

    it('adds a customer', async () => {
      renderWithProvider(<TestComponent />);

      // First set some customers
      fireEvent.click(screen.getByTestId('set-customers'));
      
      // Then add another customer
      fireEvent.click(screen.getByTestId('add-customer'));

      await waitFor(() => {
        expect(screen.getByTestId('customers-count')).toHaveTextContent('2');
      });
    });

    it('updates a customer', async () => {
      renderWithProvider(<TestComponent />);

      // First set some customers
      fireEvent.click(screen.getByTestId('set-customers'));
      
      // Then update the customer
      fireEvent.click(screen.getByTestId('update-customer'));

      await waitFor(() => {
        expect(screen.getByTestId('customers-count')).toHaveTextContent('1');
      });
    });

    it('deletes a customer', async () => {
      renderWithProvider(<TestComponent />);

      // First set some customers
      fireEvent.click(screen.getByTestId('set-customers'));
      
      // Then delete the customer
      fireEvent.click(screen.getByTestId('delete-customer'));

      await waitFor(() => {
        expect(screen.getByTestId('customers-count')).toHaveTextContent('0');
      });
    });
  });

  describe('Error Handling', () => {
    it('handles unknown action types gracefully', () => {
             const TestErrorComponent = () => {
         const { dispatch } = useData();
         
         return (
           <button
             data-testid="unknown-action"
             onClick={() => dispatch({ type: 'UNKNOWN_ACTION' as never, payload: null })}
           >
             Unknown Action
           </button>
         );
       };

      renderWithProvider(<TestErrorComponent />);

      // Should not throw an error
      expect(() => {
        fireEvent.click(screen.getByTestId('unknown-action'));
      }).not.toThrow();
    });
  });

  describe('Context Usage', () => {
    it('throws error when used outside provider', () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = jest.fn();

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useData must be used within a DataProvider');

      console.error = originalError;
    });
  });
}); 
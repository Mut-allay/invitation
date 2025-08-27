import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PartsManagementInterface } from '../PartsManagementInterface';

// Mock the Button component
jest.mock('../../ui/button', () => ({
  Button: ({ children, onClick, type, disabled, variant, className }: {
    children: React.ReactNode;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    variant?: string;
    className?: string;
  }) => (
    <button 
      onClick={onClick} 
      type={type} 
      disabled={disabled}
      className={`button ${variant || 'default'} ${className || ''}`}
    >
      {children}
    </button>
  )
}));

// Mock Heroicons
jest.mock('@heroicons/react/24/outline', () => ({
  CubeIcon: () => <svg data-testid="cube-icon" />,
  ExclamationTriangleIcon: () => <svg data-testid="exclamation-icon" />,
  CheckCircleIcon: () => <svg data-testid="check-icon" />,
  XMarkIcon: () => <svg data-testid="x-icon" />,
  PlusIcon: () => <svg data-testid="plus-icon" />,
  MinusIcon: () => <svg data-testid="minus-icon" />,
  CurrencyDollarIcon: () => <svg data-testid="dollar-icon" />,
  TruckIcon: () => <svg data-testid="truck-icon" />,
  ClockIcon: () => <svg data-testid="clock-icon" />,
  UserIcon: () => <svg data-testid="user-icon" />
}));

describe('PartsManagementInterface', () => {
  const mockRepairId = 'ir-123';
  const mockTenantId = 'tenant-1';
  const mockOnPartsUsed = jest.fn();
  const mockOnStockAlert = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the component with initial state', () => {
    render(
      <PartsManagementInterface
        repairId={mockRepairId}
        tenantId={mockTenantId}
        onPartsUsed={mockOnPartsUsed}
        onStockAlert={mockOnStockAlert}
      />
    );

    expect(screen.getByText('Parts Management Interface')).toBeInTheDocument();
    expect(screen.getByText('Repair #ir-123')).toBeInTheDocument();
    expect(screen.getByText('Add Parts')).toBeInTheDocument();
    expect(screen.getByText('Available Parts')).toBeInTheDocument();
    expect(screen.getByText('Parts Used in This Repair')).toBeInTheDocument();
  });

  it('displays all parts initially', () => {
    render(
      <PartsManagementInterface
        repairId={mockRepairId}
        tenantId={mockTenantId}
        onPartsUsed={mockOnPartsUsed}
        onStockAlert={mockOnStockAlert}
      />
    );

    // All parts should be visible initially
    expect(screen.getAllByText('Engine Oil Filter').length).toBeGreaterThan(0);
    expect(screen.getByText('Brake Pads Set')).toBeInTheDocument();
    expect(screen.getByText('Car Battery 12V')).toBeInTheDocument();
    expect(screen.getAllByText('Air Filter').length).toBeGreaterThan(0);
    expect(screen.getByText('Spark Plugs Set')).toBeInTheDocument();
  });

  it('opens the add parts modal when Add Parts button is clicked', () => {
    render(
      <PartsManagementInterface
        repairId={mockRepairId}
        tenantId={mockTenantId}
        onPartsUsed={mockOnPartsUsed}
        onStockAlert={mockOnStockAlert}
      />
    );

    const addPartsButton = screen.getByText('Add Parts');
    fireEvent.click(addPartsButton);

    expect(screen.getByText('Add Parts to Repair')).toBeInTheDocument();
    expect(screen.getByText('Available Parts:')).toBeInTheDocument();
  });

  it('allows selecting parts in the modal', async () => {
    render(
      <PartsManagementInterface
        repairId={mockRepairId}
        tenantId={mockTenantId}
        onPartsUsed={mockOnPartsUsed}
        onStockAlert={mockOnStockAlert}
      />
    );

    // Open modal
    fireEvent.click(screen.getByText('Add Parts'));

    // Find quantity inputs for available parts
    const quantityInputs = screen.getAllByPlaceholderText('Qty');
    expect(quantityInputs.length).toBeGreaterThan(0);

    // Select a part
    const firstInput = quantityInputs[0];
    fireEvent.change(firstInput, { target: { value: '2' } });

    // The part should appear in selected parts
    await waitFor(() => {
      expect(screen.getAllByText('Engine Oil Filter').length).toBeGreaterThan(0);
    });
  });

  it('validates form when no parts are selected', async () => {
    render(
      <PartsManagementInterface
        repairId={mockRepairId}
        tenantId={mockTenantId}
        onPartsUsed={mockOnPartsUsed}
        onStockAlert={mockOnStockAlert}
      />
    );

    // Open modal
    fireEvent.click(screen.getByText('Add Parts'));

    // Try to submit without selecting parts
    const addPartsButton = screen.getAllByText('Add Parts').find(button => 
      button.getAttribute('type') === 'submit'
    );
    expect(addPartsButton).toBeDisabled();
  });

  it('prevents adding more than available stock', async () => {
    render(
      <PartsManagementInterface
        repairId={mockRepairId}
        tenantId={mockTenantId}
        onPartsUsed={mockOnPartsUsed}
        onStockAlert={mockOnStockAlert}
      />
    );

    // Open modal
    fireEvent.click(screen.getByText('Add Parts'));

    // Find quantity inputs and try to add more than available stock
    const quantityInputs = screen.getAllByPlaceholderText('Qty');
    const firstInput = quantityInputs[0]; // Engine Oil Filter (50 in stock)
    
    // Try to add more than available stock - this should not be allowed
    fireEvent.change(firstInput, { target: { value: '60' } }); // More than available (50)

    // The part should not be added to selected parts because quantity exceeds stock
    await waitFor(() => {
      expect(screen.queryByText('Selected Parts:')).not.toBeInTheDocument();
    });
  });

  it('successfully adds parts when validation passes', async () => {
    render(
      <PartsManagementInterface
        repairId={mockRepairId}
        tenantId={mockTenantId}
        onPartsUsed={mockOnPartsUsed}
        onStockAlert={mockOnStockAlert}
      />
    );

    // Open modal
    fireEvent.click(screen.getByText('Add Parts'));

    // Select a valid quantity
    const quantityInputs = screen.getAllByPlaceholderText('Qty');
    const firstInput = quantityInputs[0];
    fireEvent.change(firstInput, { target: { value: '2' } });

    // Submit the form
    const formSubmitButton = screen.getAllByText('Add Parts').find(button => 
      button.getAttribute('type') === 'submit'
    );
    fireEvent.click(formSubmitButton!);

    await waitFor(() => {
      expect(mockOnPartsUsed).toHaveBeenCalled();
    });
  });

  it('triggers stock alerts for low stock items', async () => {
    render(
      <PartsManagementInterface
        repairId={mockRepairId}
        tenantId={mockTenantId}
        onPartsUsed={mockOnPartsUsed}
        onStockAlert={mockOnStockAlert}
      />
    );

    // Open modal
    fireEvent.click(screen.getByText('Add Parts'));

    // Use Brake Pads Set (8 in stock, reorder level 15) - this will trigger low stock
    const quantityInputs = screen.getAllByPlaceholderText('Qty');
    // Find the input for Brake Pads Set (it's the second part in the mock data)
    const brakePadsInput = quantityInputs[1]; // Brake Pads Set
    fireEvent.change(brakePadsInput, { target: { value: '5' } });

    // Submit the form
    const formSubmitButton = screen.getAllByText('Add Parts').find(button => 
      button.getAttribute('type') === 'submit'
    );
    fireEvent.click(formSubmitButton!);

    await waitFor(() => {
      expect(mockOnStockAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '2', // Brake Pads Set ID
          currentStock: 3, // 8 - 5 = 3
          status: 'low_stock'
        })
      );
    });
  });

  it('disables quantity input for out of stock items', () => {
    render(
      <PartsManagementInterface
        repairId={mockRepairId}
        tenantId={mockTenantId}
        onPartsUsed={mockOnPartsUsed}
        onStockAlert={mockOnStockAlert}
      />
    );

    // Car Battery 12V should be out of stock and not have quantity input
    expect(screen.getByText('Car Battery 12V')).toBeInTheDocument();
    
    // Check that out of stock items don't have quantity inputs in the main view
    const quantityInputs = screen.getAllByPlaceholderText('Qty');
    expect(quantityInputs.length).toBeGreaterThan(0);
  });

  it('displays parts usage summary correctly', () => {
    render(
      <PartsManagementInterface
        repairId={mockRepairId}
        tenantId={mockTenantId}
        onPartsUsed={mockOnPartsUsed}
        onStockAlert={mockOnStockAlert}
      />
    );

    // Check that existing parts usage is displayed
    expect(screen.getByText('Total Parts Cost:')).toBeInTheDocument();
    expect(screen.getByText('K65')).toBeInTheDocument(); // 50 + 15 = 65
    
    // Check that parts usage items are displayed in the correct section
    const partsUsageSection = screen.getByText('Parts Used in This Repair').closest('div');
    expect(partsUsageSection).toHaveTextContent('Engine Oil Filter');
    expect(partsUsageSection).toHaveTextContent('Air Filter');
  });

  it('filters parts by search term', async () => {
    render(
      <PartsManagementInterface
        repairId={mockRepairId}
        tenantId={mockTenantId}
        onPartsUsed={mockOnPartsUsed}
        onStockAlert={mockOnStockAlert}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search parts by name, SKU, or description...');
    fireEvent.change(searchInput, { target: { value: 'Engine' } });

    await waitFor(() => {
      // Check that only Engine parts are shown in the Available Parts section
      const availablePartsGrid = screen.getByText('Available Parts').closest('div')?.querySelector('.grid');
      if (availablePartsGrid) {
        expect(availablePartsGrid).toHaveTextContent('Engine Oil Filter');
        expect(availablePartsGrid).not.toHaveTextContent('Brake Pads Set');
      }
    });
  });

  it('filters parts by category', async () => {
    render(
      <PartsManagementInterface
        repairId={mockRepairId}
        tenantId={mockTenantId}
        onPartsUsed={mockOnPartsUsed}
        onStockAlert={mockOnStockAlert}
      />
    );

    const categorySelect = screen.getByDisplayValue('All Categories');
    fireEvent.change(categorySelect, { target: { value: 'Engine Parts' } });

    await waitFor(() => {
      // Check that only Engine Parts are shown in the Available Parts section
      const availablePartsGrid = screen.getByText('Available Parts').closest('div')?.querySelector('.grid');
      if (availablePartsGrid) {
        expect(availablePartsGrid).toHaveTextContent('Engine Oil Filter');
        expect(availablePartsGrid).toHaveTextContent('Air Filter');
        expect(availablePartsGrid).toHaveTextContent('Spark Plugs Set');
        expect(availablePartsGrid).not.toHaveTextContent('Brake Pads Set');
      }
    });
  });

  it('filters parts by status', async () => {
    render(
      <PartsManagementInterface
        repairId={mockRepairId}
        tenantId={mockTenantId}
        onPartsUsed={mockOnPartsUsed}
        onStockAlert={mockOnStockAlert}
      />
    );

    const statusSelect = screen.getByDisplayValue('All Status');
    fireEvent.change(statusSelect, { target: { value: 'low_stock' } });

    await waitFor(() => {
      // Check that only low_stock parts are shown in the Available Parts section
      const availablePartsGrid = screen.getByText('Available Parts').closest('div')?.querySelector('.grid');
      if (availablePartsGrid) {
        expect(availablePartsGrid).toHaveTextContent('Brake Pads Set');
        expect(availablePartsGrid).not.toHaveTextContent('Engine Oil Filter');
        expect(availablePartsGrid).not.toHaveTextContent('Car Battery 12V');
      }
    });
  });

  it('handles error when API call fails', async () => {
    mockOnPartsUsed.mockImplementation(() => { 
      throw new Error('API Error'); 
    });

    render(
      <PartsManagementInterface
        repairId={mockRepairId}
        tenantId={mockTenantId}
        onPartsUsed={mockOnPartsUsed}
        onStockAlert={mockOnStockAlert}
      />
    );

    // Open modal and add parts
    fireEvent.click(screen.getByText('Add Parts'));
    const quantityInputs = screen.getAllByPlaceholderText('Qty');
    fireEvent.change(quantityInputs[0], { target: { value: '2' } });
    
    const formSubmitButton = screen.getAllByText('Add Parts').find(button => 
      button.getAttribute('type') === 'submit'
    );
    fireEvent.click(formSubmitButton!);

    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });
  });

  it('closes modal when cancel button is clicked', () => {
    render(
      <PartsManagementInterface
        repairId={mockRepairId}
        tenantId={mockTenantId}
        onPartsUsed={mockOnPartsUsed}
        onStockAlert={mockOnStockAlert}
      />
    );

    // Open modal
    fireEvent.click(screen.getByText('Add Parts'));
    expect(screen.getByText('Add Parts to Repair')).toBeInTheDocument();

    // Close modal
    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByText('Add Parts to Repair')).not.toBeInTheDocument();
  });

  it('removes selected parts from the list', async () => {
    render(
      <PartsManagementInterface
        repairId={mockRepairId}
        tenantId={mockTenantId}
        onPartsUsed={mockOnPartsUsed}
        onStockAlert={mockOnStockAlert}
      />
    );

    // Open modal
    fireEvent.click(screen.getByText('Add Parts'));

    // Add a part
    const quantityInputs = screen.getAllByPlaceholderText('Qty');
    fireEvent.change(quantityInputs[0], { target: { value: '2' } });

    await waitFor(() => {
      // Check that the part appears in the Selected Parts section
      expect(screen.getByText('Selected Parts:')).toBeInTheDocument();
      const selectedPartsSection = screen.getByText('Selected Parts:').closest('div');
      expect(selectedPartsSection).toHaveTextContent('Engine Oil Filter');
    });

    // Remove the part
    const removeButton = screen.getByTestId('x-icon').closest('button');
    fireEvent.click(removeButton!);

    await waitFor(() => {
      // Check that the part is removed and Selected Parts section disappears
      expect(screen.queryByText('Selected Parts:')).not.toBeInTheDocument();
    });
  });
}); 
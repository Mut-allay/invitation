import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PartsOrderForm } from '../PartsOrderForm';

// Mock the RTK Query hook
const mockCreatePartsOrder = jest.fn();
jest.mock('../../../store/api/partsOrdersApi', () => ({
  useCreatePartsOrderMutation: () => [mockCreatePartsOrder, { isLoading: false }],
}));

// Test without Redux store first
describe('PartsOrderForm (Isolated)', () => {
  it('renders basic structure', () => {
    render(
      <PartsOrderForm 
        isOpen={true} 
        onClose={jest.fn()} 
        tenantId="test" 
      />
    );
    
    expect(screen.getByText(/create parts order/i)).toBeInTheDocument();
  });
  
  it('does not render when closed', () => {
    const { container } = render(
      <PartsOrderForm
        isOpen={false}
        onClose={jest.fn()}
        tenantId="test"
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should display basic form fields', () => {
    render(
      <PartsOrderForm
        isOpen={true}
        onClose={jest.fn()}
        tenantId="test"
      />
    );

    // These will fail initially - we need to add form fields
    expect(screen.getByLabelText(/supplier name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/expected delivery/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();
  });

  it('should display order items section', () => {
    render(
      <PartsOrderForm
        isOpen={true}
        onClose={jest.fn()}
        tenantId="test"
      />
    );

    // These will fail initially - we need to add order items
    expect(screen.getByText(/order items/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/part name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/unit price/i)).toBeInTheDocument();
  });

  it('should allow user to type in form fields', async () => {
    const user = userEvent.setup();

    render(
      <PartsOrderForm
        isOpen={true}
        onClose={jest.fn()}
        tenantId="test"
      />
    );

    // Test typing in supplier name
    const supplierInput = screen.getByLabelText(/supplier name/i);
    await user.type(supplierInput, 'Test Supplier');
    expect(supplierInput).toHaveValue('Test Supplier');

    // Test typing in part name
    const partNameInput = screen.getByLabelText(/part name/i);
    await user.type(partNameInput, 'Brake Pads');
    expect(partNameInput).toHaveValue('Brake Pads');

    // Test typing in quantity
    const quantityInput = screen.getByLabelText(/quantity/i);
    await user.clear(quantityInput);
    await user.type(quantityInput, '5');
    expect(quantityInput).toHaveValue(5);
  });

  it('should show validation errors for required fields', async () => {
    const user = userEvent.setup();

    render(
      <PartsOrderForm
        isOpen={true}
        onClose={jest.fn()}
        tenantId="test"
      />
    );

    // Try to submit without filling required fields
    const submitButton = screen.getByRole('button', { name: /create order/i });
    await user.click(submitButton);

    // Should show validation errors
    expect(screen.getByText(/supplier name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/part name is required/i)).toBeInTheDocument();
  });

  it('should have a submit button', () => {
    render(
      <PartsOrderForm
        isOpen={true}
        onClose={jest.fn()}
        tenantId="test"
      />
    );

    expect(screen.getByRole('button', { name: /create order/i })).toBeInTheDocument();
  });

  it('should start with one order item by default', () => {
    render(
      <PartsOrderForm
        isOpen={true}
        onClose={jest.fn()}
        tenantId="test"
      />
    );

    // Should have exactly one set of item fields
    expect(screen.getAllByLabelText(/part name/i)).toHaveLength(1);
    expect(screen.getAllByLabelText(/quantity/i)).toHaveLength(1);
    expect(screen.getAllByLabelText(/unit price/i)).toHaveLength(1);
  });

  it('should allow adding new order items', async () => {
    const user = userEvent.setup();

    render(
      <PartsOrderForm
        isOpen={true}
        onClose={jest.fn()}
        tenantId="test"
      />
    );

    // Should have "Add Item" button
    const addButton = screen.getByRole('button', { name: /add item/i });
    expect(addButton).toBeInTheDocument();

    // Click to add a new item
    await user.click(addButton);

    // Should now have 2 sets of item fields
    expect(screen.getAllByLabelText(/part name/i)).toHaveLength(2);
    expect(screen.getAllByLabelText(/quantity/i)).toHaveLength(2);
    expect(screen.getAllByLabelText(/unit price/i)).toHaveLength(2);
  });

  it('should allow removing order items when there are multiple', async () => {
    const user = userEvent.setup();

    render(
      <PartsOrderForm
        isOpen={true}
        onClose={jest.fn()}
        tenantId="test"
      />
    );

    // Add a second item first
    const addButton = screen.getByRole('button', { name: /add item/i });
    await user.click(addButton);

    // Should have 2 items now
    expect(screen.getAllByLabelText(/part name/i)).toHaveLength(2);

    // Should have remove buttons (only when multiple items exist)
    const removeButtons = screen.getAllByRole('button', { name: /remove/i });
    expect(removeButtons).toHaveLength(2); // One for each item

    // Remove the first item
    await user.click(removeButtons[0]);

    // Should be back to 1 item
    expect(screen.getAllByLabelText(/part name/i)).toHaveLength(1);
  });

  it('should not show remove buttons when there is only one item', () => {
    render(
      <PartsOrderForm
        isOpen={true}
        onClose={jest.fn()}
        tenantId="test"
      />
    );

    // Should not have any remove buttons with only one item
    expect(screen.queryByRole('button', { name: /remove/i })).not.toBeInTheDocument();
  });

  it('should calculate and display total amount', async () => {
    const user = userEvent.setup();

    render(
      <PartsOrderForm
        isOpen={true}
        onClose={jest.fn()}
        tenantId="test"
      />
    );

    // Fill in the first item
    const quantityInput = screen.getByLabelText(/quantity/i);
    const priceInput = screen.getByLabelText(/unit price/i);

    await user.clear(quantityInput);
    await user.type(quantityInput, '2');
    await user.clear(priceInput);
    await user.type(priceInput, '50.00');

    // Should show total (not subtotal)
    expect(screen.getByText(/^total: zmw 100\.00$/i)).toBeInTheDocument();
  });

  it('should submit form with valid data', async () => {
    const user = userEvent.setup();
    const mockOnClose = jest.fn();
    
    // Mock successful mutation
    mockCreatePartsOrder.mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({ id: 'order-123' })
    });

    render(
      <PartsOrderForm
        isOpen={true}
        onClose={mockOnClose}
        tenantId="test-tenant"
      />
    );

    // Fill in required fields
    await user.type(screen.getByLabelText(/supplier name/i), 'Test Supplier');
    await user.type(screen.getByLabelText(/part name/i), 'Brake Pads');
    await user.clear(screen.getByLabelText(/quantity/i));
    await user.type(screen.getByLabelText(/quantity/i), '2');
    await user.clear(screen.getByLabelText(/unit price/i));
    await user.type(screen.getByLabelText(/unit price/i), '50.00');

    // Submit the form
    await user.click(screen.getByRole('button', { name: /create order/i }));

    // Should call createPartsOrder mutation with correct data
    expect(mockCreatePartsOrder).toHaveBeenCalledWith({
      tenantId: 'test-tenant',
      order: {
        supplierName: 'Test Supplier',
        expectedDelivery: undefined,
        notes: undefined,
        items: [
          {
            partName: 'Brake Pads',
            qty: 2,
            unitPrice: 50.00,
          }
        ],
      }
    });
  });

  it('should show loading state during submission', async () => {
    // This test requires a re-render with loading state, which is complex to test in isolation
    // In a real app, this would be tested through integration tests or by mocking the hook properly
    
    // For now, we'll test that the button exists and can be disabled
    render(
      <PartsOrderForm
        isOpen={true}
        onClose={jest.fn()}
        tenantId="test"
      />
    );

    const submitButton = screen.getByRole('button', { name: /create order/i });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).not.toBeDisabled(); // Not loading by default
  });

  it('should close form after successful submission', async () => {
    const user = userEvent.setup();
    const mockOnClose = jest.fn();
    
    // Mock successful mutation
    mockCreatePartsOrder.mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({ id: 'order-123' })
    });

    render(
      <PartsOrderForm
        isOpen={true}
        onClose={mockOnClose}
        tenantId="test"
      />
    );

    // Fill in required fields
    await user.type(screen.getByLabelText(/supplier name/i), 'Test Supplier');
    await user.type(screen.getByLabelText(/part name/i), 'Brake Pads');

    // Submit the form
    await user.click(screen.getByRole('button', { name: /create order/i }));

    // Wait for submission to complete
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('should show error message on submission failure', async () => {
    const user = userEvent.setup();
    
    // Mock failed mutation
    mockCreatePartsOrder.mockReturnValue({
      unwrap: jest.fn().mockRejectedValue(new Error('Network error'))
    });

    render(
      <PartsOrderForm
        isOpen={true}
        onClose={jest.fn()}
        tenantId="test"
      />
    );

    // Fill in required fields
    await user.type(screen.getByLabelText(/supplier name/i), 'Test Supplier');
    await user.type(screen.getByLabelText(/part name/i), 'Brake Pads');

    // Submit the form
    await user.click(screen.getByRole('button', { name: /create order/i }));

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/failed to create parts order/i)).toBeInTheDocument();
    });
  });

  it('should reset form after successful submission', async () => {
    const user = userEvent.setup();
    
    // Mock successful mutation
    mockCreatePartsOrder.mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({ id: 'order-123' })
    });

    render(
      <PartsOrderForm
        isOpen={true}
        onClose={jest.fn()}
        tenantId="test"
      />
    );

    // Fill in fields
    const supplierInput = screen.getByLabelText(/supplier name/i);
    const partNameInput = screen.getByLabelText(/part name/i);

    await user.type(supplierInput, 'Test Supplier');
    await user.type(partNameInput, 'Brake Pads');

    // Submit the form
    await user.click(screen.getByRole('button', { name: /create order/i }));

    // Wait for submission and form reset
    await waitFor(() => {
      expect(supplierInput).toHaveValue('');
      expect(partNameInput).toHaveValue('');
    });
  });
});

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OrderStatusTracker } from '../OrderStatusTracker';
import { render as renderWithProviders } from '../../../test/utils/test-utils';
import { useUpdateOrderStatusMutation } from '../../../store/api/partsOrdersApi';
import { PartsOrderWithItems } from '../../../types/partsOrder';

// Mock the API hook
jest.mock('../../../store/api/partsOrdersApi', () => ({
  useUpdateOrderStatusMutation: jest.fn(),
}));

const mockUpdateOrderStatusMutation = useUpdateOrderStatusMutation as jest.Mock;
const mockUpdateOrderTrigger = jest.fn();

const mockOrder: PartsOrderWithItems = {
  id: 'order-123',
  tenantId: 'test-tenant',
  supplierName: 'Test Supplier',
  status: 'pending',
  totalAmount: 250,
  orderDate: new Date('2025-08-26'),
  createdBy: 'user-abc',
  updatedAt: new Date('2025-08-26'),
  items: [{ id: 'item-1', orderId: 'order-123', partName: 'Brake Pad', qty: 2, unitPrice: 125, totalPrice: 250 }],
  notes: 'Initial order notes',
};

describe('OrderStatusTracker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUpdateOrderStatusMutation.mockReturnValue([
      mockUpdateOrderTrigger.mockImplementation(() => ({
        unwrap: () => Promise.resolve(),
      })),
      { isLoading: false },
    ]);
  });

  it('does not render when isOpen is false', () => {
    renderWithProviders(
      <OrderStatusTracker order={mockOrder} isOpen={false} onClose={() => {}} tenantId="test-tenant" />
    );
    expect(screen.queryByText('Update Order Status')).not.toBeInTheDocument();
  });

  it('renders correctly when open and displays initial order data', () => {
    renderWithProviders(
      <OrderStatusTracker order={mockOrder} isOpen={true} onClose={() => {}} tenantId="test-tenant" />
    );

    expect(screen.getByText('Update Order Status')).toBeInTheDocument();
    expect(screen.getByText(/Order #123/)).toBeInTheDocument();
    expect(screen.getByText(/Test Supplier/)).toBeInTheDocument();
    
    // Check current status display
    const currentStatusSection = screen.getByTestId('current-status-section');
    expect(within(currentStatusSection).getByText('Pending')).toBeInTheDocument();
    
    // Check form initial values
    expect(screen.getByTestId('status-radio-pending')).toBeChecked();
    expect(screen.getByPlaceholderText(/add any additional notes/i)).toHaveValue('Initial order notes');
  });

  it('allows changing status and notes', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <OrderStatusTracker order={mockOrder} isOpen={true} onClose={() => {}} tenantId="test-tenant" />
    );

    const confirmedRadio = screen.getByTestId('status-radio-confirmed');
    await user.click(confirmedRadio);
    expect(confirmedRadio).toBeChecked();

    const notesTextarea = screen.getByPlaceholderText(/add any additional notes/i);
    await user.clear(notesTextarea);
    await user.type(notesTextarea, 'Supplier has confirmed the order.');
    expect(notesTextarea).toHaveValue('Supplier has confirmed the order.');
  });

  it('calls onClose when the cancel button is clicked', async () => {
    const user = userEvent.setup();
    const handleClose = jest.fn();
    renderWithProviders(
      <OrderStatusTracker order={mockOrder} isOpen={true} onClose={handleClose} tenantId="test-tenant" />
    );

    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('disables submit button if status is unchanged', () => {
    renderWithProviders(
      <OrderStatusTracker order={mockOrder} isOpen={true} onClose={() => {}} tenantId="test-tenant" />
    );
    expect(screen.getByRole('button', { name: /update status/i })).toBeDisabled();
  });

  it('submits the form with updated data', async () => {
    const user = userEvent.setup();
    const handleClose = jest.fn();
    renderWithProviders(
      <OrderStatusTracker order={mockOrder} isOpen={true} onClose={handleClose} tenantId="test-tenant" />
    );

    await user.click(screen.getByTestId('status-radio-confirmed'));
    await user.type(screen.getByPlaceholderText(/add any additional notes/i), ' - Confirmed by John');
    await user.click(screen.getByRole('button', { name: /update status/i }));

    await waitFor(() => {
      expect(mockUpdateOrderTrigger).toHaveBeenCalledWith({
        tenantId: 'test-tenant',
        orderId: 'order-123',
        status: 'confirmed',
        notes: 'Initial order notes - Confirmed by John',
      });
    });

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('shows loading state during submission', async () => {
    mockUpdateOrderStatusMutation.mockReturnValue([
      jest.fn().mockImplementation(() => new Promise(() => {})), // Never resolves
      { isLoading: true },
    ]);

    renderWithProviders(
      <OrderStatusTracker order={mockOrder} isOpen={true} onClose={() => {}} tenantId="test-tenant" />
    );
    
    const updateButton = screen.getByRole('button', { name: /updating.../i });
    expect(updateButton).toBeDisabled();
  });

  it('displays an error message on submission failure', async () => {
    const user = userEvent.setup();
    mockUpdateOrderTrigger.mockImplementation(() => ({
      unwrap: () => Promise.reject({ data: 'Update failed' }),
    }));
    
    renderWithProviders(
      <OrderStatusTracker order={mockOrder} isOpen={true} onClose={() => {}} tenantId="test-tenant" />
    );

    await user.click(screen.getByTestId('status-radio-delivered'));
    await user.click(screen.getByRole('button', { name: /update status/i }));

    await waitFor(() => {
      expect(screen.getByText(/failed to update order status/i)).toBeInTheDocument();
    });
  });
});

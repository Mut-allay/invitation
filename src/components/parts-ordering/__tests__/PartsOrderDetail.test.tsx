import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PartsOrderDetail } from '../PartsOrderDetail';
import { PartsOrderWithItems } from '../../../types/partsOrder';

const mockOrder: PartsOrderWithItems = {
  id: 'order-xyz789',
  tenantId: 'test-tenant',
  supplierName: 'Zambia Auto Parts',
  status: 'confirmed',
  totalAmount: 475.50,
  orderDate: new Date('2025-08-20T10:00:00Z'),
  expectedDelivery: new Date('2025-08-30T10:00:00Z'),
  createdBy: 'user-xyz',
  updatedAt: new Date('2025-08-21T11:00:00Z'),
  items: [
    { id: 'item-1', orderId: 'order-xyz789', partName: 'Alternator', qty: 1, unitPrice: 350, totalPrice: 350 },
    { id: 'item-2', orderId: 'order-xyz789', partName: 'Fan Belt', qty: 1, unitPrice: 125.50, totalPrice: 125.50 },
  ],
  notes: 'Urgent order for customer vehicle.',
};

describe('PartsOrderDetail', () => {
  it('does not render when isOpen is false', () => {
    render(<PartsOrderDetail order={mockOrder} isOpen={false} onClose={() => {}} />);
    expect(screen.queryByText('Parts Order Details')).not.toBeInTheDocument();
  });

  it('does not render when order is null', () => {
    render(<PartsOrderDetail order={null} isOpen={true} onClose={() => {}} />);
    expect(screen.queryByText('Parts Order Details')).not.toBeInTheDocument();
  });

  it('renders all order details correctly', () => {
    render(<PartsOrderDetail order={mockOrder} isOpen={true} onClose={() => {}} />);

    // Header
    expect(screen.getByText('Parts Order Details')).toBeInTheDocument();
    expect(screen.getByText(/XYZ789/)).toBeInTheDocument();

    // Order Info
    expect(screen.getByText('Zambia Auto Parts')).toBeInTheDocument();
    expect(screen.getByText('August 20, 2025')).toBeInTheDocument();
    expect(screen.getByText('August 30, 2025')).toBeInTheDocument();

    // Status & Summary
    expect(screen.getByText('Confirmed')).toBeInTheDocument();
    expect(screen.getByText('2 items')).toBeInTheDocument();
    expect(screen.getAllByText('ZMW 475.50').length).toBeGreaterThan(0);

    // Notes
    expect(screen.getByText('Notes')).toBeInTheDocument();
    expect(screen.getByText('Urgent order for customer vehicle.')).toBeInTheDocument();

    // Items Table
    const table = screen.getByRole('table');
    expect(within(table).getByText('Alternator')).toBeInTheDocument();
    expect(within(table).getByText('Fan Belt')).toBeInTheDocument();
    expect(within(table).getAllByText('ZMW 350.00').length).toBe(2);
    expect(within(table).getAllByText('ZMW 125.50').length).toBe(2);
    expect(within(table).getByText('ZMW 475.50')).toBeInTheDocument(); // Total in footer
  });

  it('handles missing optional fields gracefully', () => {
    const orderWithoutOptional = { ...mockOrder, expectedDelivery: undefined, notes: undefined };
    render(<PartsOrderDetail order={orderWithoutOptional} isOpen={true} onClose={() => {}} />);

    expect(screen.queryByText('Expected Delivery')).not.toBeInTheDocument();
    expect(screen.queryByText('Notes')).not.toBeInTheDocument();
  });

  it('calls onClose when the close button is clicked', async () => {
    const user = userEvent.setup();
    const handleClose = jest.fn();
    render(<PartsOrderDetail order={mockOrder} isOpen={true} onClose={handleClose} />);

    await user.click(screen.getByRole('button', { name: /close/i }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the X icon is clicked', async () => {
    const user = userEvent.setup();
    const handleClose = jest.fn();
    render(<PartsOrderDetail order={mockOrder} isOpen={true} onClose={handleClose} />);

    await user.click(screen.getByTestId('order-detail-close-button'));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});

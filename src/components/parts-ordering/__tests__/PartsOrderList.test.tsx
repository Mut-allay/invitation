import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PartsOrderList } from '../PartsOrderList';
import { useGetPartsOrdersQuery, useDeletePartsOrderMutation, useProcessOrderFulfillmentMutation } from '../../../store/api/partsOrdersApi';

// Mock the API hooks


jest.mock('../../../store/api/partsOrdersApi', () => ({
  useGetPartsOrdersQuery: jest.fn(),
  useDeletePartsOrderMutation: jest.fn(),
  useProcessOrderFulfillmentMutation: jest.fn(),
}));

describe('PartsOrderList', () => {
  const mockOnViewOrder = jest.fn();
  const mockOnEditOrder = jest.fn();

  const mockOrders = [
    {
      id: 'order-1',
      tenantId: 'demo-tenant',
      supplierName: 'Test Supplier 1',
      status: 'pending' as const,
      totalAmount: 150.00,
      orderDate: new Date('2025-01-01'),
      expectedDelivery: new Date('2025-01-15'),
      notes: 'Test order 1',
      createdBy: 'user-1',
      updatedAt: new Date('2025-01-01'),
      items: [
        {
          id: 'item-1',
          orderId: 'order-1',
          partName: 'Brake Pads',
          qty: 2,
          unitPrice: 50.00,
          totalPrice: 100.00,
        },
      ],
    },
    {
      id: 'order-2',
      tenantId: 'demo-tenant',
      supplierName: 'Test Supplier 2',
      status: 'delivered' as const,
      totalAmount: 75.00,
      orderDate: new Date('2025-01-02'),
      expectedDelivery: new Date('2025-01-16'),
      notes: 'Test order 2',
      createdBy: 'user-1',
      updatedAt: new Date('2025-01-02'),
      items: [
        {
          id: 'item-2',
          orderId: 'order-2',
          partName: 'Oil Filter',
          qty: 1,
          unitPrice: 75.00,
          totalPrice: 75.00,
        },
      ],
    },
    {
      id: 'order-3',
      tenantId: 'demo-tenant',
      supplierName: 'Test Supplier 3',
      status: 'confirmed' as const,
      totalAmount: 100.00,
      orderDate: new Date('2025-01-03'),
      expectedDelivery: new Date('2025-01-17'),
      notes: 'Test order 3',
      createdBy: 'user-1',
      updatedAt: new Date('2025-01-03'),
      items: [
        {
          id: 'item-3',
          orderId: 'order-3',
          partName: 'Spark Plugs',
          qty: 4,
          unitPrice: 25.00,
          totalPrice: 100.00,
        },
      ],
    },
  ];

  const defaultProps = {
    tenantId: 'demo-tenant',
    onViewOrder: jest.fn(),
    onEditOrder: jest.fn(),
  };

  // Create reusable mock for the delete trigger function
  const mockDeleteOrderTrigger = jest.fn();

  beforeEach(() => {
    // Reset mocks before each test to ensure isolation
    (useGetPartsOrdersQuery as jest.Mock).mockClear();
    (useDeletePartsOrderMutation as jest.Mock).mockClear();
    (useProcessOrderFulfillmentMutation as jest.Mock).mockClear();
    mockDeleteOrderTrigger.mockClear();
    jest.clearAllMocks();

    // Set default mock return values
    (useGetPartsOrdersQuery as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    // Provide the mock return value for the mutation hook (an array)
    (useDeletePartsOrderMutation as jest.Mock).mockReturnValue([
      mockDeleteOrderTrigger,
      { isLoading: false },
    ]);

    // Mock the processOrderFulfillment mutation
    (useProcessOrderFulfillmentMutation as jest.Mock).mockReturnValue([
      jest.fn(),
      { isLoading: false },
    ]);
  });

  it('should render loading state', () => {
    // Set loading state
    (useGetPartsOrdersQuery as jest.Mock).mockReturnValue({
      data: [],
      isLoading: true,
      error: null,
    });

    render(<PartsOrderList {...defaultProps} />);
    expect(screen.getByText(/loading parts orders/i)).toBeInTheDocument();
  });

  it('should render error state', () => {
    // Set error state
    (useGetPartsOrdersQuery as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      error: { message: 'Failed to load' },
    });

    render(<PartsOrderList {...defaultProps} />);
    expect(screen.getByText(/failed to load parts orders/i)).toBeInTheDocument();
  });

  it('should render empty state when no orders', () => {
    // This will fail initially
    render(<PartsOrderList {...defaultProps} />);
    expect(screen.getByText(/no parts orders found/i)).toBeInTheDocument();
  });

  it('should render list of orders', () => {
    // Set orders data
    (useGetPartsOrdersQuery as jest.Mock).mockReturnValue({
      data: mockOrders,
      isLoading: false,
      error: null,
    });

    render(<PartsOrderList {...defaultProps} />);

    expect(screen.getByText('Test Supplier 1')).toBeInTheDocument();
    expect(screen.getByText('Test Supplier 2')).toBeInTheDocument();
    expect(screen.getByText(/zmw 150\.00/i)).toBeInTheDocument();
    expect(screen.getByText(/zmw 75\.00/i)).toBeInTheDocument();
  });

  it('should display status badges correctly', () => {
    // Set up mock data with different statuses
    (useGetPartsOrdersQuery as jest.Mock).mockReturnValue({
      data: mockOrders,
      isLoading: false,
      error: null,
    });

    render(
      <PartsOrderList
        tenantId="test-tenant"
        onViewOrder={mockOnViewOrder}
        onEditOrder={mockOnEditOrder}
      />
    );

    // Check that status badges are displayed with proper styling
    const pendingStatus = screen.getByText('pending');
    const confirmedStatus = screen.getByText('confirmed');
    const deliveredStatus = screen.getByText('delivered');

    expect(pendingStatus).toBeInTheDocument();
    expect(confirmedStatus).toBeInTheDocument();
    expect(deliveredStatus).toBeInTheDocument();

    // Check that they have the expected CSS classes for styling
    expect(pendingStatus.closest('.status-pending')).toBeInTheDocument();
    expect(confirmedStatus.closest('.status-confirmed')).toBeInTheDocument();
    expect(deliveredStatus.closest('.status-delivered')).toBeInTheDocument();
  });

  it('should filter orders by status', async () => {
    const user = userEvent.setup();

    // Set orders data
    (useGetPartsOrdersQuery as jest.Mock).mockReturnValue({
      data: mockOrders,
      isLoading: false,
      error: null,
    });

    render(<PartsOrderList {...defaultProps} />);

    const statusFilter = screen.getByDisplayValue(/all orders/i);
    await user.selectOptions(statusFilter, 'pending');

    expect(screen.getByText('Test Supplier 1')).toBeInTheDocument();
    expect(screen.queryByText('Test Supplier 2')).not.toBeInTheDocument();
  });

  it('should search orders by supplier name', async () => {
    const user = userEvent.setup();

    // Set orders data
    (useGetPartsOrdersQuery as jest.Mock).mockReturnValue({
      data: mockOrders,
      isLoading: false,
      error: null,
    });

    render(<PartsOrderList {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText(/search by supplier name/i);
    await user.type(searchInput, 'Supplier 1');

    expect(screen.getByText('Test Supplier 1')).toBeInTheDocument();
    expect(screen.queryByText('Test Supplier 2')).not.toBeInTheDocument();
  });

  it('should call onViewOrder when view button clicked', async () => {
    const user = userEvent.setup();

    // Set orders data
    (useGetPartsOrdersQuery as jest.Mock).mockReturnValue({
      data: mockOrders,
      isLoading: false,
      error: null,
    });

    render(<PartsOrderList {...defaultProps} />);

    const viewButton = screen.getAllByTitle(/view details/i)[0];
    await user.click(viewButton);

    expect(defaultProps.onViewOrder).toHaveBeenCalledWith(mockOrders[0]);
  });

  it('should call onEditOrder when edit button clicked', async () => {
    const user = userEvent.setup();

    // Set orders data
    (useGetPartsOrdersQuery as jest.Mock).mockReturnValue({
      data: mockOrders,
      isLoading: false,
      error: null,
    });

    render(<PartsOrderList {...defaultProps} />);

    const editButton = screen.getAllByTitle(/edit status/i)[0];
    await user.click(editButton);

    expect(defaultProps.onEditOrder).toHaveBeenCalledWith(mockOrders[0]);
  });



  it('should display summary statistics', () => {
    // Set up mock data
    (useGetPartsOrdersQuery as jest.Mock).mockReturnValue({
      data: mockOrders,
      isLoading: false,
      error: null,
    });

    render(
      <PartsOrderList
        tenantId="test-tenant"
        onViewOrder={mockOnViewOrder}
        onEditOrder={mockOnEditOrder}
      />
    );

    // Check that summary statistics are displayed
    expect(screen.getByText(/total orders: 3/i)).toBeInTheDocument();
    expect(screen.getByText(/total value: zmw 325\.00/i)).toBeInTheDocument();
  });
});

import React, { useState, useMemo } from 'react';
import { PartsOrderWithItems } from '../../types/partsOrder';
import { useGetPartsOrdersQuery, useDeletePartsOrderMutation } from '../../store/api/partsOrdersApi';

interface PartsOrderListProps {
  tenantId: string;
  onViewOrder: (order: PartsOrderWithItems) => void;
  onEditOrder: (order: PartsOrderWithItems) => void;
}

export const PartsOrderList: React.FC<PartsOrderListProps> = ({
  tenantId,
  onViewOrder,
  onEditOrder,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all orders');

  // Use RTK Query to fetch orders
  const { data: orders = [], isLoading, error } = useGetPartsOrdersQuery(tenantId);
  const [deleteOrder] = useDeletePartsOrderMutation();

  // Filter orders based on search term and status
  const filteredOrders = useMemo(() => {
    let filtered = orders;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all orders') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    return filtered;
  }, [orders, searchTerm, statusFilter]);

  const handleDeleteOrder = async (order: PartsOrderWithItems) => {
    if (window.confirm(`Are you sure you want to delete order from ${order.supplierName}?`)) {
      try {
        await deleteOrder({ tenantId, orderId: order.id }).unwrap();
      } catch (error) {
        console.error('Failed to delete order:', error);
      }
    }
  };

  if (isLoading) {
    return <div>Loading parts orders...</div>;
  }

  if (error) {
    return <div>Failed to load parts orders. Please try again.</div>;
  }

  if (orders.length === 0) {
    return <div>No parts orders found.</div>;
  }

  return (
    <div>
      {/* Search and Filter Controls */}
      <div>
        <input
          placeholder="Search by supplier name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all orders">All Orders</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders List */}
      <div>
        {filteredOrders.map((order) => (
          <div key={order.id}>
            <div>
              <h3>{order.supplierName}</h3>
              <p>Status: <span className={`status-${order.status}`}>{order.status}</span></p>
              <p>Total: ZMW {order.totalAmount.toFixed(2)}</p>
              <p>Order Date: {order.orderDate.toLocaleDateString()}</p>
              {order.expectedDelivery && (
                <p>Expected Delivery: {order.expectedDelivery.toLocaleDateString()}</p>
              )}
            </div>
            <div>
              <button
                title="View Details"
                onClick={() => onViewOrder(order)}
              >
                View
              </button>
              <button
                title="Edit Status"
                onClick={() => onEditOrder(order)}
              >
                Edit
              </button>
              <button
                title="Delete Order"
                onClick={() => handleDeleteOrder(order)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Statistics */}
      <div>
        <h3>Summary</h3>
        <p>Total Orders: {filteredOrders.length}</p>
        <p>Total Value: ZMW {filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0).toFixed(2)}</p>
      </div>
    </div>
  );
};

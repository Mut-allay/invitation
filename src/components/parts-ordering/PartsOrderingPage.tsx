import React, { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { PartsOrderForm } from './PartsOrderForm';
import { PartsOrderList } from './PartsOrderList';
import { PartsOrderDetail } from './PartsOrderDetail';
import { OrderStatusTracker } from './OrderStatusTracker';
import { PartsOrderWithItems } from '../../types/partsOrder';

interface PartsOrderingPageProps {
  tenantId: string;
}

export const PartsOrderingPage: React.FC<PartsOrderingPageProps> = ({ tenantId }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PartsOrderWithItems | null>(null);

  const handleViewOrder = (order: PartsOrderWithItems) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handleEditOrder = (order: PartsOrderWithItems) => {
    setSelectedOrder(order);
    setShowStatusModal(true);
  };

  const handleCloseModals = () => {
    setShowCreateForm(false);
    setShowDetailModal(false);
    setShowStatusModal(false);
    setSelectedOrder(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Parts Ordering</h1>
          <p className="text-gray-600 mt-1">
            Manage parts orders from suppliers
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Order
        </button>
      </div>

      {/* Parts Orders List */}
      <PartsOrderList
        tenantId={tenantId}
        onViewOrder={handleViewOrder}
        onEditOrder={handleEditOrder}
      />

      {/* Modals */}
      <PartsOrderForm
        isOpen={showCreateForm}
        onClose={handleCloseModals}
        tenantId={tenantId}
      />

      <PartsOrderDetail
        order={selectedOrder}
        isOpen={showDetailModal}
        onClose={handleCloseModals}
      />

      <OrderStatusTracker
        order={selectedOrder}
        isOpen={showStatusModal}
        onClose={handleCloseModals}
        tenantId={tenantId}
      />
    </div>
  );
};

import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useUpdateOrderStatusMutation } from '../../store/api/partsOrdersApi';
import { PartsOrderWithItems, OrderStatusUpdate } from '../../types/partsOrder';

interface OrderStatusTrackerProps {
  order: PartsOrderWithItems | null;
  isOpen: boolean;
  onClose: () => void;
  tenantId: string;
}

export const OrderStatusTracker: React.FC<OrderStatusTrackerProps> = ({
  order,
  isOpen,
  onClose,
  tenantId,
}) => {
  const [updateOrderStatus, { isLoading }] = useUpdateOrderStatusMutation();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatusUpdate['status']>('pending');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (order) {
      setSelectedStatus(order.status);
      setNotes(order.notes || '');
    }
  }, [order]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!order) return;

    try {
      await updateOrderStatus({
        tenantId,
        orderId: order.id,
        status: selectedStatus,
        notes: notes.trim() || undefined,
      }).unwrap();
      
      onClose();
    } catch (error) {
      console.error('Failed to update order status:', error);
      setError('Failed to update order status. Please try again.');
    }
  };

  const getStatusInfo = (status: OrderStatusUpdate['status']) => {
    const statusInfo = {
      pending: {
        label: 'Pending',
        description: 'Order has been created and is awaiting confirmation',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
      },
      confirmed: {
        label: 'Confirmed',
        description: 'Order has been confirmed by the supplier',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
      },
      delivered: {
        label: 'Delivered',
        description: 'Order has been delivered and received',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
      },
      cancelled: {
        label: 'Cancelled',
        description: 'Order has been cancelled',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
      },
    };

    return statusInfo[status];
  };

  const statusOptions: OrderStatusUpdate['status'][] = ['pending', 'confirmed', 'delivered', 'cancelled'];

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Update Order Status</h2>
              <p className="text-gray-600 mt-1">
                Order #{order.id.split('-').pop()?.toUpperCase()} - {order.supplierName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Current Status */}
          <div className="mb-6" data-testid="current-status-section">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Current Status</h3>
            <div className={`p-4 rounded-lg border ${getStatusInfo(order.status).bgColor} ${getStatusInfo(order.status).borderColor}`}>
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full ${getStatusInfo(order.status).color.replace('text-', 'bg-')} mr-3`}></div>
                <div>
                  <p className={`font-medium ${getStatusInfo(order.status).color}`}>
                    {getStatusInfo(order.status).label}
                  </p>
                  <p className="text-sm text-gray-600">
                    {getStatusInfo(order.status).description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Status Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Update Status
              </label>
              <div className="space-y-3">
                {statusOptions.map((status) => {
                  const statusInfo = getStatusInfo(status);
                  return (
                    <label
                      key={status}
                      className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedStatus === status
                          ? `${statusInfo.bgColor} ${statusInfo.borderColor} border-2`
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="status"
                        value={status}
                        checked={selectedStatus === status}
                        onChange={(e) => setSelectedStatus(e.target.value as OrderStatusUpdate['status'])}
                        className="mt-1 mr-3"
                        data-testid={`status-radio-${status}`}
                      />
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full ${statusInfo.color.replace('text-', 'bg-')} mr-2`}></div>
                          <p className={`font-medium ${selectedStatus === status ? statusInfo.color : 'text-gray-900'}`}>
                            {statusInfo.label}
                          </p>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {statusInfo.description}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add any additional notes about this status update..."
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || selectedStatus === order.status}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </form>

          {/* Status Timeline Preview */}
          <div className="mt-6 pt-6 border-t">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Status Timeline</h4>
            <div className="flex items-center space-x-2">
              {statusOptions.slice(0, -1).map((status, index) => {
                const isActive = statusOptions.indexOf(selectedStatus) >= index;
                const isCurrent = selectedStatus === status;
                const statusInfo = getStatusInfo(status);
                
                return (
                  <React.Fragment key={status}>
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                          isCurrent
                            ? `${statusInfo.color.replace('text-', 'bg-')} text-white`
                            : isActive
                            ? 'bg-gray-400 text-white'
                            : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {index + 1}
                      </div>
                      <p className="text-xs text-gray-600 mt-1 text-center">
                        {statusInfo.label}
                      </p>
                    </div>
                    {index < statusOptions.length - 2 && (
                      <div
                        className={`flex-1 h-0.5 ${
                          statusOptions.indexOf(selectedStatus) > index ? 'bg-gray-400' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

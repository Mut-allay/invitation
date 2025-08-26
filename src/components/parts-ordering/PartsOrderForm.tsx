import React, { useState } from 'react';
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useCreatePartsOrderMutation } from '../../store/api/partsOrdersApi';
import { PartsOrderFormData } from '../../types/partsOrder';

export interface PartsOrderFormProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId: string;
}

interface OrderItem {
  partName: string;
  qty: number;
  unitPrice: number;
}

interface FormData {
  supplierName: string;
  expectedDelivery: string;
  notes: string;
  items: OrderItem[];
}

interface FormErrors {
  supplierName?: string;
  items?: string;
  submit?: string;
  [key: string]: string | undefined; // For dynamic item errors like item_0_partName
}

export const PartsOrderForm: React.FC<PartsOrderFormProps> = ({
  isOpen,
  onClose,
  tenantId,
}) => {
  const [createPartsOrder, { isLoading }] = useCreatePartsOrderMutation();
  
  const [formData, setFormData] = useState<FormData>({
    supplierName: '',
    expectedDelivery: '',
    notes: '',
    items: [{ partName: '', qty: 1, unitPrice: 0 }], // Start with one item
  });

  const [errors, setErrors] = useState<FormErrors>({});

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    const newErrors: FormErrors = {};

    if (!formData.supplierName.trim()) {
      newErrors.supplierName = 'Supplier name is required';
    }

    if (formData.items.length === 0) {
      newErrors.items = 'At least one item is required';
    }

    // Validate each item
    formData.items.forEach((item, index) => {
      if (!item.partName.trim()) {
        newErrors[`item_${index}_partName`] = 'Part name is required';
      }
      if (item.qty <= 0) {
        newErrors[`item_${index}_quantity`] = 'Quantity must be greater than 0';
      }
      if (item.unitPrice < 0) {
        newErrors[`item_${index}_unitPrice`] = 'Unit price cannot be negative';
      }
    });

    setErrors(newErrors);

    // If no errors, submit the form
    if (Object.keys(newErrors).length === 0) {
      try {
        // Convert form data to the expected format
        const orderData: PartsOrderFormData = {
          supplierName: formData.supplierName,
          expectedDelivery: formData.expectedDelivery ? new Date(formData.expectedDelivery) : undefined,
          notes: formData.notes.trim() || undefined,
          items: formData.items.map(item => ({
            partName: item.partName,
            qty: item.qty,
            unitPrice: item.unitPrice,
          })),
        };

        await createPartsOrder({ tenantId, order: orderData }).unwrap();

        // Reset form on successful submission
        setFormData({
          supplierName: '',
          expectedDelivery: '',
          notes: '',
          items: [{ partName: '', qty: 1, unitPrice: 0 }],
        });
        setErrors({});
        onClose();
      } catch (error) {
        console.error('Failed to create parts order:', error);
        setErrors({ submit: 'Failed to create parts order. Please try again.' });
      }
    }
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { partName: '', qty: 1, unitPrice: 0 }],
    }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      }));
    }
  };

  const updateItem = (index: number, field: keyof OrderItem, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Create Parts Order</h2>
              <p className="text-gray-600 mt-1">Order parts from suppliers</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              type="button"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" data-testid="parts-order-form">
            {/* Basic form fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="supplierName" className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier Name *
                </label>
                <input
                  id="supplierName"
                  type="text"
                  value={formData.supplierName}
                  onChange={(e) => setFormData(prev => ({ ...prev, supplierName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter supplier name"
                />
                {errors.supplierName && <p className="text-red-500 text-sm mt-1">{errors.supplierName}</p>}
              </div>

              <div>
                <label htmlFor="expectedDelivery" className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Delivery
                </label>
                <input
                  id="expectedDelivery"
                  type="date"
                  value={formData.expectedDelivery}
                  onChange={(e) => setFormData(prev => ({ ...prev, expectedDelivery: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add any additional notes..."
              />
            </div>

            {/* Order Items section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Order Items</h3>
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add Item
                </button>
              </div>

              <div className="space-y-4">
                {formData.items.map((item, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg border">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-2">
                        <label htmlFor={`partName-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                          Part Name *
                        </label>
                        <input
                          id={`partName-${index}`}
                          type="text"
                          value={item.partName}
                          onChange={(e) => updateItem(index, 'partName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter part name"
                        />
                        {errors[`item_${index}_partName`] && (
                          <p className="text-red-500 text-sm mt-1">{errors[`item_${index}_partName`]}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor={`quantity-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                          Quantity *
                        </label>
                        <input
                          id={`quantity-${index}`}
                          type="number"
                          min="1"
                          value={item.qty}
                          onChange={(e) => updateItem(index, 'qty', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors[`item_${index}_quantity`] && (
                          <p className="text-red-500 text-sm mt-1">{errors[`item_${index}_quantity`]}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor={`unitPrice-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                          Unit Price (ZMW) *
                        </label>
                        <input
                          id={`unitPrice-${index}`}
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors[`item_${index}_unitPrice`] && (
                          <p className="text-red-500 text-sm mt-1">{errors[`item_${index}_unitPrice`]}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-4">
                      <div className="text-sm font-medium text-gray-900">
                        Subtotal: ZMW {(item.qty * item.unitPrice).toFixed(2)}
                      </div>
                      {formData.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="flex items-center px-2 py-1 text-red-600 hover:text-red-800 text-sm"
                        >
                          <TrashIcon className="h-4 w-4 mr-1" />
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {errors.items && <p className="text-red-500 text-sm mt-2">{errors.items}</p>}
            </div>

            {/* Total */}
            <div className="border-t pt-4">
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">
                  Total: ZMW {calculateTotal().toFixed(2)}
                </p>
              </div>
            </div>

            {errors.submit && (
              <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md">
                {errors.submit}
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Creating...' : 'Create Order'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};


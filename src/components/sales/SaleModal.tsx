import React, { useState } from 'react';
import { XMarkIcon, UserIcon, CurrencyDollarIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import type { Vehicle } from '../../types/index';
import { useCustomers } from '../../hooks/useCustomers';

interface SaleModalProps {
  vehicle: Vehicle;
  isOpen: boolean;
  onClose: () => void;
}

export const SaleModal: React.FC<SaleModalProps> = ({ vehicle, isOpen, onClose }) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [salePrice, setSalePrice] = useState(vehicle.sellingPrice);
  const [deposit, setDeposit] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank_transfer' | 'mobile_money'>('cash');
  const [notes, setNotes] = useState('');

  const { customers, loading: customersLoading } = useCustomers();
  const [creatingSale, setCreatingSale] = useState(false);

  const balance = salePrice - deposit;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCustomerId) {
      alert('Please select a customer');
      return;
    }

    try {
      setCreatingSale(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock success - in a real app this would create the sale
      console.log('Mock: Sale created successfully', {
        tenantId: vehicle.tenantId,
        sale: {
          customerId: selectedCustomerId,
          vehicleId: vehicle.id,
          salePrice,
          deposit,
          balance,
          paymentMethod,
          notes,
        },
      });

      onClose();
      // Reset form
      setSelectedCustomerId('');
      setSalePrice(vehicle.sellingPrice);
      setDeposit(0);
      setPaymentMethod('cash');
      setNotes('');
      
      // Show success message
      alert('Sale created successfully! (Mock)');
    } catch (error) {
      console.error('Error creating sale:', error);
      alert('Failed to create sale. Please try again.');
    } finally {
      setCreatingSale(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Process Sale</h2>
            <p className="text-gray-600">{vehicle.make} {vehicle.model} - {vehicle.regNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Vehicle Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Vehicle Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Vehicle</label>
                <p className="text-gray-900">{vehicle.make} {vehicle.model} ({vehicle.year})</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Registration</label>
                <p className="text-gray-900">{vehicle.regNumber}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">VIN</label>
                <p className="text-gray-900 font-mono">{vehicle.vin}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Original Price</label>
                <p className="text-gray-900">K{vehicle.sellingPrice.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Customer Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <UserIcon className="h-4 w-4 inline mr-1" />
              Select Customer
            </label>
            {customersLoading ? (
              <div className="animate-pulse bg-gray-200 h-10 rounded-lg"></div>
            ) : (
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Choose a customer...</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} - {customer.phone}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Sale Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Sale Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <CurrencyDollarIcon className="h-4 w-4 inline mr-1" />
                  Sale Price (K)
                </label>
                <input
                  type="number"
                  value={salePrice}
                  onChange={(e) => setSalePrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <CurrencyDollarIcon className="h-4 w-4 inline mr-1" />
                  Deposit (K)
                </label>
                <input
                  type="number"
                  value={deposit}
                  onChange={(e) => setDeposit(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Balance Due:</span>
                <span className="text-lg font-bold text-blue-600">K{balance.toLocaleString()}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="mobile_money">Mobile Money</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DocumentTextIcon className="h-4 w-4 inline mr-1" />
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Additional notes about the sale..."
              />
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Sale Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Vehicle:</span>
                <span className="font-medium">{vehicle.make} {vehicle.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sale Price:</span>
                <span className="font-medium">K{salePrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Deposit:</span>
                <span className="font-medium">K{deposit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2">
                <span className="text-gray-900 font-semibold">Balance Due:</span>
                <span className="text-green-600 font-bold">K{balance.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creatingSale || !selectedCustomerId}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {creatingSale ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                'Complete Sale'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 
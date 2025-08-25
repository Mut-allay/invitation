import React, { useState } from 'react';
import type { Invoice } from '../../types/index';

interface PaymentModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ invoice, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Process Payment</h2>
        {invoice && (
          <p className="text-gray-600 mb-4">
            Invoice: {invoice.invoiceNumber} - Amount: K{invoice.totalAmount.toLocaleString()}
          </p>
        )}
        <p className="text-gray-700 mb-4">Payment processing form will be implemented here with mobile money integration.</p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}; 
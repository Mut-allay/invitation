import React from 'react';
import { Invoice } from '../../types/invoice';

interface InvoiceModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  isCreating: boolean;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ 
  invoice, 
  isOpen, 
  isCreating, 
  onClose 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {isCreating ? 'Create Invoice' : 'Invoice Details'}
          </h2>
          {invoice && (
            <p className="text-gray-600 mb-4">{invoice.invoiceNumber} - K{invoice.totalAmount.toLocaleString()}</p>
          )}
          <p className="text-gray-700 mb-4">Invoice management form will be implemented here with ZRA integration.</p>
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
    </div>
  );
}; 
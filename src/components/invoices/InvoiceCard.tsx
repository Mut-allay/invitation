import React, { useState } from 'react';
import { 
  DocumentTextIcon, 
  CurrencyDollarIcon, 
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import type { Invoice } from '../../types/index';

interface InvoiceCardProps {
  invoice: Invoice;
  onView: () => void;
  onEdit: () => void;
  onPayment: () => void;
}

export const InvoiceCard: React.FC<InvoiceCardProps> = ({ invoice, onView, onEdit, onPayment }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'overdue':
        return <ClockIcon className="h-4 w-4" />;
      default:
        return <DocumentTextIcon className="h-4 w-4" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const isOverdue = invoice.status === 'sent' && new Date(invoice.dueDate) < new Date();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{invoice.invoiceNumber}</h3>
            <p className="text-sm text-gray-600">Customer ID: {invoice.customerId.slice(-6)}</p>
          </div>
          <div className="flex space-x-1 ml-2">
            <button
              onClick={onView}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <EyeIcon className="h-4 w-4" />
            </button>
            {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
              <button
                onClick={onEdit}
                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}>
            {getStatusIcon(invoice.status)}
            <span className="ml-1">{invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}</span>
          </span>
          {isOverdue && (
            <span className="text-xs text-red-600 font-medium">OVERDUE</span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Amount */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">Total Amount</span>
            <span className="text-lg font-bold text-green-600">K{invoice.totalAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-gray-500">VAT (16%):</span>
            <span className="text-sm text-gray-700">K{invoice.vatAmount.toLocaleString()}</span>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-600">Issue Date</p>
              <p className="text-sm text-gray-900">{formatDate(invoice.issueDate)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-600">Due Date</p>
              <p className="text-sm text-gray-900">{formatDate(invoice.dueDate)}</p>
            </div>
          </div>
        </div>

        {/* ZRA Integration */}
        {invoice.markId && (
          <div className="bg-blue-50 p-2 rounded-lg">
            <div className="flex items-center space-x-2">
              <DocumentTextIcon className="h-4 w-4 text-blue-600" />
              <span className="text-xs text-blue-700">ZRA Mark ID: {invoice.markId}</span>
            </div>
          </div>
        )}

        {/* Payment Method */}
        {invoice.paymentMethod && (
          <div>
            <label className="text-xs font-medium text-gray-600">Payment Method</label>
            <p className="text-sm text-gray-900 capitalize">{invoice.paymentMethod.replace('_', ' ')}</p>
          </div>
        )}

        {/* Notes */}
        {invoice.notes && (
          <div>
            <label className="text-xs font-medium text-gray-600">Notes</label>
            <p className="text-sm text-gray-700 line-clamp-2">{invoice.notes}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex space-x-2 p-4 border-t border-gray-200">
        <button
          onClick={onView}
          className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center"
        >
          <EyeIcon className="h-4 w-4 mr-1" />
          View
        </button>
        {invoice.status === 'sent' && (
          <button
            onClick={onPayment}
            className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
          >
            <CurrencyDollarIcon className="h-4 w-4 mr-1" />
            Pay
          </button>
        )}
      </div>
    </div>
  );
}; 
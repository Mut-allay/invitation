import React, { useState, useCallback } from 'react';
import {
  DocumentTextIcon,
  PrinterIcon,
  DocumentArrowDownIcon,
  QrCodeIcon,
  CalculatorIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

// ZRA-compliant invoice item interface
interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number; // ZRA standard is 16%
  vatExempt: boolean;
  total: number;
  vatAmount: number;
}

// ZRA-compliant invoice interface
interface ZRAInvoice {
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;
  customerName: string;
  customerAddress: string;
  customerTpin: string; // ZRA Tax Payer Identification Number
  businessName: string;
  businessAddress: string;
  businessTpin: string;
  items: InvoiceItem[];
  subtotal: number;
  totalVat: number;
  totalAmount: number;
  currency: 'ZMW';
  qrCode?: string;
  zraReference?: string;
}

interface ZRAInvoiceGeneratorProps {
  onInvoiceGenerated: (invoice: ZRAInvoice) => void;
  onCancel: () => void;
}

const ZRAInvoiceGenerator: React.FC<ZRAInvoiceGeneratorProps> = ({
  onInvoiceGenerated,
  onCancel
}) => {
  const [invoice, setInvoice] = useState<Partial<ZRAInvoice>>({
    invoiceDate: new Date(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    currency: 'ZMW',
    items: []
  });

  const [currentItem, setCurrentItem] = useState<Partial<InvoiceItem>>({
    description: '',
    quantity: 1,
    unitPrice: 0,
    vatRate: 16, // ZRA standard VAT rate
    vatExempt: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);

  // ZRA VAT rates
  const ZRA_VAT_RATES = [
    { value: 0, label: '0% (Exempt)', description: 'VAT Exempt items' },
    { value: 16, label: '16% (Standard)', description: 'Standard VAT rate in Zambia' }
  ];

  // Format currency in Zambian Kwacha
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-ZM', {
      style: 'currency',
      currency: 'ZMW',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Generate ZRA-compliant invoice number
  const generateInvoiceNumber = (): string => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ZRA-${year}${month}${day}-${random}`;
  };

  // Validate TPIN format on input change
  const validateTpin = (tpin: string): boolean => {
    return /^\d{10}$/.test(tpin);
  };

  // Handle business TPIN change with validation
  const handleBusinessTpinChange = (value: string) => {
    const cleanValue = value.replace(/\D/g, '').slice(0, 10);
    setInvoice({ ...invoice, businessTpin: cleanValue });
    
    // Clear error if TPIN is now valid
    if (cleanValue.length === 10 && validateTpin(cleanValue)) {
      const { businessTpin, ...otherErrors } = errors;
      setErrors(otherErrors);
    }
  };

  // Handle customer TPIN change with validation
  const handleCustomerTpinChange = (value: string) => {
    const cleanValue = value.replace(/\D/g, '').slice(0, 10);
    setInvoice({ ...invoice, customerTpin: cleanValue });
    
    // Clear error if TPIN is now valid
    if (cleanValue.length === 10 && validateTpin(cleanValue)) {
      const { customerTpin, ...otherErrors } = errors;
      setErrors(otherErrors);
    }
  };

  // Calculate item totals with VAT (with proper rounding)
  const calculateItemTotals = (item: Partial<InvoiceItem>) => {
    const subtotal = Math.round(((item.quantity || 0) * (item.unitPrice || 0)) * 100) / 100;
    const vatAmount = item.vatExempt ? 0 : Math.round(subtotal * ((item.vatRate || 0) / 100) * 100) / 100;
    const total = Math.round((subtotal + vatAmount) * 100) / 100;

    return { subtotal, vatAmount, total };
  };

  // Calculate invoice totals (with proper rounding)
  const calculateInvoiceTotals = (items: InvoiceItem[]) => {
    const subtotal = Math.round(items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0) * 100) / 100;
    const totalVat = Math.round(items.reduce((sum, item) => sum + item.vatAmount, 0) * 100) / 100;
    const totalAmount = Math.round((subtotal + totalVat) * 100) / 100;

    return { subtotal, totalVat, totalAmount };
  };

  // Validate invoice data
  const validateInvoice = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!invoice.customerName?.trim()) {
      newErrors.customerName = 'Customer name is required';
    }

    if (!invoice.customerTpin?.trim()) {
      newErrors.customerTpin = 'Customer TPIN is required for ZRA compliance';
    } else if (!validateTpin(invoice.customerTpin)) {
      newErrors.customerTpin = 'TPIN must be 10 digits';
    }

    if (!invoice.businessName?.trim()) {
      newErrors.businessName = 'Business name is required';
    }

    if (!invoice.businessTpin?.trim()) {
      newErrors.businessTpin = 'Business TPIN is required for ZRA compliance';
    } else if (!validateTpin(invoice.businessTpin)) {
      newErrors.businessTpin = 'Business TPIN must be 10 digits';
    }

    if (!invoice.items?.length) {
      newErrors.items = 'At least one item is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Add item to invoice
  const handleAddItem = () => {
    if (!currentItem.description?.trim()) {
      setErrors({ ...errors, itemDescription: 'Item description is required' });
      return;
    }

    if ((currentItem.quantity || 0) <= 0) {
      setErrors({ ...errors, itemQuantity: 'Quantity must be greater than 0' });
      return;
    }

    if ((currentItem.unitPrice || 0) <= 0) {
      setErrors({ ...errors, itemUnitPrice: 'Unit price must be greater than 0' });
      return;
    }

    const { subtotal, vatAmount, total } = calculateItemTotals(currentItem);

    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: currentItem.description!,
      quantity: currentItem.quantity!,
      unitPrice: currentItem.unitPrice!,
      vatRate: currentItem.vatRate!,
      vatExempt: currentItem.vatExempt!,
      total: subtotal,
      vatAmount
    };

    const updatedItems = [...(invoice.items || []), newItem];
    const totals = calculateInvoiceTotals(updatedItems);

    setInvoice({
      ...invoice,
      items: updatedItems,
      ...totals
    });

    // Reset current item
    setCurrentItem({
      description: '',
      quantity: 1,
      unitPrice: 0,
      vatRate: 16,
      vatExempt: false
    });

    // Clear item errors
    const { itemDescription, itemQuantity, itemUnitPrice, ...otherErrors } = errors;
    setErrors(otherErrors);
  };

  // Remove item from invoice
  const handleRemoveItem = (itemId: string) => {
    const updatedItems = invoice.items?.filter(item => item.id !== itemId) || [];
    const totals = calculateInvoiceTotals(updatedItems);

    setInvoice({
      ...invoice,
      items: updatedItems,
      ...totals
    });
  };

  // Generate QR code (simplified - in real implementation would use proper QR library)
  const generateQRCode = (invoice: ZRAInvoice): string => {
    // Simplified QR code generation for testing - much faster
    const qrData = {
      invoiceNumber: invoice.invoiceNumber,
      businessTpin: invoice.businessTpin,
      totalAmount: invoice.totalAmount,
      date: invoice.invoiceDate.toISOString().split('T')[0]
    };
    
    // Return a simple SVG-based QR code representation
    return `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="white"/><text x="50" y="50" text-anchor="middle" font-size="8">QR:${invoice.invoiceNumber}</text></svg>`)}`;
  };

  // Generate ZRA-compliant invoice
  const handleGenerateInvoice = async () => {
    if (!validateInvoice()) {
      return;
    }

    setIsGenerating(true);

    try {
      const invoiceNumber = generateInvoiceNumber();
      const zraReference = `ZRA-REF-${Date.now()}`;

      const completeInvoice: ZRAInvoice = {
        invoiceNumber,
        invoiceDate: invoice.invoiceDate!,
        dueDate: invoice.dueDate!,
        customerName: invoice.customerName!,
        customerAddress: invoice.customerAddress || '',
        customerTpin: invoice.customerTpin!,
        businessName: invoice.businessName!,
        businessAddress: invoice.businessAddress || '',
        businessTpin: invoice.businessTpin!,
        items: invoice.items!,
        subtotal: invoice.subtotal!,
        totalVat: invoice.totalVat!,
        totalAmount: invoice.totalAmount!,
        currency: 'ZMW',
        zraReference
      };

      // Generate QR code
      completeInvoice.qrCode = generateQRCode(completeInvoice);

      // Simulate ZRA submission delay (reduced for testing)
      await new Promise(resolve => setTimeout(resolve, 500));

      onInvoiceGenerated(completeInvoice);
    } catch (error) {
      setErrors({ general: 'Failed to generate invoice. Please try again.' });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <DocumentTextIcon className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">ZRA Invoice Generator</h1>
              <p className="text-gray-600">Generate ZRA-compliant invoices with 16% VAT</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <QrCodeIcon className="h-6 w-6 text-green-600" />
            <span className="text-sm text-green-600 font-medium">ZRA Compliant</span>
          </div>
        </div>

        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <XCircleIcon className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-red-800">{errors.general}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Business Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Business Information</h2>
            
            <div>
              <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">
                Business Name *
              </label>
              <input
                type="text"
                id="businessName"
                value={invoice.businessName || ''}
                onChange={(e) => setInvoice({ ...invoice, businessName: e.target.value })}
                className="input-field"
                placeholder="Your business name"
                aria-describedby="businessNameError"
              />
              {errors.businessName && (
                <p id="businessNameError" className="text-red-600 text-sm mt-1">{errors.businessName}</p>
              )}
            </div>

            <div>
              <label htmlFor="businessTpin" className="block text-sm font-medium text-gray-700 mb-1">
                Business TPIN *
              </label>
              <input
                type="text"
                id="businessTpin"
                value={invoice.businessTpin || ''}
                onChange={(e) => handleBusinessTpinChange(e.target.value)}
                className="input-field"
                placeholder="1234567890"
                maxLength={10}
                aria-describedby="businessTpinError businessTpinHelp"
              />
              <p id="businessTpinHelp" className="text-xs text-gray-500 mt-1">10-digit Tax Payer Identification Number</p>
              {errors.businessTpin && (
                <p id="businessTpinError" className="text-red-600 text-sm mt-1">{errors.businessTpin}</p>
              )}
            </div>

            <div>
              <label htmlFor="businessAddress" className="block text-sm font-medium text-gray-700 mb-1">
                Business Address
              </label>
              <textarea
                id="businessAddress"
                value={invoice.businessAddress || ''}
                onChange={(e) => setInvoice({ ...invoice, businessAddress: e.target.value })}
                className="input-field"
                rows={3}
                placeholder="Business address"
              />
            </div>
          </div>

          {/* Customer Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Customer Information</h2>
            
            <div>
              <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
                Customer Name *
              </label>
              <input
                type="text"
                id="customerName"
                value={invoice.customerName || ''}
                onChange={(e) => setInvoice({ ...invoice, customerName: e.target.value })}
                className="input-field"
                placeholder="Customer name"
                aria-describedby="customerNameError"
              />
              {errors.customerName && (
                <p id="customerNameError" className="text-red-600 text-sm mt-1">{errors.customerName}</p>
              )}
            </div>

            <div>
              <label htmlFor="customerTpin" className="block text-sm font-medium text-gray-700 mb-1">
                Customer TPIN *
              </label>
              <input
                type="text"
                id="customerTpin"
                value={invoice.customerTpin || ''}
                onChange={(e) => handleCustomerTpinChange(e.target.value)}
                className="input-field"
                placeholder="1234567890"
                maxLength={10}
                aria-describedby="customerTpinError customerTpinHelp"
              />
              <p id="customerTpinHelp" className="text-xs text-gray-500 mt-1">Customer's 10-digit TPIN</p>
              {errors.customerTpin && (
                <p id="customerTpinError" className="text-red-600 text-sm mt-1">{errors.customerTpin}</p>
              )}
            </div>

            <div>
              <label htmlFor="customerAddress" className="block text-sm font-medium text-gray-700 mb-1">
                Customer Address
              </label>
              <textarea
                id="customerAddress"
                value={invoice.customerAddress || ''}
                onChange={(e) => setInvoice({ ...invoice, customerAddress: e.target.value })}
                className="input-field"
                rows={3}
                placeholder="Customer address"
              />
            </div>
          </div>
        </div>

        {/* Invoice Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label htmlFor="invoiceDate" className="block text-sm font-medium text-gray-700 mb-1">
              Invoice Date
            </label>
            <input
              type="date"
              id="invoiceDate"
              value={invoice.invoiceDate?.toISOString().split('T')[0] || ''}
              onChange={(e) => setInvoice({ ...invoice, invoiceDate: new Date(e.target.value) })}
              className="input-field"
            />
          </div>

          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <input
              type="date"
              id="dueDate"
              value={invoice.dueDate?.toISOString().split('T')[0] || ''}
              onChange={(e) => setInvoice({ ...invoice, dueDate: new Date(e.target.value) })}
              className="input-field"
            />
          </div>
        </div>

        {/* Add Item Section */}
        <div className="border-t border-gray-200 pt-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Items</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            <div className="md:col-span-2">
              <label htmlFor="itemDescription" className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <input
                type="text"
                id="itemDescription"
                value={currentItem.description || ''}
                onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
                className="input-field"
                placeholder="Item description"
                aria-describedby="itemDescriptionError"
              />
              {errors.itemDescription && (
                <p id="itemDescriptionError" className="text-red-600 text-sm mt-1">{errors.itemDescription}</p>
              )}
            </div>

            <div>
              <label htmlFor="itemQuantity" className="block text-sm font-medium text-gray-700 mb-1">
                Quantity *
              </label>
              <input
                type="number"
                id="itemQuantity"
                value={currentItem.quantity || ''}
                onChange={(e) => setCurrentItem({ ...currentItem, quantity: parseFloat(e.target.value) || 0 })}
                className="input-field"
                min="0.01"
                step="0.01"
                aria-describedby="itemQuantityError"
              />
              {errors.itemQuantity && (
                <p id="itemQuantityError" className="text-red-600 text-sm mt-1">{errors.itemQuantity}</p>
              )}
            </div>

            <div>
              <label htmlFor="itemUnitPrice" className="block text-sm font-medium text-gray-700 mb-1">
                Unit Price (ZMW) *
              </label>
              <input
                type="number"
                id="itemUnitPrice"
                value={currentItem.unitPrice || ''}
                onChange={(e) => setCurrentItem({ ...currentItem, unitPrice: parseFloat(e.target.value) || 0 })}
                className="input-field"
                min="0.01"
                step="0.01"
                aria-describedby="itemUnitPriceError"
              />
              {errors.itemUnitPrice && (
                <p id="itemUnitPriceError" className="text-red-600 text-sm mt-1">{errors.itemUnitPrice}</p>
              )}
            </div>

            <div>
              <label htmlFor="itemVatRate" className="block text-sm font-medium text-gray-700 mb-1">
                VAT Rate
              </label>
              <select
                id="itemVatRate"
                value={currentItem.vatRate || 16}
                onChange={(e) => {
                  const rate = parseFloat(e.target.value);
                  setCurrentItem({ 
                    ...currentItem, 
                    vatRate: rate,
                    vatExempt: rate === 0
                  });
                }}
                className="input-field"
              >
                {ZRA_VAT_RATES.map(rate => (
                  <option key={rate.value} value={rate.value}>
                    {rate.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {currentItem.quantity && currentItem.unitPrice && (
                <>
                  Subtotal: {formatCurrency((currentItem.quantity || 0) * (currentItem.unitPrice || 0))} | 
                  VAT: {formatCurrency(calculateItemTotals(currentItem).vatAmount)} | 
                  Total: {formatCurrency(calculateItemTotals(currentItem).total)}
                </>
              )}
            </div>
            <button
              onClick={handleAddItem}
              className="btn-primary flex items-center"
              aria-label="Add item to invoice"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Item
            </button>
          </div>
        </div>

        {/* Items List */}
        {invoice.items && invoice.items.length > 0 && (
          <div className="border-t border-gray-200 pt-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Invoice Items</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
                    <th className="border border-gray-300 px-4 py-2 text-right">Qty</th>
                    <th className="border border-gray-300 px-4 py-2 text-right">Unit Price</th>
                    <th className="border border-gray-300 px-4 py-2 text-right">VAT %</th>
                    <th className="border border-gray-300 px-4 py-2 text-right">VAT Amount</th>
                    <th className="border border-gray-300 px-4 py-2 text-right">Total</th>
                    <th className="border border-gray-300 px-4 py-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item) => (
                    <tr key={item.id}>
                      <td className="border border-gray-300 px-4 py-2">{item.description}</td>
                      <td className="border border-gray-300 px-4 py-2 text-right">{item.quantity}</td>
                      <td className="border border-gray-300 px-4 py-2 text-right">{formatCurrency(item.unitPrice)}</td>
                      <td className="border border-gray-300 px-4 py-2 text-right">
                        {item.vatExempt ? 'Exempt' : `${item.vatRate}%`}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-right">{formatCurrency(item.vatAmount)}</td>
                      <td className="border border-gray-300 px-4 py-2 text-right font-medium">
                        {formatCurrency(item.total)}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-600 hover:text-red-800"
                          aria-label={`Remove ${item.description}`}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Invoice Totals */}
            <div className="mt-4 flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(invoice.subtotal || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total VAT (16%):</span>
                  <span className="font-medium">{formatCurrency(invoice.totalVat || 0)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total Amount:</span>
                  <span>{formatCurrency(invoice.totalAmount || 0)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {errors.items && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-red-800">{errors.items}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="btn-secondary"
            disabled={isGenerating}
          >
            Cancel
          </button>
          <button
            onClick={handleGenerateInvoice}
            disabled={isGenerating || !invoice.items?.length}
            className="btn-primary flex items-center"
            aria-label="Generate ZRA-compliant invoice"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                <CalculatorIcon className="h-4 w-4 mr-2" />
                Generate Invoice
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ZRAInvoiceGenerator;

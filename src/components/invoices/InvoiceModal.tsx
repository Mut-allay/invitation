import React, { useState } from 'react';
import type { Invoice } from '../../types/index';
import ZRAInvoiceGenerator from './ZRAInvoiceGenerator';
import VATCalculator from './VATCalculator';

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
  const [showZRAGenerator, setShowZRAGenerator] = useState(false);
  const [showVATCalculator, setShowVATCalculator] = useState(false);

  if (!isOpen) return null;

  const handleInvoiceGenerated = (zraInvoice: { invoiceNumber: string; totalAmount: number }) => {
    console.log('ZRA Invoice Generated:', zraInvoice);
    alert(`ZRA Invoice Generated Successfully!\nInvoice Number: ${zraInvoice.invoiceNumber}\nTotal Amount: K${(zraInvoice.totalAmount || 0).toLocaleString()}`);
    onClose();
  };

  const handleVATCalculation = (calculation: { amount: number; vatAmount: number; totalWithVAT: number }) => {
    console.log('VAT Calculation:', calculation);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {isCreating ? 'Create ZRA Invoice' : 'Invoice Details'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {invoice && !isCreating && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600">
                <strong>Invoice:</strong> {invoice.invoiceNumber} - K{(invoice.totalAmount || 0).toLocaleString()}
              </p>
            </div>
          )}

          {isCreating && (
            <div className="space-y-6">
              {/* Quick Action Buttons */}
              <div className="flex space-x-4 mb-6">
                <button
                  onClick={() => setShowZRAGenerator(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  🧾 Generate ZRA Invoice
                </button>
                <button
                  onClick={() => setShowVATCalculator(true)}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  🧮 VAT Calculator
                </button>
              </div>

              {/* ZRA Invoice Generator */}
              {showZRAGenerator && (
                <div className="border border-gray-200 rounded-lg">
                  <ZRAInvoiceGenerator
                    onInvoiceGenerated={handleInvoiceGenerated}
                    onCancel={() => setShowZRAGenerator(false)}
                  />
                </div>
              )}

              {/* VAT Calculator */}
              {showVATCalculator && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">ZRA VAT Calculator</h3>
                    <button
                      onClick={() => setShowVATCalculator(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <VATCalculator
                    initialAmount={1000}
                    onCalculationChange={handleVATCalculation}
                    showExemptionInfo={true}
                  />
                </div>
              )}

              {/* Instructions */}
              {!showZRAGenerator && !showVATCalculator && (
                <div className="text-center py-12">
                  <div className="mb-4">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">ZRA Invoice Management</h3>
                  <p className="text-gray-600 mb-6">
                    Create ZRA-compliant invoices with automatic VAT calculation and QR code generation.
                  </p>
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => setShowZRAGenerator(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Start Creating Invoice
                    </button>
                    <button
                      onClick={() => setShowVATCalculator(true)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Calculate VAT
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {!isCreating && (
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 
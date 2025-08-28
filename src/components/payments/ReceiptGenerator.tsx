import React from 'react';
import { useGetPaymentReceiptQuery } from '../../store/api/paymentsApi';
import { PaymentReceipt } from '../../types/payment';
import { PrinterIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

interface ReceiptGeneratorProps {
    paymentId: string;
    onClose?: () => void;
}

const ReceiptGenerator: React.FC<ReceiptGeneratorProps> = ({ paymentId, onClose }) => {
    const { data: receipt, isLoading, error } = useGetPaymentReceiptQuery({ paymentId });

    const formatDate = (date: Date): string => {
        return new Intl.DateTimeFormat('en-ZM', {
            dateStyle: 'medium',
            timeStyle: 'short'
        }).format(new Date(date));
    };

    const formatAmount = (amount: number): string => {
        return new Intl.NumberFormat('en-ZM', {
            style: 'currency',
            currency: 'ZMW'
        }).format(amount);
    };

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = () => {
        // Create a blob from the receipt content
        const receiptContent = generateReceiptContent(receipt!);
        const blob = new Blob([receiptContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);

        // Create a temporary link and trigger download
        const link = document.createElement('a');
        link.href = url;
        link.download = `receipt-${receipt?.receiptNumber || paymentId}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    const generateReceiptContent = (receipt: PaymentReceipt): string => {
        const lines = [
            'GARAGIFLOW AUTO SERVICES',
            '======================',
            '',
            `Receipt Number: ${receipt.receiptNumber}`,
            `Date: ${formatDate(receipt.issuedAt)}`,
            `Customer: ${receipt.customerName}`,
            '',
            'Payment Details:',
            '---------------',
            `Method: ${receipt.paymentDetails.type === 'mobile_money' ?
                `Mobile Money (${receipt.paymentDetails.provider})` :
                `Bank Transfer (${receipt.paymentDetails.bankCode})`}`,
            `Reference: ${receipt.paymentDetails.reference}`,
            '',
            'Items:',
            '------'
        ];

        if (receipt.items && receipt.items.length > 0) {
            receipt.items.forEach(item => {
                lines.push(`${item.description}: ${formatAmount(item.amount)}`);
            });
        }

        lines.push('');
        lines.push(`Subtotal: ${formatAmount(receipt.subtotal)}`);
        lines.push(`VAT (16%): ${formatAmount(receipt.tax)}`);
        lines.push(`Total: ${formatAmount(receipt.total)}`);
        lines.push('');
        lines.push('Thank you for your business!');

        return lines.join('\n');
    };

    if (isLoading) {
        return (
            <div className="p-6 bg-white rounded-lg shadow-lg max-w-2xl mx-auto">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-32 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-white rounded-lg shadow-lg max-w-2xl mx-auto">
                <div className="text-red-600">
                    <p>Failed to load receipt. Please try again later.</p>
                </div>
            </div>
        );
    }

    if (!receipt) {
        return null;
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow-lg max-w-2xl mx-auto">
            {/* Receipt Header */}
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900">GARAGIFLOW AUTO SERVICES</h1>
                <p className="text-gray-600">Official Payment Receipt</p>
            </div>

            {/* Receipt Details */}
            <div className="mb-8">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-gray-600">Receipt Number:</p>
                        <p className="font-medium">{receipt.receiptNumber}</p>
                    </div>
                    <div>
                        <p className="text-gray-600">Date:</p>
                        <p className="font-medium">{formatDate(receipt.issuedAt)}</p>
                    </div>
                    <div className="col-span-2">
                        <p className="text-gray-600">Customer:</p>
                        <p className="font-medium">{receipt.customerName}</p>
                    </div>
                </div>
            </div>

            {/* Payment Method Details */}
            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                <h2 className="font-semibold mb-2">Payment Details</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-gray-600">Method:</p>
                        <p className="font-medium">
                            {receipt.paymentDetails.type === 'mobile_money'
                                ? `Mobile Money (${receipt.paymentDetails.provider})`
                                : `Bank Transfer (${receipt.paymentDetails.bankCode})`}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-600">Reference:</p>
                        <p className="font-mono font-medium">{receipt.paymentDetails.reference}</p>
                    </div>
                </div>
            </div>

            {/* Items */}
            {receipt.items && receipt.items.length > 0 && (
                <div className="mb-8">
                    <h2 className="font-semibold mb-2">Items</h2>
                    <div className="border-t border-gray-200">
                        {receipt.items.map((item, index) => (
                            <div
                                key={index}
                                className="py-2 grid grid-cols-2 border-b border-gray-200"
                            >
                                <span className="text-gray-600">{item.description}</span>
                                <span className="text-right font-medium">
                                    {formatAmount(item.amount)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Totals */}
            <div className="mb-8">
                <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-medium">{formatAmount(receipt.subtotal)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                        <span className="text-gray-600">VAT (16%)</span>
                        <span className="font-medium">{formatAmount(receipt.tax)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                        <span>Total</span>
                        <span>{formatAmount(receipt.total)}</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="text-center text-gray-600 mb-8">
                <p>Thank you for your business!</p>
                <p className="text-sm mt-1">This is a computer-generated receipt.</p>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4 print:hidden">
                <button
                    onClick={handlePrint}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <PrinterIcon className="h-5 w-5 mr-2 text-gray-500" />
                    Print
                </button>
                <button
                    onClick={handleDownload}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                    Download
                </button>
            </div>

            {/* Print Styles */}
            <style jsx>{`
        @media print {
          @page {
            size: A4;
            margin: 2cm;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
        </div>
    );
};

export default ReceiptGenerator;

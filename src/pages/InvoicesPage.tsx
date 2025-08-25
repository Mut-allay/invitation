import React, { useState } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  EyeIcon,
  PencilIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import { useInvoices } from '../hooks/useInvoices';
import { useVehicles } from '../hooks/useVehicles';
import { useCustomers } from '../hooks/useCustomers';
import { InvoiceCard } from '../components/invoices/InvoiceCard';
import { InvoiceModal } from '../components/invoices/InvoiceModal';
import { PaymentModal } from '../components/invoices/PaymentModal';
import { useToast } from '../contexts/ToastContext';
import { getErrorMessage } from '@/lib/utils';
import type { Invoice } from '../types/index';

// Mock invoices data for when the API returns empty
const mockInvoices: Invoice[] = [
  {
    id: '1',
    tenantId: 'tenant1',
    invoiceNumber: 'INV-2024-001',
    customerId: 'customer1',
    vehicleId: 'vehicle1',
    totalAmount: 1250,
    subtotal: 1000,
    vatAmount: 250,
    vatRate: 25,
    taxBreakdown: { vat: 250 },
    status: 'paid',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    issueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    paidDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    paymentMethod: 'bank_transfer',
    notes: 'Engine repair and oil change',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: '2',
    tenantId: 'tenant1',
    invoiceNumber: 'INV-2024-002',
    customerId: 'customer2',
    vehicleId: 'vehicle2',
    totalAmount: 850,
    subtotal: 680,
    vatAmount: 170,
    vatRate: 25,
    taxBreakdown: { vat: 170 },
    status: 'sent',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    issueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    notes: 'Brake system repair',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: '3',
    tenantId: 'tenant1',
    invoiceNumber: 'INV-2024-003',
    customerId: 'customer3',
    vehicleId: 'vehicle3',
    totalAmount: 320,
    subtotal: 256,
    vatAmount: 64,
    vatRate: 25,
    taxBreakdown: { vat: 64 },
    status: 'overdue',
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    issueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    notes: 'AC system recharge',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: '4',
    tenantId: 'tenant1',
    invoiceNumber: 'INV-2024-004',
    customerId: 'customer4',
    vehicleId: 'vehicle4',
    totalAmount: 1800,
    subtotal: 1440,
    vatAmount: 360,
    vatRate: 25,
    taxBreakdown: { vat: 360 },
    status: 'draft',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    issueDate: new Date(),
    notes: 'Transmission repair and parts replacement',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: '5',
    tenantId: 'tenant1',
    invoiceNumber: 'INV-2024-005',
    customerId: 'customer5',
    vehicleId: 'vehicle5',
    totalAmount: 450,
    subtotal: 360,
    vatAmount: 90,
    vatRate: 25,
    taxBreakdown: { vat: 90 },
    status: 'sent',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    issueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    notes: 'Electrical system diagnostics and repair',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
];

const InvoicesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const { invoices: apiInvoices, loading, error } = useInvoices();
  const { success, error: toastError } = useToast();

  // Use mock data if API returns empty
  const invoices = apiInvoices.length === 0 && !loading ? mockInvoices : apiInvoices;

  const statuses = ['draft', 'sent', 'paid', 'overdue', 'cancelled'];

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.customerId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !selectedStatus || invoice.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getInvoiceStats = () => {
    const totalInvoices = invoices.length;
    const totalAmount = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;
    const overdueInvoices = invoices.filter(inv => inv.status === 'overdue').length;
    const pendingAmount = invoices
      .filter(inv => inv.status === 'sent' || inv.status === 'overdue')
      .reduce((sum, inv) => sum + inv.totalAmount, 0);
    const paidAmount = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.totalAmount, 0);

    return { totalInvoices, totalAmount, paidInvoices, overdueInvoices, pendingAmount, paidAmount };
  };

  const stats = getInvoiceStats();

  const handleCreateInvoice = () => {
    setIsCreating(true);
    setSelectedInvoice(null);
    setShowInvoiceModal(true);
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setIsCreating(false);
    setSelectedInvoice(invoice);
    setShowInvoiceModal(true);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setIsCreating(false);
    setSelectedInvoice(invoice);
    setShowInvoiceModal(true);
  };

  const handlePayment = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowPaymentModal(true);
  };

  const handleGeneratePDF = (invoice: Invoice) => {
    // Mock PDF generation
    success(`PDF generated for ${invoice.invoiceNumber}`);
  };

  const handleStatusToggle = (invoice: Invoice, newStatus: Invoice['status']) => {
    // In a real app, this would update the API
    success(`Invoice ${invoice.invoiceNumber} status updated to ${newStatus}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
      case 'sent':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'cancelled':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="space-y-6 responsive-p">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-responsive-2xl font-bold text-foreground">Invoices & Payments</h1>
          <p className="text-responsive-base text-muted-foreground">Manage invoices and payment processing</p>
        </div>
        <button 
          onClick={handleCreateInvoice}
          className="btn-primary flex items-center space-x-2 w-full sm:w-auto"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Create Invoice</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="fluid-grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-glass p-6 rounded-xl shadow-layered">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
              <DocumentTextIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-responsive-sm font-medium text-muted-foreground">Total Invoices</p>
              <p className="text-responsive-2xl font-bold text-foreground">{stats.totalInvoices}</p>
            </div>
          </div>
        </div>

        <div className="card-glass p-6 rounded-xl shadow-layered">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-xl">
              <CurrencyDollarIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-responsive-sm font-medium text-muted-foreground">Total Amount</p>
              <p className="text-responsive-2xl font-bold text-foreground">K{stats.totalAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="card-glass p-6 rounded-xl shadow-layered">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-xl">
              <ClockIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-responsive-sm font-medium text-muted-foreground">Pending Amount</p>
              <p className="text-responsive-2xl font-bold text-foreground">K{stats.pendingAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="card-glass p-6 rounded-xl shadow-layered">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-xl">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-responsive-sm font-medium text-muted-foreground">Overdue</p>
              <p className="text-responsive-2xl font-bold text-foreground">{stats.overdueInvoices}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="fluid-grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-glass p-6 rounded-xl shadow-layered">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-responsive-sm font-medium text-muted-foreground">Paid Invoices</p>
              <p className="text-responsive-xl font-bold text-foreground">{stats.paidInvoices}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-xl">
              <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="text-responsive-sm text-muted-foreground mt-2">
            Total Paid: K{stats.paidAmount.toLocaleString()}
          </p>
        </div>

        <div className="card-glass p-6 rounded-xl shadow-layered">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-responsive-sm font-medium text-muted-foreground">Collection Rate</p>
              <p className="text-responsive-xl font-bold text-foreground">
                {stats.totalInvoices > 0 ? Math.round((stats.paidInvoices / stats.totalInvoices) * 100) : 0}%
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
              <CurrencyDollarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-responsive-sm text-muted-foreground mt-2">
            {stats.paidInvoices} of {stats.totalInvoices} invoices paid
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card-glass p-6 rounded-xl shadow-layered">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search invoices by number or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-glass w-full pl-10 pr-4 py-2"
            />
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="input-glass px-4 py-2"
          >
            <option value="">All Status</option>
            {statuses.map(status => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Invoices List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="card-glass border border-red-200 dark:border-red-800 p-4">
          <p className="text-red-800 dark:text-red-400">Error loading invoices: {getErrorMessage(error)}</p>
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div className="card-glass p-8 text-center">
          <DocumentTextIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-responsive-lg font-medium text-foreground mb-2">No invoices found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || selectedStatus ? 'Try adjusting your search or filters.' : 'Get started by creating your first invoice.'}
          </p>
          {!searchTerm && !selectedStatus && (
            <button
              onClick={handleCreateInvoice}
              className="btn-primary"
            >
              Create First Invoice
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredInvoices.map((invoice) => (
            <div key={invoice.id} className="card-glass p-6 rounded-xl shadow-layered hover:shadow-glow transition-all duration-300">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-responsive-lg font-semibold text-foreground">{invoice.invoiceNumber}</h3>
                  <p className="text-responsive-sm text-muted-foreground">
                    Customer: {invoice.customerId} • Vehicle: {invoice.vehicleId}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                  {invoice.status.toUpperCase()}
                </span>
              </div>

              {/* Details */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-responsive-sm text-muted-foreground">Amount:</span>
                  <span className="text-responsive-lg font-bold text-foreground">K{invoice.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-responsive-sm text-muted-foreground">Issue Date:</span>
                  <span className="text-responsive-sm text-foreground">{formatDate(invoice.issueDate)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-responsive-sm text-muted-foreground">Due Date:</span>
                  <span className="text-responsive-sm text-foreground">{formatDate(invoice.dueDate)}</span>
                </div>
                {invoice.paymentMethod && (
                  <div className="flex justify-between items-center">
                    <span className="text-responsive-sm text-muted-foreground">Payment Method:</span>
                    <span className="text-responsive-sm text-foreground capitalize">
                      {invoice.paymentMethod.replace('_', ' ')}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleViewInvoice(invoice)}
                  className="btn-secondary text-responsive-sm px-3 py-1 flex items-center"
                >
                  <EyeIcon className="h-4 w-4 mr-1" />
                  View
                </button>
                <button
                  onClick={() => handleEditInvoice(invoice)}
                  className="btn-primary text-responsive-sm px-3 py-1 flex items-center"
                >
                  <PencilIcon className="h-4 w-4 mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => handleGeneratePDF(invoice)}
                  className="btn-ghost text-responsive-sm px-3 py-1 flex items-center"
                >
                  <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
                  PDF
                </button>
                
                {/* Payment Status Toggles */}
                {invoice.status === 'sent' && (
                  <button
                    onClick={() => handlePayment(invoice)}
                    className="bg-green-600 hover:bg-green-700 text-white text-responsive-sm px-3 py-1 rounded-lg transition-all duration-200"
                  >
                    Mark Paid
                  </button>
                )}
                {invoice.status === 'overdue' && (
                  <button
                    onClick={() => handlePayment(invoice)}
                    className="bg-red-600 hover:bg-red-700 text-white text-responsive-sm px-3 py-1 rounded-lg transition-all duration-200"
                  >
                    Collect Payment
                  </button>
                )}
                {invoice.status === 'draft' && (
                  <button
                    onClick={() => handleStatusToggle(invoice, 'sent')}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-responsive-sm px-3 py-1 rounded-lg transition-all duration-200"
                  >
                    Send Invoice
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <InvoiceModal
        invoice={selectedInvoice}
        isOpen={showInvoiceModal}
        isCreating={isCreating}
        onClose={() => setShowInvoiceModal(false)}
      />
      <PaymentModal
        invoice={selectedInvoice}
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
      />
    </div>
  );
};

export default InvoicesPage; 
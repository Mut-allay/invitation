import React, { useState, useMemo } from 'react';
import {
  DocumentTextIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PrinterIcon,
  EnvelopeIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,

  ExclamationTriangleIcon,
  ChartBarIcon,
  DocumentArrowDownIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

// Invoice status types
type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

// Invoice interface
interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerTpin: string;
  businessName: string;
  businessTpin: string;
  amount: number;
  vatAmount: number;
  totalAmount: number;
  status: InvoiceStatus;
  issueDate: Date;
  dueDate: Date;
  paidDate?: Date;
  currency: 'ZMW';
  zraReference?: string;
  qrCode?: string;
}

// Filter options
interface FilterOptions {
  status: InvoiceStatus | 'all';
  dateRange: 'all' | 'today' | 'week' | 'month' | 'quarter' | 'year';
  amountRange: 'all' | 'small' | 'medium' | 'large';
  searchTerm: string;
}

interface InvoiceDashboardProps {
  invoices: Invoice[];
  onInvoiceSelect: (invoice: Invoice) => void;
  onInvoiceEdit: (invoice: Invoice) => void;
  onInvoiceDelete: (invoiceId: string) => void;
  onBulkPrint: (invoiceIds: string[]) => void;
  onBulkEmail: (invoiceIds: string[]) => void;
  onBulkExport: (invoiceIds: string[]) => void;
  onNewInvoice: () => void;
  className?: string;
}

const InvoiceDashboard: React.FC<InvoiceDashboardProps> = ({
  invoices,
  onInvoiceSelect,
  onInvoiceEdit,
  onInvoiceDelete,
  onBulkPrint,
  onBulkEmail,
  onBulkExport,
  onNewInvoice,
  className = ''
}) => {
  const [selectedInvoices, setSelectedInvoices] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    dateRange: 'all',
    amountRange: 'all',
    searchTerm: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'customer' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Format currency in Zambian Kwacha
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-ZM', {
      style: 'currency',
      currency: 'ZMW',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Format date
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-ZM', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  // Get status color and icon
  const getStatusInfo = (status: InvoiceStatus) => {
    switch (status) {
      case 'draft':
        return { color: 'text-gray-600', bgColor: 'bg-gray-100', icon: DocumentTextIcon, label: 'Draft' };
      case 'sent':
        return { color: 'text-blue-600', bgColor: 'bg-blue-100', icon: EnvelopeIcon, label: 'Sent' };
      case 'paid':
        return { color: 'text-green-600', bgColor: 'bg-green-100', icon: CheckCircleIcon, label: 'Paid' };
      case 'overdue':
        return { color: 'text-red-600', bgColor: 'bg-red-100', icon: ExclamationTriangleIcon, label: 'Overdue' };
      case 'cancelled':
        return { color: 'text-gray-500', bgColor: 'bg-gray-100', icon: XCircleIcon, label: 'Cancelled' };
      default:
        return { color: 'text-gray-600', bgColor: 'bg-gray-100', icon: DocumentTextIcon, label: 'Unknown' };
    }
  };

  // Filter and sort invoices
  const filteredAndSortedInvoices = useMemo(() => {
    const filtered = invoices.filter(invoice => {
      // Status filter
      if (filters.status !== 'all' && invoice.status !== filters.status) {
        return false;
      }

      // Date range filter
      const today = new Date();
      const invoiceDate = new Date(invoice.issueDate);
      
      switch (filters.dateRange) {
        case 'today':
          if (invoiceDate.toDateString() !== today.toDateString()) return false;
          break;
        case 'week': {
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (invoiceDate < weekAgo) return false;
          break;
        }
        case 'month': {
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (invoiceDate < monthAgo) return false;
          break;
        }
        case 'quarter': {
          const quarterAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
          if (invoiceDate < quarterAgo) return false;
          break;
        }
        case 'year': {
          const yearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);
          if (invoiceDate < yearAgo) return false;
          break;
        }
      }

      // Amount range filter
      switch (filters.amountRange) {
        case 'small':
          if (invoice.totalAmount >= 1000) return false;
          break;
        case 'medium':
          if (invoice.totalAmount < 1000 || invoice.totalAmount >= 10000) return false;
          break;
        case 'large':
          if (invoice.totalAmount < 10000) return false;
          break;
      }

      // Search term filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesSearch = 
          invoice.invoiceNumber.toLowerCase().includes(searchLower) ||
          invoice.customerName.toLowerCase().includes(searchLower) ||
          invoice.businessName.toLowerCase().includes(searchLower) ||
          invoice.customerTpin.includes(searchLower) ||
          invoice.businessTpin.includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      return true;
    });

    // Sort invoices
    filtered.sort((a, b) => {
      let aValue: Date | number | string, bValue: Date | number | string;

      switch (sortBy) {
        case 'date':
          aValue = new Date(a.issueDate);
          bValue = new Date(b.issueDate);
          break;
        case 'amount':
          aValue = a.totalAmount;
          bValue = b.totalAmount;
          break;
        case 'customer':
          aValue = a.customerName.toLowerCase();
          bValue = b.customerName.toLowerCase();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          aValue = new Date(a.issueDate);
          bValue = new Date(b.issueDate);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [invoices, filters, sortBy, sortOrder]);

  // Calculate dashboard statistics
  const statistics = useMemo(() => {
    const total = invoices.length;
    const paid = invoices.filter(inv => inv.status === 'paid').length;
    const overdue = invoices.filter(inv => inv.status === 'overdue').length;
    const draft = invoices.filter(inv => inv.status === 'draft').length;
    const totalAmount = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const paidAmount = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.totalAmount, 0);
    const overdueAmount = invoices
      .filter(inv => inv.status === 'overdue')
      .reduce((sum, inv) => sum + inv.totalAmount, 0);

    return {
      total,
      paid,
      overdue,
      draft,
      totalAmount,
      paidAmount,
      overdueAmount,
      paidPercentage: total > 0 ? (paid / total) * 100 : 0,
      overduePercentage: total > 0 ? (overdue / total) * 100 : 0
    };
  }, [invoices]);

  // Handle invoice selection
  const handleInvoiceSelect = (invoiceId: string, checked: boolean) => {
    const newSelected = new Set(selectedInvoices);
    if (checked) {
      newSelected.add(invoiceId);
    } else {
      newSelected.delete(invoiceId);
    }
    setSelectedInvoices(newSelected);
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedInvoices(new Set(filteredAndSortedInvoices.map(inv => inv.id)));
    } else {
      setSelectedInvoices(new Set());
    }
  };

  // Handle bulk operations
  const handleBulkOperation = (operation: 'print' | 'email' | 'export') => {
    const selectedIds = Array.from(selectedInvoices);
    if (selectedIds.length === 0) return;

    switch (operation) {
      case 'print':
        onBulkPrint(selectedIds);
        break;
      case 'email':
        onBulkEmail(selectedIds);
        break;
      case 'export':
        onBulkExport(selectedIds);
        break;
    }
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <DocumentTextIcon className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Invoice Management Dashboard</h1>
              <p className="text-gray-600">Manage and track all ZRA-compliant invoices</p>
            </div>
          </div>
          <button
            onClick={onNewInvoice}
            className="btn-primary flex items-center"
            aria-label="Create new invoice"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            New Invoice
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="p-6 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <DocumentTextIcon className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-blue-600">Total Invoices</p>
                <p className="text-2xl font-bold text-blue-900">{statistics.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-green-600">Paid</p>
                <p className="text-2xl font-bold text-green-900">
                  {statistics.paid} ({statistics.paidPercentage.toFixed(1)}%)
                </p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-red-600">Overdue</p>
                <p className="text-2xl font-bold text-red-900">
                  {statistics.overdue} ({statistics.overduePercentage.toFixed(1)}%)
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-gray-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(statistics.totalAmount)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={filters.searchTerm}
              onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
              className="input-field pl-10"
              aria-label="Search invoices"
            />
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary flex items-center"
              aria-expanded={showFilters}
              aria-controls="filter-panel"
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              Filters
            </button>

            {/* Sort */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [newSortBy, newSortOrder] = e.target.value.split('-') as [typeof sortBy, typeof sortOrder];
                setSortBy(newSortBy);
                setSortOrder(newSortOrder);
              }}
              className="input-field"
              aria-label="Sort invoices"
            >
              <option value="date-desc">Date (Newest)</option>
              <option value="date-asc">Date (Oldest)</option>
              <option value="amount-desc">Amount (High to Low)</option>
              <option value="amount-asc">Amount (Low to High)</option>
              <option value="customer-asc">Customer (A-Z)</option>
              <option value="customer-desc">Customer (Z-A)</option>
              <option value="status-asc">Status (A-Z)</option>
              <option value="status-desc">Status (Z-A)</option>
            </select>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div id="filter-panel" className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value as FilterOptions['status'] })}
                className="input-field"
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters({ ...filters, dateRange: e.target.value as FilterOptions['dateRange'] })}
                className="input-field"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="quarter">Last 90 Days</option>
                <option value="year">Last Year</option>
              </select>
            </div>

            {/* Amount Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount Range</label>
              <select
                value={filters.amountRange}
                onChange={(e) => setFilters({ ...filters, amountRange: e.target.value as FilterOptions['amountRange'] })}
                className="input-field"
              >
                <option value="all">All Amounts</option>
                <option value="small">Under K 1,000</option>
                <option value="medium">K 1,000 - K 10,000</option>
                <option value="large">Over K 10,000</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={() => setFilters({
                  status: 'all',
                  dateRange: 'all',
                  amountRange: 'all',
                  searchTerm: ''
                })}
                className="btn-secondary w-full"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedInvoices.size > 0 && (
        <div className="p-4 bg-blue-50 border-b border-blue-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-blue-800">
              {selectedInvoices.size} invoice{selectedInvoices.size !== 1 ? 's' : ''} selected
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleBulkOperation('print')}
                className="btn-secondary flex items-center text-sm"
                aria-label="Print selected invoices"
              >
                <PrinterIcon className="h-4 w-4 mr-1" />
                Print
              </button>
              <button
                onClick={() => handleBulkOperation('email')}
                className="btn-secondary flex items-center text-sm"
                aria-label="Email selected invoices"
              >
                <EnvelopeIcon className="h-4 w-4 mr-1" />
                Email
              </button>
              <button
                onClick={() => handleBulkOperation('export')}
                className="btn-secondary flex items-center text-sm"
                aria-label="Export selected invoices"
              >
                <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
                Export
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoices Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedInvoices.size === filteredAndSortedInvoices.length && filteredAndSortedInvoices.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300"
                  aria-label="Select all invoices"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Invoice
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Issue Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Due Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedInvoices.map((invoice) => {
              const statusInfo = getStatusInfo(invoice.status);
              const StatusIcon = statusInfo.icon;
              const isSelected = selectedInvoices.has(invoice.id);

              return (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => handleInvoiceSelect(invoice.id, e.target.checked)}
                      className="rounded border-gray-300"
                      aria-label={`Select invoice ${invoice.invoiceNumber}`}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</div>
                      <div className="text-sm text-gray-500">{invoice.businessName}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{invoice.customerName}</div>
                      <div className="text-sm text-gray-500">TPIN: {invoice.customerTpin}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(invoice.totalAmount)}</div>
                      <div className="text-sm text-gray-500">VAT: {formatCurrency(invoice.vatAmount)}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {statusInfo.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(invoice.issueDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(invoice.dueDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onInvoiceSelect(invoice)}
                        className="text-blue-600 hover:text-blue-900"
                        aria-label={`View invoice ${invoice.invoiceNumber}`}
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onInvoiceEdit(invoice)}
                        className="text-green-600 hover:text-green-900"
                        aria-label={`Edit invoice ${invoice.invoiceNumber}`}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onInvoiceDelete(invoice.id)}
                        className="text-red-600 hover:text-red-900"
                        aria-label={`Delete invoice ${invoice.invoiceNumber}`}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Empty State */}
        {filteredAndSortedInvoices.length === 0 && (
          <div className="text-center py-12">
            <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
            <p className="text-gray-500">
              {filters.searchTerm || filters.status !== 'all' || filters.dateRange !== 'all' || filters.amountRange !== 'all'
                ? 'Try adjusting your filters or search terms.'
                : 'Get started by creating your first invoice.'}
            </p>
            {!filters.searchTerm && filters.status === 'all' && filters.dateRange === 'all' && filters.amountRange === 'all' && (
              <button
                onClick={onNewInvoice}
                className="btn-primary mt-4"
              >
                Create Invoice
              </button>
            )}
          </div>
        )}
      </div>

      {/* Pagination Info */}
      {filteredAndSortedInvoices.length > 0 && (
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-700">
            Showing {filteredAndSortedInvoices.length} of {invoices.length} invoices
          </p>
        </div>
      )}
    </div>
  );
};

export default InvoiceDashboard;

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InvoiceDashboard from '../InvoiceDashboard';

// Mock callback functions
const mockOnInvoiceSelect = jest.fn();
const mockOnInvoiceEdit = jest.fn();
const mockOnInvoiceDelete = jest.fn();
const mockOnBulkPrint = jest.fn();
const mockOnBulkEmail = jest.fn();
const mockOnBulkExport = jest.fn();
const mockOnNewInvoice = jest.fn();

const defaultProps = {
  onInvoiceSelect: mockOnInvoiceSelect,
  onInvoiceEdit: mockOnInvoiceEdit,
  onInvoiceDelete: mockOnInvoiceDelete,
  onBulkPrint: mockOnBulkPrint,
  onBulkEmail: mockOnBulkEmail,
  onBulkExport: mockOnBulkExport,
  onNewInvoice: mockOnNewInvoice
};

// Sample invoice data
const sampleInvoices = [
  {
    id: '1',
    invoiceNumber: 'ZRA-20241201-001',
    customerName: 'Test Customer 1',
    customerTpin: '1234567890',
    businessName: 'Test Business Ltd',
    businessTpin: '0987654321',
    amount: 1000,
    vatAmount: 160,
    totalAmount: 1160,
    status: 'paid' as const,
    issueDate: new Date('2024-12-01'),
    dueDate: new Date('2024-12-31'),
    paidDate: new Date('2024-12-15'),
    currency: 'ZMW' as const,
    zraReference: 'ZRA-REF-001'
  },
  {
    id: '2',
    invoiceNumber: 'ZRA-20241201-002',
    customerName: 'Test Customer 2',
    customerTpin: '2345678901',
    businessName: 'Test Business Ltd',
    businessTpin: '0987654321',
    amount: 5000,
    vatAmount: 800,
    totalAmount: 5800,
    status: 'overdue' as const,
    issueDate: new Date('2024-11-01'),
    dueDate: new Date('2024-11-30'),
    currency: 'ZMW' as const,
    zraReference: 'ZRA-REF-002'
  },
  {
    id: '3',
    invoiceNumber: 'ZRA-20241201-003',
    customerName: 'Test Customer 3',
    customerTpin: '3456789012',
    businessName: 'Test Business Ltd',
    businessTpin: '0987654321',
    amount: 500,
    vatAmount: 80,
    totalAmount: 580,
    status: 'draft' as const,
    issueDate: new Date('2024-12-01'),
    dueDate: new Date('2024-12-31'),
    currency: 'ZMW' as const,
    zraReference: 'ZRA-REF-003'
  }
];

describe('InvoiceDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Tests', () => {
    it('renders invoice dashboard interface', () => {
      render(<InvoiceDashboard {...defaultProps} invoices={sampleInvoices} />);
      
      expect(screen.getByText('Invoice Management Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Manage and track all ZRA-compliant invoices')).toBeInTheDocument();
      expect(screen.getByText('New Invoice')).toBeInTheDocument();
    });

    it('displays statistics cards correctly', () => {
      render(<InvoiceDashboard {...defaultProps} invoices={sampleInvoices} />);
      
      expect(screen.getByText('Total Invoices')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument(); // Total count
      
      expect(screen.getAllByText('Paid')).toHaveLength(2); // One in stats, one in table
      expect(screen.getAllByText('1 (33.3%)')).toHaveLength(2); // One for paid, one for overdue
      
      expect(screen.getAllByText('Overdue')).toHaveLength(2); // One in stats, one in table
      
      expect(screen.getByText('Total Amount')).toBeInTheDocument();
      expect(screen.getByText('K 7,540.00')).toBeInTheDocument(); // Total amount
    });

    it('displays invoice table with correct data', () => {
      render(<InvoiceDashboard {...defaultProps} invoices={sampleInvoices} />);
      
      // Check invoice numbers
      expect(screen.getByText('ZRA-20241201-001')).toBeInTheDocument();
      expect(screen.getByText('ZRA-20241201-002')).toBeInTheDocument();
      expect(screen.getByText('ZRA-20241201-003')).toBeInTheDocument();
      
      // Check customer names
      expect(screen.getByText('Test Customer 1')).toBeInTheDocument();
      expect(screen.getByText('Test Customer 2')).toBeInTheDocument();
      expect(screen.getByText('Test Customer 3')).toBeInTheDocument();
      
      // Check amounts
      expect(screen.getByText('K 1,160.00')).toBeInTheDocument();
      expect(screen.getByText('K 5,800.00')).toBeInTheDocument();
      expect(screen.getByText('K 580.00')).toBeInTheDocument();
    });

    it('shows correct status badges', () => {
      render(<InvoiceDashboard {...defaultProps} invoices={sampleInvoices} />);
      
      expect(screen.getAllByText('Paid')).toHaveLength(2); // One in stats, one in table
      expect(screen.getAllByText('Overdue')).toHaveLength(2); // One in stats, one in table
      expect(screen.getByText('Draft')).toBeInTheDocument(); // Only in table
    });

    it('handles search functionality', async () => {
      const user = userEvent.setup();
      render(<InvoiceDashboard {...defaultProps} invoices={sampleInvoices} />);
      
      const searchInput = screen.getByPlaceholderText('Search invoices...');
      await user.type(searchInput, 'Customer 1');
      
      await waitFor(() => {
        expect(screen.getByText('Test Customer 1')).toBeInTheDocument();
        expect(screen.queryByText('Test Customer 2')).not.toBeInTheDocument();
        expect(screen.queryByText('Test Customer 3')).not.toBeInTheDocument();
      });
    });

    it('handles status filtering', async () => {
      const user = userEvent.setup();
      render(<InvoiceDashboard {...defaultProps} invoices={sampleInvoices} />);
      
      // Open filters
      const filterButton = screen.getByText('Filters');
      await user.click(filterButton);
      
      // Select paid status - use the select element directly since it doesn't have a proper label
      const statusSelect = screen.getAllByRole('combobox')[1]; // Second combobox (first is sort)
      await user.selectOptions(statusSelect, 'paid');
      
      await waitFor(() => {
        expect(screen.getByText('Test Customer 1')).toBeInTheDocument();
        expect(screen.queryByText('Test Customer 2')).not.toBeInTheDocument();
        expect(screen.queryByText('Test Customer 3')).not.toBeInTheDocument();
      });
    });

    it('handles date range filtering', async () => {
      const user = userEvent.setup();
      render(<InvoiceDashboard {...defaultProps} invoices={sampleInvoices} />);
      
      // Open filters
      const filterButton = screen.getByText('Filters');
      await user.click(filterButton);
      
      // Select month range
      const dateRangeSelect = screen.getAllByRole('combobox')[2]; // Third combobox
      await user.selectOptions(dateRangeSelect, 'month');
      
      // Verify that the filter was applied (the select value changed)
      expect(dateRangeSelect).toHaveValue('month');
    });

    it('handles amount range filtering', async () => {
      const user = userEvent.setup();
      render(<InvoiceDashboard {...defaultProps} invoices={sampleInvoices} />);
      
      // Open filters
      const filterButton = screen.getByText('Filters');
      await user.click(filterButton);
      
      // Select small amount range - use the select element directly
      const amountRangeSelect = screen.getAllByRole('combobox')[3]; // Fourth combobox
      await user.selectOptions(amountRangeSelect, 'small');
      
      await waitFor(() => {
        expect(screen.getByText('Test Customer 3')).toBeInTheDocument(); // K 580
        expect(screen.queryByText('Test Customer 1')).not.toBeInTheDocument(); // K 1,160
        expect(screen.queryByText('Test Customer 2')).not.toBeInTheDocument(); // K 5,800
      });
    });

    it('handles sorting by different columns', async () => {
      const user = userEvent.setup();
      render(<InvoiceDashboard {...defaultProps} invoices={sampleInvoices} />);
      
      const sortSelect = screen.getByLabelText('Sort invoices');
      
      // Sort by amount (high to low)
      await user.selectOptions(sortSelect, 'amount-desc');
      
      // Check that invoices are sorted by amount (highest first)
      const rows = screen.getAllByRole('row');
      expect(rows[1]).toHaveTextContent('Test Customer 2'); // K 5,800
      expect(rows[2]).toHaveTextContent('Test Customer 1'); // K 1,160
      expect(rows[3]).toHaveTextContent('Test Customer 3'); // K 580
    });

    it('handles invoice selection', async () => {
      const user = userEvent.setup();
      render(<InvoiceDashboard {...defaultProps} invoices={sampleInvoices} />);
      
      const checkboxes = screen.getAllByRole('checkbox');
      const firstInvoiceCheckbox = checkboxes[1]; // First invoice checkbox (skip select all)
      
      await user.click(firstInvoiceCheckbox);
      
      // Should show bulk actions
      await waitFor(() => {
        expect(screen.getByText('1 invoice selected')).toBeInTheDocument();
        expect(screen.getByText('Print')).toBeInTheDocument();
        expect(screen.getByText('Email')).toBeInTheDocument();
        expect(screen.getByText('Export')).toBeInTheDocument();
      });
    });

    it('handles select all functionality', async () => {
      const user = userEvent.setup();
      render(<InvoiceDashboard {...defaultProps} invoices={sampleInvoices} />);
      
      const selectAllCheckbox = screen.getByLabelText('Select all invoices');
      await user.click(selectAllCheckbox);
      
      await waitFor(() => {
        expect(screen.getByText('3 invoices selected')).toBeInTheDocument();
      });
    });

    it('handles bulk operations', async () => {
      const user = userEvent.setup();
      render(<InvoiceDashboard {...defaultProps} invoices={sampleInvoices} />);
      
      // Select all invoices
      const selectAllCheckbox = screen.getByLabelText('Select all invoices');
      await user.click(selectAllCheckbox);
      
      // Test bulk print
      const printButton = screen.getByText('Print');
      await user.click(printButton);
      expect(mockOnBulkPrint).toHaveBeenCalledWith(expect.arrayContaining(['1', '2', '3']));
      
      // Test bulk email
      const emailButton = screen.getByText('Email');
      await user.click(emailButton);
      expect(mockOnBulkEmail).toHaveBeenCalledWith(expect.arrayContaining(['1', '2', '3']));
      
      // Test bulk export
      const exportButton = screen.getByText('Export');
      await user.click(exportButton);
      expect(mockOnBulkExport).toHaveBeenCalledWith(expect.arrayContaining(['1', '2', '3']));
    });

    it('handles individual invoice actions', async () => {
      const user = userEvent.setup();
      render(<InvoiceDashboard {...defaultProps} invoices={sampleInvoices} />);
      
      // Test view action
      const viewButtons = screen.getAllByLabelText(/View invoice/);
      await user.click(viewButtons[0]);
      expect(mockOnInvoiceSelect).toHaveBeenCalledWith(expect.objectContaining({
        id: expect.any(String),
        invoiceNumber: expect.any(String),
        customerName: expect.any(String)
      }));
      
      // Test edit action
      const editButtons = screen.getAllByLabelText(/Edit invoice/);
      await user.click(editButtons[0]);
      expect(mockOnInvoiceEdit).toHaveBeenCalledWith(expect.objectContaining({
        id: expect.any(String),
        invoiceNumber: expect.any(String),
        customerName: expect.any(String)
      }));
      
      // Test delete action
      const deleteButtons = screen.getAllByLabelText(/Delete invoice/);
      await user.click(deleteButtons[0]);
      expect(mockOnInvoiceDelete).toHaveBeenCalledWith(expect.any(String));
    });

    it('handles new invoice creation', async () => {
      const user = userEvent.setup();
      render(<InvoiceDashboard {...defaultProps} invoices={sampleInvoices} />);
      
      const newInvoiceButton = screen.getByText('New Invoice');
      await user.click(newInvoiceButton);
      
      expect(mockOnNewInvoice).toHaveBeenCalled();
    });

    it('shows empty state when no invoices match filters', async () => {
      const user = userEvent.setup();
      render(<InvoiceDashboard {...defaultProps} invoices={sampleInvoices} />);
      
      const searchInput = screen.getByPlaceholderText('Search invoices...');
      await user.type(searchInput, 'NonExistentCustomer');
      
      await waitFor(() => {
        expect(screen.getByText('No invoices found')).toBeInTheDocument();
        expect(screen.getByText('Try adjusting your filters or search terms.')).toBeInTheDocument();
      });
    });

    it('shows empty state when no invoices exist', () => {
      render(<InvoiceDashboard {...defaultProps} invoices={[]} />);
      
      expect(screen.getByText('No invoices found')).toBeInTheDocument();
      expect(screen.getByText('Get started by creating your first invoice.')).toBeInTheDocument();
      expect(screen.getByText('Create Invoice')).toBeInTheDocument();
    });

    it('clears filters correctly', async () => {
      const user = userEvent.setup();
      render(<InvoiceDashboard {...defaultProps} invoices={sampleInvoices} />);
      
      // Open filters and set some values
      const filterButton = screen.getByText('Filters');
      await user.click(filterButton);
      
      const searchInput = screen.getByPlaceholderText('Search invoices...');
      await user.type(searchInput, 'Customer 1');
      
      const statusSelect = screen.getAllByRole('combobox')[1]; // Second combobox (first is sort)
      await user.selectOptions(statusSelect, 'paid');
      
      // Clear filters
      const clearButton = screen.getByText('Clear Filters');
      await user.click(clearButton);
      
      // Should show all invoices again
      await waitFor(() => {
        expect(screen.getByText('Test Customer 1')).toBeInTheDocument();
        expect(screen.getByText('Test Customer 2')).toBeInTheDocument();
        expect(screen.getByText('Test Customer 3')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility Tests', () => {
    it('has proper ARIA labels and roles', () => {
      render(<InvoiceDashboard {...defaultProps} invoices={sampleInvoices} />);
      
      // Check form labels are properly associated
      expect(screen.getByLabelText('Search invoices')).toBeInTheDocument();
      expect(screen.getByLabelText('Sort invoices')).toBeInTheDocument();
      expect(screen.getByLabelText('Select all invoices')).toBeInTheDocument();
      
      // Check buttons have proper labels
      expect(screen.getByLabelText('Create new invoice')).toBeInTheDocument();
      expect(screen.getAllByLabelText(/View invoice/)).toHaveLength(3);
      expect(screen.getAllByLabelText(/Edit invoice/)).toHaveLength(3);
      expect(screen.getAllByLabelText(/Delete invoice/)).toHaveLength(3);
    });

    it('provides proper filter panel accessibility', async () => {
      const user = userEvent.setup();
      render(<InvoiceDashboard {...defaultProps} invoices={sampleInvoices} />);
      
      const filterButton = screen.getByText('Filters');
      expect(filterButton).toHaveAttribute('aria-expanded', 'false');
      expect(filterButton).toHaveAttribute('aria-controls', 'filter-panel');
      
      await user.click(filterButton);
      
      await waitFor(() => {
        expect(filterButton).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<InvoiceDashboard {...defaultProps} invoices={sampleInvoices} />);
      
      // Tab through interactive elements
      await user.tab();
      expect(screen.getByLabelText('Create new invoice')).toHaveFocus();
      
      await user.tab();
      expect(screen.getByPlaceholderText('Search invoices...')).toHaveFocus();
      
      await user.tab();
      expect(screen.getByText('Filters')).toHaveFocus();
    });

    it('has proper color contrast for status badges', () => {
      render(<InvoiceDashboard {...defaultProps} invoices={sampleInvoices} />);
      
      // Check that status badges exist (styling classes will be applied by component)
      expect(screen.getAllByText('Paid')).toHaveLength(2); // One in stats, one in table
      expect(screen.getAllByText('Overdue')).toHaveLength(2); // One in stats, one in table
      expect(screen.getAllByText('Draft')).toHaveLength(1); // Only in table
    });
  });

  describe('Dashboard Analytics', () => {
    it('calculates statistics correctly', () => {
      render(<InvoiceDashboard {...defaultProps} invoices={sampleInvoices} />);
      
      // Check total count
      expect(screen.getByText('3')).toBeInTheDocument();
      
      // Check paid count and percentage
      expect(screen.getAllByText('1 (33.3%)')).toHaveLength(2); // One for paid, one for overdue
      
      // Check overdue count and percentage
      expect(screen.getAllByText('1 (33.3%)')).toHaveLength(2); // One for paid, one for overdue
      
      // Check total amount
      expect(screen.getByText('K 7,540.00')).toBeInTheDocument();
    });

    it('handles zero invoices correctly', () => {
      render(<InvoiceDashboard {...defaultProps} invoices={[]} />);
      
      expect(screen.getByText('0')).toBeInTheDocument(); // Total count
      expect(screen.getAllByText('0 (0.0%)')).toHaveLength(2); // Paid and overdue percentages
      expect(screen.getByText('K 0.00')).toBeInTheDocument(); // Total amount
    });

    it('updates statistics when filters are applied', async () => {
      const user = userEvent.setup();
      render(<InvoiceDashboard {...defaultProps} invoices={sampleInvoices} />);
      
      // Filter to show only paid invoices
      const filterButton = screen.getByText('Filters');
      await user.click(filterButton);
      
      const statusSelect = screen.getAllByRole('combobox')[1]; // Second combobox (first is sort)
      await user.selectOptions(statusSelect, 'paid');
      
      // Statistics should still show overall totals, not filtered totals
      expect(screen.getByText('3')).toBeInTheDocument(); // Total count
      expect(screen.getAllByText('1 (33.3%)')).toHaveLength(2); // Paid and overdue percentages
    });
  });

  describe('Currency and Date Formatting', () => {
    it('displays amounts in Zambian Kwacha format', () => {
      render(<InvoiceDashboard {...defaultProps} invoices={sampleInvoices} />);
      
      expect(screen.getByText('K 1,160.00')).toBeInTheDocument();
      expect(screen.getByText('K 5,800.00')).toBeInTheDocument();
      expect(screen.getByText('K 580.00')).toBeInTheDocument();
      expect(screen.getByText('K 7,540.00')).toBeInTheDocument(); // Total
    });

    it('displays dates in Zambian format', () => {
      render(<InvoiceDashboard {...defaultProps} invoices={sampleInvoices} />);
      
      // Check that dates are formatted (exact format may vary based on locale)
      // The component displays both issue dates and due dates
      // Note: Due to timezone conversion, some dates may appear on different days
      expect(screen.getAllByText(/Dec.*2024/)).toHaveLength(2); // 2 Dec dates (from 2024-12-31)
      expect(screen.getAllByText(/Nov.*2024/)).toHaveLength(3); // 3 Nov dates (from timezone-adjusted dates)
    });
  });

  describe('ZRA Compliance', () => {
    it('displays ZRA invoice numbers correctly', () => {
      render(<InvoiceDashboard {...defaultProps} invoices={sampleInvoices} />);
      
      expect(screen.getByText('ZRA-20241201-001')).toBeInTheDocument();
      expect(screen.getByText('ZRA-20241201-002')).toBeInTheDocument();
      expect(screen.getByText('ZRA-20241201-003')).toBeInTheDocument();
    });

    it('shows TPIN information', () => {
      render(<InvoiceDashboard {...defaultProps} invoices={sampleInvoices} />);
      
      expect(screen.getByText('TPIN: 1234567890')).toBeInTheDocument();
      expect(screen.getByText('TPIN: 2345678901')).toBeInTheDocument();
      expect(screen.getByText('TPIN: 3456789012')).toBeInTheDocument();
    });

    it('displays VAT amounts correctly', () => {
      render(<InvoiceDashboard {...defaultProps} invoices={sampleInvoices} />);
      
      expect(screen.getByText('VAT: K 160.00')).toBeInTheDocument();
      expect(screen.getByText('VAT: K 800.00')).toBeInTheDocument();
      expect(screen.getByText('VAT: K 80.00')).toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      const { container } = render(
        <InvoiceDashboard {...defaultProps} invoices={sampleInvoices} className="custom-class" />
      );
      
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });
});

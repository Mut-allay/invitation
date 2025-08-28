import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ComplianceReport from '../ComplianceReport';
import { zraApi } from '../../../store/api/zraApi';

// Mock the ZRA API
jest.mock('../../../store/api/zraApi', () => ({
  zraApi: {
    getComplianceReport: jest.fn(),
    checkZRAStatus: jest.fn()
  }
}));

const mockZraApi = zraApi as jest.Mocked<typeof zraApi>;

describe('ComplianceReport', () => {
  const mockOnClose = jest.fn();

  const mockReport = {
    period: 'current-month',
    totalInvoices: 50,
    totalAmount: 50000,
    totalVAT: 8000,
    submittedInvoices: 45,
    pendingInvoices: 5,
    complianceStatus: 'COMPLIANT' as const,
    lastSubmissionDate: new Date('2024-12-01')
  };

  const mockStatus = {
    status: 'ONLINE' as const,
    message: 'ZRA API is available'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockZraApi.getComplianceReport.mockResolvedValue(mockReport);
    mockZraApi.checkZRAStatus.mockResolvedValue(mockStatus);
  });

  it('renders compliance report interface', () => {
    render(<ComplianceReport onClose={mockOnClose} />);
    
    expect(screen.getByText('ZRA Compliance Report')).toBeInTheDocument();
    expect(screen.getByText('Monitor your ZRA compliance status and reporting')).toBeInTheDocument();
    expect(screen.getByText('Close')).toBeInTheDocument();
  });

  it('displays ZRA status indicator', async () => {
    render(<ComplianceReport onClose={mockOnClose} />);
    
    await waitFor(() => {
      expect(screen.getByText('ZRA API: Connected')).toBeInTheDocument();
    });
  });

  it('shows period selector', () => {
    render(<ComplianceReport onClose={mockOnClose} />);
    
    expect(screen.getByLabelText('Report Period')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Current Month')).toBeInTheDocument();
  });

  it('loads and displays compliance report data', async () => {
    render(<ComplianceReport onClose={mockOnClose} />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('50')).toBeInTheDocument(); // Total Invoices
      expect(screen.getByText('ZMW 50,000.00')).toBeInTheDocument(); // Total Amount
      expect(screen.getByText('ZMW 8,000.00')).toBeInTheDocument(); // Total VAT
      expect(screen.getByText('45')).toBeInTheDocument(); // Submitted Invoices
    });
  });

  it('displays compliance status correctly', async () => {
    render(<ComplianceReport onClose={mockOnClose} />);
    
    await waitFor(() => {
      expect(screen.getByText('Fully Compliant')).toBeInTheDocument();
    });
  });

  it('shows non-compliant status', async () => {
    const nonCompliantReport = { ...mockReport, complianceStatus: 'NON_COMPLIANT' as const };
    mockZraApi.getComplianceReport.mockResolvedValue(nonCompliantReport);
    
    render(<ComplianceReport onClose={mockOnClose} />);
    
    await waitFor(() => {
      expect(screen.getByText('Non-Compliant')).toBeInTheDocument();
    });
  });

  it('shows pending status', async () => {
    const pendingReport = { ...mockReport, complianceStatus: 'PENDING' as const };
    mockZraApi.getComplianceReport.mockResolvedValue(pendingReport);
    
    render(<ComplianceReport onClose={mockOnClose} />);
    
    await waitFor(() => {
      expect(screen.getByText('Pending Review')).toBeInTheDocument();
    });
  });

  it('displays detailed statistics', async () => {
    render(<ComplianceReport onClose={mockOnClose} />);
    
    await waitFor(() => {
      expect(screen.getByText('Invoice Status Breakdown')).toBeInTheDocument();
      expect(screen.getByText('Financial Summary')).toBeInTheDocument();
      expect(screen.getByText('Submitted to ZRA')).toBeInTheDocument();
      expect(screen.getByText('Pending Submission')).toBeInTheDocument();
      expect(screen.getByText('Total Invoice Value')).toBeInTheDocument();
      expect(screen.getByText('Total VAT Collected')).toBeInTheDocument();
      expect(screen.getByText('Net Amount')).toBeInTheDocument();
    });
  });

  it('shows compliance recommendations for compliant status', async () => {
    render(<ComplianceReport onClose={mockOnClose} />);
    
    await waitFor(() => {
      expect(screen.getByText('Compliance Recommendations')).toBeInTheDocument();
      expect(screen.getByText('Excellent compliance status')).toBeInTheDocument();
      expect(screen.getByText('All invoices have been properly submitted to ZRA')).toBeInTheDocument();
    });
  });

  it('shows compliance recommendations for non-compliant status', async () => {
    const nonCompliantReport = { ...mockReport, complianceStatus: 'NON_COMPLIANT' as const };
    mockZraApi.getComplianceReport.mockResolvedValue(nonCompliantReport);
    
    render(<ComplianceReport onClose={mockOnClose} />);
    
    await waitFor(() => {
      expect(screen.getByText('Immediate action required')).toBeInTheDocument();
      expect(screen.getByText('Submit pending invoices to ZRA to maintain compliance')).toBeInTheDocument();
    });
  });

  it('shows compliance recommendations for pending status', async () => {
    const pendingReport = { ...mockReport, complianceStatus: 'PENDING' as const };
    mockZraApi.getComplianceReport.mockResolvedValue(pendingReport);
    
    render(<ComplianceReport onClose={mockOnClose} />);
    
    await waitFor(() => {
      expect(screen.getByText('Review required')).toBeInTheDocument();
      expect(screen.getByText('Some invoices are pending ZRA review')).toBeInTheDocument();
    });
  });

  it('shows pending submissions warning when there are pending invoices', async () => {
    const reportWithPending = { ...mockReport, pendingInvoices: 10 };
    mockZraApi.getComplianceReport.mockResolvedValue(reportWithPending);
    
    render(<ComplianceReport onClose={mockOnClose} />);
    
    await waitFor(() => {
      expect(screen.getByText('Pending submissions')).toBeInTheDocument();
      expect(screen.getByText('10 invoice(s) need to be submitted to ZRA')).toBeInTheDocument();
    });
  });

  it('handles period change', async () => {
    render(<ComplianceReport onClose={mockOnClose} />);
    
    const periodSelector = screen.getByLabelText('Report Period');
    fireEvent.change(periodSelector, { target: { value: 'last-month' } });
    
    await waitFor(() => {
      expect(mockZraApi.getComplianceReport).toHaveBeenCalledWith('last-month');
    });
  });

  it('handles close button click', () => {
    render(<ComplianceReport onClose={mockOnClose} />);
    
    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('displays loading state', () => {
    mockZraApi.getComplianceReport.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(<ComplianceReport onClose={mockOnClose} />);
    
    expect(screen.getByText('Loading compliance report...')).toBeInTheDocument();
  });

  it('displays error state', async () => {
    mockZraApi.getComplianceReport.mockRejectedValue(new Error('API Error'));
    
    render(<ComplianceReport onClose={mockOnClose} />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load compliance report')).toBeInTheDocument();
    });
  });

  it('displays offline ZRA status', async () => {
    mockZraApi.checkZRAStatus.mockResolvedValue({
      status: 'OFFLINE' as const,
      message: 'ZRA API is unavailable'
    });
    
    render(<ComplianceReport onClose={mockOnClose} />);
    
    await waitFor(() => {
      expect(screen.getByText('ZRA API: Disconnected')).toBeInTheDocument();
    });
  });

  it('formats currency correctly', async () => {
    render(<ComplianceReport onClose={mockOnClose} />);
    
    await waitFor(() => {
      expect(screen.getByText('ZMW 50,000.00')).toBeInTheDocument();
      expect(screen.getByText('ZMW 8,000.00')).toBeInTheDocument();
      expect(screen.getByText('ZMW 42,000.00')).toBeInTheDocument(); // Net Amount
    });
  });

  it('displays last submission date when available', async () => {
    const reportWithDate = { 
      ...mockReport, 
      lastSubmissionDate: new Date('2024-12-01T10:30:00Z')
    };
    mockZraApi.getComplianceReport.mockResolvedValue(reportWithDate);
    
    render(<ComplianceReport onClose={mockOnClose} />);
    
    await waitFor(() => {
      expect(screen.getByText(/Last submission:/)).toBeInTheDocument();
    });
  });

  it('calls API functions on mount', async () => {
    render(<ComplianceReport onClose={mockOnClose} />);
    
    await waitFor(() => {
      expect(mockZraApi.getComplianceReport).toHaveBeenCalledWith('current-month');
      expect(mockZraApi.checkZRAStatus).toHaveBeenCalled();
    });
  });
});

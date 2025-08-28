// src/components/reporting/__tests__/ReportingDashboard.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ReportingDashboard from '../ReportingDashboard';
import { httpsCallable } from 'firebase/functions';

jest.mock('firebase/functions', () => ({
  getFunctions: jest.fn(),
  httpsCallable: jest.fn(),
}));

describe('ReportingDashboard', () => {
  const mockHttpsCallable = httpsCallable as jest.Mock;

  beforeEach(() => {
    mockHttpsCallable.mockClear();
  });

  it('should render the dashboard and allow generating a report', async () => {
    const mockReportData = { sales: 1000, inventoryTurnover: 0.5, settlements: 500 };
    const mockGenerateReport = jest.fn(() => Promise.resolve({ data: mockReportData }));
    mockHttpsCallable.mockReturnValue(mockGenerateReport);

    render(<ReportingDashboard />);

    fireEvent.click(screen.getByText('Generate Report'));

    await waitFor(() => {
      expect(screen.getByTestId('total-sales')).toHaveTextContent('$1000.00');
      expect(screen.getByTestId('inventory-turnover')).toHaveTextContent('0.50');
    });
  });

  it('should show an error message if the report generation fails', async () => {
    const mockGenerateReport = jest.fn(() => Promise.reject('An error occurred'));
    mockHttpsCallable.mockReturnValue(mockGenerateReport);

    render(<ReportingDashboard />);

    fireEvent.click(screen.getByText('Generate Report'));

    await waitFor(() => {
      expect(screen.getByText('Failed to generate report.')).toBeInTheDocument();
    });
  });
});


import React from 'react';
import { render, screen } from '@testing-library/react';
import { EqualizationDashboard } from '../EqualizationDashboard';
import { useGetEqualizationsQuery } from '../../../store/api/paymentEqualizationApi';
import { PartsEqualization } from '../../../types/partsEqualization';

jest.mock('../../../store/api/paymentEqualizationApi');

describe('EqualizationDashboard', () => {
  const mockUseGetEqualizationsQuery = useGetEqualizationsQuery as jest.Mock;

  it('should render the dashboard title', () => {
    mockUseGetEqualizationsQuery.mockReturnValue({ data: [], isLoading: false, error: null });
    render(<EqualizationDashboard />);
    expect(screen.getByText('Payment Equalization Dashboard')).toBeInTheDocument();
  });

  it('should display a loading message', () => {
    mockUseGetEqualizationsQuery.mockReturnValue({ data: [], isLoading: true, error: null });
    render(<EqualizationDashboard />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should display an error message', () => {
    mockUseGetEqualizationsQuery.mockReturnValue({ data: [], isLoading: false, error: new Error('test error') });
    render(<EqualizationDashboard />);
    expect(screen.getByText('Error loading data.')).toBeInTheDocument();
  });

  it('should display a list of equalizations', () => {
    const mockData: PartsEqualization[] = [
      { id: '1', period: '2025-07', totalAmount: 123.45, status: 'calculated', tenantId: 'demo-tenant', partnerTenantId: 'demo-tenant', createdBy: 'system', createdAt: { toDate: () => new Date() } as any },
      { id: '2', period: '2025-06', totalAmount: 678.90, status: 'settled', tenantId: 'demo-tenant', partnerTenantId: 'demo-tenant', createdBy: 'system', createdAt: { toDate: () => new Date() } as any },
    ];
    mockUseGetEqualizationsQuery.mockReturnValue({ data: mockData, isLoading: false, error: null });
    render(<EqualizationDashboard />);
    expect(screen.getByText('2025-07')).toBeInTheDocument();
    expect(screen.getByText('123.45')).toBeInTheDocument();
    expect(screen.getByText('calculated')).toBeInTheDocument();
    expect(screen.getByText('2025-06')).toBeInTheDocument();
    expect(screen.getByText('678.90')).toBeInTheDocument();
    expect(screen.getByText('settled')).toBeInTheDocument();
  });
});

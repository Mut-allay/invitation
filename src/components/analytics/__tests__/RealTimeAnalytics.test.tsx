import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RealTimeAnalytics from '../RealTimeAnalytics';

// Mock the MainChart component
jest.mock('../../organisms/charts/MainChart', () => {
  return function MockMainChart({ data, type, dataKey, title }: any) {
    return (
      <div data-testid="main-chart">
        <div data-testid="chart-type">{type}</div>
        <div data-testid="chart-data-key">{dataKey}</div>
        <div data-testid="chart-title">{title}</div>
        <div data-testid="chart-data-length">{data?.length || 0}</div>
      </div>
    );
  };
});

describe('RealTimeAnalytics', () => {
  it('renders the component with header', () => {
    render(<RealTimeAnalytics />);
    
    expect(screen.getByText('Real-Time Analytics')).toBeInTheDocument();
    expect(screen.getByText('Live business metrics and performance')).toBeInTheDocument();
  });

  it('shows connection status', () => {
    render(<RealTimeAnalytics />);
    
    expect(screen.getByText('Connected')).toBeInTheDocument();
  });

  it('displays metrics after loading', async () => {
    render(<RealTimeAnalytics />);
    
    // Wait for metrics to load
    await waitFor(() => {
      expect(screen.getByText('Sales (Last Hour)')).toBeInTheDocument();
      expect(screen.getByText('Active Repairs')).toBeInTheDocument();
      expect(screen.getByText('New Customers')).toBeInTheDocument();
      expect(screen.getByText('Revenue (K)')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('shows live performance trends chart', async () => {
    render(<RealTimeAnalytics />);
    
    await waitFor(() => {
      expect(screen.getByText('Live Performance Trends')).toBeInTheDocument();
      expect(screen.getByTestId('main-chart')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('displays last update time', () => {
    render(<RealTimeAnalytics />);
    
    expect(screen.getByText(/Last update:/)).toBeInTheDocument();
  });

  it('formats revenue values correctly', async () => {
    render(<RealTimeAnalytics />);
    
    await waitFor(() => {
      const revenueElements = screen.getAllByText(/K \d+,?\d*/);
      expect(revenueElements.length).toBeGreaterThan(0);
    }, { timeout: 3000 });
  });
});

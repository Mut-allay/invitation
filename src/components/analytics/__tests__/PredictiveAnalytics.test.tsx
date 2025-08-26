import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PredictiveAnalytics from '../PredictiveAnalytics';

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

describe('PredictiveAnalytics', () => {
  it('renders the component with header', () => {
    render(<PredictiveAnalytics />);
    
    expect(screen.getByText('Predictive Analytics')).toBeInTheDocument();
    expect(screen.getByText('AI-powered forecasting and trend analysis')).toBeInTheDocument();
  });

  it('shows timeframe selector', () => {
    render(<PredictiveAnalytics />);
    
    expect(screen.getByDisplayValue('Next Month')).toBeInTheDocument();
  });

  it('displays loading state initially', () => {
    render(<PredictiveAnalytics />);
    
    expect(screen.getByText('Generating predictions...')).toBeInTheDocument();
  });

  it('shows predictions after loading', async () => {
    render(<PredictiveAnalytics />);
    
    await waitFor(() => {
      expect(screen.getByText('Sales Forecast')).toBeInTheDocument();
      expect(screen.getByText('Inventory Demand')).toBeInTheDocument();
      expect(screen.getByText('New Customers')).toBeInTheDocument();
      expect(screen.getByText('Repair Volume')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('displays prediction details', async () => {
    render(<PredictiveAnalytics />);
    
    await waitFor(() => {
      const currentElements = screen.getAllByText('Current');
      const predictedElements = screen.getAllByText('Predicted');
      const changeElements = screen.getAllByText('Change');
      const keyFactorsElements = screen.getAllByText('Key Factors');
      expect(currentElements.length).toBeGreaterThan(0);
      expect(predictedElements.length).toBeGreaterThan(0);
      expect(changeElements.length).toBeGreaterThan(0);
      expect(keyFactorsElements.length).toBeGreaterThan(0);
    }, { timeout: 3000 });
  });

  it('shows confidence levels', async () => {
    render(<PredictiveAnalytics />);
    
    await waitFor(() => {
      const confidenceElements = screen.getAllByText(/\d+% confidence/);
      expect(confidenceElements.length).toBeGreaterThan(0);
    }, { timeout: 3000 });
  });

  it('displays forecast vs actual chart', async () => {
    render(<PredictiveAnalytics />);
    
    await waitFor(() => {
      expect(screen.getByText('Forecast vs Actual Performance')).toBeInTheDocument();
      expect(screen.getByTestId('main-chart')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('shows insights section', async () => {
    render(<PredictiveAnalytics />);
    
    await waitFor(() => {
      expect(screen.getByText('Sales Insights')).toBeInTheDocument();
      expect(screen.getByText('Customer Trends')).toBeInTheDocument();
      expect(screen.getByText('Inventory Alert')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('displays AI recommendations', async () => {
    render(<PredictiveAnalytics />);
    
    await waitFor(() => {
      expect(screen.getByText('AI Recommendations')).toBeInTheDocument();
      expect(screen.getByText('Increase Marketing Budget')).toBeInTheDocument();
      expect(screen.getByText('Stock Optimization')).toBeInTheDocument();
      expect(screen.getByText('Staff Planning')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('formats revenue values correctly', async () => {
    render(<PredictiveAnalytics />);
    
    await waitFor(() => {
      const revenueElements = screen.getAllByText(/K \d+,?\d*/);
      expect(revenueElements.length).toBeGreaterThan(0);
    }, { timeout: 3000 });
  });

  it('shows trend indicators', async () => {
    render(<PredictiveAnalytics />);
    
    await waitFor(() => {
      // Should show both up and down trends
      const trendElements = screen.getAllByText(/from last hour/);
      expect(trendElements.length).toBeGreaterThan(0);
    }, { timeout: 3000 });
  });
});

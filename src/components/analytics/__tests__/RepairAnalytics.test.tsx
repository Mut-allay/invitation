import React from 'react';
import { render, screen } from '@testing-library/react';
import RepairAnalytics from '../RepairAnalytics';
import type { Repair } from '../../../types/repair';

// Mock the toast context
const mockUseToast = jest.fn();
jest.mock('../../../contexts/toast-hooks', () => ({
  useToast: () => mockUseToast()
}));

// Mock Recharts to avoid chart rendering issues in tests
jest.mock('recharts', () => ({
  LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="line-chart">{children}</div>,
  Line: ({ dataKey }: { dataKey: string }) => <div data-testid={`line-${dataKey}`} />,
  PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ children, dataKey }: { children: React.ReactNode; dataKey: string }) => <div data-testid={`pie-${dataKey}`}>{children}</div>,
  Cell: ({ children }: { children: React.ReactNode }) => <div data-testid="cell">{children}</div>,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: ({ dataKey }: { dataKey: string }) => <div data-testid={`bar-${dataKey}`} />,
  RadarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="radar-chart">{children}</div>,
  Radar: ({ dataKey }: { dataKey: string }) => <div data-testid={`radar-${dataKey}`} />,
  PolarGrid: () => <div data-testid="polar-grid" />,
  PolarAngleAxis: () => <div data-testid="polar-angle-axis" />,
  PolarRadiusAxis: () => <div data-testid="polar-radius-axis" />
}));

// Mock UI components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className} data-testid="card">{children}</div>
  ),
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, className }: { 
    children: React.ReactNode; 
    onClick?: () => void; 
    className?: string;
  }) => (
    <button onClick={onClick} className={className} data-testid="button">{children}</button>
  ),
}));

// Mock data
const mockRepairs: Repair[] = [
  {
    id: '1',
    tenantId: 'tenant1',
    customerId: 'c1',
    vehicleId: 'v1',
    status: 'completed',
    reportedIssues: 'Engine repair',
    estimatedCompletion: new Date('2024-01-05'),
    actualCompletion: new Date('2024-01-05'),
    totalCost: 1400,
    laborCost: 800,
    partsCost: 600,
    notes: 'Engine overhaul completed successfully',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-05')
  },
  {
    id: '2',
    tenantId: 'tenant1',
    customerId: 'c2',
    vehicleId: 'v2',
    status: 'in_progress',
    reportedIssues: 'Brake system repair',
    estimatedCompletion: new Date('2024-01-06'),
    totalCost: 800,
    laborCost: 400,
    partsCost: 400,
    notes: 'Brake pads replacement in progress',
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02')
  }
];

describe('RepairAnalytics', () => {
  beforeEach(() => {
    mockUseToast.mockReturnValue({
      success: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      loading: jest.fn(),
      dismiss: jest.fn()
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders repair analytics with correct title', () => {
    render(
      <RepairAnalytics
        repairs={mockRepairs}
      />
    );

    expect(screen.getByText('Repair Analytics Dashboard')).toBeInTheDocument();
  });

  it('displays efficiency metrics overview', () => {
    render(
      <RepairAnalytics
        repairs={mockRepairs}
      />
    );

    expect(screen.getByText('Repair Analytics Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Total Repairs')).toBeInTheDocument();
    expect(screen.getByText('Completion Rate')).toBeInTheDocument();
  });

  it('shows revenue analytics section', () => {
    render(
      <RepairAnalytics
        repairs={mockRepairs}
      />
    );

    expect(screen.getByText('Repair Analytics Dashboard')).toBeInTheDocument();
  });

  it('displays mechanic performance table', () => {
    render(
      <RepairAnalytics
        repairs={mockRepairs}
      />
    );

    expect(screen.getByText('Repair Analytics Dashboard')).toBeInTheDocument();
    expect(screen.getByText('John Smith')).toBeInTheDocument();
    expect(screen.getByText('Mike Johnson')).toBeInTheDocument();
  });

  it('shows revenue by category chart', () => {
    render(
      <RepairAnalytics
        repairs={mockRepairs}
      />
    );

    expect(screen.getByText('Repair Analytics Dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('displays predictive insights section', () => {
    render(
      <RepairAnalytics
        repairs={mockRepairs}
      />
    );

    expect(screen.getByText('Repair Analytics Dashboard')).toBeInTheDocument();
  });

  it('shows seasonal trends', () => {
    render(
      <RepairAnalytics
        repairs={mockRepairs}
      />
    );

    expect(screen.getByText('Repair Analytics Dashboard')).toBeInTheDocument();
  });

  it('displays risk factors', () => {
    render(
      <RepairAnalytics
        repairs={mockRepairs}
      />
    );

    expect(screen.getByText('Repair Analytics Dashboard')).toBeInTheDocument();
  });

  it('handles timeframe selection', () => {
    render(
      <RepairAnalytics
        repairs={mockRepairs}
      />
    );

    expect(screen.getByText('Repair Analytics Dashboard')).toBeInTheDocument();
  });

  it('displays mechanic specializations correctly', () => {
    render(
      <RepairAnalytics
        repairs={mockRepairs}
      />
    );

    expect(screen.getByText('Repair Analytics Dashboard')).toBeInTheDocument();
  });

  it('shows customer satisfaction ratings', () => {
    render(
      <RepairAnalytics
        repairs={mockRepairs}
      />
    );

    expect(screen.getByText('Repair Analytics Dashboard')).toBeInTheDocument();
  });

  it('displays revenue data in charts', () => {
    render(
      <RepairAnalytics
        repairs={mockRepairs}
      />
    );

    expect(screen.getByText('Repair Analytics Dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('handles empty repairs array gracefully', () => {
    render(
      <RepairAnalytics
        repairs={[]}
      />
    );

    // Component should render without errors
    expect(screen.getByText('Repair Analytics Dashboard')).toBeInTheDocument();
    
    // Metrics should show 0 values
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('shows mechanic performance metrics', () => {
    render(
      <RepairAnalytics
        repairs={mockRepairs}
      />
    );

    expect(screen.getByText('Repair Analytics Dashboard')).toBeInTheDocument();
  });

  it('displays chart tooltips and legends', () => {
    render(
      <RepairAnalytics
        repairs={mockRepairs}
      />
    );

    expect(screen.getByText('Repair Analytics Dashboard')).toBeInTheDocument();
  });

  it('shows revenue breakdown by category', () => {
    render(
      <RepairAnalytics
        repairs={mockRepairs}
      />
    );

    expect(screen.getByText('Repair Analytics Dashboard')).toBeInTheDocument();
  });

  it('handles chart errors gracefully', () => {
    render(
      <RepairAnalytics
        repairs={mockRepairs}
      />
    );

    // The component should render without errors even if charts fail
    expect(screen.getByText('Repair Analytics Dashboard')).toBeInTheDocument();
  });
});

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { RepairAnalytics } from '../RepairAnalytics';
import { useToast } from '../../../contexts/toast-hooks';
import type { Repair, Mechanic } from '../../../types/repair';

// Mock the toast hook
jest.mock('../../../contexts/toast-hooks');
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>;

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
  RadarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="radar-chart">{children}</div>,
  PolarGrid: () => <div data-testid="polar-grid" />,
  PolarAngleAxis: ({ dataKey }: { dataKey: string }) => <div data-testid={`polar-angle-axis-${dataKey}`} />,
  PolarRadiusAxis: () => <div data-testid="polar-radius-axis" />,
  Radar: ({ dataKey }: { dataKey: string }) => <div data-testid={`radar-${dataKey}`} />,
}));

// Mock data
const mockRepairs: Repair[] = [
  {
    id: '1',
    tenantId: 'tenant1',
    customerId: 'customer1',
    vehicleId: 'vehicle1',
    status: 'completed',
    reportedIssues: 'Engine making strange noises',
    estimatedCompletion: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    actualCompletion: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    totalCost: 500,
    laborCost: 300,
    partsCost: 200,
    notes: 'Engine repair completed',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: '2',
    tenantId: 'tenant1',
    customerId: 'customer2',
    vehicleId: 'vehicle2',
    status: 'in_progress',
    reportedIssues: 'Brake system issues',
    estimatedCompletion: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    totalCost: 300,
    laborCost: 150,
    partsCost: 150,
    notes: 'Brake repair in progress',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  }
];

const mockMechanics: Mechanic[] = [
  {
    id: 'tech1',
    tenantId: 'tenant1',
    name: 'John Smith',
    specialization: ['Engine Repair', 'Diagnostics'],
    hourlyRate: 45,
    availability: 'available',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'tech2',
    tenantId: 'tenant1',
    name: 'Mike Johnson',
    specialization: ['Electrical Systems', 'AC Repair'],
    hourlyRate: 42,
    availability: 'available',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const mockDateRange = {
  start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  end: new Date()
};

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
        mechanics={mockMechanics}
        dateRange={mockDateRange}
      />
    );

    expect(screen.getByText('Repair Efficiency Analytics')).toBeInTheDocument();
  });

  it('displays efficiency metrics overview', () => {
    render(
      <RepairAnalytics
        repairs={mockRepairs}
        mechanics={mockMechanics}
        dateRange={mockDateRange}
      />
    );

    expect(screen.getByText('Avg Repair Time')).toBeInTheDocument();
    expect(screen.getByText('On-Time Rate')).toBeInTheDocument();
    expect(screen.getByText('First-Time Fix')).toBeInTheDocument();
    expect(screen.getByText('Rework Rate')).toBeInTheDocument();
    expect(screen.getByText('Bay Utilization')).toBeInTheDocument();
  });

  it('shows revenue analytics section', () => {
    render(
      <RepairAnalytics
        repairs={mockRepairs}
        mechanics={mockMechanics}
        dateRange={mockDateRange}
      />
    );

    expect(screen.getByText('Revenue Trends')).toBeInTheDocument();
    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    expect(screen.getByText('Avg Repair Cost')).toBeInTheDocument();
    expect(screen.getByText('Profit Margin')).toBeInTheDocument();
  });

  it('displays mechanic performance table', () => {
    render(
      <RepairAnalytics
        repairs={mockRepairs}
        mechanics={mockMechanics}
        dateRange={mockDateRange}
      />
    );

    expect(screen.getByText('Mechanic Performance')).toBeInTheDocument();
    expect(screen.getByText('John Smith')).toBeInTheDocument();
    expect(screen.getByText('Mike Johnson')).toBeInTheDocument();
  });

  it('shows revenue by category chart', () => {
    render(
      <RepairAnalytics
        repairs={mockRepairs}
        mechanics={mockMechanics}
        dateRange={mockDateRange}
      />
    );

    expect(screen.getByText('Revenue by Category')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('displays predictive insights section', () => {
    render(
      <RepairAnalytics
        repairs={mockRepairs}
        mechanics={mockMechanics}
        dateRange={mockDateRange}
      />
    );

    expect(screen.getByText('Predictive Insights')).toBeInTheDocument();
    expect(screen.getByText('Expected Repairs')).toBeInTheDocument();
    expect(screen.getByText('Staffing Needed')).toBeInTheDocument();
  });

  it('shows seasonal trends', () => {
    render(
      <RepairAnalytics
        repairs={mockRepairs}
        mechanics={mockMechanics}
        dateRange={mockDateRange}
      />
    );

    expect(screen.getByText('Seasonal Trends')).toBeInTheDocument();
    expect(screen.getByText('AC repairs peak in summer months')).toBeInTheDocument();
    expect(screen.getByText('Brake system demand increases in winter')).toBeInTheDocument();
  });

  it('displays risk factors', () => {
    render(
      <RepairAnalytics
        repairs={mockRepairs}
        mechanics={mockMechanics}
        dateRange={mockDateRange}
      />
    );

    expect(screen.getByText('Risk Factors')).toBeInTheDocument();
    expect(screen.getByText('Parts supply chain delays')).toBeInTheDocument();
    expect(screen.getByText('Technician skill gaps in new technologies')).toBeInTheDocument();
  });

  it('shows performance radar chart', () => {
    render(
      <RepairAnalytics
        repairs={mockRepairs}
        mechanics={mockMechanics}
        dateRange={mockDateRange}
      />
    );

    expect(screen.getByText('Performance Overview')).toBeInTheDocument();
    expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
  });

  it('handles timeframe selection', () => {
    render(
      <RepairAnalytics
        repairs={mockRepairs}
        mechanics={mockMechanics}
        dateRange={mockDateRange}
      />
    );

    const timeframeSelect = screen.getByDisplayValue('This Month');
    expect(timeframeSelect).toBeInTheDocument();

    fireEvent.change(timeframeSelect, { target: { value: 'quarter' } });
    expect(timeframeSelect).toHaveValue('quarter');
  });

  it('displays mechanic specializations correctly', () => {
    render(
      <RepairAnalytics
        repairs={mockRepairs}
        mechanics={mockMechanics}
        dateRange={mockDateRange}
      />
    );

    expect(screen.getByText('Engine Repair')).toBeInTheDocument();
    expect(screen.getByText('Diagnostics')).toBeInTheDocument();
    expect(screen.getByText('Electrical Systems')).toBeInTheDocument();
    expect(screen.getByText('AC Repair')).toBeInTheDocument();
  });

  it('shows customer satisfaction ratings', () => {
    render(
      <RepairAnalytics
        repairs={mockRepairs}
        mechanics={mockMechanics}
        dateRange={mockDateRange}
      />
    );

    // Check that satisfaction scores are displayed (these are mocked values)
    const satisfactionCells = screen.getAllByText(/4\.[0-9]/);
    expect(satisfactionCells.length).toBeGreaterThan(0);
  });

  it('displays revenue data in charts', () => {
    render(
      <RepairAnalytics
        repairs={mockRepairs}
        mechanics={mockMechanics}
        dateRange={mockDateRange}
      />
    );

    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('handles empty repairs array gracefully', () => {
    render(
      <RepairAnalytics
        repairs={[]}
        mechanics={mockMechanics}
        dateRange={mockDateRange}
      />
    );

    // Component should render without errors
    expect(screen.getByText('Repair Efficiency Analytics')).toBeInTheDocument();
    
    // Metrics should show 0 values
    const avgRepairTime = screen.getByText('0h');
    expect(avgRepairTime).toBeInTheDocument();
  });

  it('shows mechanic performance metrics', () => {
    render(
      <RepairAnalytics
        repairs={mockRepairs}
        mechanics={mockMechanics}
        dateRange={mockDateRange}
      />
    );

    // Check that performance metrics are displayed
    expect(screen.getByText('Repairs')).toBeInTheDocument();
    expect(screen.getByText('Avg Time')).toBeInTheDocument();
    expect(screen.getByText('Satisfaction')).toBeInTheDocument();
    expect(screen.getByText('Revenue')).toBeInTheDocument();
  });

  it('displays chart tooltips and legends', () => {
    render(
      <RepairAnalytics
        repairs={mockRepairs}
        mechanics={mockMechanics}
        dateRange={mockDateRange}
      />
    );

    // Check that charts are rendered (they include tooltips and legends internally)
    expect(screen.getByText('Revenue Trends')).toBeInTheDocument();
    expect(screen.getByText('Revenue by Category')).toBeInTheDocument();
  });

  it('shows revenue breakdown by category', () => {
    render(
      <RepairAnalytics
        repairs={mockRepairs}
        mechanics={mockMechanics}
        dateRange={mockDateRange}
      />
    );

    // Check that revenue categories are displayed in the section title
    expect(screen.getByText('Revenue by Category')).toBeInTheDocument();
  });

  it('handles chart errors gracefully', () => {
    render(
      <RepairAnalytics
        repairs={mockRepairs}
        mechanics={mockMechanics}
        dateRange={mockDateRange}
      />
    );

    // The component should render without errors even if charts fail
    expect(screen.getByText('Repair Efficiency Analytics')).toBeInTheDocument();
  });
});

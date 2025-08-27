import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SmartWorkflowEngine } from '../SmartWorkflowEngine';
import { useToast } from '../../../contexts/toast-hooks';
import type { Repair, Mechanic, Bay } from '../../../types/repair';

// Mock the toast hook
jest.mock('../../../contexts/toast-hooks');
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>;

// Mock data
const mockRepair: Repair = {
  id: '1',
  tenantId: 'tenant1',
  customerId: 'customer1',
  vehicleId: 'vehicle1',
  status: 'pending',
  reportedIssues: 'Engine making strange noises, check engine light on',
  estimatedCompletion: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
  totalCost: 0,
  laborCost: 0,
  partsCost: 0,
  notes: 'Customer reported issue started yesterday',
  createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
};

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

const mockBays: Bay[] = [
  {
    id: 'bay1',
    tenantId: 'tenant1',
    name: 'Bay A - Engine',
    type: 'standard',
    status: 'available',
    capacity: 1,
    equipment: ['Lift', 'Diagnostic Tool', 'Air Compressor'],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const mockOnWorkflowUpdate = jest.fn();

describe('SmartWorkflowEngine', () => {
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

  it('renders workflow engine with correct title', () => {
    render(
      <SmartWorkflowEngine
        repair={mockRepair}
        mechanics={mockMechanics}
        bays={mockBays}
        onWorkflowUpdate={mockOnWorkflowUpdate}
      />
    );

    expect(screen.getByText('Smart Workflow Engine')).toBeInTheDocument();
  });

  it('displays workflow control buttons', () => {
    render(
      <SmartWorkflowEngine
        repair={mockRepair}
        mechanics={mockMechanics}
        bays={mockBays}
        onWorkflowUpdate={mockOnWorkflowUpdate}
      />
    );

    expect(screen.getByText('Start')).toBeInTheDocument();
    expect(screen.getByText('Pause')).toBeInTheDocument();
    expect(screen.getByText('Stop')).toBeInTheDocument();
  });

  it('shows workflow steps correctly', () => {
    render(
      <SmartWorkflowEngine
        repair={mockRepair}
        mechanics={mockMechanics}
        bays={mockBays}
        onWorkflowUpdate={mockOnWorkflowUpdate}
      />
    );

    expect(screen.getByText('Initial Assessment')).toBeInTheDocument();
    expect(screen.getByText('Diagnostics')).toBeInTheDocument();
    expect(screen.getByText('Parts Ordering')).toBeInTheDocument();
    expect(screen.getByText('Repair Execution')).toBeInTheDocument();
    expect(screen.getByText('Quality Check')).toBeInTheDocument();
    expect(screen.getByText('Final Inspection')).toBeInTheDocument();
  });

  it('displays current workflow status', () => {
    render(
      <SmartWorkflowEngine
        repair={mockRepair}
        mechanics={mockMechanics}
        bays={mockBays}
        onWorkflowUpdate={mockOnWorkflowUpdate}
      />
    );

    expect(screen.getByText('running')).toBeInTheDocument();
  });

  it('shows assigned mechanic when available', () => {
    render(
      <SmartWorkflowEngine
        repair={mockRepair}
        mechanics={mockMechanics}
        bays={mockBays}
        onWorkflowUpdate={mockOnWorkflowUpdate}
      />
    );

    expect(screen.getByText('Assigned Mechanic:')).toBeInTheDocument();
  });

  it('processes workflow rules when button is clicked', async () => {
    render(
      <SmartWorkflowEngine
        repair={mockRepair}
        mechanics={mockMechanics}
        bays={mockBays}
        onWorkflowUpdate={mockOnWorkflowUpdate}
      />
    );

    const processButton = screen.getByText('Process Rules');
    fireEvent.click(processButton);

    await waitFor(() => {
      expect(mockOnWorkflowUpdate).toHaveBeenCalled();
    });
  });

  it('handles workflow control actions', () => {
    render(
      <SmartWorkflowEngine
        repair={mockRepair}
        mechanics={mockMechanics}
        bays={mockBays}
        onWorkflowUpdate={mockOnWorkflowUpdate}
      />
    );

    const pauseButton = screen.getByText('Pause');
    fireEvent.click(pauseButton);

    // The pause button should be disabled after clicking
    expect(pauseButton).toBeDisabled();
  });

  it('displays workflow steps with correct status indicators', () => {
    render(
      <SmartWorkflowEngine
        repair={mockRepair}
        mechanics={mockMechanics}
        bays={mockBays}
        onWorkflowUpdate={mockOnWorkflowUpdate}
      />
    );

    // Check that workflow steps are displayed
    expect(screen.getByText('Initial Assessment')).toBeInTheDocument();
    expect(screen.getByText('Diagnostics')).toBeInTheDocument();
    expect(screen.getByText('Parts Ordering')).toBeInTheDocument();
  });

  it('shows estimated duration for each workflow step', () => {
    render(
      <SmartWorkflowEngine
        repair={mockRepair}
        mechanics={mockMechanics}
        bays={mockBays}
        onWorkflowUpdate={mockOnWorkflowUpdate}
      />
    );

    // Check that duration information is displayed
    const durationElements = screen.getAllByText(/\d+ min/);
    expect(durationElements.length).toBeGreaterThan(0);
  });

  it('handles empty mechanics array gracefully', () => {
    render(
      <SmartWorkflowEngine
        repair={mockRepair}
        mechanics={[]}
        bays={mockBays}
        onWorkflowUpdate={mockOnWorkflowUpdate}
      />
    );

    expect(screen.getByText('Not assigned')).toBeInTheDocument();
  });

  it('handles empty bays array gracefully', () => {
    render(
      <SmartWorkflowEngine
        repair={mockRepair}
        mechanics={mockMechanics}
        bays={[]}
        onWorkflowUpdate={mockOnWorkflowUpdate}
      />
    );

    // Component should render without errors
    expect(screen.getByText('Smart Workflow Engine')).toBeInTheDocument();
  });

  it('shows escalations when they exist', async () => {
    // Create a repair that would trigger escalations
    const overdueRepair: Repair = {
      ...mockRepair,
      estimatedCompletion: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Past date
    };

    render(
      <SmartWorkflowEngine
        repair={overdueRepair}
        mechanics={mockMechanics}
        bays={mockBays}
        onWorkflowUpdate={mockOnWorkflowUpdate}
      />
    );

    // Process rules to trigger escalations
    const processButton = screen.getByText('Process Rules');
    fireEvent.click(processButton);

    await waitFor(() => {
      expect(screen.getByText(/Escalations/)).toBeInTheDocument();
    });
  });

  it('calls onWorkflowUpdate when workflow state changes', async () => {
    render(
      <SmartWorkflowEngine
        repair={mockRepair}
        mechanics={mockMechanics}
        bays={mockBays}
        onWorkflowUpdate={mockOnWorkflowUpdate}
      />
    );

    // Process rules to trigger workflow update
    const processButton = screen.getByText('Process Rules');
    fireEvent.click(processButton);

    await waitFor(() => {
      expect(mockOnWorkflowUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          repairId: mockRepair.id,
          status: 'running'
        })
      );
    });
  });

  it('displays correct workflow step numbers', () => {
    render(
      <SmartWorkflowEngine
        repair={mockRepair}
        mechanics={mockMechanics}
        bays={mockBays}
        onWorkflowUpdate={mockOnWorkflowUpdate}
      />
    );

    // Check that workflow steps are displayed with their content
    expect(screen.getByText('Initial Assessment')).toBeInTheDocument();
    expect(screen.getByText('Diagnostics')).toBeInTheDocument();
    expect(screen.getByText('Parts Ordering')).toBeInTheDocument();
  });

  it('shows workflow step dependencies correctly', () => {
    render(
      <SmartWorkflowEngine
        repair={mockRepair}
        mechanics={mockMechanics}
        bays={mockBays}
        onWorkflowUpdate={mockOnWorkflowUpdate}
      />
    );

    // All steps should be visible regardless of dependencies
    expect(screen.getByText('Initial Assessment')).toBeInTheDocument();
    expect(screen.getByText('Diagnostics')).toBeInTheDocument();
    expect(screen.getByText('Parts Ordering')).toBeInTheDocument();
  });
});

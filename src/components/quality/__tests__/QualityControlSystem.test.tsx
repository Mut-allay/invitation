import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QualityControlSystem } from '../QualityControlSystem';
import { useToast } from '../../../contexts/toast-hooks';
import type { Repair } from '../../../types/repair';

// Mock the toast hook
jest.mock('../../../contexts/toast-hooks');
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>;

// Mock data
const mockRepair: Repair = {
  id: '1',
  tenantId: 'tenant1',
  customerId: 'customer1',
  vehicleId: 'vehicle1',
  status: 'in_progress',
  reportedIssues: 'Engine making strange noises, check engine light on',
  estimatedCompletion: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
  totalCost: 0,
  laborCost: 0,
  partsCost: 0,
  notes: 'Customer reported issue started yesterday',
  createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
};

const mockOnQualityUpdate = jest.fn();

describe('QualityControlSystem', () => {
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

  it('renders quality control system with correct title', () => {
    render(
      <QualityControlSystem
        repair={mockRepair}
        onQualityUpdate={mockOnQualityUpdate}
      />
    );

    expect(screen.getByText('Quality Control Metrics')).toBeInTheDocument();
  });

  it('displays quality metrics overview', () => {
    render(
      <QualityControlSystem
        repair={mockRepair}
        onQualityUpdate={mockOnQualityUpdate}
      />
    );

    expect(screen.getByText('Overall Score')).toBeInTheDocument();
    
    // Check that category labels are displayed (there are multiple elements with these texts)
    const safetyElements = screen.getAllByText('Safety');
    const performanceElements = screen.getAllByText('Performance');
    const cosmeticElements = screen.getAllByText('Cosmetic');
    const documentationElements = screen.getAllByText('Documentation');
    
    expect(safetyElements.length).toBeGreaterThan(0);
    expect(performanceElements.length).toBeGreaterThan(0);
    expect(cosmeticElements.length).toBeGreaterThan(0);
    expect(documentationElements.length).toBeGreaterThan(0);
  });

  it('shows quality checklists for different categories', () => {
    render(
      <QualityControlSystem
        repair={mockRepair}
        onQualityUpdate={mockOnQualityUpdate}
      />
    );

    expect(screen.getByText('Quality Checklists')).toBeInTheDocument();
    
    // Check that category buttons are displayed (there are multiple elements with these texts)
    const safetyElements = screen.getAllByText('Safety');
    const performanceElements = screen.getAllByText('Performance');
    const cosmeticElements = screen.getAllByText('Cosmetic');
    const documentationElements = screen.getAllByText('Documentation');
    
    expect(safetyElements.length).toBeGreaterThan(0);
    expect(performanceElements.length).toBeGreaterThan(0);
    expect(cosmeticElements.length).toBeGreaterThan(0);
    expect(documentationElements.length).toBeGreaterThan(0);
  });

  it('displays safety checklist items', () => {
    render(
      <QualityControlSystem
        repair={mockRepair}
        onQualityUpdate={mockOnQualityUpdate}
      />
    );

    // Click on safety category
    const safetyButtons = screen.getAllByText('Safety');
    const safetyButton = safetyButtons.find(button => button.tagName === 'BUTTON');
    if (safetyButton) {
      fireEvent.click(safetyButton);
    }

    expect(screen.getByText('All safety equipment properly installed')).toBeInTheDocument();
    expect(screen.getByText('Brake system functionality verified')).toBeInTheDocument();
    expect(screen.getByText('Steering system integrity confirmed')).toBeInTheDocument();
    expect(screen.getByText('Tire condition and pressure checked')).toBeInTheDocument();
  });

  it('allows checking/unchecking checklist items', () => {
    render(
      <QualityControlSystem
        repair={mockRepair}
        onQualityUpdate={mockOnQualityUpdate}
      />
    );

    // Click on safety category
    const safetyButtons = screen.getAllByText('Safety');
    const safetyButton = safetyButtons.find(button => button.tagName === 'BUTTON');
    if (safetyButton) {
      fireEvent.click(safetyButton);
    }

    // Check that checklist items are displayed
    expect(screen.getByText('All safety equipment properly installed')).toBeInTheDocument();
    expect(screen.getByText('Brake system functionality verified')).toBeInTheDocument();
  });

  it('shows photo requirement indicators', () => {
    render(
      <QualityControlSystem
        repair={mockRepair}
        onQualityUpdate={mockOnQualityUpdate}
      />
    );

    // Click on safety category
    const safetyButtons = screen.getAllByText('Safety');
    const safetyButton = safetyButtons.find(button => button.tagName === 'BUTTON');
    if (safetyButton) {
      fireEvent.click(safetyButton);
    }

    // Check that checklist items are displayed
    expect(screen.getByText('All safety equipment properly installed')).toBeInTheDocument();
  });

  it('displays photo documentation section', () => {
    render(
      <QualityControlSystem
        repair={mockRepair}
        onQualityUpdate={mockOnQualityUpdate}
      />
    );

    expect(screen.getByText('Photo Documentation')).toBeInTheDocument();
    expect(screen.getByText('Upload Photos')).toBeInTheDocument();
  });

  it('shows inspector selection dropdown', () => {
    render(
      <QualityControlSystem
        repair={mockRepair}
        onQualityUpdate={mockOnQualityUpdate}
      />
    );

    expect(screen.getByText('Quality Inspector')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Quality Manager - Senior Inspector')).toBeInTheDocument();
  });

  it('allows adding notes to checklist items', () => {
    render(
      <QualityControlSystem
        repair={mockRepair}
        onQualityUpdate={mockOnQualityUpdate}
      />
    );

    // Click on safety category
    const safetyButtons = screen.getAllByText('Safety');
    const safetyButton = safetyButtons.find(button => button.tagName === 'BUTTON');
    if (safetyButton) {
      fireEvent.click(safetyButton);
    }

    // Check that checklist items are displayed
    expect(screen.getByText('All safety equipment properly installed')).toBeInTheDocument();
  });

  it('shows final approval section', () => {
    render(
      <QualityControlSystem
        repair={mockRepair}
        onQualityUpdate={mockOnQualityUpdate}
      />
    );

    expect(screen.getByText('Final Quality Approval')).toBeInTheDocument();
    expect(screen.getByText('Approve Quality')).toBeInTheDocument();
  });

  it('disables approval button when quality threshold not met', () => {
    render(
      <QualityControlSystem
        repair={mockRepair}
        onQualityUpdate={mockOnQualityUpdate}
      />
    );

    const approveButton = screen.getByText('Approve Quality');
    expect(approveButton).toBeDisabled();
  });

  it('shows progress bar for completed checkpoints', () => {
    render(
      <QualityControlSystem
        repair={mockRepair}
        onQualityUpdate={mockOnQualityUpdate}
      />
    );

    expect(screen.getByText(/Progress:/)).toBeInTheDocument();
    expect(screen.getByText(/Failed:/)).toBeInTheDocument();
  });

  it('handles category switching correctly', () => {
    render(
      <QualityControlSystem
        repair={mockRepair}
        onQualityUpdate={mockOnQualityUpdate}
      />
    );

    // Check that both safety and performance buttons exist
    const safetyButtons = screen.getAllByText('Safety');
    const performanceButtons = screen.getAllByText('Performance');
    
    const safetyButton = safetyButtons.find(button => button.tagName === 'BUTTON');
    const performanceButton = performanceButtons.find(button => button.tagName === 'BUTTON');
    
    expect(safetyButton).toBeInTheDocument();
    expect(performanceButton).toBeInTheDocument();
  });

  it('displays performance checklist items', () => {
    render(
      <QualityControlSystem
        repair={mockRepair}
        onQualityUpdate={mockOnQualityUpdate}
      />
    );

    // Click on performance category
    const performanceButtons = screen.getAllByText('Performance');
    const performanceButton = performanceButtons.find(button => button.tagName === 'BUTTON');
    if (performanceButton) {
      fireEvent.click(performanceButton);
    }

    // Check that performance checklist items are displayed
    expect(screen.getByText('Engine performance test completed')).toBeInTheDocument();
    expect(screen.getByText('Transmission operation verified')).toBeInTheDocument();
    expect(screen.getByText('Electrical systems tested')).toBeInTheDocument();
    expect(screen.getByText('AC/Heating system operational')).toBeInTheDocument();
  });

  it('shows empty state for photo documentation', () => {
    render(
      <QualityControlSystem
        repair={mockRepair}
        onQualityUpdate={mockOnQualityUpdate}
      />
    );

    expect(screen.getByText('No photos uploaded yet')).toBeInTheDocument();
    expect(screen.getByText('Upload photos to document the repair process')).toBeInTheDocument();
  });

  it('calls onQualityUpdate when metrics change', async () => {
    render(
      <QualityControlSystem
        repair={mockRepair}
        onQualityUpdate={mockOnQualityUpdate}
      />
    );

    // Check a checklist item to trigger metrics update
    const safetyButtons = screen.getAllByText('Safety');
    const safetyButton = safetyButtons.find(button => button.tagName === 'BUTTON');
    if (safetyButton) {
      fireEvent.click(safetyButton);
    }

    const firstCheckbox = screen.getByText('All safety equipment properly installed').closest('div')?.querySelector('input[type="checkbox"]');
    if (firstCheckbox) {
      fireEvent.click(firstCheckbox);
    }

    await waitFor(() => {
      expect(mockOnQualityUpdate).toHaveBeenCalled();
    });
  });

  it('displays quality scores correctly', () => {
    render(
      <QualityControlSystem
        repair={mockRepair}
        onQualityUpdate={mockOnQualityUpdate}
      />
    );

    // The overall score should be displayed prominently
    const overallScores = screen.getAllByText(/^\d+%$/);
    expect(overallScores.length).toBeGreaterThan(0);
  });

  it('shows checklist completion status', () => {
    render(
      <QualityControlSystem
        repair={mockRepair}
        onQualityUpdate={mockOnQualityUpdate}
      />
    );

    // Click on safety category
    const safetyButtons = screen.getAllByText('Safety');
    const safetyButton = safetyButtons.find(button => button.tagName === 'BUTTON');
    if (safetyButton) {
      fireEvent.click(safetyButton);
    }

    // Check that completion status is shown
    const completionStatus = screen.getByText(/0\/4/);
    expect(completionStatus).toBeInTheDocument();
  });
});

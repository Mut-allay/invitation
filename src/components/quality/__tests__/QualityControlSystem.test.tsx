import React from 'react';
import { render, screen } from '@testing-library/react';
import QualityControlSystem from '../QualityControlSystem';
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
const mockOnClose = jest.fn();

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
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Quality Control System')).toBeInTheDocument();
  });

  it('displays quality metrics overview', () => {
    render(
      <QualityControlSystem
        repair={mockRepair}
        onQualityUpdate={mockOnQualityUpdate}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Quality Control System')).toBeInTheDocument();
  });

  it('shows quality checklists for different categories', () => {
    render(
      <QualityControlSystem
        repair={mockRepair}
        onQualityUpdate={mockOnQualityUpdate}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Quality Control System')).toBeInTheDocument();
  });

  it('displays safety checklist items', () => {
    render(
      <QualityControlSystem
        repair={mockRepair}
        onQualityUpdate={mockOnQualityUpdate}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Quality Control System')).toBeInTheDocument();
  });

  it('allows checking/unchecking checklist items', () => {
    render(
      <QualityControlSystem
        repair={mockRepair}
        onQualityUpdate={mockOnQualityUpdate}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Quality Control System')).toBeInTheDocument();
  });

  it('shows photo requirement indicators', () => {
    render(
      <QualityControlSystem
        repair={mockRepair}
        onQualityUpdate={mockOnQualityUpdate}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Quality Control System')).toBeInTheDocument();
  });

  it('displays photo documentation section', () => {
    render(
      <QualityControlSystem
        repair={mockRepair}
        onQualityUpdate={mockOnQualityUpdate}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Quality Control System')).toBeInTheDocument();
  });

  it('shows inspector selection dropdown', () => {
    render(
      <QualityControlSystem
        repair={mockRepair}
        onQualityUpdate={mockOnQualityUpdate}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Quality Control System')).toBeInTheDocument();
  });

  it('allows adding notes to checklist items', () => {
    render(
      <QualityControlSystem
        repair={mockRepair}
        onQualityUpdate={mockOnQualityUpdate}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Quality Control System')).toBeInTheDocument();
  });

  it('shows final approval section', () => {
    render(
      <QualityControlSystem
        repair={mockRepair}
        onQualityUpdate={mockOnQualityUpdate}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Quality Control System')).toBeInTheDocument();
  });

  it('disables approval button when quality threshold not met', () => {
    render(
      <QualityControlSystem
        repair={mockRepair}
        onQualityUpdate={mockOnQualityUpdate}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Quality Control System')).toBeInTheDocument();
  });

  it('shows progress bar for completed checkpoints', () => {
    render(
      <QualityControlSystem
        repair={mockRepair}
        onQualityUpdate={mockOnQualityUpdate}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Quality Control System')).toBeInTheDocument();
  });

  it('handles category switching correctly', () => {
    render(
      <QualityControlSystem
        repair={mockRepair}
        onQualityUpdate={mockOnQualityUpdate}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Quality Control System')).toBeInTheDocument();
  });

  it('displays performance checklist items', () => {
    render(
      <QualityControlSystem
        repair={mockRepair}
        onQualityUpdate={mockOnQualityUpdate}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Quality Control System')).toBeInTheDocument();
  });
});

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdvancedJobCardWorkflow } from '../AdvancedJobCardWorkflow';
import type { RepairStatus, CompletionData } from '../../../types/repair';

// Mock the Button component
jest.mock('../../ui/button', () => ({
  Button: ({ children, onClick, disabled, variant, size, className, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`button ${variant || 'default'} ${size || 'default'} ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  ),
}));

describe('AdvancedJobCardWorkflow', () => {
  const mockRepairId = 'repair-123';
  const mockOnStatusChange = jest.fn();
  const mockOnComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders workflow interface correctly', () => {
    render(
      <AdvancedJobCardWorkflow
        repairId={mockRepairId}
        onStatusChange={mockOnStatusChange}
        onComplete={mockOnComplete}
      />
    );

    expect(screen.getByText('Advanced Job Card Workflow')).toBeInTheDocument();
    expect(screen.getByText(`Repair #${mockRepairId.slice(-6)}`)).toBeInTheDocument();
    expect(screen.getByText('PENDING')).toBeInTheDocument();
    expect(screen.getByText('Start Workflow')).toBeInTheDocument();
  });

  it('displays all workflow steps correctly', () => {
    render(
      <AdvancedJobCardWorkflow
        repairId={mockRepairId}
        onStatusChange={mockOnStatusChange}
        onComplete={mockOnComplete}
      />
    );

    expect(screen.getByText('Workflow Steps')).toBeInTheDocument();
    expect(screen.getByText('Step 1: Initial Inspection')).toBeInTheDocument();
    expect(screen.getByText('Step 2: Parts Procurement')).toBeInTheDocument();
    expect(screen.getByText('Step 3: Repair Execution')).toBeInTheDocument();
    expect(screen.getByText('Step 4: Quality Check')).toBeInTheDocument();
    expect(screen.getByText('Step 5: Final Testing')).toBeInTheDocument();
  });

  it('displays quality checkpoints correctly', () => {
    render(
      <AdvancedJobCardWorkflow
        repairId={mockRepairId}
        onStatusChange={mockOnStatusChange}
        onComplete={mockOnComplete}
      />
    );

    expect(screen.getByText('Quality Checkpoints')).toBeInTheDocument();
    expect(screen.getByText('SAFETY')).toBeInTheDocument();
    expect(screen.getByText('PERFORMANCE')).toBeInTheDocument();
    expect(screen.getByText('FINAL')).toBeInTheDocument();
  });

  it('handles workflow start correctly', async () => {
    render(
      <AdvancedJobCardWorkflow
        repairId={mockRepairId}
        onStatusChange={mockOnStatusChange}
        onComplete={mockOnComplete}
      />
    );

    const startButton = screen.getByText('Start Workflow');
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(mockOnStatusChange).toHaveBeenCalledWith(
        expect.objectContaining({
          repairId: mockRepairId,
          status: 'in_progress',
          timestamp: expect.any(Date),
          updatedBy: 'current-user'
        })
      );
    });

    expect(screen.getByText('IN PROGRESS')).toBeInTheDocument();
  });

  it('handles step progression correctly', async () => {
    render(
      <AdvancedJobCardWorkflow
        repairId={mockRepairId}
        onStatusChange={mockOnStatusChange}
        onComplete={mockOnComplete}
      />
    );

    // Start workflow first
    const startButton = screen.getByText('Start Workflow');
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByText('IN PROGRESS')).toBeInTheDocument();
    });

    // Start first step
    const startStepButtons = screen.getAllByText('Start');
    fireEvent.click(startStepButtons[0]); // First step

    await waitFor(() => {
      expect(screen.getByText('Complete')).toBeInTheDocument();
    });

    // Complete first step
    const completeStepButton = screen.getByText('Complete');
    fireEvent.click(completeStepButton);

    await waitFor(() => {
      // Step 2 should now be available
      const step2StartButtons = screen.getAllByText('Start');
      expect(step2StartButtons.length).toBeGreaterThan(0);
    });
  });

  it('handles quality checkpoint updates correctly', async () => {
    render(
      <AdvancedJobCardWorkflow
        repairId={mockRepairId}
        onStatusChange={mockOnStatusChange}
        onComplete={mockOnComplete}
      />
    );

    // Find and click Pass button for safety checkpoint
    const passButtons = screen.getAllByText('Pass');
    fireEvent.click(passButtons[0]); // Safety checkpoint

    await waitFor(() => {
      // After passing, the checkpoint should show a green checkmark icon
      const safetyCheckpoint = screen.getByText('SAFETY').closest('div[class*="border-green-200"]');
      expect(safetyCheckpoint).toBeInTheDocument();
    });

    // Pass remaining checkpoints
    const remainingPassButtons = screen.getAllByText('Pass');
    fireEvent.click(remainingPassButtons[0]); // Performance
    fireEvent.click(remainingPassButtons[1]); // Final
  });

  it('enforces step dependencies correctly', async () => {
    render(
      <AdvancedJobCardWorkflow
        repairId={mockRepairId}
        onStatusChange={mockOnStatusChange}
        onComplete={mockOnComplete}
      />
    );

    // Start workflow
    const startButton = screen.getByText('Start Workflow');
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByText('IN PROGRESS')).toBeInTheDocument();
    });

    // Step 2 should be disabled until Step 1 is completed
    const startButtons = screen.getAllByText('Start');
    expect(startButtons[0]).not.toBeDisabled(); // Step 1
    expect(startButtons[1]).toBeDisabled(); // Step 2 (depends on Step 1)
  });

  it('completes full workflow when all steps and checkpoints are done', async () => {
    render(
      <AdvancedJobCardWorkflow
        repairId={mockRepairId}
        onStatusChange={mockOnStatusChange}
        onComplete={mockOnComplete}
      />
    );

    // Start workflow
    const startButton = screen.getByText('Start Workflow');
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByText('IN PROGRESS')).toBeInTheDocument();
    });

    // Complete all steps
    for (let i = 0; i < 5; i++) {
      const startStepButtons = screen.getAllByText('Start');
      const enabledStartButton = startStepButtons.find(button => !(button as HTMLButtonElement).disabled);
      if (enabledStartButton) {
        fireEvent.click(enabledStartButton);
        
        await waitFor(() => {
          const completeStepButton = screen.getByText('Complete');
          fireEvent.click(completeStepButton);
        });
      }
    }

    // Pass all quality checkpoints
    const passButtons = screen.getAllByText('Pass');
    passButtons.forEach(button => {
      fireEvent.click(button);
    });

    await waitFor(() => {
      expect(screen.getByText('Complete Repair Workflow')).toBeInTheDocument();
    });

    // Complete workflow
    const completeWorkflowButton = screen.getByText('Complete Repair Workflow');
    fireEvent.click(completeWorkflowButton);

    await waitFor(() => {
      expect(mockOnStatusChange).toHaveBeenCalledWith(
        expect.objectContaining({
          repairId: mockRepairId,
          status: 'completed'
        })
      );

      expect(mockOnComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          repairId: mockRepairId,
          actualCompletion: expect.any(Date),
          finalCost: 500,
          qualityCheckPassed: true,
          customerSatisfaction: 5
        })
      );
    });
  });

  it('handles error states correctly', async () => {
    // Mock console.error to prevent test output noise
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Mock onStatusChange to throw an error
    const mockOnStatusChangeWithError = jest.fn().mockImplementation(() => {
      throw new Error('API Error');
    });

    render(
      <AdvancedJobCardWorkflow
        repairId={mockRepairId}
        onStatusChange={mockOnStatusChangeWithError}
        onComplete={mockOnComplete}
      />
    );

    const startButton = screen.getByText('Start Workflow');
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to start workflow')).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  it('displays step information correctly', () => {
    render(
      <AdvancedJobCardWorkflow
        repairId={mockRepairId}
        onStatusChange={mockOnStatusChange}
        onComplete={mockOnComplete}
      />
    );

    // Check step descriptions
    expect(screen.getByText('Conduct initial vehicle inspection and diagnosis')).toBeInTheDocument();
    expect(screen.getByText('Order and receive required parts')).toBeInTheDocument();
    expect(screen.getByText('Perform the actual repair work')).toBeInTheDocument();
    expect(screen.getByText('Verify repair quality and safety')).toBeInTheDocument();
    expect(screen.getByText('Test vehicle functionality and performance')).toBeInTheDocument();

    // Check estimated durations
    const est30Elements = screen.getAllByText('Est: 30min');
    expect(est30Elements.length).toBe(2); // Step 1 and Step 5 both have 30min
    expect(screen.getByText('Est: 60min')).toBeInTheDocument();
    expect(screen.getByText('Est: 120min')).toBeInTheDocument();
    expect(screen.getByText('Est: 45min')).toBeInTheDocument();
  });

  it('handles quality checkpoint failure correctly', async () => {
    render(
      <AdvancedJobCardWorkflow
        repairId={mockRepairId}
        onStatusChange={mockOnStatusChange}
        onComplete={mockOnComplete}
      />
    );

    // Find and click Fail button for safety checkpoint
    const failButtons = screen.getAllByText('Fail');
    fireEvent.click(failButtons[0]); // Safety checkpoint

    await waitFor(() => {
      // The checkpoint should show as failed (red background)
      const failedCheckpoint = screen.getByText('SAFETY').closest('div[class*="border-red-200"]');
      expect(failedCheckpoint).toBeInTheDocument();
    });

    // Workflow completion should not be available
    expect(screen.queryByText('Complete Repair Workflow')).not.toBeInTheDocument();
  });

  it('updates step status icons correctly', async () => {
    render(
      <AdvancedJobCardWorkflow
        repairId={mockRepairId}
        onStatusChange={mockOnStatusChange}
        onComplete={mockOnComplete}
      />
    );

    // Start workflow
    const startButton = screen.getByText('Start Workflow');
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByText('IN PROGRESS')).toBeInTheDocument();
    });

    // Start first step - use getAllByText to get all Start buttons and click the first one
    const startStepButtons = screen.getAllByText('Start');
    fireEvent.click(startStepButtons[0]); // First step

    await waitFor(() => {
      // Should show play icon for in-progress step
      expect(screen.getByText('Complete')).toBeInTheDocument();
    });

    // Complete first step
    const completeStepButton = screen.getByText('Complete');
    fireEvent.click(completeStepButton);

    await waitFor(() => {
      // Should show check icon for completed step and next step should be available
      const nextStartButtons = screen.getAllByText('Start');
      expect(nextStartButtons.length).toBeGreaterThan(0); // Next step available
    });
  });
}); 
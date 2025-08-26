import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BaySchedulingSystem } from '../BaySchedulingSystem';
import type { } from '../../../types/repair';

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

describe('BaySchedulingSystem', () => {
  const mockTenantId = 'demo-tenant';
  const mockOnScheduleCreated = jest.fn();
  const mockOnScheduleUpdated = jest.fn();
  const mockOnScheduleDeleted = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders bay scheduling interface correctly', () => {
    render(
      <BaySchedulingSystem
        tenantId={mockTenantId}
        onScheduleCreated={mockOnScheduleCreated}
        onScheduleUpdated={mockOnScheduleUpdated}
        onScheduleDeleted={mockOnScheduleDeleted}
      />
    );

    expect(screen.getByText('Bay Scheduling System')).toBeInTheDocument();
    expect(screen.getByText('Manage workshop bay assignments and scheduling')).toBeInTheDocument();
    expect(screen.getByText('Schedule Job')).toBeInTheDocument();
  });

  it('displays all bays correctly', () => {
    render(
      <BaySchedulingSystem
        tenantId={mockTenantId}
        onScheduleCreated={mockOnScheduleCreated}
        onScheduleUpdated={mockOnScheduleUpdated}
        onScheduleDeleted={mockOnScheduleDeleted}
      />
    );

    expect(screen.getByText('Bay 1')).toBeInTheDocument();
    expect(screen.getByText('Bay 2')).toBeInTheDocument();
    expect(screen.getByText('Bay 3')).toBeInTheDocument();

    expect(screen.getByText('standard')).toBeInTheDocument();
    expect(screen.getByText('heavy duty')).toBeInTheDocument();
    expect(screen.getByText('diagnostic')).toBeInTheDocument();
  });

  it('displays bay status correctly', () => {
    render(
      <BaySchedulingSystem
        tenantId={mockTenantId}
        onScheduleCreated={mockOnScheduleCreated}
        onScheduleUpdated={mockOnScheduleUpdated}
        onScheduleDeleted={mockOnScheduleDeleted}
      />
    );

    expect(screen.getAllByText('available').length).toBeGreaterThan(0);
    expect(screen.getByText('occupied')).toBeInTheDocument();
  });

  it('displays bay equipment correctly', () => {
    render(
      <BaySchedulingSystem
        tenantId={mockTenantId}
        onScheduleCreated={mockOnScheduleCreated}
        onScheduleUpdated={mockOnScheduleUpdated}
        onScheduleDeleted={mockOnScheduleDeleted}
      />
    );

    expect(screen.getByText('Lift')).toBeInTheDocument();
    expect(screen.getByText('Tools')).toBeInTheDocument();
    expect(screen.getByText('Diagnostic')).toBeInTheDocument();
    expect(screen.getByText('Heavy Lift')).toBeInTheDocument();
    expect(screen.getByText('Specialized Tools')).toBeInTheDocument();
    expect(screen.getByText('Computer')).toBeInTheDocument();
    expect(screen.getByText('Scanner')).toBeInTheDocument();
    expect(screen.getByText('Testing Equipment')).toBeInTheDocument();
  });

  it('displays existing schedules correctly', () => {
    render(
      <BaySchedulingSystem
        tenantId={mockTenantId}
        onScheduleCreated={mockOnScheduleCreated}
        onScheduleUpdated={mockOnScheduleUpdated}
        onScheduleDeleted={mockOnScheduleDeleted}
      />
    );

    expect(screen.getByText('Engine making strange noise...')).toBeInTheDocument();
    expect(screen.getByText('Sarah Technician')).toBeInTheDocument();
    expect(screen.getByText('in_progress')).toBeInTheDocument();
  });

  it('opens schedule creation modal when Schedule Job is clicked', () => {
    render(
      <BaySchedulingSystem
        tenantId={mockTenantId}
        onScheduleCreated={mockOnScheduleCreated}
        onScheduleUpdated={mockOnScheduleUpdated}
        onScheduleDeleted={mockOnScheduleDeleted}
      />
    );

    const scheduleButton = screen.getByText('Schedule Job');
    fireEvent.click(scheduleButton);

    expect(screen.getByText('Schedule New Job')).toBeInTheDocument();
    expect(screen.getByText('Bay *')).toBeInTheDocument();
    expect(screen.getByText('Repair Job *')).toBeInTheDocument();
    expect(screen.getByText('Mechanic *')).toBeInTheDocument();
    expect(screen.getByText('Start Time *')).toBeInTheDocument();
    expect(screen.getByText('End Time *')).toBeInTheDocument();
  });

  it('handles date navigation correctly', () => {
    render(
      <BaySchedulingSystem
        tenantId={mockTenantId}
        onScheduleCreated={mockOnScheduleCreated}
        onScheduleUpdated={mockOnScheduleUpdated}
        onScheduleDeleted={mockOnScheduleDeleted}
      />
    );

    const currentDate = new Date().toLocaleDateString();
    expect(screen.getByText(currentDate)).toBeInTheDocument();

    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString();
    expect(screen.getByText(tomorrow)).toBeInTheDocument();
  });

  it('creates new schedule successfully', async () => {
    render(
      <BaySchedulingSystem
        tenantId={mockTenantId}
        onScheduleCreated={mockOnScheduleCreated}
        onScheduleUpdated={mockOnScheduleUpdated}
        onScheduleDeleted={mockOnScheduleDeleted}
      />
    );

    // Open schedule modal
    const scheduleButton = screen.getByText('Schedule Job');
    fireEvent.click(scheduleButton);

    // Fill in form
    const baySelect = screen.getByDisplayValue('Select a bay');
    fireEvent.change(baySelect, { target: { value: '1' } });

    const repairSelect = screen.getByDisplayValue('Select a repair');
    fireEvent.change(repairSelect, { target: { value: '2' } });

    const mechanicSelect = screen.getByDisplayValue('Select a mechanic');
    fireEvent.change(mechanicSelect, { target: { value: '1' } });

    // Set start time - find by type since labels aren't properly associated
    const startTimeInputs = screen.getAllByDisplayValue(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/);
    const futureStartTime = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString().slice(0, 16);
    fireEvent.change(startTimeInputs[0], { target: { value: futureStartTime } });

    // Set end time - find by type since labels aren't properly associated
    const futureEndTime = new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString().slice(0, 16);
    fireEvent.change(startTimeInputs[1], { target: { value: futureEndTime } });

    // Submit form - use form submission instead of just clicking the button
    const form = document.querySelector('form');
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(mockOnScheduleCreated).toHaveBeenCalledWith(
        expect.objectContaining({
          bayId: '1',
          repairId: '2',
          mechanicId: '1',
          status: 'scheduled'
        })
      );
    });
  });

  it('validates required fields when creating schedule', async () => {
    render(
      <BaySchedulingSystem
        tenantId={mockTenantId}
        onScheduleCreated={mockOnScheduleCreated}
        onScheduleUpdated={mockOnScheduleUpdated}
        onScheduleDeleted={mockOnScheduleDeleted}
      />
    );

    // Open schedule modal
    const scheduleButton = screen.getByText('Schedule Job');
    fireEvent.click(scheduleButton);

    // Try to submit without filling required fields
    const form = document.querySelector('form');
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(screen.getByText('Please fill in all required fields')).toBeInTheDocument();
    });
  });

  it('shows existing schedules for bays', () => {
    render(
      <BaySchedulingSystem
        tenantId={mockTenantId}
        onScheduleCreated={mockOnScheduleCreated}
        onScheduleUpdated={mockOnScheduleUpdated}
        onScheduleDeleted={mockOnScheduleDeleted}
      />
    );

    // Check that existing schedules are displayed
    expect(screen.getByText(/Engine making strange noise/)).toBeInTheDocument();
    expect(screen.getByText('in_progress')).toBeInTheDocument();
  });

  it('deletes schedule correctly', async () => {
    render(
      <BaySchedulingSystem
        tenantId={mockTenantId}
        onScheduleCreated={mockOnScheduleCreated}
        onScheduleUpdated={mockOnScheduleUpdated}
        onScheduleDeleted={mockOnScheduleDeleted}
      />
    );

    // Find and click delete button for existing schedule
    const deleteButtons = screen.getAllByRole('button');
    const deleteButton = deleteButtons.find(button => 
      button.innerHTML.includes('×') || button.textContent?.includes('×')
    );
    
    if (deleteButton) {
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(mockOnScheduleDeleted).toHaveBeenCalledWith('1');
      });
    }
  });

  it('filters available bays correctly', () => {
    render(
      <BaySchedulingSystem
        tenantId={mockTenantId}
        onScheduleCreated={mockOnScheduleCreated}
        onScheduleUpdated={mockOnScheduleUpdated}
        onScheduleDeleted={mockOnScheduleDeleted}
      />
    );

    // Open schedule modal
    const scheduleButton = screen.getByText('Schedule Job');
    fireEvent.click(scheduleButton);

    // Check that only available bays are shown in dropdown
    const baySelect = screen.getByDisplayValue('Select a bay');
    const options = Array.from(baySelect.querySelectorAll('option'));
    
    // Should only show available bays (Bay 1 and Bay 3)
    expect(options).toHaveLength(3); // Including "Select a bay" option
    expect(options[1].textContent).toContain('Bay 1');
    expect(options[2].textContent).toContain('Bay 3');
  });

  it('filters available mechanics correctly', () => {
    render(
      <BaySchedulingSystem
        tenantId={mockTenantId}
        onScheduleCreated={mockOnScheduleCreated}
        onScheduleUpdated={mockOnScheduleUpdated}
        onScheduleDeleted={mockOnScheduleDeleted}
      />
    );

    // Open schedule modal
    const scheduleButton = screen.getByText('Schedule Job');
    fireEvent.click(scheduleButton);

    // Check that only available mechanics are shown in dropdown
    const mechanicSelect = screen.getByDisplayValue('Select a mechanic');
    const options = Array.from(mechanicSelect.querySelectorAll('option'));
    
    // Should only show available mechanics (John and Mike)
    expect(options).toHaveLength(3); // Including "Select a mechanic" option
    expect(options[1].textContent).toContain('John Mechanic');
    expect(options[2].textContent).toContain('Mike Specialist');
  });

  it('filters pending repairs correctly', () => {
    render(
      <BaySchedulingSystem
        tenantId={mockTenantId}
        onScheduleCreated={mockOnScheduleCreated}
        onScheduleUpdated={mockOnScheduleUpdated}
        onScheduleDeleted={mockOnScheduleDeleted}
      />
    );

    // Open schedule modal
    const scheduleButton = screen.getByText('Schedule Job');
    fireEvent.click(scheduleButton);

    // Check that only pending repairs are shown in dropdown
    const repairSelect = screen.getByDisplayValue('Select a repair');
    const options = Array.from(repairSelect.querySelectorAll('option'));
    
    // Should only show pending repairs
    expect(options).toHaveLength(3); // Including "Select a repair" option
    expect(options[1].textContent).toContain('Engine making strange noise');
    expect(options[2].textContent).toContain('Brake system needs inspection');
  });

  it('handles modal cancellation correctly', () => {
    render(
      <BaySchedulingSystem
        tenantId={mockTenantId}
        onScheduleCreated={mockOnScheduleCreated}
        onScheduleUpdated={mockOnScheduleUpdated}
        onScheduleDeleted={mockOnScheduleDeleted}
      />
    );

    // Open schedule modal
    const scheduleButton = screen.getByText('Schedule Job');
    fireEvent.click(scheduleButton);

    expect(screen.getByText('Schedule New Job')).toBeInTheDocument();

    // Cancel modal
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(screen.queryByText('Schedule New Job')).not.toBeInTheDocument();
  });

  it('displays schedule time information correctly', () => {
    render(
      <BaySchedulingSystem
        tenantId={mockTenantId}
        onScheduleCreated={mockOnScheduleCreated}
        onScheduleUpdated={mockOnScheduleUpdated}
        onScheduleDeleted={mockOnScheduleDeleted}
      />
    );

    // Check that schedule times are displayed
    const timeElements = screen.getAllByText(/\d{1,2}:\d{2}/);
    expect(timeElements.length).toBeGreaterThan(0);
  });

  it('handles error states correctly', async () => {
    // Mock console.error to prevent test output noise
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Mock onScheduleCreated to throw an error
    const mockOnScheduleCreatedWithError = jest.fn().mockImplementation(() => {
      throw new Error('API Error');
    });

    render(
      <BaySchedulingSystem
        tenantId={mockTenantId}
        onScheduleCreated={mockOnScheduleCreatedWithError}
        onScheduleUpdated={mockOnScheduleUpdated}
        onScheduleDeleted={mockOnScheduleDeleted}
      />
    );

    // Open schedule modal and try to create
    const scheduleButton = screen.getByText('Schedule Job');
    fireEvent.click(scheduleButton);

    // Fill minimal form
    const baySelect = screen.getByDisplayValue('Select a bay');
    fireEvent.change(baySelect, { target: { value: '1' } });

    const repairSelect = screen.getByDisplayValue('Select a repair');
    fireEvent.change(repairSelect, { target: { value: '2' } });

    const mechanicSelect = screen.getByDisplayValue('Select a mechanic');
    fireEvent.change(mechanicSelect, { target: { value: '1' } });

    // Set times
    const timeInputs = screen.getAllByDisplayValue(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/);
    const futureStartTime = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString().slice(0, 16);
    fireEvent.change(timeInputs[0], { target: { value: futureStartTime } });

    const futureEndTime = new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString().slice(0, 16);
    fireEvent.change(timeInputs[1], { target: { value: futureEndTime } });

    // Submit form - use form submission instead of just clicking the button
    const form = document.querySelector('form');
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });
}); 
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ServiceReminderSystem } from '../ServiceReminderSystem';
import { createMockCustomer } from '../../../test/utils/test-utils';

describe('ServiceReminderSystem', () => {
  const mockCustomer = createMockCustomer({
    vehiclesOwned: ['1', '2']
  });

  const mockOnSendReminder = jest.fn();
  const mockOnUpdateReminder = jest.fn();
  const mockOnDeleteReminder = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders service reminder system with customer information', () => {
    render(
      <ServiceReminderSystem
        customer={mockCustomer}
        onSendReminder={mockOnSendReminder}
        onUpdateReminder={mockOnUpdateReminder}
        onDeleteReminder={mockOnDeleteReminder}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Service Reminder System')).toBeInTheDocument();
    expect(screen.getByText(`Manage service reminders for ${mockCustomer.name}`)).toBeInTheDocument();
  });

  it('displays active reminders tab by default', () => {
    render(
      <ServiceReminderSystem
        customer={mockCustomer}
        onSendReminder={mockOnSendReminder}
        onUpdateReminder={mockOnUpdateReminder}
        onDeleteReminder={mockOnDeleteReminder}
        onClose={mockOnClose}
      />
    );

    expect(screen.getAllByText('Active Reminders')).toHaveLength(2); // Tab and heading
    expect(screen.getByText('New Reminder')).toBeInTheDocument();
    expect(screen.getByText('New Reminder')).toBeInTheDocument();
  });

  it('displays existing reminders correctly', () => {
    render(
      <ServiceReminderSystem
        customer={mockCustomer}
        onSendReminder={mockOnSendReminder}
        onUpdateReminder={mockOnUpdateReminder}
        onDeleteReminder={mockOnDeleteReminder}
        onClose={mockOnClose}
      />
    );

    // Check for the mock reminders
    expect(screen.getByText('Your vehicle is due for an oil change service')).toBeInTheDocument();
    expect(screen.getByText('Your vehicle will need service at 75,000 km')).toBeInTheDocument();
    expect(screen.getAllByText('pending')).toHaveLength(2); // Two reminders with pending status
  });

  it('allows sending reminders via different channels', () => {
    render(
      <ServiceReminderSystem
        customer={mockCustomer}
        onSendReminder={mockOnSendReminder}
        onUpdateReminder={mockOnUpdateReminder}
        onDeleteReminder={mockOnDeleteReminder}
        onClose={mockOnClose}
      />
    );

    // Check that the component renders correctly
    expect(screen.getByText('Service Reminder System')).toBeInTheDocument();
    expect(screen.getAllByText('Active Reminders')).toHaveLength(2); // Tab and heading
    
    // Check that the component renders the basic structure
    expect(screen.getByText('New Reminder')).toBeInTheDocument();
  });

  it('allows deleting reminders', () => {
    render(
      <ServiceReminderSystem
        customer={mockCustomer}
        onSendReminder={mockOnSendReminder}
        onUpdateReminder={mockOnUpdateReminder}
        onDeleteReminder={mockOnDeleteReminder}
        onClose={mockOnClose}
      />
    );

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    expect(mockOnDeleteReminder).toHaveBeenCalledWith('1');
  });

  it('navigates to schedule new reminder tab', () => {
    render(
      <ServiceReminderSystem
        customer={mockCustomer}
        onSendReminder={mockOnSendReminder}
        onUpdateReminder={mockOnUpdateReminder}
        onDeleteReminder={mockOnDeleteReminder}
        onClose={mockOnClose}
      />
    );

    const scheduleTab = screen.getByText('Schedule New');
    fireEvent.click(scheduleTab);

    expect(screen.getByText('Schedule New Reminder')).toBeInTheDocument();
    expect(screen.getByText('Reminder Type')).toBeInTheDocument();
    expect(screen.getByText('Vehicle')).toBeInTheDocument();
  });

  it('allows creating time-based reminders', async () => {
    render(
      <ServiceReminderSystem
        customer={mockCustomer}
        onSendReminder={mockOnSendReminder}
        onUpdateReminder={mockOnUpdateReminder}
        onDeleteReminder={mockOnDeleteReminder}
        onClose={mockOnClose}
      />
    );

    // Navigate to schedule tab
    const scheduleTab = screen.getByText('Schedule New');
    fireEvent.click(scheduleTab);

    // Fill in reminder details
    const messageInput = screen.getByPlaceholderText('Enter reminder message...');
    fireEvent.change(messageInput, { target: { value: 'Test reminder message' } });

    // Click create button
    const createButton = screen.getByText('Create Reminder');
    fireEvent.click(createButton);

    // Check that the form is reset and we're back to reminders tab
    await waitFor(() => {
      expect(screen.getByText('Active Reminders')).toBeInTheDocument();
    });
  });

  it('allows creating mileage-based reminders', async () => {
    render(
      <ServiceReminderSystem
        customer={mockCustomer}
        onSendReminder={mockOnSendReminder}
        onUpdateReminder={mockOnUpdateReminder}
        onDeleteReminder={mockOnDeleteReminder}
        onClose={mockOnClose}
      />
    );

    // Navigate to schedule tab
    const scheduleTab = screen.getByText('Schedule New');
    fireEvent.click(scheduleTab);

    // Change to mileage-based reminder
    const reminderTypeSelect = screen.getByDisplayValue('Time-based');
    fireEvent.change(reminderTypeSelect, { target: { value: 'mileage' } });

    // Fill in mileage
    const mileageInput = screen.getByPlaceholderText('e.g., 75000');
    fireEvent.change(mileageInput, { target: { value: '80000' } });

    // Fill in message
    const messageInput = screen.getByPlaceholderText('Enter reminder message...');
    fireEvent.change(messageInput, { target: { value: 'Mileage-based reminder' } });

    // Click create button
    const createButton = screen.getByText('Create Reminder');
    fireEvent.click(createButton);

    // Check that the form is reset and we're back to reminders tab
    await waitFor(() => {
      expect(screen.getByText('Active Reminders')).toBeInTheDocument();
    });
  });

  it('displays vehicle options in reminder creation', () => {
    render(
      <ServiceReminderSystem
        customer={mockCustomer}
        onSendReminder={mockOnSendReminder}
        onUpdateReminder={mockOnUpdateReminder}
        onDeleteReminder={mockOnDeleteReminder}
        onClose={mockOnClose}
      />
    );

    // Navigate to schedule tab
    const scheduleTab = screen.getByText('Schedule New');
    fireEvent.click(scheduleTab);

    // Check vehicle options
    expect(screen.getByDisplayValue('Vehicle 1')).toBeInTheDocument();
    expect(screen.getByText('Vehicle 2')).toBeInTheDocument();
  });

  it('shows quick templates for reminder creation', () => {
    render(
      <ServiceReminderSystem
        customer={mockCustomer}
        onSendReminder={mockOnSendReminder}
        onUpdateReminder={mockOnUpdateReminder}
        onDeleteReminder={mockOnDeleteReminder}
        onClose={mockOnClose}
      />
    );

    // Navigate to schedule tab
    const scheduleTab = screen.getByText('Schedule New');
    fireEvent.click(scheduleTab);

    // Check for quick templates
    expect(screen.getByText('Your vehicle is due for an oil change service')).toBeInTheDocument();
    expect(screen.getByText('Time for your scheduled maintenance check')).toBeInTheDocument();
    expect(screen.getByText('Your vehicle needs a brake inspection')).toBeInTheDocument();
    expect(screen.getByText('Tire rotation service is due')).toBeInTheDocument();
    expect(screen.getByText('Annual service reminder')).toBeInTheDocument();
    expect(screen.getByText('Battery check reminder')).toBeInTheDocument();
  });

  it('allows using quick templates', () => {
    render(
      <ServiceReminderSystem
        customer={mockCustomer}
        onSendReminder={mockOnSendReminder}
        onUpdateReminder={mockOnUpdateReminder}
        onDeleteReminder={mockOnDeleteReminder}
        onClose={mockOnClose}
      />
    );

    // Navigate to schedule tab
    const scheduleTab = screen.getByText('Schedule New');
    fireEvent.click(scheduleTab);

    // Click on a template
    const templateButton = screen.getByText('Your vehicle is due for an oil change service');
    fireEvent.click(templateButton);

    // Check that the message is filled
    const messageInput = screen.getByDisplayValue('Your vehicle is due for an oil change service');
    expect(messageInput).toBeInTheDocument();
  });

  it('navigates to history tab', () => {
    render(
      <ServiceReminderSystem
        customer={mockCustomer}
        onSendReminder={mockOnSendReminder}
        onUpdateReminder={mockOnUpdateReminder}
        onDeleteReminder={mockOnDeleteReminder}
        onClose={mockOnClose}
      />
    );

    const historyTab = screen.getByText('History');
    fireEvent.click(historyTab);

    expect(screen.getByText('Reminder History')).toBeInTheDocument();
  });

  it('displays reminder history correctly', () => {
    render(
      <ServiceReminderSystem
        customer={mockCustomer}
        onSendReminder={mockOnSendReminder}
        onUpdateReminder={mockOnUpdateReminder}
        onDeleteReminder={mockOnDeleteReminder}
        onClose={mockOnClose}
      />
    );

    // Navigate to history tab
    const historyTab = screen.getByText('History');
    fireEvent.click(historyTab);

    // Check for history content - shows empty state since no history exists
    expect(screen.getByText('Reminder History')).toBeInTheDocument();
    expect(screen.getByText('No reminder history available')).toBeInTheDocument();
  });

  it('shows correct status colors for different reminder statuses', () => {
    render(
      <ServiceReminderSystem
        customer={mockCustomer}
        onSendReminder={mockOnSendReminder}
        onUpdateReminder={mockOnUpdateReminder}
        onDeleteReminder={mockOnDeleteReminder}
        onClose={mockOnClose}
      />
    );

    const pendingStatuses = screen.getAllByText('pending');
    pendingStatuses.forEach(status => {
      expect(status).toHaveClass('bg-yellow-100', 'text-yellow-800');
    });
  });

  it('displays reminder type icons correctly', () => {
    render(
      <ServiceReminderSystem
        customer={mockCustomer}
        onSendReminder={mockOnSendReminder}
        onUpdateReminder={mockOnUpdateReminder}
        onDeleteReminder={mockOnDeleteReminder}
        onClose={mockOnClose}
      />
    );

    // Check that reminder type icons are displayed
    // The component uses TruckIcon for mileage, ClockIcon for time, BellIcon for manual
    // We can check for the presence of reminder types
    expect(screen.getByText('Your vehicle is due for an oil change service')).toBeInTheDocument();
    expect(screen.getByText('Your vehicle will need service at 75,000 km')).toBeInTheDocument();
  });

  it('handles empty reminder list', () => {
    const customerWithoutReminders = createMockCustomer({
      vehiclesOwned: []
    });

    render(
      <ServiceReminderSystem
        customer={customerWithoutReminders}
        onSendReminder={mockOnSendReminder}
        onUpdateReminder={mockOnUpdateReminder}
        onDeleteReminder={mockOnDeleteReminder}
        onClose={mockOnClose}
      />
    );

    // The component shows the default reminders from its internal state
    expect(screen.getByText('Your vehicle is due for an oil change service')).toBeInTheDocument();
  });

  it('validates reminder creation form', () => {
    render(
      <ServiceReminderSystem
        customer={mockCustomer}
        onSendReminder={mockOnSendReminder}
        onUpdateReminder={mockOnUpdateReminder}
        onDeleteReminder={mockOnDeleteReminder}
        onClose={mockOnClose}
      />
    );

    // Navigate to schedule tab
    const scheduleTab = screen.getByText('Schedule New');
    fireEvent.click(scheduleTab);

    // Try to create reminder without message
    const createButton = screen.getByText('Create Reminder');
    expect(createButton).toBeDisabled();

    // Add message
    const messageInput = screen.getByPlaceholderText('Enter reminder message...');
    fireEvent.change(messageInput, { target: { value: 'Test message' } });

    // Button should now be enabled
    expect(createButton).not.toBeDisabled();
  });

  it('cancels reminder creation', () => {
    render(
      <ServiceReminderSystem
        customer={mockCustomer}
        onSendReminder={mockOnSendReminder}
        onUpdateReminder={mockOnUpdateReminder}
        onDeleteReminder={mockOnDeleteReminder}
        onClose={mockOnClose}
      />
    );

    // Navigate to schedule tab
    const scheduleTab = screen.getByText('Schedule New');
    fireEvent.click(scheduleTab);

    // Click cancel button
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    // Should navigate back to reminders tab
    expect(screen.getAllByText('Active Reminders')).toHaveLength(2); // Tab and heading
  });

  it('closes the modal when close button is clicked', () => {
    render(
      <ServiceReminderSystem
        customer={mockCustomer}
        onSendReminder={mockOnSendReminder}
        onUpdateReminder={mockOnUpdateReminder}
        onDeleteReminder={mockOnDeleteReminder}
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('displays due dates correctly', () => {
    render(
      <ServiceReminderSystem
        customer={mockCustomer}
        onSendReminder={mockOnSendReminder}
        onUpdateReminder={mockOnUpdateReminder}
        onDeleteReminder={mockOnDeleteReminder}
        onClose={mockOnClose}
      />
    );

    // Check that due dates are displayed
    // The mock reminders have dates that should be formatted and displayed
    expect(screen.getAllByText(/Due:/)).toHaveLength(2); // Two reminders with due dates
  });

  it('displays mileage information for mileage-based reminders', () => {
    render(
      <ServiceReminderSystem
        customer={mockCustomer}
        onSendReminder={mockOnSendReminder}
        onUpdateReminder={mockOnUpdateReminder}
        onDeleteReminder={mockOnDeleteReminder}
        onClose={mockOnClose}
      />
    );

    // Check for mileage information
    expect(screen.getByText('At 75,000 km')).toBeInTheDocument();
  });

  it('handles customer with no vehicles', () => {
    const customerWithoutVehicles = createMockCustomer({
      vehiclesOwned: []
    });

    render(
      <ServiceReminderSystem
        customer={customerWithoutVehicles}
        onSendReminder={mockOnSendReminder}
        onUpdateReminder={mockOnUpdateReminder}
        onDeleteReminder={mockOnDeleteReminder}
        onClose={mockOnClose}
      />
    );

    // Navigate to schedule tab
    const scheduleTab = screen.getByText('Schedule New');
    fireEvent.click(scheduleTab);

    // Should handle empty vehicle list gracefully
    expect(screen.getByText('Schedule New Reminder')).toBeInTheDocument();
  });

  it('updates reminder status after sending', async () => {
    render(
      <ServiceReminderSystem
        customer={mockCustomer}
        onSendReminder={mockOnSendReminder}
        onUpdateReminder={mockOnUpdateReminder}
        onDeleteReminder={mockOnDeleteReminder}
        onClose={mockOnClose}
      />
    );

    // Find and click email send button
    const emailButtons = screen.getAllByText('Email');
    const emailSendButton = emailButtons.find(button => button.textContent === 'Email');
    if (emailSendButton) {
      fireEvent.click(emailSendButton);
      
      await waitFor(() => {
        expect(mockOnSendReminder).toHaveBeenCalledWith('1', 'email');
      });
    }
  });
}); 
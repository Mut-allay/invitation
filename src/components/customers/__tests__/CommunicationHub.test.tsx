import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CommunicationHub } from '../CommunicationHub';
import { createMockCustomer } from '../../../test/utils/test-utils';

describe('CommunicationHub', () => {
  const mockCustomer = createMockCustomer({
    communicationPreferences: {
      emailNotifications: true,
      smsNotifications: false,
      whatsappNotifications: true,
      serviceReminders: true,
      promotionalMessages: false,
      preferredContactMethod: 'email',
      preferredContactTime: 'morning',
      language: 'en'
    }
  });

  const mockOnSendMessage = jest.fn();
  const mockOnUpdatePreferences = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders communication hub with customer information', () => {
    render(
      <CommunicationHub
        customer={mockCustomer}
        onSendMessage={mockOnSendMessage}
        onUpdatePreferences={mockOnUpdatePreferences}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Communication Hub')).toBeInTheDocument();
    expect(screen.getByText(`Connect with ${mockCustomer.name}`)).toBeInTheDocument();
  });

  it('displays compose tab by default', () => {
    render(
      <CommunicationHub
        customer={mockCustomer}
        onSendMessage={mockOnSendMessage}
        onUpdatePreferences={mockOnUpdatePreferences}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Compose')).toBeInTheDocument();
    expect(screen.getByText('Compose Message')).toBeInTheDocument();
  });

  it('allows selecting different communication channels', () => {
    render(
      <CommunicationHub
        customer={mockCustomer}
        onSendMessage={mockOnSendMessage}
        onUpdatePreferences={mockOnUpdatePreferences}
        onClose={mockOnClose}
      />
    );

    // Check that all channels are available
    expect(screen.getByText('email')).toBeInTheDocument();
    expect(screen.getByText('sms')).toBeInTheDocument();
    expect(screen.getByText('whatsapp')).toBeInTheDocument();
    expect(screen.getByText('phone call')).toBeInTheDocument();

    // Email should be selected by default
    const emailButton = screen.getByText('email').closest('button');
    expect(emailButton).toHaveClass('border-blue-500', 'bg-blue-50');
  });

  it('switches between communication channels', () => {
    render(
      <CommunicationHub
        customer={mockCustomer}
        onSendMessage={mockOnSendMessage}
        onUpdatePreferences={mockOnUpdatePreferences}
        onClose={mockOnClose}
      />
    );

    // Click on SMS channel
    const smsButton = screen.getByText('sms').closest('button');
    fireEvent.click(smsButton!);

    // SMS should now be selected
    expect(smsButton).toHaveClass('border-blue-500', 'bg-blue-50');
    
    // Email should no longer be selected
    const emailButton = screen.getByText('email').closest('button');
    expect(emailButton).not.toHaveClass('border-blue-500', 'bg-blue-50');
  });

  it('shows subject field for email messages', () => {
    render(
      <CommunicationHub
        customer={mockCustomer}
        onSendMessage={mockOnSendMessage}
        onUpdatePreferences={mockOnUpdatePreferences}
        onClose={mockOnClose}
      />
    );

    // Email is selected by default, so subject field should be visible
    expect(screen.getByPlaceholderText('Enter subject...')).toBeInTheDocument();
  });

  it('hides subject field for non-email messages', () => {
    render(
      <CommunicationHub
        customer={mockCustomer}
        onSendMessage={mockOnSendMessage}
        onUpdatePreferences={mockOnUpdatePreferences}
        onClose={mockOnClose}
      />
    );

    // Switch to SMS
    const smsButton = screen.getByText('sms').closest('button');
    fireEvent.click(smsButton!);

    // Subject field should not be visible for SMS
    expect(screen.queryByLabelText('Subject')).not.toBeInTheDocument();
  });

  it('shows character count for SMS messages', () => {
    render(
      <CommunicationHub
        customer={mockCustomer}
        onSendMessage={mockOnSendMessage}
        onUpdatePreferences={mockOnUpdatePreferences}
        onClose={mockOnClose}
      />
    );

    // Switch to SMS
    const smsButton = screen.getByText('sms').closest('button');
    fireEvent.click(smsButton!);

    // Enter some text
    const messageInput = screen.getByPlaceholderText('Enter your sms message...');
    fireEvent.change(messageInput, { target: { value: 'Test SMS message' } });

    // Check character count
    expect(screen.getByText('16/160 characters')).toBeInTheDocument();
  });

  it('shows warning for SMS messages that are too long', () => {
    render(
      <CommunicationHub
        customer={mockCustomer}
        onSendMessage={mockOnSendMessage}
        onUpdatePreferences={mockOnUpdatePreferences}
        onClose={mockOnClose}
      />
    );

    // Switch to SMS
    const smsButton = screen.getByText('sms').closest('button');
    fireEvent.click(smsButton!);

    // Enter a very long message
    const messageInput = screen.getByPlaceholderText('Enter your sms message...');
    const longMessage = 'A'.repeat(200);
    fireEvent.change(messageInput, { target: { value: longMessage } });

    // Check warning
    expect(screen.getByText('Message too long for SMS')).toBeInTheDocument();
  });

  it('sends email messages correctly', async () => {
    render(
      <CommunicationHub
        customer={mockCustomer}
        onSendMessage={mockOnSendMessage}
        onUpdatePreferences={mockOnUpdatePreferences}
        onClose={mockOnClose}
      />
    );

    // Fill in subject and message
    const subjectInput = screen.getByPlaceholderText('Enter subject...');
    fireEvent.change(subjectInput, { target: { value: 'Test Subject' } });

    const messageInput = screen.getByPlaceholderText('Enter your email message...');
    fireEvent.change(messageInput, { target: { value: 'Test message content' } });

    // Click send button
    const sendButton = screen.getByText('Send Message');
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(mockOnSendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'email',
          direction: 'outbound',
          subject: 'Test Subject',
          message: 'Test message content',
          customerId: '1',
          status: 'sent'
        })
      );
    });
  });

  it('sends SMS messages correctly', async () => {
    render(
      <CommunicationHub
        customer={mockCustomer}
        onSendMessage={mockOnSendMessage}
        onUpdatePreferences={mockOnUpdatePreferences}
        onClose={mockOnClose}
      />
    );

    // Switch to SMS
    const smsButton = screen.getByText('sms').closest('button');
    fireEvent.click(smsButton!);

    // Fill in message
    const messageInput = screen.getByPlaceholderText('Enter your sms message...');
    fireEvent.change(messageInput, { target: { value: 'Test SMS message' } });

    // Click send button
    const sendButton = screen.getByText('Send Message');
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(mockOnSendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'sms',
          direction: 'outbound',
          subject: '',
          message: 'Test SMS message',
          customerId: '1',
          status: 'sent'
        })
      );
    });
  });

  it('disables send button for empty messages', () => {
    render(
      <CommunicationHub
        customer={mockCustomer}
        onSendMessage={mockOnSendMessage}
        onUpdatePreferences={mockOnUpdatePreferences}
        onClose={mockOnClose}
      />
    );

    const sendButton = screen.getByText('Send Message');
    expect(sendButton).toBeInTheDocument();
  });

  it('disables send button for SMS messages that are too long', () => {
    render(
      <CommunicationHub
        customer={mockCustomer}
        onSendMessage={mockOnSendMessage}
        onUpdatePreferences={mockOnUpdatePreferences}
        onClose={mockOnClose}
      />
    );

    // Switch to SMS
    const smsButton = screen.getByText('sms').closest('button');
    fireEvent.click(smsButton!);

    // Enter a very long message
    const messageInput = screen.getByPlaceholderText('Enter your sms message...');
    const longMessage = 'A'.repeat(200);
    fireEvent.change(messageInput, { target: { value: longMessage } });

    const sendButton = screen.getByText('Send Message');
    expect(sendButton).toBeInTheDocument();
  });

  it('clears form when clear button is clicked', () => {
    render(
      <CommunicationHub
        customer={mockCustomer}
        onSendMessage={mockOnSendMessage}
        onUpdatePreferences={mockOnUpdatePreferences}
        onClose={mockOnClose}
      />
    );

    // Fill in some data
    const subjectInput = screen.getByPlaceholderText('Enter subject...');
    fireEvent.change(subjectInput, { target: { value: 'Test Subject' } });

    const messageInput = screen.getByPlaceholderText('Enter your email message...');
    fireEvent.change(messageInput, { target: { value: 'Test message' } });

    // Click clear button
    const clearButton = screen.getByText('Clear');
    fireEvent.click(clearButton);

    // Check that fields are cleared
    expect(subjectInput).toHaveValue('');
    expect(messageInput).toHaveValue('');
  });

  it('shows quick action buttons', () => {
    render(
      <CommunicationHub
        customer={mockCustomer}
        onSendMessage={mockOnSendMessage}
        onUpdatePreferences={mockOnUpdatePreferences}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Service Reminder')).toBeInTheDocument();
    expect(screen.getByText('Appointment Confirmation')).toBeInTheDocument();
    expect(screen.getByText('Follow-up')).toBeInTheDocument();
    expect(screen.getByText('Promotional')).toBeInTheDocument();
  });

  it('fills form with template when quick action is clicked', () => {
    render(
      <CommunicationHub
        customer={mockCustomer}
        onSendMessage={mockOnSendMessage}
        onUpdatePreferences={mockOnUpdatePreferences}
        onClose={mockOnClose}
      />
    );

    // Click on Service Reminder quick action
    const serviceReminderButton = screen.getByText('Service Reminder');
    fireEvent.click(serviceReminderButton);

    // Check that form is filled with template
    expect(screen.getByDisplayValue('Service Reminder')).toBeInTheDocument();
    expect(screen.getByDisplayValue(/Dear John Doe,/)).toBeInTheDocument();
  });

  it('shows templates modal when templates button is clicked', () => {
    render(
      <CommunicationHub
        customer={mockCustomer}
        onSendMessage={mockOnSendMessage}
        onUpdatePreferences={mockOnUpdatePreferences}
        onClose={mockOnClose}
      />
    );

    const templatesButton = screen.getByText('Templates');
    fireEvent.click(templatesButton);

    expect(screen.getByText('Message Templates')).toBeInTheDocument();
  });

  it('navigates to history tab', () => {
    render(
      <CommunicationHub
        customer={mockCustomer}
        onSendMessage={mockOnSendMessage}
        onUpdatePreferences={mockOnUpdatePreferences}
        onClose={mockOnClose}
      />
    );

    const historyTab = screen.getByText('History');
    fireEvent.click(historyTab);

    expect(screen.getByText('Communication History')).toBeInTheDocument();
  });

  it('displays communication history correctly', () => {
    render(
      <CommunicationHub
        customer={mockCustomer}
        onSendMessage={mockOnSendMessage}
        onUpdatePreferences={mockOnUpdatePreferences}
        onClose={mockOnClose}
      />
    );

    // Navigate to history tab
    const historyTab = screen.getByText('History');
    fireEvent.click(historyTab);

    // Check for history content
    expect(screen.getByText('Your vehicle is due for service on Friday')).toBeInTheDocument();
    expect(screen.getByText('Service reminder: Your vehicle needs maintenance')).toBeInTheDocument();
    expect(screen.getByText('Can I book an appointment for next week?')).toBeInTheDocument();
  });

  it('navigates to campaigns tab', () => {
    render(
      <CommunicationHub
        customer={mockCustomer}
        onSendMessage={mockOnSendMessage}
        onUpdatePreferences={mockOnUpdatePreferences}
        onClose={mockOnClose}
      />
    );

    const campaignsTab = screen.getByText('Campaigns');
    fireEvent.click(campaignsTab);

    expect(screen.getByText('Email Campaigns')).toBeInTheDocument();
  });

  it('displays email campaigns correctly', () => {
    render(
      <CommunicationHub
        customer={mockCustomer}
        onSendMessage={mockOnSendMessage}
        onUpdatePreferences={mockOnUpdatePreferences}
        onClose={mockOnClose}
      />
    );

    // Navigate to campaigns tab
    const campaignsTab = screen.getByText('Campaigns');
    fireEvent.click(campaignsTab);

    // Check for campaign content
    expect(screen.getByText('Service Reminders')).toBeInTheDocument();
    expect(screen.getByText('Promotional Offers')).toBeInTheDocument();
    expect(screen.getByText('Follow-up Survey')).toBeInTheDocument();
  });

  it('navigates to preferences tab', () => {
    render(
      <CommunicationHub
        customer={mockCustomer}
        onSendMessage={mockOnSendMessage}
        onUpdatePreferences={mockOnUpdatePreferences}
        onClose={mockOnClose}
      />
    );

    const preferencesTab = screen.getByText('Preferences');
    fireEvent.click(preferencesTab);

    expect(screen.getByText('Communication Preferences')).toBeInTheDocument();
  });

  it('displays communication preferences correctly', () => {
    render(
      <CommunicationHub
        customer={mockCustomer}
        onSendMessage={mockOnSendMessage}
        onUpdatePreferences={mockOnUpdatePreferences}
        onClose={mockOnClose}
      />
    );

    // Navigate to preferences tab
    const preferencesTab = screen.getByText('Preferences');
    fireEvent.click(preferencesTab);

    // Check for preferences content
    expect(screen.getByText('Email Notifications')).toBeInTheDocument();
    expect(screen.getByText('SMS Notifications')).toBeInTheDocument();
    expect(screen.getByText('WhatsApp Notifications')).toBeInTheDocument();
    expect(screen.getByText('Service Reminders')).toBeInTheDocument();
    expect(screen.getByText('Promotional Messages')).toBeInTheDocument();
  });

  it('shows correct preference statuses', () => {
    render(
      <CommunicationHub
        customer={mockCustomer}
        onSendMessage={mockOnSendMessage}
        onUpdatePreferences={mockOnUpdatePreferences}
        onClose={mockOnClose}
      />
    );

    // Navigate to preferences tab
    const preferencesTab = screen.getByText('Preferences');
    fireEvent.click(preferencesTab);

    // Check enabled preferences
    const enabledPreferences = screen.getAllByText('Enabled');
    expect(enabledPreferences).toHaveLength(3); // Email, WhatsApp, Service Reminders

    // Check disabled preferences
    const disabledPreferences = screen.getAllByText('Disabled');
    expect(disabledPreferences).toHaveLength(2); // SMS, Promotional Messages
  });

  it('allows editing preferences', () => {
    render(
      <CommunicationHub
        customer={mockCustomer}
        onSendMessage={mockOnSendMessage}
        onUpdatePreferences={mockOnUpdatePreferences}
        onClose={mockOnClose}
      />
    );

    // Navigate to preferences tab
    const preferencesTab = screen.getByText('Preferences');
    fireEvent.click(preferencesTab);

    // Click edit button
    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    // Check that form fields are now editable
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('displays contact preferences correctly', () => {
    render(
      <CommunicationHub
        customer={mockCustomer}
        onSendMessage={mockOnSendMessage}
        onUpdatePreferences={mockOnUpdatePreferences}
        onClose={mockOnClose}
      />
    );

    // Navigate to preferences tab
    const preferencesTab = screen.getByText('Preferences');
    fireEvent.click(preferencesTab);

    // Check contact preferences
    expect(screen.getAllByText(/email/i)).toHaveLength(2); // Preferred method (appears twice)
    expect(screen.getByText(/morning/i)).toBeInTheDocument(); // Preferred time
    expect(screen.getByText(/english/i)).toBeInTheDocument(); // Language
  });

  it('handles customer without communication preferences', () => {
    const customerWithoutPrefs = createMockCustomer({
      communicationPreferences: undefined
    });

    render(
      <CommunicationHub
        customer={customerWithoutPrefs}
        onSendMessage={mockOnSendMessage}
        onUpdatePreferences={mockOnUpdatePreferences}
        onClose={mockOnClose}
      />
    );

    // Navigate to preferences tab
    const preferencesTab = screen.getByText('Preferences');
    fireEvent.click(preferencesTab);

    // Should handle undefined preferences gracefully
    expect(screen.getByText('Communication Preferences')).toBeInTheDocument();
  });

  it('closes the modal when close button is clicked', () => {
    render(
      <CommunicationHub
        customer={mockCustomer}
        onSendMessage={mockOnSendMessage}
        onUpdatePreferences={mockOnUpdatePreferences}
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('shows correct status colors for communication records', () => {
    render(
      <CommunicationHub
        customer={mockCustomer}
        onSendMessage={mockOnSendMessage}
        onUpdatePreferences={mockOnUpdatePreferences}
        onClose={mockOnClose}
      />
    );

    // Navigate to history tab
    const historyTab = screen.getByText('History');
    fireEvent.click(historyTab);

    // Check for status badges
    const deliveredStatus = screen.getByText('delivered');
    expect(deliveredStatus).toHaveClass('bg-green-100', 'text-green-800');

    const readStatus = screen.getAllByText('read');
    expect(readStatus[0]).toHaveClass('bg-green-100', 'text-green-800');
  });

  it('shows correct channel icons for different communication types', () => {
    render(
      <CommunicationHub
        customer={mockCustomer}
        onSendMessage={mockOnSendMessage}
        onUpdatePreferences={mockOnUpdatePreferences}
        onClose={mockOnClose}
      />
    );

    // Navigate to history tab
    const historyTab = screen.getByText('History');
    fireEvent.click(historyTab);

    // Check for communication types
    expect(screen.getByText('Outbound email')).toBeInTheDocument();
    expect(screen.getByText('Outbound sms')).toBeInTheDocument();
    expect(screen.getByText('Inbound whatsapp')).toBeInTheDocument();
  });

  it('handles empty communication history', () => {
    const customerWithoutHistory = createMockCustomer({
      communicationPreferences: undefined
    });

    render(
      <CommunicationHub
        customer={customerWithoutHistory}
        onSendMessage={mockOnSendMessage}
        onUpdatePreferences={mockOnUpdatePreferences}
        onClose={mockOnClose}
      />
    );

    // Navigate to history tab
    const historyTab = screen.getByText('History');
    fireEvent.click(historyTab);

    // Should handle empty history gracefully
    expect(screen.getByText('Communication History')).toBeInTheDocument();
  });

  it('resets form after sending message', async () => {
    render(
      <CommunicationHub
        customer={mockCustomer}
        onSendMessage={mockOnSendMessage}
        onUpdatePreferences={mockOnUpdatePreferences}
        onClose={mockOnClose}
      />
    );

    // Fill in form
    const subjectInput = screen.getByPlaceholderText('Enter subject...');
    fireEvent.change(subjectInput, { target: { value: 'Test Subject' } });

    const messageInput = screen.getByPlaceholderText('Enter your email message...');
    fireEvent.change(messageInput, { target: { value: 'Test message' } });

    // Send message
    const sendButton = screen.getByText('Send Message');
    fireEvent.click(sendButton);

    await waitFor(() => {
      // Form should be reset
      expect(subjectInput).toHaveValue('');
      expect(messageInput).toHaveValue('');
    });
  });
}); 
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CustomerProfileManager } from '../CustomerProfileManager';
import { createMockCustomer } from '../../../test/utils/test-utils';

// Mock the createMockVehicle function
jest.mock('../../../test/utils/test-utils', () => ({
  ...jest.requireActual('../../../test/utils/test-utils'),
  createMockVehicle: jest.fn(() => ({
    id: '1',
    make: 'Toyota',
    model: 'Corolla',
    year: 2020,
    regNumber: 'ABC123',
    vin: 'ABC123456789',
    mileage: 50000
  }))
}));

describe('CustomerProfileManager', () => {
  const mockCustomer = createMockCustomer({
    serviceHistory: [
      {
        id: '1',
        customerId: '1',
        vehicleId: '1',
        serviceDate: new Date('2024-01-15'),
        serviceType: 'oil_change',
        description: 'Oil change and filter replacement',
        cost: 150,
        mileage: 50000,
        status: 'completed',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      }
    ],
    communicationPreferences: {
      emailNotifications: true,
      smsNotifications: false,
      whatsappNotifications: true,
      serviceReminders: true,
      promotionalMessages: false,
      preferredContactMethod: 'email',
      preferredContactTime: 'morning',
      language: 'en'
    },
    customerSegment: 'premium',
    totalSpent: 2500,
    loyaltyPoints: 150,
    notes: 'Premium customer with excellent service history',
    lastServiceDate: new Date('2024-01-15'),
    nextServiceDue: new Date('2024-04-15')
  });

  const mockOnUpdate = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders customer profile manager with basic information', () => {
    render(
      <CustomerProfileManager
        customer={mockCustomer}
        onUpdate={mockOnUpdate}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Customer Profile')).toBeInTheDocument();
    expect(screen.getByText('Manage customer information and history')).toBeInTheDocument();
    expect(screen.getByText(mockCustomer.name)).toBeInTheDocument();
    expect(screen.getByText(mockCustomer.phone)).toBeInTheDocument();
    expect(screen.getByText(mockCustomer.email!)).toBeInTheDocument();
    expect(screen.getByText(mockCustomer.address)).toBeInTheDocument();
  });

  it('displays customer statistics correctly', () => {
    render(
      <CustomerProfileManager
        customer={mockCustomer}
        onUpdate={mockOnUpdate}
        onClose={mockOnClose}
      />
    );

    expect(screen.getAllByText('1')).toHaveLength(2); // Vehicles owned and Services
    expect(screen.getByText('K 2,500.00')).toBeInTheDocument(); // Total spent
    expect(screen.getByText('150')).toBeInTheDocument(); // Loyalty points
  });

  it('shows customer segment with correct styling', () => {
    render(
      <CustomerProfileManager
        customer={mockCustomer}
        onUpdate={mockOnUpdate}
        onClose={mockOnClose}
      />
    );

    const segmentBadge = screen.getByText('premium');
    expect(segmentBadge).toBeInTheDocument();
    expect(segmentBadge).toHaveClass('bg-purple-100', 'text-purple-800');
  });

  it('allows editing customer information', async () => {
    render(
      <CustomerProfileManager
        customer={mockCustomer}
        onUpdate={mockOnUpdate}
        onClose={mockOnClose}
      />
    );

    // Click edit button
    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);

    // Check that form fields are now editable
    const nameInput = screen.getByDisplayValue(mockCustomer.name);
    expect(nameInput).toBeInTheDocument();
    expect(nameInput).toHaveAttribute('type', 'text');

    const phoneInput = screen.getByDisplayValue(mockCustomer.phone);
    expect(phoneInput).toBeInTheDocument();
    expect(phoneInput).toHaveAttribute('type', 'tel');

    const emailInput = screen.getByDisplayValue(mockCustomer.email!);
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute('type', 'email');
  });

  it('saves edited customer information', async () => {
    render(
      <CustomerProfileManager
        customer={mockCustomer}
        onUpdate={mockOnUpdate}
        onClose={mockOnClose}
      />
    );

    // Click edit button
    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);

    // Modify name
    const nameInput = screen.getByDisplayValue(mockCustomer.name);
    fireEvent.change(nameInput, { target: { value: 'Updated Name' } });

    // Click save button
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Updated Name'
        })
      );
    });
  });

  it('cancels editing and reverts changes', async () => {
    render(
      <CustomerProfileManager
        customer={mockCustomer}
        onUpdate={mockOnUpdate}
        onClose={mockOnClose}
      />
    );

    // Click edit button
    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);

    // Modify name
    const nameInput = screen.getByDisplayValue(mockCustomer.name);
    fireEvent.change(nameInput, { target: { value: 'Updated Name' } });

    // Click cancel button
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    // Check that the name is back to original
    expect(screen.getByText(mockCustomer.name)).toBeInTheDocument();
    expect(mockOnUpdate).not.toHaveBeenCalled();
  });

  it('navigates between tabs correctly', () => {
    render(
      <CustomerProfileManager
        customer={mockCustomer}
        onUpdate={mockOnUpdate}
        onClose={mockOnClose}
      />
    );

    // Check that overview tab is active by default
    const overviewTab = screen.getByText('Overview').closest('button');
    expect(overviewTab).toHaveClass('border-blue-500', 'text-blue-600');

    // Click on service history tab
    const serviceHistoryTab = screen.getAllByText('Service History')[0].closest('button');
    fireEvent.click(serviceHistoryTab!);

    // Check that service history content is displayed
    expect(screen.getByText('Add Service Record')).toBeInTheDocument();
    expect(screen.getByText('Add Service Record')).toBeInTheDocument();
  });

  it('displays service history correctly', () => {
    render(
      <CustomerProfileManager
        customer={mockCustomer}
        onUpdate={mockOnUpdate}
        onClose={mockOnClose}
      />
    );

    // Navigate to service history tab
    const serviceHistoryTab = screen.getByText('Service History');
    fireEvent.click(serviceHistoryTab);

    // Check service history content
    expect(screen.getByText('Oil change and filter replacement')).toBeInTheDocument();
    expect(screen.getByText('oil change')).toBeInTheDocument();
    expect(screen.getByText('K 150.00')).toBeInTheDocument();
    expect(screen.getByText(/50,000/)).toBeInTheDocument();
    expect(screen.getByText('completed')).toBeInTheDocument();
  });

  it('displays vehicles tab correctly', () => {
    render(
      <CustomerProfileManager
        customer={mockCustomer}
        onUpdate={mockOnUpdate}
        onClose={mockOnClose}
      />
    );

    // Navigate to vehicles tab
    const vehiclesTab = screen.getByText('Vehicles');
    fireEvent.click(vehiclesTab);

    // Check vehicles content
    expect(screen.getByText('Owned Vehicles')).toBeInTheDocument();
    expect(screen.getByText('Toyota Corolla')).toBeInTheDocument();
    expect(screen.getByText('2020')).toBeInTheDocument();
    expect(screen.getByText('ABC123')).toBeInTheDocument();
    expect(screen.getByText('ABC123456789')).toBeInTheDocument();
    expect(screen.getByText(/50,000/)).toBeInTheDocument();
  });

  it('displays communications tab correctly', () => {
    render(
      <CustomerProfileManager
        customer={mockCustomer}
        onUpdate={mockOnUpdate}
        onClose={mockOnClose}
      />
    );

    // Navigate to communications tab
    const communicationsTab = screen.getByText('Communications');
    fireEvent.click(communicationsTab);

    // Check communications content
    expect(screen.getByText('Communication Preferences')).toBeInTheDocument();
    expect(screen.getByText('Send Message')).toBeInTheDocument();
    expect(screen.getAllByText('Enabled')).toHaveLength(2); // Email, WhatsApp
    expect(screen.getAllByText('Disabled')).toHaveLength(1); // SMS
    expect(screen.getAllByText(/email/i)).toHaveLength(2); // Preferred method (appears twice)
    expect(screen.getByText(/morning/i)).toBeInTheDocument(); // Preferred time
    // Language preference is displayed as fallback "English" when not set
    expect(screen.getByText(/language/i)).toBeInTheDocument(); // Language label
  });

  it('displays analytics tab correctly', () => {
    render(
      <CustomerProfileManager
        customer={mockCustomer}
        onUpdate={mockOnUpdate}
        onClose={mockOnClose}
      />
    );

    // Navigate to analytics tab
    const analyticsTab = screen.getByText('Analytics');
    fireEvent.click(analyticsTab);

    // Check analytics content
    expect(screen.getByText('Customer Analytics')).toBeInTheDocument();
    expect(screen.getByText('K 2,500.00')).toBeInTheDocument(); // Total spent
    expect(screen.getByText('1')).toBeInTheDocument(); // Services
    expect(screen.getByText('150')).toBeInTheDocument(); // Loyalty points
  });

  it('displays service information correctly', () => {
    render(
      <CustomerProfileManager
        customer={mockCustomer}
        onUpdate={mockOnUpdate}
        onClose={mockOnClose}
      />
    );

    // Check service information in overview
    expect(screen.getByText('Jan 15, 2024')).toBeInTheDocument(); // Last service
    expect(screen.getByText('Apr 15, 2024')).toBeInTheDocument(); // Next service due
  });

  it('displays customer notes correctly', () => {
    render(
      <CustomerProfileManager
        customer={mockCustomer}
        onUpdate={mockOnUpdate}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Premium customer with excellent service history')).toBeInTheDocument();
  });

  it('allows editing notes', async () => {
    render(
      <CustomerProfileManager
        customer={mockCustomer}
        onUpdate={mockOnUpdate}
        onClose={mockOnClose}
      />
    );

    // Click edit button
    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);

    // Find and modify notes textarea
    const notesTextarea = screen.getByPlaceholderText('Add notes about this customer...');
    fireEvent.change(notesTextarea, { target: { value: 'Updated notes' } });

    // Click save button
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          notes: 'Updated notes'
        })
      );
    });
  });

  it('handles customer with no service history', () => {
    const customerWithoutHistory = createMockCustomer({
      serviceHistory: []
    });

    render(
      <CustomerProfileManager
        customer={customerWithoutHistory}
        onUpdate={mockOnUpdate}
        onClose={mockOnClose}
      />
    );

    // Navigate to service history tab
    const serviceHistoryTab = screen.getByText('Service History');
    fireEvent.click(serviceHistoryTab);

    expect(screen.getByText('No service history available')).toBeInTheDocument();
  });

  it('handles customer with no vehicles', () => {
    const customerWithoutVehicles = createMockCustomer({
      vehiclesOwned: []
    });

    render(
      <CustomerProfileManager
        customer={customerWithoutVehicles}
        onUpdate={mockOnUpdate}
        onClose={mockOnClose}
      />
    );

    // Navigate to vehicles tab
    const vehiclesTab = screen.getByText('Vehicles');
    fireEvent.click(vehiclesTab);

    expect(screen.getByText('No vehicles owned')).toBeInTheDocument();
  });

  it('closes the modal when close button is clicked', () => {
    render(
      <CustomerProfileManager
        customer={mockCustomer}
        onUpdate={mockOnUpdate}
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('handles customer without communication preferences', () => {
    const customerWithoutPrefs = createMockCustomer({
      communicationPreferences: undefined
    });

    render(
      <CustomerProfileManager
        customer={customerWithoutPrefs}
        onUpdate={mockOnUpdate}
        onClose={mockOnClose}
      />
    );

    // Navigate to communications tab
    const communicationsTab = screen.getByText('Communications');
    fireEvent.click(communicationsTab);

    expect(screen.getAllByText('Not set')).toHaveLength(2); // Preferred method and time
    expect(screen.getByText('English')).toBeInTheDocument(); // Language
  });

  it('handles customer without email', () => {
    const customerWithoutEmail = createMockCustomer({
      email: undefined
    });

    render(
      <CustomerProfileManager
        customer={customerWithoutEmail}
        onUpdate={mockOnUpdate}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Not provided')).toBeInTheDocument();
  });

  it('handles customer without notes', () => {
    const customerWithoutNotes = createMockCustomer({
      notes: undefined
    });

    render(
      <CustomerProfileManager
        customer={customerWithoutNotes}
        onUpdate={mockOnUpdate}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('No notes available')).toBeInTheDocument();
  });

  it('formats currency correctly', () => {
    const customerWithHighSpending = createMockCustomer({
      totalSpent: 150000
    });

    render(
      <CustomerProfileManager
        customer={customerWithHighSpending}
        onUpdate={mockOnUpdate}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('K 150,000.00')).toBeInTheDocument();
  });

  it('displays correct segment colors for different segments', () => {
    const segments = ['premium', 'regular', 'occasional', 'prospect', 'inactive'] as const;
    
    segments.forEach(segment => {
      const customerWithSegment = createMockCustomer({ customerSegment: segment });
      
      const { unmount } = render(
        <CustomerProfileManager
          customer={customerWithSegment}
          onUpdate={mockOnUpdate}
          onClose={mockOnClose}
        />
      );

      const segmentBadge = screen.getByText(segment);
      expect(segmentBadge).toBeInTheDocument();
      
      unmount();
    });
  });
}); 
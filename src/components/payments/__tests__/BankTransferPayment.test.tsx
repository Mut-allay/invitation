import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BankTransferPayment from '../BankTransferPayment';

// Mock the payment completion callback
const mockOnPaymentComplete = jest.fn();
const mockOnCancel = jest.fn();

const defaultProps = {
  amount: 1500.00,
  onPaymentComplete: mockOnPaymentComplete,
  onCancel: mockOnCancel
};

describe('BankTransferPayment', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Tests', () => {
    it('renders bank transfer payment interface', () => {
      render(<BankTransferPayment {...defaultProps} />);
      
      expect(screen.getByText('Bank Transfer Payment')).toBeInTheDocument();
      expect(screen.getByText(/Pay.*1,500.00.*via bank transfer/)).toBeInTheDocument();
      expect(screen.getByText('Zambia National Commercial Bank')).toBeInTheDocument();
      expect(screen.getByText('First National Bank')).toBeInTheDocument();
      expect(screen.getByText('Stanbic Bank Zambia')).toBeInTheDocument();
    });

    it('displays correct amount in Zambian Kwacha format', () => {
      render(<BankTransferPayment {...defaultProps} amount={2500.50} />);
      
      expect(screen.getByText(/Pay.*2,500.50.*via bank transfer/)).toBeInTheDocument();
    });

    it('shows all Zambian banks with their codes', () => {
      render(<BankTransferPayment {...defaultProps} />);
      
      expect(screen.getByText('Transfer via ZANACO')).toBeInTheDocument();
      expect(screen.getByText('Transfer via FNB')).toBeInTheDocument();
      expect(screen.getByText('Transfer via STANBIC')).toBeInTheDocument();
      expect(screen.getByText('Transfer via BARCLAYS')).toBeInTheDocument();
      expect(screen.getByText('Transfer via INVESTRUST')).toBeInTheDocument();
      expect(screen.getByText('Transfer via CAVMONT')).toBeInTheDocument();
    });

    it('handles bank selection correctly', async () => {
      const user = userEvent.setup();
      render(<BankTransferPayment {...defaultProps} />);
      
      const zanacoButton = screen.getByText('Zambia National Commercial Bank').closest('button');
      await user.click(zanacoButton!);
      
      expect(screen.getByText('Zambia National Commercial Bank Transfer')).toBeInTheDocument();
      expect(screen.getByText('Enter your account details to receive payment instructions.')).toBeInTheDocument();
    });

    it('validates account number input', async () => {
      const user = userEvent.setup();
      render(<BankTransferPayment {...defaultProps} />);
      
      // Select bank first
      const zanacoButton = screen.getByText('Zambia National Commercial Bank').closest('button');
      await user.click(zanacoButton!);
      
      // Enter invalid account number
      const accountInput = screen.getByPlaceholderText('e.g., 1234 5678 9012 3456');
      await user.type(accountInput, '123456789');
      
      // Enter account name
      const nameInput = screen.getByPlaceholderText('e.g., John Doe');
      await user.type(nameInput, 'John Doe');
      
      // Try to continue with invalid account number
      const continueButton = screen.getByText('Continue');
      await user.click(continueButton);
      
      await waitFor(() => {
        expect(screen.getByText('Please enter a valid 16-digit account number')).toBeInTheDocument();
      });
    });

    it('accepts valid Zambian account numbers', async () => {
      const user = userEvent.setup();
      render(<BankTransferPayment {...defaultProps} />);
      
      // Select bank first
      const zanacoButton = screen.getByText('Zambia National Commercial Bank').closest('button');
      await user.click(zanacoButton!);
      
      // Enter valid account number
      const accountInput = screen.getByPlaceholderText('e.g., 1234 5678 9012 3456');
      await user.type(accountInput, '1234567890123456');
      
      // Enter account name
      const nameInput = screen.getByPlaceholderText('e.g., John Doe');
      await user.type(nameInput, 'John Doe');
      
      // Continue to confirmation
      const continueButton = screen.getByText('Continue');
      await user.click(continueButton);
      
      await waitFor(() => {
        expect(screen.getByText('Confirm Bank Transfer')).toBeInTheDocument();
        expect(screen.getByText('1234 5678 9012 3456')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
    });

    it('shows payment confirmation screen', async () => {
      const user = userEvent.setup();
      render(<BankTransferPayment {...defaultProps} />);
      
      // Navigate through the flow
      const zanacoButton = screen.getByText('Zambia National Commercial Bank').closest('button');
      await user.click(zanacoButton!);
      
      const accountInput = screen.getByPlaceholderText('e.g., 1234 5678 9012 3456');
      await user.type(accountInput, '1234567890123456');
      
      const nameInput = screen.getByPlaceholderText('e.g., John Doe');
      await user.type(nameInput, 'John Doe');
      
      const continueButton = screen.getByText('Continue');
      await user.click(continueButton);
      
      await waitFor(() => {
        expect(screen.getByText('Confirm Bank Transfer')).toBeInTheDocument();
        expect(screen.getByText('Please review your transfer details before proceeding.')).toBeInTheDocument();
        expect(screen.getByText('Transfer Instructions:')).toBeInTheDocument();
      });
    });

    it('processes payment successfully', async () => {
      const user = userEvent.setup();
      render(<BankTransferPayment {...defaultProps} />);
      
      // Navigate through the flow
      const zanacoButton = screen.getByText('Zambia National Commercial Bank').closest('button');
      await user.click(zanacoButton!);
      
      const accountInput = screen.getByPlaceholderText('e.g., 1234 5678 9012 3456');
      await user.type(accountInput, '1234567890123456');
      
      const nameInput = screen.getByPlaceholderText('e.g., John Doe');
      await user.type(nameInput, 'John Doe');
      
      const continueButton = screen.getByText('Continue');
      await user.click(continueButton);
      
      const confirmButton = screen.getByText('Confirm Transfer');
      await user.click(confirmButton);
      
      // Wait for processing
      await waitFor(() => {
        expect(screen.getByText('Processing Transfer')).toBeInTheDocument();
      }, { timeout: 1000 });
      
      // Wait for success
      await waitFor(() => {
        expect(screen.getByText('Transfer Initiated Successfully!')).toBeInTheDocument();
      }, { timeout: 4000 });
      
      // Verify callback was called
      expect(mockOnPaymentComplete).toHaveBeenCalledWith({
        success: true,
        reference: expect.stringMatching(/^BT-\d{6}-[A-Z0-9]{6}$/),
        bankCode: 'ZANACO',
        accountNumber: '1234567890123456',
        amount: 1500.00,
        timestamp: expect.any(Date)
      });
    });

    it('calls onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<BankTransferPayment {...defaultProps} />);
      
      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);
      
      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('disables continue button when fields are empty', async () => {
      const user = userEvent.setup();
      render(<BankTransferPayment {...defaultProps} />);
      
      // Select bank first
      const zanacoButton = screen.getByText('Zambia National Commercial Bank').closest('button');
      await user.click(zanacoButton!);
      
      // Check that continue button is disabled
      const continueButton = screen.getByText('Continue');
      expect(continueButton).toBeDisabled();
    });
  });

  describe('Integration Tests', () => {
    it('completes full bank transfer flow successfully', async () => {
      const user = userEvent.setup();
      render(<BankTransferPayment {...defaultProps} />);
      
      // Step 1: Select bank
      const zanacoButton = screen.getByText('Zambia National Commercial Bank').closest('button');
      await user.click(zanacoButton!);
      
      // Step 2: Enter account details
      const accountInput = screen.getByPlaceholderText('e.g., 1234 5678 9012 3456');
      await user.type(accountInput, '1234567890123456');
      
      const nameInput = screen.getByPlaceholderText('e.g., John Doe');
      await user.type(nameInput, 'John Doe');
      
      const continueButton = screen.getByText('Continue');
      await user.click(continueButton);
      
      // Step 3: Confirm transfer
      await waitFor(() => {
        expect(screen.getByText('Confirm Bank Transfer')).toBeInTheDocument();
      });
      
      const confirmButton = screen.getByText('Confirm Transfer');
      await user.click(confirmButton);
      
      // Step 4: Wait for success
      await waitFor(() => {
        expect(screen.getByText('Transfer Initiated Successfully!')).toBeInTheDocument();
      }, { timeout: 4000 });
      
      // Verify complete flow
      expect(mockOnPaymentComplete).toHaveBeenCalledWith({
        success: true,
        reference: expect.stringMatching(/^BT-\d{6}-[A-Z0-9]{6}$/),
        bankCode: 'ZANACO',
        accountNumber: '1234567890123456',
        amount: 1500.00,
        timestamp: expect.any(Date)
      });
    });

    it('handles navigation between steps correctly', async () => {
      const user = userEvent.setup();
      render(<BankTransferPayment {...defaultProps} />);
      
      // Select bank
      const zanacoButton = screen.getByText('Zambia National Commercial Bank').closest('button');
      await user.click(zanacoButton!);
      
      // Go back to bank selection
      const backButton = screen.getByText('Back');
      await user.click(backButton);
      
      // Should be back at bank selection
      expect(screen.getByText('Bank Transfer Payment')).toBeInTheDocument();
      expect(screen.getByText('Zambia National Commercial Bank')).toBeInTheDocument();
    });

    it('maintains state correctly during navigation', async () => {
      const user = userEvent.setup();
      render(<BankTransferPayment {...defaultProps} />);
      
      // Select bank
      const zanacoButton = screen.getByText('Zambia National Commercial Bank').closest('button');
      await user.click(zanacoButton!);
      
      // Enter account details
      const accountInput = screen.getByPlaceholderText('e.g., 1234 5678 9012 3456');
      await user.type(accountInput, '1234567890123456');
      
      const nameInput = screen.getByPlaceholderText('e.g., John Doe');
      await user.type(nameInput, 'John Doe');
      
      // Go to confirmation
      const continueButton = screen.getByText('Continue');
      await user.click(continueButton);
      
      // Go back to account details
      const backButton = screen.getByText('Back');
      await user.click(backButton);
      
      // State should be preserved
      expect(screen.getByDisplayValue('1234 5678 9012 3456')).toBeInTheDocument();
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    });
  });

  describe('Accessibility Tests', () => {
    it('has proper ARIA labels and roles', () => {
      render(<BankTransferPayment {...defaultProps} />);
      
      // Check bank selection buttons have proper labels
      expect(screen.getByLabelText('Select Zambia National Commercial Bank for bank transfer')).toBeInTheDocument();
      expect(screen.getByLabelText('Select First National Bank for bank transfer')).toBeInTheDocument();
      
      // Check cancel button has proper label
      expect(screen.getByLabelText('Cancel bank transfer payment')).toBeInTheDocument();
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<BankTransferPayment {...defaultProps} />);
      
      // Tab through interactive elements
      await user.tab();
      expect(screen.getByText('Zambia National Commercial Bank').closest('button')).toHaveFocus();
      
      // Tab through all bank buttons first
      await user.tab();
      await user.tab();
      await user.tab();
      await user.tab();
      await user.tab();
      await user.tab();
      
      // Now should be on cancel button
      expect(screen.getByText('Cancel')).toHaveFocus();
    });

    it('provides proper error messages for screen readers', async () => {
      const user = userEvent.setup();
      render(<BankTransferPayment {...defaultProps} />);
      
      // Navigate to account details
      const zanacoButton = screen.getByText('Zambia National Commercial Bank').closest('button');
      await user.click(zanacoButton!);
      
      // Enter invalid account number
      const accountInput = screen.getByPlaceholderText('e.g., 1234 5678 9012 3456');
      await user.type(accountInput, '123456789');
      
      // Enter account name
      const nameInput = screen.getByPlaceholderText('e.g., John Doe');
      await user.type(nameInput, 'John Doe');
      
      // Try to continue with invalid account number
      const continueButton = screen.getByText('Continue');
      await user.click(continueButton);
      
      await waitFor(() => {
        expect(screen.getByText('Please enter a valid 16-digit account number')).toBeInTheDocument();
      });
    });

    it('has proper color contrast for text elements', () => {
      render(<BankTransferPayment {...defaultProps} />);
      
      const title = screen.getByText('Bank Transfer Payment');
      expect(title).toHaveClass('text-gray-900'); // High contrast for headings
      
      const description = screen.getByText(/Pay.*via bank transfer/);
      expect(description).toHaveClass('text-gray-600'); // Medium contrast for secondary text
    });

    it('provides alternative text for icons', () => {
      render(<BankTransferPayment {...defaultProps} />);
      
      // Check that SVG icons are present with proper attributes
      const svgIcons = document.querySelectorAll('svg[aria-hidden="true"]');
      expect(svgIcons.length).toBeGreaterThan(0);
      
      // Check that bank icons (emojis) are present
      expect(screen.getAllByText('🏦')).toHaveLength(6);
    });
  });

  describe('Account Number Formatting', () => {
    it('formats Zambian account numbers correctly', async () => {
      const user = userEvent.setup();
      render(<BankTransferPayment {...defaultProps} />);
      
      // Select bank first
      const zanacoButton = screen.getByText('Zambia National Commercial Bank').closest('button');
      await user.click(zanacoButton!);
      
      // Enter account number
      const accountInput = screen.getByPlaceholderText('e.g., 1234 5678 9012 3456');
      await user.type(accountInput, '1234567890123456');
      
      // Should be formatted with spaces
      expect(screen.getByDisplayValue('1234 5678 9012 3456')).toBeInTheDocument();
    });

    it('handles different account number formats', async () => {
      const user = userEvent.setup();
      render(<BankTransferPayment {...defaultProps} />);
      
      // Select bank first
      const zanacoButton = screen.getByText('Zambia National Commercial Bank').closest('button');
      await user.click(zanacoButton!);
      
      // Enter account number with spaces
      const accountInput = screen.getByPlaceholderText('e.g., 1234 5678 9012 3456');
      await user.type(accountInput, '1234 5678 9012 3456');
      
      // Should maintain formatting
      expect(screen.getByDisplayValue('1234 5678 9012 3456')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('shows error for invalid account number', async () => {
      const user = userEvent.setup();
      render(<BankTransferPayment {...defaultProps} />);
      
      // Navigate to account details
      const zanacoButton = screen.getByText('Zambia National Commercial Bank').closest('button');
      await user.click(zanacoButton!);
      
      // Enter invalid account number
      const accountInput = screen.getByPlaceholderText('e.g., 1234 5678 9012 3456');
      await user.type(accountInput, '123456789');
      
      // Enter account name
      const nameInput = screen.getByPlaceholderText('e.g., John Doe');
      await user.type(nameInput, 'John Doe');
      
      // Try to continue
      const continueButton = screen.getByText('Continue');
      await user.click(continueButton);
      
      await waitFor(() => {
        expect(screen.getByText('Please enter a valid 16-digit account number')).toBeInTheDocument();
      });
    });

    it('clears error when valid input is provided', async () => {
      const user = userEvent.setup();
      render(<BankTransferPayment {...defaultProps} />);
      
      // Navigate to account details
      const zanacoButton = screen.getByText('Zambia National Commercial Bank').closest('button');
      await user.click(zanacoButton!);
      
      // Enter invalid account number
      const accountInput = screen.getByPlaceholderText('e.g., 1234 5678 9012 3456');
      await user.type(accountInput, '123456789');
      
      // Enter account name
      const nameInput = screen.getByPlaceholderText('e.g., John Doe');
      await user.type(nameInput, 'John Doe');
      
      // Try to continue
      const continueButton = screen.getByText('Continue');
      await user.click(continueButton);
      
      await waitFor(() => {
        expect(screen.getByText('Please enter a valid 16-digit account number')).toBeInTheDocument();
      });
      
      // Clear and enter valid account number
      await user.clear(accountInput);
      await user.type(accountInput, '1234567890123456');
      await user.click(continueButton);
      
      // Error should be gone and we should move to confirmation step
      await waitFor(() => {
        expect(screen.queryByText('Please enter a valid 16-digit account number')).not.toBeInTheDocument();
        expect(screen.getByText('Confirm Bank Transfer')).toBeInTheDocument();
      });
    });
  });
});

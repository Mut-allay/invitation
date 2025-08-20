import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CashPayment from '../CashPayment';

// Mock the payment completion callback
const mockOnPaymentComplete = jest.fn();
const mockOnCancel = jest.fn();

const defaultProps = {
  amount: 1500.00,
  onPaymentComplete: mockOnPaymentComplete,
  onCancel: mockOnCancel
};

describe('CashPayment', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Tests', () => {
    it('renders cash payment interface', () => {
      render(<CashPayment {...defaultProps} />);
      
      expect(screen.getByText('Cash Payment')).toBeInTheDocument();
      expect(screen.getByText('Amount due: K 1,500.00')).toBeInTheDocument();
      expect(screen.getByText('Amount Received')).toBeInTheDocument();
      expect(screen.getByText('Quick Add:')).toBeInTheDocument();
    });

    it('displays correct amount in Zambian Kwacha format', () => {
      render(<CashPayment {...defaultProps} amount={2500.50} />);
      
      expect(screen.getByText('Amount due: K 2,500.50')).toBeInTheDocument();
    });

    it('shows Zambian currency denominations', () => {
      render(<CashPayment {...defaultProps} />);
      
      expect(screen.getByText('+K100')).toBeInTheDocument();
      expect(screen.getByText('+K50')).toBeInTheDocument();
      expect(screen.getByText('+K20')).toBeInTheDocument();
      expect(screen.getByText('+K10')).toBeInTheDocument();
      expect(screen.getByText('+K5')).toBeInTheDocument();
      expect(screen.getByText('+K2')).toBeInTheDocument();
    });

    it('handles amount input correctly', async () => {
      const user = userEvent.setup();
      render(<CashPayment {...defaultProps} />);
      
      const amountInput = screen.getByPlaceholderText('0.00');
      await user.type(amountInput, '2000');
      
      expect(screen.getByDisplayValue('2000')).toBeInTheDocument();
      expect(screen.getByText('K 2,000.00')).toBeInTheDocument();
      expect(screen.getByText('K 500.00')).toBeInTheDocument(); // Change
    });

    it('handles quick add buttons', async () => {
      const user = userEvent.setup();
      render(<CashPayment {...defaultProps} />);
      
      const k100Button = screen.getByText('+K100');
      const k50Button = screen.getByText('+K50');
      
      await user.click(k100Button);
      await user.click(k50Button);
      
      expect(screen.getByDisplayValue('150')).toBeInTheDocument();
      expect(screen.getByText('K 150.00')).toBeInTheDocument();
    });

    it('calculates change correctly', async () => {
      const user = userEvent.setup();
      render(<CashPayment {...defaultProps} />);
      
      const amountInput = screen.getByPlaceholderText('0.00');
      await user.type(amountInput, '2000');
      
      expect(screen.getByText('K 500.00')).toBeInTheDocument(); // Change
    });

    it('shows error for insufficient amount', async () => {
      const user = userEvent.setup();
      render(<CashPayment {...defaultProps} />);
      
      const amountInput = screen.getByPlaceholderText('0.00');
      await user.type(amountInput, '1000');
      
      // Continue button should be disabled for insufficient amount
      const continueButton = screen.getByText('Continue');
      expect(continueButton).toBeDisabled();
      
      // Enter sufficient amount to proceed to confirmation
      await user.clear(amountInput);
      await user.type(amountInput, '2000');
      await user.click(continueButton);
      
      await waitFor(() => {
        expect(screen.getByText('Confirm Cash Payment')).toBeInTheDocument();
      });
      
      // Go back and enter insufficient amount
      const backButton = screen.getByText('Back');
      await user.click(backButton);
      
      await user.clear(amountInput);
      await user.type(amountInput, '1000');
      await user.click(continueButton);
      
      await waitFor(() => {
        expect(screen.getByText('Confirm Cash Payment')).toBeInTheDocument();
      });
      
      const confirmButton = screen.getByText('Confirm Payment');
      await user.click(confirmButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Amount received.*is less than required amount/)).toBeInTheDocument();
      });
    });

    it('shows payment confirmation screen', async () => {
      const user = userEvent.setup();
      render(<CashPayment {...defaultProps} />);
      
      const amountInput = screen.getByPlaceholderText('0.00');
      await user.type(amountInput, '2000');
      
      const continueButton = screen.getByText('Continue');
      await user.click(continueButton);
      
      await waitFor(() => {
        expect(screen.getByText('Confirm Cash Payment')).toBeInTheDocument();
        expect(screen.getByText('Please review the payment details before proceeding.')).toBeInTheDocument();
        expect(screen.getByText('Change Breakdown:')).toBeInTheDocument();
      });
    });

    it('processes payment successfully', async () => {
      const user = userEvent.setup();
      render(<CashPayment {...defaultProps} />);
      
      const amountInput = screen.getByPlaceholderText('0.00');
      await user.type(amountInput, '2000');
      
      const continueButton = screen.getByText('Continue');
      await user.click(continueButton);
      
      const confirmButton = screen.getByText('Confirm Payment');
      await user.click(confirmButton);
      
      // Wait for processing
      await waitFor(() => {
        expect(screen.getByText('Processing Payment')).toBeInTheDocument();
      }, { timeout: 1000 });
      
      // Wait for success
      await waitFor(() => {
        expect(screen.getByText('Payment Successful!')).toBeInTheDocument();
      }, { timeout: 3000 });
      
      // Verify callback was called
      expect(mockOnPaymentComplete).toHaveBeenCalledWith({
        success: true,
        reference: expect.stringMatching(/^CASH-\d{6}-[A-Z0-9]{6}$/),
        amountReceived: 2000,
        change: 500,
        receiptNumber: expect.stringMatching(/^RCP-\d{6}-[A-Z0-9]{6}$/),
        timestamp: expect.any(Date)
      });
    });

    it('calls onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<CashPayment {...defaultProps} />);
      
      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);
      
      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('disables continue button when amount is insufficient', async () => {
      const user = userEvent.setup();
      render(<CashPayment {...defaultProps} />);
      
      const amountInput = screen.getByPlaceholderText('0.00');
      await user.type(amountInput, '1000');
      
      const continueButton = screen.getByText('Continue');
      expect(continueButton).toBeDisabled();
    });
  });

  describe('Integration Tests', () => {
    it('completes full cash payment flow successfully', async () => {
      const user = userEvent.setup();
      render(<CashPayment {...defaultProps} />);
      
      // Step 1: Enter amount
      const amountInput = screen.getByPlaceholderText('0.00');
      await user.type(amountInput, '2000');
      
      // Step 2: Continue to confirmation
      const continueButton = screen.getByText('Continue');
      await user.click(continueButton);
      
      // Step 3: Confirm payment
      await waitFor(() => {
        expect(screen.getByText('Confirm Cash Payment')).toBeInTheDocument();
      });
      
      const confirmButton = screen.getByText('Confirm Payment');
      await user.click(confirmButton);
      
      // Step 4: Wait for success
      await waitFor(() => {
        expect(screen.getByText('Payment Successful!')).toBeInTheDocument();
      }, { timeout: 3000 });
      
      // Verify complete flow
      expect(mockOnPaymentComplete).toHaveBeenCalledWith({
        success: true,
        reference: expect.stringMatching(/^CASH-\d{6}-[A-Z0-9]{6}$/),
        amountReceived: 2000,
        change: 500,
        receiptNumber: expect.stringMatching(/^RCP-\d{6}-[A-Z0-9]{6}$/),
        timestamp: expect.any(Date)
      });
    });

    it('handles navigation between steps correctly', async () => {
      const user = userEvent.setup();
      render(<CashPayment {...defaultProps} />);
      
      // Enter amount
      const amountInput = screen.getByPlaceholderText('0.00');
      await user.type(amountInput, '2000');
      
      // Go to confirmation
      const continueButton = screen.getByText('Continue');
      await user.click(continueButton);
      
      // Go back to amount entry
      const backButton = screen.getByText('Back');
      await user.click(backButton);
      
      // Should be back at amount entry
      expect(screen.getByText('Cash Payment')).toBeInTheDocument();
      expect(screen.getByDisplayValue('2000')).toBeInTheDocument();
    });

    it('maintains state correctly during navigation', async () => {
      const user = userEvent.setup();
      render(<CashPayment {...defaultProps} />);
      
      // Enter amount
      const amountInput = screen.getByPlaceholderText('0.00');
      await user.type(amountInput, '2000');
      
      // Go to confirmation
      const continueButton = screen.getByText('Continue');
      await user.click(continueButton);
      
      // Go back to amount entry
      const backButton = screen.getByText('Back');
      await user.click(backButton);
      
      // State should be preserved
      expect(screen.getByDisplayValue('2000')).toBeInTheDocument();
      expect(screen.getByText('K 500.00')).toBeInTheDocument(); // Change
    });
  });

  describe('Accessibility Tests', () => {
    it('has proper ARIA labels and roles', () => {
      render(<CashPayment {...defaultProps} />);
      
      // Check quick add buttons have proper labels
      expect(screen.getByLabelText('Add K100')).toBeInTheDocument();
      expect(screen.getByLabelText('Add K50')).toBeInTheDocument();
      
      // Check cancel button has proper label
      expect(screen.getByLabelText('Cancel cash payment')).toBeInTheDocument();
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<CashPayment {...defaultProps} />);
      
      // Tab through interactive elements
      await user.tab();
      expect(screen.getByPlaceholderText('0.00')).toHaveFocus();
      
      await user.tab();
      expect(screen.getByText('+K100')).toHaveFocus();
    });

    it('provides proper error messages for screen readers', async () => {
      const user = userEvent.setup();
      render(<CashPayment {...defaultProps} />);
      
      // Enter insufficient amount
      const amountInput = screen.getByPlaceholderText('0.00');
      await user.type(amountInput, '1000');
      
      // Continue button should be disabled
      const continueButton = screen.getByText('Continue');
      expect(continueButton).toBeDisabled();
      
      // Enter sufficient amount to proceed
      await user.clear(amountInput);
      await user.type(amountInput, '2000');
      await user.click(continueButton);
      
      // Should show confirmation screen
      await waitFor(() => {
        expect(screen.getByText('Confirm Cash Payment')).toBeInTheDocument();
      });
    });

    it('has proper color contrast for text elements', () => {
      render(<CashPayment {...defaultProps} />);
      
      const title = screen.getByText('Cash Payment');
      expect(title).toHaveClass('text-gray-900'); // High contrast for headings
      
      const description = screen.getByText(/Amount due:/);
      expect(description).toHaveClass('text-gray-600'); // Medium contrast for secondary text
    });

    it('provides alternative text for icons', () => {
      render(<CashPayment {...defaultProps} />);
      
      // Check that SVG icons are present with proper attributes
      const svgIcons = document.querySelectorAll('svg[aria-hidden="true"]');
      expect(svgIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Change Calculation', () => {
    it('calculates change correctly for exact amount', async () => {
      const user = userEvent.setup();
      render(<CashPayment {...defaultProps} />);
      
      const amountInput = screen.getByPlaceholderText('0.00');
      await user.type(amountInput, '1500');
      
      expect(screen.getByText('K 0.00')).toBeInTheDocument(); // No change
    });

    it('calculates change correctly for overpayment', async () => {
      const user = userEvent.setup();
      render(<CashPayment {...defaultProps} />);
      
      const amountInput = screen.getByPlaceholderText('0.00');
      await user.type(amountInput, '2000');
      
      expect(screen.getByText('K 500.00')).toBeInTheDocument(); // Change
    });

    it('shows change breakdown with denominations', async () => {
      const user = userEvent.setup();
      render(<CashPayment {...defaultProps} />);
      
      const amountInput = screen.getByPlaceholderText('0.00');
      await user.type(amountInput, '2000');
      
      const continueButton = screen.getByText('Continue');
      await user.click(continueButton);
      
      await waitFor(() => {
        expect(screen.getByText('Change Breakdown:')).toBeInTheDocument();
        expect(screen.getByText('Please provide change of K 500.00 to the customer.')).toBeInTheDocument();
        expect(screen.getByText('Recommended denominations:')).toBeInTheDocument();
      });
    });
  });

  describe('Receipt Generation', () => {
    it('generates receipt with proper format', async () => {
      const user = userEvent.setup();
      render(<CashPayment {...defaultProps} />);
      
      const amountInput = screen.getByPlaceholderText('0.00');
      await user.type(amountInput, '2000');
      
      const continueButton = screen.getByText('Continue');
      await user.click(continueButton);
      
      const confirmButton = screen.getByText('Confirm Payment');
      await user.click(confirmButton);
      
      await waitFor(() => {
        expect(screen.getByText('Payment Successful!')).toBeInTheDocument();
      }, { timeout: 3000 });
      
      // Check receipt details
      expect(screen.getByText(/Receipt #:/)).toBeInTheDocument();
      expect(screen.getByText(/Reference:/)).toBeInTheDocument();
      expect(screen.getByText(/Amount Paid:/)).toBeInTheDocument();
      expect(screen.getByText(/Amount Received:/)).toBeInTheDocument();
      expect(screen.getByText(/Change Given:/)).toBeInTheDocument();
      expect(screen.getByText(/Date:/)).toBeInTheDocument();
      expect(screen.getByText(/Time:/)).toBeInTheDocument();
    });

    it('provides print receipt functionality', async () => {
      const user = userEvent.setup();
      render(<CashPayment {...defaultProps} />);
      
      // Mock window.print
      const mockPrint = jest.fn();
      Object.defineProperty(window, 'print', {
        value: mockPrint,
        writable: true
      });
      
      const amountInput = screen.getByPlaceholderText('0.00');
      await user.type(amountInput, '2000');
      
      const continueButton = screen.getByText('Continue');
      await user.click(continueButton);
      
      const confirmButton = screen.getByText('Confirm Payment');
      await user.click(confirmButton);
      
      await waitFor(() => {
        expect(screen.getByText('Payment Successful!')).toBeInTheDocument();
      }, { timeout: 3000 });
      
      const printButton = screen.getByText('Print Receipt');
      await user.click(printButton);
      
      expect(mockPrint).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('shows error for insufficient amount', async () => {
      const user = userEvent.setup();
      render(<CashPayment {...defaultProps} />);
      
      const amountInput = screen.getByPlaceholderText('0.00');
      await user.type(amountInput, '1000');
      
      // Continue button should be disabled for insufficient amount
      const continueButton = screen.getByText('Continue');
      expect(continueButton).toBeDisabled();
      
      // Enter sufficient amount to proceed to confirmation
      await user.clear(amountInput);
      await user.type(amountInput, '2000');
      await user.click(continueButton);
      
      await waitFor(() => {
        expect(screen.getByText('Confirm Cash Payment')).toBeInTheDocument();
      });
      
      // Go back and enter insufficient amount
      const backButton = screen.getByText('Back');
      await user.click(backButton);
      
      await user.clear(amountInput);
      await user.type(amountInput, '1000');
      await user.click(continueButton);
      
      await waitFor(() => {
        expect(screen.getByText('Confirm Cash Payment')).toBeInTheDocument();
      });
      
      const confirmButton = screen.getByText('Confirm Payment');
      await user.click(confirmButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Amount received.*is less than required amount/)).toBeInTheDocument();
      });
    });

    it('clears error when valid amount is provided', async () => {
      const user = userEvent.setup();
      render(<CashPayment {...defaultProps} />);
      
      const amountInput = screen.getByPlaceholderText('0.00');
      await user.type(amountInput, '1000');
      
      // Continue button should be disabled for insufficient amount
      const continueButton = screen.getByText('Continue');
      expect(continueButton).toBeDisabled();
      
      // Enter sufficient amount to proceed to confirmation
      await user.clear(amountInput);
      await user.type(amountInput, '2000');
      await user.click(continueButton);
      
      await waitFor(() => {
        expect(screen.getByText('Confirm Cash Payment')).toBeInTheDocument();
      });
      
      // Go back and enter insufficient amount
      const backButton = screen.getByText('Back');
      await user.click(backButton);
      
      await user.clear(amountInput);
      await user.type(amountInput, '1000');
      await user.click(continueButton);
      
      await waitFor(() => {
        expect(screen.getByText('Confirm Cash Payment')).toBeInTheDocument();
      });
      
      const confirmButton = screen.getByText('Confirm Payment');
      await user.click(confirmButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Amount received.*is less than required amount/)).toBeInTheDocument();
      });
      
      // Go back and enter sufficient amount
      const backButton2 = screen.getByText('Back');
      await user.click(backButton2);
      
      await user.clear(amountInput);
      await user.type(amountInput, '2000');
      await user.click(continueButton);
      
      await waitFor(() => {
        expect(screen.queryByText(/Amount received.*is less than required amount/)).not.toBeInTheDocument();
        expect(screen.getByText('Confirm Cash Payment')).toBeInTheDocument();
      });
    });
  });
});

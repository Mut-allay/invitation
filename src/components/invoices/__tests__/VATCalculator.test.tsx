import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VATCalculator from '../VATCalculator';

// Mock the calculation change callback
const mockOnCalculationChange = jest.fn();

const defaultProps = {
  onCalculationChange: mockOnCalculationChange
};

describe('VATCalculator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Tests', () => {
    it('renders VAT calculator interface', () => {
      render(<VATCalculator {...defaultProps} />);
      
      expect(screen.getByText('ZRA VAT Calculator')).toBeInTheDocument();
      expect(screen.getByLabelText(/Amount \(ZMW\)/)).toBeInTheDocument();
      expect(screen.getByText('Amount Type')).toBeInTheDocument();
      expect(screen.getByLabelText(/VAT Rate/)).toBeInTheDocument();
      expect(screen.getByText('VAT Calculation Results')).toBeInTheDocument();
    });

    it('displays initial values correctly', () => {
      render(
        <VATCalculator 
          {...defaultProps}
          initialAmount={1000}
          initialVATRate={16}
        />
      );
      
      const amountInput = screen.getByLabelText(/Amount \(ZMW\)/);
      const vatRateSelect = screen.getByLabelText(/VAT Rate/);
      
      expect(amountInput).toHaveValue(1000);
      expect(vatRateSelect).toHaveValue('16');
    });

    it('shows VAT rate options', () => {
      render(<VATCalculator {...defaultProps} />);
      
      const vatRateSelect = screen.getByLabelText(/VAT Rate/);
      expect(screen.getByText('0% - VAT Exempt')).toBeInTheDocument();
      expect(screen.getByText('16% - Standard Rate')).toBeInTheDocument();
    });

    it('displays amount type radio buttons', () => {
      render(<VATCalculator {...defaultProps} />);
      
      expect(screen.getByLabelText('Exclusive of VAT')).toBeInTheDocument();
      expect(screen.getByLabelText('Inclusive of VAT')).toBeInTheDocument();
      
      // Exclusive should be selected by default
      expect(screen.getByLabelText('Exclusive of VAT')).toBeChecked();
      expect(screen.getByLabelText('Inclusive of VAT')).not.toBeChecked();
    });

    it('calculates VAT correctly for exclusive amounts', async () => {
      const user = userEvent.setup();
      render(<VATCalculator {...defaultProps} />);
      
      const amountInput = screen.getByLabelText(/Amount \(ZMW\)/);
      await user.clear(amountInput);
      await user.type(amountInput, '1000');
      
      // Check calculations: 1000 + (1000 * 0.16) = 1000 + 160 = 1160
      await waitFor(() => {
        expect(screen.getByText('K 1,000.00')).toBeInTheDocument(); // Amount excl VAT
        expect(screen.getByText('K 160.00')).toBeInTheDocument(); // VAT amount
        expect(screen.getByText('K 1,160.00')).toBeInTheDocument(); // Total incl VAT
      });
    });

    it('calculates VAT correctly for inclusive amounts', async () => {
      const user = userEvent.setup();
      render(<VATCalculator {...defaultProps} />);
      
      const amountInput = screen.getByLabelText(/Amount \(ZMW\)/);
      const inclusiveRadio = screen.getByLabelText('Inclusive of VAT');
      
      await user.click(inclusiveRadio);
      await user.clear(amountInput);
      await user.type(amountInput, '1160');
      
      // Check calculations: 1160 / 1.16 = 1000, VAT = 1160 - 1000 = 160
      await waitFor(() => {
        expect(screen.getByText('K 1,000.00')).toBeInTheDocument(); // Amount excl VAT
        expect(screen.getByText('K 160.00')).toBeInTheDocument(); // VAT amount
        expect(screen.getByText('K 1,160.00')).toBeInTheDocument(); // Total incl VAT
      });
    });

    it('handles VAT-exempt items correctly', async () => {
      const user = userEvent.setup();
      render(<VATCalculator {...defaultProps} />);
      
      const amountInput = screen.getByLabelText(/Amount \(ZMW\)/);
      const vatRateSelect = screen.getByLabelText(/VAT Rate/);
      
      await user.clear(amountInput);
      await user.type(amountInput, '1000');
      await user.selectOptions(vatRateSelect, '0');
      
      await waitFor(() => {
        expect(screen.getAllByText('K 1,000.00')).toHaveLength(2); // Amount appears twice
        expect(screen.getByText('K 0.00')).toBeInTheDocument(); // VAT amount (0)
        expect(screen.getByText('VAT Exempt')).toBeInTheDocument(); // Exempt indicator appears
      });
    });

    it('shows VAT exempt indicator', async () => {
      const user = userEvent.setup();
      render(<VATCalculator {...defaultProps} />);
      
      const vatRateSelect = screen.getByLabelText(/VAT Rate/);
      await user.selectOptions(vatRateSelect, '0');
      
      await waitFor(() => {
        expect(screen.getByText('VAT Exempt')).toBeInTheDocument();
      });
    });

    it('toggles calculation details', async () => {
      const user = userEvent.setup();
      render(<VATCalculator {...defaultProps} />);
      
      const toggleButton = screen.getByText('Show Calculation Details');
      expect(screen.queryByText('Calculation Breakdown')).not.toBeInTheDocument();
      
      await user.click(toggleButton);
      
      await waitFor(() => {
        expect(screen.getByText('Calculation Breakdown')).toBeInTheDocument();
        expect(screen.getByText('Hide Calculation Details')).toBeInTheDocument();
      });
    });

    it('shows detailed breakdown for exclusive calculations', async () => {
      const user = userEvent.setup();
      render(<VATCalculator {...defaultProps} />);
      
      const amountInput = screen.getByLabelText(/Amount \(ZMW\)/);
      await user.clear(amountInput);
      await user.type(amountInput, '1000');
      
      const toggleButton = screen.getByText('Show Calculation Details');
      await user.click(toggleButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Base Amount: K 1,000.00/)).toBeInTheDocument();
        expect(screen.getByText(/VAT Calculation: K 1,000.00 × 16%/)).toBeInTheDocument();
        expect(screen.getByText(/Total: K 1,000.00 \+ K 160.00 = K 1,160.00/)).toBeInTheDocument();
      });
    });

    it('shows detailed breakdown for inclusive calculations', async () => {
      const user = userEvent.setup();
      render(<VATCalculator {...defaultProps} />);
      
      const amountInput = screen.getByLabelText(/Amount \(ZMW\)/);
      const inclusiveRadio = screen.getByLabelText('Inclusive of VAT');
      
      await user.click(inclusiveRadio);
      await user.clear(amountInput);
      await user.type(amountInput, '1160');
      
      const toggleButton = screen.getByText('Show Calculation Details');
      await user.click(toggleButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Total Amount \(incl\. VAT\): K 1,160.00/)).toBeInTheDocument();
        expect(screen.getByText(/VAT Factor: 1 \+ \(16% ÷ 100\) = 1.1600/)).toBeInTheDocument();
        expect(screen.getByText(/Base Amount: K 1,160.00 ÷ 1.1600/)).toBeInTheDocument();
      });
    });

    it('shows VAT percentage of total', async () => {
      const user = userEvent.setup();
      render(<VATCalculator {...defaultProps} />);
      
      const amountInput = screen.getByLabelText(/Amount \(ZMW\)/);
      await user.clear(amountInput);
      await user.type(amountInput, '1000');
      
      await waitFor(() => {
        // VAT (160) / Total (1160) * 100 = 13.8%
        expect(screen.getByText(/VAT represents 13.8% of the total amount/)).toBeInTheDocument();
      });
    });

    it('calls onCalculationChange when values change', async () => {
      const user = userEvent.setup();
      render(<VATCalculator {...defaultProps} />);
      
      const amountInput = screen.getByLabelText(/Amount \(ZMW\)/);
      await user.clear(amountInput);
      await user.type(amountInput, '1000');
      
      await waitFor(() => {
        expect(mockOnCalculationChange).toHaveBeenCalledWith(
          expect.objectContaining({
            amount: 1000,
            vatRate: 16,
            isExempt: false,
            vatAmount: 160,
            totalWithVAT: 1160,
            totalWithoutVAT: 1000
          })
        );
      });
    });
  });

  describe('VAT Exemption Information', () => {
    it('shows exemption information when enabled', () => {
      render(<VATCalculator {...defaultProps} showExemptionInfo={true} />);
      
      expect(screen.getByText('ZRA VAT Exemption Categories')).toBeInTheDocument();
      expect(screen.getByText(/Basic food items \(maize meal, rice, sugar, etc\.\)/)).toBeInTheDocument();
      expect(screen.getByText(/Medical and pharmaceutical supplies/)).toBeInTheDocument();
      expect(screen.getByText(/Educational materials and books/)).toBeInTheDocument();
    });

    it('hides exemption information by default', () => {
      render(<VATCalculator {...defaultProps} />);
      
      expect(screen.queryByText('ZRA VAT Exemption Categories')).not.toBeInTheDocument();
    });

    it('shows all exemption categories', () => {
      render(<VATCalculator {...defaultProps} showExemptionInfo={true} />);
      
      // Check for key exemption categories
      expect(screen.getByText(/Basic food items/)).toBeInTheDocument();
      expect(screen.getByText(/Medical and pharmaceutical supplies/)).toBeInTheDocument();
      expect(screen.getByText(/Educational materials and books/)).toBeInTheDocument();
      expect(screen.getByText(/Agricultural inputs and equipment/)).toBeInTheDocument();
      expect(screen.getByText(/Export services/)).toBeInTheDocument();
      expect(screen.getByText(/Financial services/)).toBeInTheDocument();
      expect(screen.getByText(/Insurance services/)).toBeInTheDocument();
      expect(screen.getByText(/Public transport services/)).toBeInTheDocument();
      expect(screen.getByText(/Residential rental services/)).toBeInTheDocument();
    });
  });

  describe('Accessibility Tests', () => {
    it('has proper ARIA labels and roles', () => {
      render(<VATCalculator {...defaultProps} />);
      
      // Check form labels are properly associated
      expect(screen.getByLabelText(/Amount \(ZMW\)/)).toBeInTheDocument();
      expect(screen.getByLabelText(/VAT Rate/)).toBeInTheDocument();
      expect(screen.getByLabelText('Exclusive of VAT')).toBeInTheDocument();
      expect(screen.getByLabelText('Inclusive of VAT')).toBeInTheDocument();
    });

    it('provides proper help text', () => {
      render(<VATCalculator {...defaultProps} />);
      
      expect(screen.getByText('Enter the amount in Zambian Kwacha')).toBeInTheDocument();
      expect(screen.getByText('Most goods and services in Zambia')).toBeInTheDocument();
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<VATCalculator {...defaultProps} />);
      
      // Tab through form elements
      await user.tab();
      expect(screen.getByLabelText(/Amount \(ZMW\)/)).toHaveFocus();
      
      await user.tab();
      expect(screen.getByLabelText('Exclusive of VAT')).toHaveFocus();
    });

    it('has proper ARIA attributes for expandable content', async () => {
      const user = userEvent.setup();
      render(<VATCalculator {...defaultProps} />);
      
      const toggleButton = screen.getByText('Show Calculation Details');
      expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
      expect(toggleButton).toHaveAttribute('aria-controls', 'breakdown-details');
      
      await user.click(toggleButton);
      
      await waitFor(() => {
        expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
      });
    });
  });

  describe('Currency Formatting', () => {
    it('displays amounts in Zambian Kwacha format', async () => {
      const user = userEvent.setup();
      render(<VATCalculator {...defaultProps} />);
      
      const amountInput = screen.getByLabelText(/Amount \(ZMW\)/);
      await user.clear(amountInput);
      await user.type(amountInput, '1234.56');
      
      await waitFor(() => {
        expect(screen.getByText('K 1,234.56')).toBeInTheDocument();
      });
    });

    it('handles decimal calculations correctly', async () => {
      const user = userEvent.setup();
      render(<VATCalculator {...defaultProps} />);
      
      const amountInput = screen.getByLabelText(/Amount \(ZMW\)/);
      await user.clear(amountInput);
      await user.type(amountInput, '100.50');
      
      // 100.50 * 0.16 = 16.08, Total = 116.58
      await waitFor(() => {
        expect(screen.getByText('K 100.50')).toBeInTheDocument(); // Base amount
        expect(screen.getByText('K 16.08')).toBeInTheDocument(); // VAT amount
        expect(screen.getByText('K 116.58')).toBeInTheDocument(); // Total
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles zero amount', async () => {
      const user = userEvent.setup();
      render(<VATCalculator {...defaultProps} />);
      
      const amountInput = screen.getByLabelText(/Amount \(ZMW\)/);
      await user.clear(amountInput);
      await user.type(amountInput, '0');
      
      await waitFor(() => {
        expect(screen.getAllByText('K 0.00')).toHaveLength(3); // Amount appears 3 times (excl VAT, VAT amount, total)
      });
    });

    it('handles empty input gracefully', async () => {
      const user = userEvent.setup();
      render(<VATCalculator {...defaultProps} />);
      
      const amountInput = screen.getByLabelText(/Amount \(ZMW\)/);
      await user.clear(amountInput);
      
      // Should default to 0
      await waitFor(() => {
        expect(screen.getAllByText('K 0.00')).toHaveLength(3); // Amount appears 3 times (excl VAT, VAT amount, total)
      });
    });

    it('handles very large numbers', async () => {
      const user = userEvent.setup();
      render(<VATCalculator {...defaultProps} />);
      
      const amountInput = screen.getByLabelText(/Amount \(ZMW\)/);
      await user.clear(amountInput);
      await user.type(amountInput, '1000000');
      
      await waitFor(() => {
        expect(screen.getByText('K 1,000,000.00')).toBeInTheDocument(); // Base amount
        expect(screen.getByText('K 160,000.00')).toBeInTheDocument(); // VAT amount
        expect(screen.getByText('K 1,160,000.00')).toBeInTheDocument(); // Total
      });
    });
  });

  describe('ZRA Compliance', () => {
    it('displays ZRA compliance note', () => {
      render(<VATCalculator {...defaultProps} />);
      
      expect(screen.getByText('Calculations based on ZRA VAT regulations. Standard rate: 16%')).toBeInTheDocument();
    });

    it('uses correct ZRA VAT rate of 16%', () => {
      render(<VATCalculator {...defaultProps} />);
      
      const vatRateSelect = screen.getByLabelText(/VAT Rate/);
      expect(vatRateSelect).toHaveValue('16'); // Default should be 16%
    });

    it('shows ZRA-approved exemption categories', () => {
      render(<VATCalculator {...defaultProps} showExemptionInfo={true} />);
      
      // Check that exemption note mentions ZRA
      expect(screen.getByText(/Consult ZRA guidelines for complete exemption criteria/)).toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      const { container } = render(
        <VATCalculator {...defaultProps} className="custom-class" />
      );
      
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });
});


import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SettlementForm } from '../SettlementForm';
import { useProcessSettlementMutation } from '../../../store/api/paymentEqualizationApi';
import { PartsEqualization } from '../../../types/partsEqualization';
import { firestore } from 'firebase-admin';

jest.mock('../../../store/api/paymentEqualizationApi');

describe('SettlementForm', () => {
  const mockProcessSettlement = jest.fn();
  const mockUseProcessSettlementMutation = useProcessSettlementMutation as jest.Mock;

  const mockEqualization: PartsEqualization = {
    id: '1',
    period: '2025-07',
    totalAmount: 123.45,
    status: 'calculated',
    tenantId: 'demo-tenant',
    partnerTenantId: 'demo-tenant',
    createdBy: 'system',
    createdAt: { toDate: () => new Date() } as firestore.Timestamp,
  };

  beforeEach(() => {
    mockProcessSettlement.mockReturnValue({ unwrap: () => Promise.resolve() });
    mockUseProcessSettlementMutation.mockReturnValue([mockProcessSettlement, { isLoading: false }]);
  });

  it('should render the form with equalization details', () => {
    render(<SettlementForm equalization={mockEqualization} onClose={() => {}} />);
    expect(screen.getByText('Settle Payment for 2025-07')).toBeInTheDocument();
    expect(screen.getByText('Total Amount: 123.45')).toBeInTheDocument();
  });

  it('should allow user to change settlement method and enter a reference', () => {
    render(<SettlementForm equalization={mockEqualization} onClose={() => {}} />);
    const methodSelect = screen.getByLabelText('Settlement Method');
    const referenceInput = screen.getByLabelText('Reference');

    fireEvent.change(methodSelect, { target: { value: 'mobile_money' } });
    fireEvent.change(referenceInput, { target: { value: 'MM123' } });

    expect(methodSelect).toHaveValue('mobile_money');
    expect(referenceInput).toHaveValue('MM123');
  });

  it('should call processSettlement on form submission', () => {
    const mockOnClose = jest.fn();
    render(<SettlementForm equalization={mockEqualization} onClose={mockOnClose} />);
    
    fireEvent.click(screen.getByText('Settle Payment'));

    expect(mockProcessSettlement).toHaveBeenCalledWith({
      tenantId: 'demo-tenant',
      equalizationId: '1',
      settlementDetails: {
        settlementMethod: 'bank_transfer',
        settlementReference: '',
      },
    });
  });
});

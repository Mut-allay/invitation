
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PartnerInvitation } from '../PartnerInvitation';
import { useInvitePartnerMutation } from '../../../store/api/partnerBusinessApi';

jest.mock('../../../store/api/partnerBusinessApi');

describe('PartnerInvitation', () => {
  const mockInvitePartner = jest.fn();
  const mockUseInvitePartnerMutation = useInvitePartnerMutation as jest.Mock;

  beforeEach(() => {
    mockInvitePartner.mockReturnValue({ unwrap: () => Promise.resolve() });
    mockUseInvitePartnerMutation.mockReturnValue([mockInvitePartner, { isLoading: false }]);
  });

  it('should render the invitation form', () => {
    render(<PartnerInvitation />);
    expect(screen.getByText('Invite Partner')).toBeInTheDocument();
  });

  it('should allow user to enter a partner tenant ID and change permissions', () => {
    render(<PartnerInvitation />);
    const tenantIdInput = screen.getByLabelText('Partner Tenant ID');
    const viewInventoryCheckbox = screen.getByLabelText('Can View Inventory');
    const placeOrdersCheckbox = screen.getByLabelText('Can Place Orders');

    fireEvent.change(tenantIdInput, { target: { value: 'partner-tenant' } });
    fireEvent.click(viewInventoryCheckbox);
    fireEvent.click(placeOrdersCheckbox);

    expect(tenantIdInput).toHaveValue('partner-tenant');
    expect(viewInventoryCheckbox).not.toBeChecked();
    expect(placeOrdersCheckbox).not.toBeChecked();
  });

  it('should call invitePartner on form submission', () => {
    render(<PartnerInvitation />);
    const tenantIdInput = screen.getByLabelText('Partner Tenant ID');
    const submitButton = screen.getByText('Send Invitation');

    fireEvent.change(tenantIdInput, { target: { value: 'partner-tenant' } });
    fireEvent.click(submitButton);

    expect(mockInvitePartner).toHaveBeenCalledWith({
      tenantId: 'demo-tenant',
      partnerTenantId: 'partner-tenant',
      permissions: {
        canViewInventory: true,
        canPlaceOrders: true,
      },
    });
  });
});

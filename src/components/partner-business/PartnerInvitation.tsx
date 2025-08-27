
import React, { useState } from 'react';
import { useInvitePartnerMutation } from '../../store/api/partnerBusinessApi';

export const PartnerInvitation: React.FC = () => {
  const [partnerTenantId, setPartnerTenantId] = useState('');
  const [canViewInventory, setCanViewInventory] = useState(true);
  const [canPlaceOrders, setCanPlaceOrders] = useState(true);
  const [invitePartner, { isLoading }] = useInvitePartnerMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await invitePartner({
        tenantId: 'demo-tenant', // This will be replaced with the actual tenantId from context
        partnerTenantId,
        permissions: {
          canViewInventory,
          canPlaceOrders,
        },
      }).unwrap();
      setPartnerTenantId('');
    } catch (error) {
      console.error('Failed to send invitation:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Invite Partner</h2>
      <div>
        <label htmlFor="partnerTenantId">Partner Tenant ID</label>
        <input
          id="partnerTenantId"
          type="text"
          value={partnerTenantId}
          onChange={(e) => setPartnerTenantId(e.target.value)}
        />
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            checked={canViewInventory}
            onChange={(e) => setCanViewInventory(e.target.checked)}
          />
          Can View Inventory
        </label>
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            checked={canPlaceOrders}
            onChange={(e) => setCanPlaceOrders(e.target.checked)}
          />
          Can Place Orders
        </label>
      </div>
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Sending...' : 'Send Invitation'}
      </button>
    </form>
  );
};

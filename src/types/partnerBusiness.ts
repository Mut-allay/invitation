
import { firestore } from 'firebase-admin';

export interface PartnerBusiness {
  id: string;
  tenantId: string; // The tenant initiating the partnership
  partnerTenantId: string; // The tenant being invited
  status: 'pending' | 'active' | 'suspended';
  permissions: {
    canViewInventory: boolean;
    canPlaceOrders: boolean;
  };
  invitationDate: firestore.Timestamp;
  acceptedDate?: firestore.Timestamp;
}

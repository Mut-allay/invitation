
import * as admin from 'firebase-admin';
import { PartnerBusiness } from '../../../src/types/partnerBusiness';

if (admin.apps.length === 0) {
  admin.initializeApp();
}

interface Permissions {
  canViewInventory: boolean;
  canPlaceOrders: boolean;
}

export const invitePartner = async (
  db: admin.firestore.Firestore,
  tenantId: string,
  partnerTenantId: string,
  permissions: Permissions
): Promise<void> => {
  const invitationData: Omit<PartnerBusiness, 'id'> = {
    tenantId,
    partnerTenantId,
    status: 'pending',
    permissions,
    invitationDate: admin.firestore.Timestamp.now(),
  };

  await db.collection('partnerBusinesses').add(invitationData);
};

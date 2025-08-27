
import * as admin from 'firebase-admin';

if (admin.apps.length === 0) {
  admin.initializeApp();
}

export const getPartnerCatalog = async (
  db: admin.firestore.Firestore,
  requestingTenantId: string,
  partnerTenantId: string
): Promise<any[]> => {
  const partnershipSnapshot = await db.collection('partnerBusinesses')
    .where('tenantId', '==', requestingTenantId)
    .where('partnerTenantId', '==', partnerTenantId)
    .where('status', '==', 'active')
    .get();

  if (partnershipSnapshot.empty) {
    throw new Error('No active partnership found or insufficient permissions.');
  }

  const partnership = partnershipSnapshot.docs[0].data();
  if (!partnership.permissions.canViewInventory) {
    throw new Error('No active partnership found or insufficient permissions.');
  }

  const inventorySnapshot = await db.collection('inventories')
    .where('tenantId', '==', partnerTenantId)
    .get();

  return inventorySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

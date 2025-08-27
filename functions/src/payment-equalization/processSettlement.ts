
import * as admin from 'firebase-admin';

if (admin.apps.length === 0) {
  admin.initializeApp();
}

interface SettlementDetails {
  settlementMethod: 'mobile_money' | 'bank_transfer' | 'cash';
  settlementReference?: string;
}

export const processSettlement = async (
  db: admin.firestore.Firestore,
  tenantId: string,
  equalizationId: string,
  settlementDetails: SettlementDetails
): Promise<void> => {
  const equalizationRef = db.collection('partsEqualizations').doc(equalizationId);

  await equalizationRef.update({
    status: 'settled',
    settlementDate: admin.firestore.Timestamp.now(),
    ...settlementDetails,
  });
};

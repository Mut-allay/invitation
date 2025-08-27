
import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as admin from 'firebase-admin';
import { calculateEqualization } from './calculateEqualization';
import { PartsOrderWithItems } from '../../../src/types/partsOrder';
import { PartsEqualization } from '../../../src/types/partsEqualization';

if (admin.apps.length === 0) {
  admin.initializeApp();
}

export const createEqualizationLogic = async (db: admin.firestore.Firestore, timestamp: string): Promise<void> => {
  const now = new Date(timestamp);
  const year = now.getFullYear();
  const month = now.getMonth();

  // Calculate the period for the previous month
  const lastMonth = new Date(year, month - 1, 1);
  const lastMonthYear = lastMonth.getFullYear();
  const lastMonthMonth = lastMonth.getMonth() + 1;
  const period = `${lastMonthYear}-${lastMonthMonth.toString().padStart(2, '0')}`;

  // For now, we'll assume a single tenant. This will be expanded later.
  const tenantId = 'demo-tenant';

  const partsOrdersSnapshot = await db.collection('partsOrders')
    .where('tenantId', '==', tenantId)
    .get();

  const partsOrders = partsOrdersSnapshot.docs.map(doc => doc.data() as PartsOrderWithItems);

  const totalAmount = calculateEqualization(partsOrders, period);

  if (totalAmount > 0) {
    const equalizationData: Omit<PartsEqualization, 'id'> = {
      tenantId,
      partnerTenantId: tenantId, // Internal equalization for now
      period,
      totalAmount,
      status: 'calculated',
      createdBy: 'system',
      createdAt: admin.firestore.Timestamp.now(),
    };

    await db.collection('partsEqualizations').add(equalizationData);
  }
};

export const createEqualization = onSchedule('0 0 1 * *', async (event) => {
  const db = admin.firestore();
  try {
    await createEqualizationLogic(db, event.scheduleTime);
    console.log('Payment equalization created successfully.');
  } catch (error) {
    console.error('Error creating payment equalization:', error);
  }
});

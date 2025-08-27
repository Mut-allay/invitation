import { getFirestore } from 'firebase-admin/firestore';
import { onCall, HttpsError, CallableRequest } from 'firebase-functions/v2/https';

const db = getFirestore();

// --- 1. Manual Validation Function ---
const validateGetOrdersData = (data: any) => {
  if (!data || typeof data.tenantId !== 'string' || data.tenantId.length === 0) {
    throw new HttpsError('invalid-argument', 'A valid tenantId is required.');
  }
  return data;
};

// --- 2. Core Business Logic ---
export async function getPartsOrdersLogic(request: CallableRequest) {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'You must be logged in to view orders.');
  }

  const { tenantId } = validateGetOrdersData(request.data);

  if (request.auth.token.tenantId !== tenantId) {
    throw new HttpsError('permission-denied', 'You are not authorized to view orders for this tenant.');
  }

  const ordersSnapshot = await db.collection('partsOrders')
    .where('tenantId', '==', tenantId)
    .orderBy('orderDate', 'desc')
    .get();

  const orders = await Promise.all(ordersSnapshot.docs.map(async (doc) => {
    const orderData = doc.data();
    const itemsSnapshot = await doc.ref.collection('orderItems').get();
    const items = itemsSnapshot.docs.map(itemDoc => ({
      id: itemDoc.id,
      ...itemDoc.data(),
    }));

    return {
      id: doc.id,
      ...orderData,
      items,
    };
  }));

  return { orders };
}

// --- 3. Thin Firebase Wrapper ---
export const getPartsOrders = onCall(getPartsOrdersLogic);

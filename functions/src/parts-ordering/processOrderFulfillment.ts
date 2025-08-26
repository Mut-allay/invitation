import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { onCall, HttpsError, CallableRequest } from 'firebase-functions/v2/https';

const db = getFirestore();

// --- 1. Manual Validation Function ---
const validateFulfillmentData = (data: any) => {
  if (!data) {
    throw new HttpsError('invalid-argument', 'Request data is missing.');
  }
  if (typeof data.tenantId !== 'string' || data.tenantId.length === 0) {
    throw new HttpsError('invalid-argument', 'A valid tenantId is required.');
  }
  if (typeof data.orderId !== 'string' || data.orderId.length === 0) {
    throw new HttpsError('invalid-argument', 'A valid orderId is required.');
  }
  return data;
};

// --- 2. Core Business Logic ---
export async function processOrderFulfillmentLogic(request: CallableRequest) {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'You must be logged in to fulfill an order.');
  }

  const { tenantId, orderId } = validateFulfillmentData(request.data);

  if (request.auth.token.tenantId !== tenantId) {
    throw new HttpsError('permission-denied', 'You are not authorized to fulfill orders for this tenant.');
  }

  const orderRef = db.collection('partsOrders').doc(orderId);

  await db.runTransaction(async (transaction) => {
    const orderDoc = await transaction.get(orderRef);

    if (!orderDoc.exists || orderDoc.data()?.tenantId !== tenantId) {
      throw new HttpsError('not-found', 'The specified order was not found.');
    }

    const orderData = orderDoc.data();
    if (orderData?.status === 'delivered') {
      throw new HttpsError('failed-precondition', 'This order has already been delivered.');
    }
    if (orderData?.status === 'cancelled') {
      throw new HttpsError('failed-precondition', 'Cannot fulfill a cancelled order.');
    }

    // For Phase 1, we just update the status.

    transaction.update(orderRef, {
      status: 'delivered',
      updatedAt: Timestamp.now(),
    });
  });

  return { status: 'success', message: 'Order fulfilled successfully.' };
}

// --- 3. Thin Firebase Wrapper ---
export const processOrderFulfillment = onCall(processOrderFulfillmentLogic);
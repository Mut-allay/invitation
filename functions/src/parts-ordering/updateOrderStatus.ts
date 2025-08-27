import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { onCall, HttpsError, CallableRequest } from 'firebase-functions/v2/https';

const db = getFirestore();

// --- 1. Manual Validation Function ---
const validateUpdateStatusData = (data: any) => {
  if (!data) {
    throw new HttpsError('invalid-argument', 'Request data is missing.');
  }
  if (typeof data.tenantId !== 'string' || data.tenantId.length === 0) {
    throw new HttpsError('invalid-argument', 'A valid tenantId is required.');
  }
  if (typeof data.orderId !== 'string' || data.orderId.length === 0) {
    throw new HttpsError('invalid-argument', 'A valid orderId is required.');
  }
  const validStatuses = ['pending', 'confirmed', 'delivered', 'cancelled'];
  if (typeof data.status !== 'string' || !validStatuses.includes(data.status)) {
    throw new HttpsError('invalid-argument', 'A valid status is required.');
  }
  return data;
};

// --- 2. Core Business Logic ---
export async function updateOrderStatusLogic(request: CallableRequest) {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'You must be logged in to update an order.');
  }

  const { tenantId, orderId, status, notes } = validateUpdateStatusData(request.data);

  if (request.auth.token.tenantId !== tenantId) {
    throw new HttpsError('permission-denied', 'You are not authorized to update orders for this tenant.');
  }

  const orderRef = db.collection('partsOrders').doc(orderId);
  const orderDoc = await orderRef.get();

  if (!orderDoc.exists || orderDoc.data()?.tenantId !== tenantId) {
    throw new HttpsError('not-found', 'The specified order was not found.');
  }

  const updateData: { status: string, updatedAt: Timestamp, notes?: string } = {
    status,
    updatedAt: Timestamp.now(),
  };

  if (notes) {
    updateData.notes = notes;
  }

  await orderRef.update(updateData);

  return { status: 'success', message: 'Order status updated successfully.' };
}

// --- 3. Thin Firebase Wrapper ---
export const updateOrderStatus = onCall(updateOrderStatusLogic);
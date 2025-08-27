import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const db = getFirestore();

/**
 * Processes a parts order fulfillment.
 * This updates the order status to 'delivered' and increments the stock for each item in the order.
 */
export const processOrderFulfillment = onCall<{ tenantId: string; orderId: string }>(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { tenantId, orderId } = request.data;
  const userClaims = request.auth.token;

  if (userClaims.tenantId !== tenantId) {
    throw new HttpsError('permission-denied', 'Access denied to this tenant');
  }

  const orderRef = db.collection('tenants').doc(tenantId).collection('partsOrders').doc(orderId);

  try {
    await db.runTransaction(async (transaction) => {
      const orderDoc = await transaction.get(orderRef);

      if (!orderDoc.exists) {
        throw new HttpsError('not-found', 'Parts order not found');
      }

      const orderData = orderDoc.data();
      if (!orderData) {
        throw new HttpsError('internal', 'Order data is missing.');
      }

      if (orderData.status === 'delivered') {
        throw new HttpsError('failed-precondition', 'Order has already been delivered.');
      }

      if (orderData.status === 'cancelled') {
        throw new HttpsError('failed-precondition', 'Cannot fulfill a cancelled order.');
      }

      const items = orderData.items;
      if (!items || !Array.isArray(items)) {
        throw new HttpsError('internal', 'Order items are missing or invalid.');
      }

      // Update inventory for each item in the order
      for (const item of items) {
        if (!item.inventoryId || !item.qty) {
          console.warn(`Skipping item with missing inventoryId or qty: ${item.partName}`);
          continue;
        }
        const inventoryRef = db.collection('tenants').doc(tenantId).collection('inventories').doc(item.inventoryId);
        transaction.update(inventoryRef, { 
          currentStock: FieldValue.increment(item.qty)
        });
      }

      // Update the order status to 'delivered'
      transaction.update(orderRef, { 
        status: 'delivered', 
        updatedAt: FieldValue.serverTimestamp() 
      });
    });

    return { success: true, message: 'Order fulfilled successfully.' };
  } catch (error) {
    if (error instanceof HttpsError) {
      throw error;
    }
    console.error('Error processing order fulfillment:', error);
    throw new HttpsError('internal', 'Failed to process order fulfillment.');
  }
});
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';

const db = getFirestore();

/**
 * Delete a parts order
 * Phase 1: Basic delete functionality
 */
export const deletePartsOrder = onCall<{ tenantId: string; orderId: string }>(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { tenantId, orderId } = request.data;
  const userClaims = request.auth.token;

  // Verify user belongs to the tenant
  if (userClaims.tenantId !== tenantId) {
    throw new HttpsError('permission-denied', 'Access denied to this tenant');
  }

  try {
    const orderRef = db.collection('partsOrders').doc(orderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      throw new HttpsError('not-found', 'Parts order not found');
    }

    const orderData = orderDoc.data();
    
    // Verify the order belongs to the tenant
    if (orderData?.tenantId !== tenantId) {
      throw new HttpsError('permission-denied', 'Access denied to this order');
    }

    // Use a batch to delete order and all its items
    const batch = db.batch();
    
    // Delete all items first
    const itemsSnapshot = await orderRef.collection('items').get();
    itemsSnapshot.docs.forEach(itemDoc => {
      batch.delete(itemDoc.ref);
    });

    // Delete the order
    batch.delete(orderRef);

    await batch.commit();

    return { success: true };
  } catch (error) {
    if (error instanceof HttpsError) {
      throw error;
    }
    console.error('Error deleting parts order:', error);
    throw new HttpsError('internal', 'Failed to delete parts order');
  }
});

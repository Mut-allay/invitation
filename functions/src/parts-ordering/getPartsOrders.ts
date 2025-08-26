import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';

const db = getFirestore();

/**
 * Get all parts orders for a tenant
 * Phase 1: Basic parts ordering functionality
 */
export const getPartsOrders = onCall<{ tenantId: string }>(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { tenantId } = request.data;
  const userClaims = request.auth.token;

  // Verify user belongs to the tenant
  if (userClaims.tenantId !== tenantId) {
    throw new HttpsError('permission-denied', 'Access denied to this tenant');
  }

  try {
    const ordersRef = db.collection('partsOrders');
    const snapshot = await ordersRef
      .where('tenantId', '==', tenantId)
      .orderBy('orderDate', 'desc')
      .get();
    
    const orders = [];
    
    // Get each order with its items
    for (const doc of snapshot.docs) {
      const orderData = doc.data();
      
      // Get items for this order
      const itemsSnapshot = await doc.ref.collection('items').get();
      const items = itemsSnapshot.docs.map(itemDoc => ({
        id: itemDoc.id,
        ...itemDoc.data(),
      }));

      orders.push({
        id: doc.id,
        ...orderData,
        orderDate: orderData.orderDate?.toDate(),
        expectedDelivery: orderData.expectedDelivery?.toDate(),
        updatedAt: orderData.updatedAt?.toDate(),
        items,
      });
    }

    return { orders };
  } catch (error) {
    console.error('Error fetching parts orders:', error);
    throw new HttpsError('internal', 'Failed to fetch parts orders');
  }
});

/**
 * Get a single parts order by ID
 * Phase 1: Basic parts ordering functionality
 */
export const getPartsOrder = onCall<{ tenantId: string; orderId: string }>(async (request) => {
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

    // Get items for this order
    const itemsSnapshot = await orderRef.collection('items').get();
    const items = itemsSnapshot.docs.map(itemDoc => ({
      id: itemDoc.id,
      ...itemDoc.data(),
    }));

    const order = {
      id: orderDoc.id,
      ...orderData,
      orderDate: orderData.orderDate?.toDate(),
      expectedDelivery: orderData.expectedDelivery?.toDate(),
      updatedAt: orderData.updatedAt?.toDate(),
      items,
    };

    return { order };
  } catch (error) {
    if (error instanceof HttpsError) {
      throw error;
    }
    console.error('Error fetching parts order:', error);
    throw new HttpsError('internal', 'Failed to fetch parts order');
  }
});

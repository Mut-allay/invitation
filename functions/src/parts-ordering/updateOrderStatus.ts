import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const db = getFirestore();

interface OrderStatusUpdateData {
  orderId: string;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  notes?: string;
}

/**
 * Update parts order status
 * Phase 1: Basic status update functionality
 */
export const updateOrderStatus = onCall<{ 
  tenantId: string; 
  data: OrderStatusUpdateData
}>(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { tenantId, data } = request.data;
  const { orderId, status, notes } = data;
  const userClaims = request.auth.token;

  // Verify user belongs to the tenant
  if (userClaims.tenantId !== tenantId) {
    throw new HttpsError('permission-denied', 'Access denied to this tenant');
  }

  // Validate status
  const validStatuses = ['pending', 'confirmed', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    throw new HttpsError('invalid-argument', 'Invalid order status');
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

    // Update the order
    const updateData: any = {
      status,
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    await orderRef.update(updateData);

    // Return the updated order (without items for status updates)
    const updatedOrder = {
      id: orderId,
      ...orderData,
      ...updateData,
      updatedAt: new Date(),
    };

    return { order: updatedOrder };
  } catch (error) {
    if (error instanceof HttpsError) {
      throw error;
    }
    console.error('Error updating parts order status:', error);
    throw new HttpsError('internal', 'Failed to update parts order status');
  }
});

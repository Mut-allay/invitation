import { onCall } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions';
import { getFirestore } from 'firebase-admin/firestore';

const db = getFirestore();

export const deletePartsOrder = onCall(async (request) => {
  try {
    const { tenantId, orderId } = request.data;

    if (!tenantId || !orderId) {
      throw new Error('Missing required parameters: tenantId and orderId');
    }

    logger.info(`Deleting parts order ${orderId} for tenant ${tenantId}`);

    // Delete the order document
    const orderRef = db.collection('tenants').doc(tenantId).collection('partsOrders').doc(orderId);
    await orderRef.delete();

    // Delete all order items
    const itemsRef = db.collection('tenants').doc(tenantId).collection('partsOrders').doc(orderId).collection('items');
    const itemsSnapshot = await itemsRef.get();
    
    const deletePromises = itemsSnapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(deletePromises);

    logger.info(`Successfully deleted parts order ${orderId} and all its items`);

    return {
      success: true,
      message: 'Parts order deleted successfully'
    };

  } catch (error) {
    logger.error('Error deleting parts order:', error);
    throw new Error(`Failed to delete parts order: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}); 
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const db = getFirestore();

// Types for Parts Orders (Phase 1 - Basic Implementation)
interface PartsOrderFormData {
  supplierName: string;
  expectedDelivery?: Date;
  notes?: string;
  items: OrderItemFormData[];
}

interface OrderItemFormData {
  partName: string;
  qty: number;
  unitPrice: number;
}

interface PartsOrder {
  id: string;
  tenantId: string;
  supplierName: string;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  totalAmount: number;
  orderDate: Date;
  expectedDelivery?: Date;
  notes?: string;
  createdBy: string;
  updatedAt: Date;
}

interface OrderItem {
  id: string;
  orderId: string;
  partName: string;
  qty: number;
  unitPrice: number;
  totalPrice: number;
}

/**
 * Create a new parts order
 * Phase 1: Basic parts ordering functionality
 */
export const createPartsOrder = onCall<{ tenantId: string; order: PartsOrderFormData }>(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { tenantId, order } = request.data;
  const userClaims = request.auth.token;

  // Verify user belongs to the tenant
  if (userClaims.tenantId !== tenantId) {
    throw new HttpsError('permission-denied', 'Access denied to this tenant');
  }

  // Validate order data
  if (!order.supplierName || !order.items || order.items.length === 0) {
    throw new HttpsError('invalid-argument', 'Order must have supplier name and at least one item');
  }

  // Validate items
  for (const item of order.items) {
    if (!item.partName || item.qty <= 0 || item.unitPrice <= 0) {
      throw new HttpsError('invalid-argument', 'All items must have valid part name, quantity, and unit price');
    }
  }

  try {
    // Calculate total amount
    const totalAmount = order.items.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0);

    // Create the parts order document
    const orderData: Omit<PartsOrder, 'id'> = {
      tenantId,
      supplierName: order.supplierName,
      status: 'pending',
      totalAmount,
      orderDate: new Date(),
      expectedDelivery: order.expectedDelivery,
      notes: order.notes,
      createdBy: request.auth.uid,
      updatedAt: new Date(),
    };

    // Use a batch to create order and items atomically
    const batch = db.batch();
    
    // Create the order document
    const orderRef = db.collection('partsOrders').doc();
    batch.set(orderRef, {
      ...orderData,
      orderDate: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Create order items
    const items: OrderItem[] = [];
    order.items.forEach((item, index) => {
      const itemRef = orderRef.collection('items').doc();
      const orderItem: Omit<OrderItem, 'id'> = {
        orderId: orderRef.id,
        partName: item.partName,
        qty: item.qty,
        unitPrice: item.unitPrice,
        totalPrice: item.qty * item.unitPrice,
      };
      
      batch.set(itemRef, orderItem);
      items.push({ id: itemRef.id, ...orderItem });
    });

    // Commit the batch
    await batch.commit();

    // Return the created order with items
    const createdOrder = {
      id: orderRef.id,
      ...orderData,
      items,
    };

    return { order: createdOrder };
  } catch (error) {
    console.error('Error creating parts order:', error);
    throw new HttpsError('internal', 'Failed to create parts order');
  }
});

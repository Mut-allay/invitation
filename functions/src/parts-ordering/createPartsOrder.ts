import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { onCall, HttpsError, CallableRequest } from 'firebase-functions/v2/https';

const db = getFirestore();

// --- 1. Manual Validation Function ---
const validateCreateOrderData = (data: any) => {
  if (!data) {
    throw new HttpsError('invalid-argument', 'Request data is missing.');
  }

  // Validate top-level fields
  if (typeof data.tenantId !== 'string' || data.tenantId.length === 0) {
    throw new HttpsError('invalid-argument', 'A valid tenantId is required.');
  }
  if (typeof data.supplierName !== 'string' || data.supplierName.length < 2) {
    throw new HttpsError('invalid-argument', 'Supplier name must be at least 2 characters long.');
  }
  if (!Array.isArray(data.items) || data.items.length === 0) {
    throw new HttpsError('invalid-argument', 'An order must contain at least one item.');
  }

  // Validate each item in the array
  for (const item of data.items) {
    if (typeof item.partName !== 'string' || item.partName.length < 3) {
      throw new HttpsError('invalid-argument', 'Each part name must be at least 3 characters long.');
    }
    if (typeof item.qty !== 'number' || !Number.isInteger(item.qty) || item.qty <= 0) {
      throw new HttpsError('invalid-argument', `Quantity for '${item.partName}' must be a positive integer.`);
    }
    if (typeof item.unitPrice !== 'number' || item.unitPrice < 0) {
      throw new HttpsError('invalid-argument', `Unit price for '${item.partName}' cannot be negative.`);
    }
  }
  
  // Return the validated data if all checks pass
  return data;
};


// --- 2. Core Business Logic (Using Manual Validation) ---
export async function createPartsOrderLogic(request: CallableRequest) {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'You must be logged in to create an order.');
  }

  // Input Validation using our manual function
  const { tenantId, supplierName, notes, items } = validateCreateOrderData(request.data);

  if (request.auth.token.tenantId !== tenantId) {
    throw new HttpsError('permission-denied', 'You are not authorized to perform this action for the specified tenant.');
  }

  const totalAmount = items.reduce((sum: number, item: any) => sum + (item.qty * item.unitPrice), 0);

  const newOrder = {
    tenantId,
    supplierName,
    notes: notes || '',
    totalAmount,
    status: 'pending',
    orderDate: Timestamp.now(),
    updatedAt: Timestamp.now(),
    createdBy: request.auth.uid,
    itemCount: items.length,
  };

  const batch = db.batch();
  const orderRef = db.collection('partsOrders').doc();
  batch.set(orderRef, newOrder);

  items.forEach((item: any) => {
    const itemRef = orderRef.collection('orderItems').doc();
    batch.set(itemRef, {
      partName: item.partName,
      qty: item.qty,
      unitPrice: item.unitPrice,
      totalPrice: item.qty * item.unitPrice,
    });
  });

  await batch.commit();

  return { status: 'success', orderId: orderRef.id, message: 'Order created successfully.' };
}


// --- 3. Thin Firebase Wrapper (Unchanged) ---
export const createPartsOrder = onCall(createPartsOrderLogic);
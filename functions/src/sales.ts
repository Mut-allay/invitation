import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { initializeApp } from 'firebase-admin/app';

// Initialize Firebase Admin
initializeApp();

const db = getFirestore();

// Get sales for a tenant
export const getSales = onCall<{ tenantId: string }>(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { tenantId } = request.data;
  const userClaims = request.auth.token;

  if (userClaims.tenantId !== tenantId) {
    throw new HttpsError('permission-denied', 'Access denied to this tenant');
  }

  try {
    const salesRef = db.collection('sales');
    const snapshot = await salesRef.where('tenantId', '==', tenantId).get();
    
    const sales = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    }));

    return { sales };
  } catch (error) {
    console.error('Error fetching sales:', error);
    throw new HttpsError('internal', 'Failed to fetch sales');
  }
});

// Get a single sale
export const getSale = onCall<{ tenantId: string; saleId: string }>(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { tenantId, saleId } = request.data;
  const userClaims = request.auth.token;

  if (userClaims.tenantId !== tenantId) {
    throw new HttpsError('permission-denied', 'Access denied to this tenant');
  }

  try {
    const saleRef = db.collection('sales').doc(saleId);
    const saleDoc = await saleRef.get();

    if (!saleDoc.exists) {
      throw new HttpsError('not-found', 'Sale not found');
    }

    const saleData = saleDoc.data();
    if (saleData?.tenantId !== tenantId) {
      throw new HttpsError('permission-denied', 'Access denied to this sale');
    }

    return {
      id: saleDoc.id,
      ...saleData,
      createdAt: saleData.createdAt?.toDate(),
      updatedAt: saleData.updatedAt?.toDate(),
    };
  } catch (error) {
    console.error('Error fetching sale:', error);
    throw new HttpsError('internal', 'Failed to fetch sale');
  }
});

// Create a new sale
export const createSale = onCall<{ tenantId: string; sale: any }>(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { tenantId, sale } = request.data;
  const userClaims = request.auth.token;

  if (userClaims.tenantId !== tenantId) {
    throw new HttpsError('permission-denied', 'Access denied to this tenant');
  }

  try {
    // Start a batch write
    const batch = db.batch();

    // Create the sale document
    const saleRef = db.collection('sales').doc();
    const saleData = {
      ...sale,
      tenantId,
      status: 'completed',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    batch.set(saleRef, saleData);

    // Update vehicle status to sold
    const vehicleRef = db.collection('vehicles').doc(sale.vehicleId);
    batch.update(vehicleRef, {
      status: 'sold',
      updatedAt: new Date(),
    });

    // Update customer's vehicles owned
    const customerRef = db.collection('customers').doc(sale.customerId);
    batch.update(customerRef, {
<<<<<<< Updated upstream
      vehiclesOwned: FieldValue.arrayUnion(sale.vehicleId),
=======
              vehiclesOwned: FieldValue.arrayUnion(sale.vehicleId),
>>>>>>> Stashed changes
      updatedAt: new Date(),
    });

    // Create audit log
    const auditLogRef = db.collection('auditLogs').doc();
    const auditLog = {
      tenantId,
      actorUid: request.auth.uid,
      entityType: 'sale',
      entityId: saleRef.id,
      action: 'sale_created',
      diff: {
        vehicleId: sale.vehicleId,
        customerId: sale.customerId,
        salePrice: sale.salePrice,
        deposit: sale.deposit,
        balance: sale.balance,
      },
      timestamp: new Date(),
    };

    batch.set(auditLogRef, auditLog);

    // Commit the batch
    await batch.commit();

    return {
      id: saleRef.id,
      ...saleData,
    };
  } catch (error) {
    console.error('Error creating sale:', error);
    throw new HttpsError('internal', 'Failed to create sale');
  }
});

// Update a sale
export const updateSale = onCall<{ tenantId: string; saleId: string; sale: any }>(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { tenantId, saleId, sale } = request.data;
  const userClaims = request.auth.token;

  if (userClaims.tenantId !== tenantId) {
    throw new HttpsError('permission-denied', 'Access denied to this tenant');
  }

  try {
    const saleRef = db.collection('sales').doc(saleId);
    const saleDoc = await saleRef.get();

    if (!saleDoc.exists) {
      throw new HttpsError('not-found', 'Sale not found');
    }

    const existingData = saleDoc.data();
    if (existingData?.tenantId !== tenantId) {
      throw new HttpsError('permission-denied', 'Access denied to this sale');
    }

    const updateData = {
      ...sale,
      updatedAt: new Date(),
    };

    await saleRef.update(updateData);

    return {
      id: saleId,
      ...existingData,
      ...updateData,
    };
  } catch (error) {
    console.error('Error updating sale:', error);
    throw new HttpsError('internal', 'Failed to update sale');
  }
});

// Delete a sale
export const deleteSale = onCall<{ tenantId: string; saleId: string }>(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { tenantId, saleId } = request.data;
  const userClaims = request.auth.token;

  if (userClaims.tenantId !== tenantId) {
    throw new HttpsError('permission-denied', 'Access denied to this tenant');
  }

  try {
    const saleRef = db.collection('sales').doc(saleId);
    const saleDoc = await saleRef.get();

    if (!saleDoc.exists) {
      throw new HttpsError('not-found', 'Sale not found');
    }

    const saleData = saleDoc.data();
    if (saleData?.tenantId !== tenantId) {
      throw new HttpsError('permission-denied', 'Access denied to this sale');
    }

    await saleRef.delete();

    return { success: true };
  } catch (error) {
    console.error('Error deleting sale:', error);
    throw new HttpsError('internal', 'Failed to delete sale');
  }
}); 
import { onCall, HttpsError, CallableRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { logger } from 'firebase-functions/v1';
import { z } from 'zod';

// Initialize Firebase Admin if not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();

// Type definitions
interface SaleData {
  tenantId: string;
  createdAt?: FirebaseFirestore.Timestamp;
  updatedAt?: FirebaseFirestore.Timestamp;
  [key: string]: any;
}

// Get sales for a tenant
export const getSales = onCall<{ tenantId: string }>(async (request: CallableRequest<{ tenantId: string }>) => {
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
    
    const sales = snapshot.docs.map(doc => {
      const data = doc.data() as SaleData;
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      };
    });

    return { sales };
  } catch (error) {
    console.error('Error fetching sales:', error);
    throw new HttpsError('internal', 'Failed to fetch sales');
  }
});

// Get a single sale
export const getSale = onCall<{ tenantId: string; saleId: string }>(async (request: CallableRequest<{ tenantId: string; saleId: string }>) => {
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

    const saleData = saleDoc.data() as SaleData;
    if (!saleData || saleData.tenantId !== tenantId) {
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

import { checkRateLimit } from './rate-limiter';

// Create a new sale
export const createSale = onCall<{ tenantId: string; sale: SaleData }>(async (request: CallableRequest<{ tenantId: string; sale: SaleData }>) => {
  if (!request.auth || !request.rawRequest.ip) {
    throw new HttpsError('unauthenticated', 'User must be authenticated and have an IP address.');
  }

  await checkRateLimit(request.rawRequest.ip);

  const { tenantId, sale } = request.data;
  const userClaims = request.auth.token;

  if (userClaims.tenantId !== tenantId) {
    throw new HttpsError('permission-denied', 'Access denied to this tenant');
  }

  try {
    const saleData = {
      ...sale,
      tenantId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const saleRef = await db.collection('sales').add(saleData);
    const newSaleDoc = await saleRef.get();

    return {
      id: saleRef.id,
      ...newSaleDoc.data(),
      createdAt: newSaleDoc.data()?.createdAt?.toDate(),
      updatedAt: newSaleDoc.data()?.updatedAt?.toDate(),
    };
  } catch (error) {
    console.error('Error creating sale:', error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError('internal', 'Failed to create sale');
  }
});

// Update a sale
export const updateSale = onCall<{ tenantId: string; saleId: string; sale: SaleData }>(async (request: CallableRequest<{ tenantId: string; saleId: string; sale: SaleData }>) => {
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

    const existingData = saleDoc.data() as SaleData;
    if (!existingData || existingData.tenantId !== tenantId) {
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
export const deleteSale = onCall<{ tenantId: string; saleId: string }>(async (request: CallableRequest<{ tenantId: string; saleId: string }>) => {
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

    const saleData = saleDoc.data() as SaleData;
    if (!saleData || saleData.tenantId !== tenantId) {
      throw new HttpsError('permission-denied', 'Access denied to this sale');
    }

    await saleRef.delete();

    return { success: true };
  } catch (error) {
    console.error('Error deleting sale:', error);
    throw new HttpsError('internal', 'Failed to delete sale');
  }
}); 
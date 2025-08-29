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
interface RepairData {
  tenantId: string;
  createdAt?: FirebaseFirestore.Timestamp;
  updatedAt?: FirebaseFirestore.Timestamp;
  estimatedCompletion?: FirebaseFirestore.Timestamp;
  actualCompletion?: FirebaseFirestore.Timestamp;
  closedAt?: FirebaseFirestore.Timestamp;
  status?: string;
  [key: string]: any;
}

interface JobCardData {
  [key: string]: any;
}

// Get repairs for a tenant
export const getRepairs = onCall<{ tenantId: string }>(async (request: CallableRequest<{ tenantId: string }>) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { tenantId } = request.data;
  const userClaims = request.auth.token;

  if (userClaims.tenantId !== tenantId) {
    throw new HttpsError('permission-denied', 'Access denied to this tenant');
  }

  try {
    const repairsRef = db.collection('repairs');
    const snapshot = await repairsRef.where('tenantId', '==', tenantId).get();
    
    const repairs = snapshot.docs.map(doc => {
      const data = doc.data() as RepairData;
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        estimatedCompletion: data.estimatedCompletion?.toDate(),
        actualCompletion: data.actualCompletion?.toDate(),
        closedAt: data.closedAt?.toDate(),
      };
    });

    return { repairs };
  } catch (error) {
    console.error('Error fetching repairs:', error);
    throw new HttpsError('internal', 'Failed to fetch repairs');
  }
});

// Get a single repair
export const getRepair = onCall<{ tenantId: string; repairId: string }>(async (request: CallableRequest<{ tenantId: string; repairId: string }>) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { tenantId, repairId } = request.data;
  const userClaims = request.auth.token;

  if (userClaims.tenantId !== tenantId) {
    throw new HttpsError('permission-denied', 'Access denied to this tenant');
  }

  try {
    const repairRef = db.collection('repairs').doc(repairId);
    const repairDoc = await repairRef.get();

    if (!repairDoc.exists) {
      throw new HttpsError('not-found', 'Repair not found');
    }

    const repairData = repairDoc.data() as RepairData;
    if (!repairData || repairData.tenantId !== tenantId) {
      throw new HttpsError('permission-denied', 'Access denied to this repair');
    }

    return {
      id: repairDoc.id,
      ...repairData,
      createdAt: repairData.createdAt?.toDate(),
      updatedAt: repairData.updatedAt?.toDate(),
      estimatedCompletion: repairData.estimatedCompletion?.toDate(),
      actualCompletion: repairData.actualCompletion?.toDate(),
      closedAt: repairData.closedAt?.toDate(),
    };
  } catch (error) {
    console.error('Error fetching repair:', error);
    throw new HttpsError('internal', 'Failed to fetch repair');
  }
});

// Create a new repair
export const createRepair = onCall<{ tenantId: string; repair: RepairData }>(async (request: CallableRequest<{ tenantId: string; repair: RepairData }>) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { tenantId, repair } = request.data;
  const userClaims = request.auth.token;

  if (userClaims.tenantId !== tenantId) {
    throw new HttpsError('permission-denied', 'Access denied to this tenant');
  }

  try {
    const repairData = {
      ...repair,
      tenantId,
      status: 'pending',
      totalCost: 0,
      laborCost: 0,
      partsCost: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const repairRef = await db.collection('repairs').add(repairData);
    
    return {
      id: repairRef.id,
      ...repairData,
    };
  } catch (error) {
    console.error('Error creating repair:', error);
    throw new HttpsError('internal', 'Failed to create repair');
  }
});

// Update a repair
export const updateRepair = onCall<{ tenantId: string; repairId: string; repair: RepairData }>(async (request: CallableRequest<{ tenantId: string; repairId: string; repair: RepairData }>) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { tenantId, repairId, repair } = request.data;
  const userClaims = request.auth.token;

  if (userClaims.tenantId !== tenantId) {
    throw new HttpsError('permission-denied', 'Access denied to this tenant');
  }

  try {
    const repairRef = db.collection('repairs').doc(repairId);
    const repairDoc = await repairRef.get();

    if (!repairDoc.exists) {
      throw new HttpsError('not-found', 'Repair not found');
    }

    const existingData = repairDoc.data() as RepairData;
    if (!existingData || existingData.tenantId !== tenantId) {
      throw new HttpsError('permission-denied', 'Access denied to this repair');
    }

    const updateData = {
      ...repair,
      updatedAt: new Date(),
    };

    // If status is being updated to completed, set closedAt
    if (repair.status === 'completed' && existingData.status !== 'completed') {
      updateData.closedAt = new Date() as any;
      updateData.actualCompletion = new Date() as any;
    }

    await repairRef.update(updateData);

    return {
      id: repairId,
      ...existingData,
      ...updateData,
    };
  } catch (error) {
    console.error('Error updating repair:', error);
    throw new HttpsError('internal', 'Failed to update repair');
  }
});

// Delete a repair
export const deleteRepair = onCall<{ tenantId: string; repairId: string }>(async (request: CallableRequest<{ tenantId: string; repairId: string }>) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { tenantId, repairId } = request.data;
  const userClaims = request.auth.token;

  if (userClaims.tenantId !== tenantId) {
    throw new HttpsError('permission-denied', 'Access denied to this tenant');
  }

  try {
    const repairRef = db.collection('repairs').doc(repairId);
    const repairDoc = await repairRef.get();

    if (!repairDoc.exists) {
      throw new HttpsError('not-found', 'Repair not found');
    }

    const repairData = repairDoc.data() as RepairData;
    if (repairData?.tenantId !== tenantId) {
      throw new HttpsError('permission-denied', 'Access denied to this repair');
    }

    await repairRef.delete();

    return { success: true };
  } catch (error) {
    console.error('Error deleting repair:', error);
    throw new HttpsError('internal', 'Failed to delete repair');
  }
});

// Get job cards for a repair
export const getJobCards = onCall<{ tenantId: string; repairId: string }>(async (request: CallableRequest<{ tenantId: string; repairId: string }>) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { tenantId, repairId } = request.data;
  const userClaims = request.auth.token;

  if (userClaims.tenantId !== tenantId) {
    throw new HttpsError('permission-denied', 'Access denied to this tenant');
  }

  try {
    const jobCardsRef = db.collection('repairs').doc(repairId).collection('jobCards');
    const snapshot = await jobCardsRef.get();
    
    const jobCards = snapshot.docs.map(doc => {
      const data = doc.data() as JobCardData;
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      };
    });

    return { jobCards };
  } catch (error) {
    console.error('Error fetching job cards:', error);
    throw new HttpsError('internal', 'Failed to fetch job cards');
  }
});

// Create a job card
export const createJobCard = onCall<{ tenantId: string; repairId: string; jobCard: JobCardData }>(async (request: CallableRequest<{ tenantId: string; repairId: string; jobCard: JobCardData }>) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { tenantId, repairId, jobCard } = request.data;
  const userClaims = request.auth.token;

  if (userClaims.tenantId !== tenantId) {
    throw new HttpsError('permission-denied', 'Access denied to this tenant');
  }

  try {
    const jobCardData = {
      ...jobCard,
      repairId,
      status: 'pending',
      totalLabor: jobCard.estimatedHours * jobCard.rate,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const jobCardRef = await db.collection('repairs').doc(repairId).collection('jobCards').add(jobCardData);
    
    // Update repair status to in_progress if it was pending
    const repairRef = db.collection('repairs').doc(repairId);
    await repairRef.update({
      status: 'in_progress',
      updatedAt: new Date(),
    });
    
    return {
      id: jobCardRef.id,
      ...jobCardData,
    };
  } catch (error) {
    console.error('Error creating job card:', error);
    throw new HttpsError('internal', 'Failed to create job card');
  }
}); 
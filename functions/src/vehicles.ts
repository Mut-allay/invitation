import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp } from 'firebase-admin/app';

// Initialize Firebase Admin
initializeApp();

const db = getFirestore();

// Get vehicles for a tenant
export const getVehicles = onCall<{ tenantId: string }>(async (request) => {
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
    const vehiclesRef = db.collection('vehicles');
    const snapshot = await vehiclesRef.where('tenantId', '==', tenantId).get();
    
    const vehicles = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    }));

    return { vehicles };
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    throw new HttpsError('internal', 'Failed to fetch vehicles');
  }
});

// Get a single vehicle
export const getVehicle = onCall<{ tenantId: string; vehicleId: string }>(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { tenantId, vehicleId } = request.data;
  const userClaims = request.auth.token;

  if (userClaims.tenantId !== tenantId) {
    throw new HttpsError('permission-denied', 'Access denied to this tenant');
  }

  try {
    const vehicleRef = db.collection('vehicles').doc(vehicleId);
    const vehicleDoc = await vehicleRef.get();

    if (!vehicleDoc.exists) {
      throw new HttpsError('not-found', 'Vehicle not found');
    }

    const vehicleData = vehicleDoc.data();
    if (vehicleData?.tenantId !== tenantId) {
      throw new HttpsError('permission-denied', 'Access denied to this vehicle');
    }

    return {
      id: vehicleDoc.id,
      ...vehicleData,
      createdAt: vehicleData.createdAt?.toDate(),
      updatedAt: vehicleData.updatedAt?.toDate(),
    };
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    throw new HttpsError('internal', 'Failed to fetch vehicle');
  }
});

// Create a new vehicle
export const createVehicle = onCall<{ tenantId: string; vehicle: Record<string, unknown> }>(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { tenantId, vehicle } = request.data;
  const userClaims = request.auth.token;

  if (userClaims.tenantId !== tenantId) {
    throw new HttpsError('permission-denied', 'Access denied to this tenant');
  }

  // Check permissions
  if (!userClaims.permissions?.includes('create_vehicle')) {
    throw new HttpsError('permission-denied', 'Insufficient permissions');
  }

  try {
    const vehicleData = {
      ...vehicle,
      tenantId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const vehicleRef = await db.collection('vehicles').add(vehicleData);
    
    return {
      id: vehicleRef.id,
      ...vehicleData,
    };
  } catch (error) {
    console.error('Error creating vehicle:', error);
    throw new HttpsError('internal', 'Failed to create vehicle');
  }
});

// Update a vehicle
export const updateVehicle = onCall<{ tenantId: string; vehicleId: string; vehicle: Record<string, unknown> }>(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { tenantId, vehicleId, vehicle } = request.data;
  const userClaims = request.auth.token;

  if (userClaims.tenantId !== tenantId) {
    throw new HttpsError('permission-denied', 'Access denied to this tenant');
  }

  if (!userClaims.permissions?.includes('update_vehicle')) {
    throw new HttpsError('permission-denied', 'Insufficient permissions');
  }

  try {
    const vehicleRef = db.collection('vehicles').doc(vehicleId);
    const vehicleDoc = await vehicleRef.get();

    if (!vehicleDoc.exists) {
      throw new HttpsError('not-found', 'Vehicle not found');
    }

    const existingData = vehicleDoc.data();
    if (existingData?.tenantId !== tenantId) {
      throw new HttpsError('permission-denied', 'Access denied to this vehicle');
    }

    const updateData = {
      ...vehicle,
      updatedAt: new Date(),
    };

    await vehicleRef.update(updateData);

    return {
      id: vehicleId,
      ...existingData,
      ...updateData,
    };
  } catch (error) {
    console.error('Error updating vehicle:', error);
    throw new HttpsError('internal', 'Failed to update vehicle');
  }
});

// Delete a vehicle
export const deleteVehicle = onCall<{ tenantId: string; vehicleId: string }>(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { tenantId, vehicleId } = request.data;
  const userClaims = request.auth.token;

  if (userClaims.tenantId !== tenantId) {
    throw new HttpsError('permission-denied', 'Access denied to this tenant');
  }

  if (!userClaims.permissions?.includes('delete_vehicle')) {
    throw new HttpsError('permission-denied', 'Insufficient permissions');
  }

  try {
    const vehicleRef = db.collection('vehicles').doc(vehicleId);
    const vehicleDoc = await vehicleRef.get();

    if (!vehicleDoc.exists) {
      throw new HttpsError('not-found', 'Vehicle not found');
    }

    const vehicleData = vehicleDoc.data();
    if (vehicleData?.tenantId !== tenantId) {
      throw new HttpsError('permission-denied', 'Access denied to this vehicle');
    }

    await vehicleRef.delete();

    return { success: true };
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    throw new HttpsError('internal', 'Failed to delete vehicle');
  }
});

// Trigger: Update vehicle status when sold
export const onVehicleStatusUpdate = onDocumentUpdated('vehicles/{vehicleId}', async (event) => {
  const beforeData = event.data?.before.data();
  const afterData = event.data?.after.data();

  if (beforeData?.status !== 'sold' && afterData?.status === 'sold') {
    // Vehicle was just sold, create audit log
    const auditLog = {
      tenantId: afterData.tenantId,
      actorUid: 'system',
      entityType: 'vehicle',
      entityId: event.params.vehicleId,
      action: 'vehicle_sold',
      diff: {
        status: { from: beforeData?.status, to: 'sold' }
      },
      timestamp: new Date(),
    };

    await db.collection('auditLogs').add(auditLog);
    console.log(`Vehicle ${event.params.vehicleId} marked as sold`);
  }
}); 
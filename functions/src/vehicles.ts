import { onCall, HttpsError, CallableRequest } from 'firebase-functions/v2/https';
import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp } from 'firebase-admin/app';

// Initialize Firebase Admin
initializeApp();

const db = getFirestore();

// Type definitions
interface VehicleData {
  tenantId: string;
  createdAt?: FirebaseFirestore.Timestamp;
  updatedAt?: FirebaseFirestore.Timestamp;
  [key: string]: any;
}

// Get vehicles for a tenant
export const getVehicles = onCall<{ tenantId: string }>(async (request: CallableRequest<{ tenantId: string }>) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { tenantId } = request.data;
  const userClaims = request.auth.token;

  if (userClaims.tenantId !== tenantId) {
    throw new HttpsError('permission-denied', 'Access denied to this tenant');
  }

  try {
    const vehiclesRef = db.collection('vehicles');
    const snapshot = await vehiclesRef.where('tenantId', '==', tenantId).get();
    
    const vehicles = snapshot.docs.map(doc => {
      const data = doc.data() as VehicleData;
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      };
    });

    return { vehicles };
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    throw new HttpsError('internal', 'Failed to fetch vehicles');
  }
});

// Get a single vehicle
export const getVehicle = onCall<{ tenantId: string; vehicleId: string }>(async (request: CallableRequest<{ tenantId: string; vehicleId: string }>) => {
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

    const vehicleData = vehicleDoc.data() as VehicleData;
    if (!vehicleData || vehicleData.tenantId !== tenantId) {
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
export const createVehicle = onCall<{ tenantId: string; vehicle: Record<string, unknown> }>(async (request: CallableRequest<{ tenantId: string; vehicle: Record<string, unknown> }>) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { tenantId, vehicle } = request.data;
  const userClaims = request.auth.token;

  if (userClaims.tenantId !== tenantId) {
    throw new HttpsError('permission-denied', 'Access denied to this tenant');
  }

  try {
    const vehicleData = {
      ...vehicle,
      tenantId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const vehicleRef = await db.collection('vehicles').add(vehicleData);
    const newVehicleDoc = await vehicleRef.get();

    return {
      id: vehicleRef.id,
      ...newVehicleDoc.data(),
      createdAt: newVehicleDoc.data()?.createdAt?.toDate(),
      updatedAt: newVehicleDoc.data()?.updatedAt?.toDate(),
    };
  } catch (error) {
    console.error('Error creating vehicle:', error);
    throw new HttpsError('internal', 'Failed to create vehicle');
  }
});

// Update a vehicle
export const updateVehicle = onCall<{ tenantId: string; vehicleId: string; vehicle: Record<string, unknown> }>(async (request: CallableRequest<{ tenantId: string; vehicleId: string; vehicle: Record<string, unknown> }>) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { tenantId, vehicleId, vehicle } = request.data;
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

    const existingData = vehicleDoc.data() as VehicleData;
    if (!existingData || existingData.tenantId !== tenantId) {
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
export const deleteVehicle = onCall<{ tenantId: string; vehicleId: string }>(async (request: CallableRequest<{ tenantId: string; vehicleId: string }>) => {
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

    const vehicleData = vehicleDoc.data() as VehicleData;
    if (!vehicleData || vehicleData.tenantId !== tenantId) {
      throw new HttpsError('permission-denied', 'Access denied to this vehicle');
    }

    await vehicleRef.delete();

    return { success: true };
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    throw new HttpsError('internal', 'Failed to delete vehicle');
  }
});

// Firestore trigger for vehicle updates
export const onVehicleUpdated = onDocumentUpdated('vehicles/{vehicleId}', async (event) => {
  const vehicleId = event.params.vehicleId;
  const beforeData = event.data?.before.data();
  const afterData = event.data?.after.data();

  if (!beforeData || !afterData) {
    console.log('No data available for vehicle update trigger');
    return;
  }

  // Log the vehicle update
  console.log(`Vehicle ${vehicleId} updated:`, {
    before: beforeData,
    after: afterData,
  });

  // You can add additional logic here, such as:
  // - Updating related documents
  // - Sending notifications
  // - Creating audit logs
  // - Triggering workflows
});
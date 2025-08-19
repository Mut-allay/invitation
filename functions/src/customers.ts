import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp } from 'firebase-admin/app';

// Initialize Firebase Admin
initializeApp();

const db = getFirestore();
const auth = getAuth();

// Get customers for a tenant
export const getCustomers = onCall<{ tenantId: string }>(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { tenantId } = request.data;
  const userClaims = request.auth.token;

  if (userClaims.tenantId !== tenantId) {
    throw new HttpsError('permission-denied', 'Access denied to this tenant');
  }

  try {
    const customersRef = db.collection('customers');
    const snapshot = await customersRef.where('tenantId', '==', tenantId).get();
    
    const customers = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    }));

    return { customers };
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw new HttpsError('internal', 'Failed to fetch customers');
  }
});

// Get a single customer
export const getCustomer = onCall<{ tenantId: string; customerId: string }>(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { tenantId, customerId } = request.data;
  const userClaims = request.auth.token;

  if (userClaims.tenantId !== tenantId) {
    throw new HttpsError('permission-denied', 'Access denied to this tenant');
  }

  try {
    const customerRef = db.collection('customers').doc(customerId);
    const customerDoc = await customerRef.get();

    if (!customerDoc.exists) {
      throw new HttpsError('not-found', 'Customer not found');
    }

    const customerData = customerDoc.data();
    if (customerData?.tenantId !== tenantId) {
      throw new HttpsError('permission-denied', 'Access denied to this customer');
    }

    return {
      id: customerDoc.id,
      ...customerData,
      createdAt: customerData.createdAt?.toDate(),
      updatedAt: customerData.updatedAt?.toDate(),
    };
  } catch (error) {
    console.error('Error fetching customer:', error);
    throw new HttpsError('internal', 'Failed to fetch customer');
  }
});

// Create a new customer
export const createCustomer = onCall<{ tenantId: string; customer: any }>(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { tenantId, customer } = request.data;
  const userClaims = request.auth.token;

  if (userClaims.tenantId !== tenantId) {
    throw new HttpsError('permission-denied', 'Access denied to this tenant');
  }

  try {
    const customerData = {
      ...customer,
      tenantId,
      vehiclesOwned: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const customerRef = await db.collection('customers').add(customerData);
    
    return {
      id: customerRef.id,
      ...customerData,
    };
  } catch (error) {
    console.error('Error creating customer:', error);
    throw new HttpsError('internal', 'Failed to create customer');
  }
});

// Update a customer
export const updateCustomer = onCall<{ tenantId: string; customerId: string; customer: any }>(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { tenantId, customerId, customer } = request.data;
  const userClaims = request.auth.token;

  if (userClaims.tenantId !== tenantId) {
    throw new HttpsError('permission-denied', 'Access denied to this tenant');
  }

  try {
    const customerRef = db.collection('customers').doc(customerId);
    const customerDoc = await customerRef.get();

    if (!customerDoc.exists) {
      throw new HttpsError('not-found', 'Customer not found');
    }

    const existingData = customerDoc.data();
    if (existingData?.tenantId !== tenantId) {
      throw new HttpsError('permission-denied', 'Access denied to this customer');
    }

    const updateData = {
      ...customer,
      updatedAt: new Date(),
    };

    await customerRef.update(updateData);

    return {
      id: customerId,
      ...existingData,
      ...updateData,
    };
  } catch (error) {
    console.error('Error updating customer:', error);
    throw new HttpsError('internal', 'Failed to update customer');
  }
});

// Delete a customer
export const deleteCustomer = onCall<{ tenantId: string; customerId: string }>(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { tenantId, customerId } = request.data;
  const userClaims = request.auth.token;

  if (userClaims.tenantId !== tenantId) {
    throw new HttpsError('permission-denied', 'Access denied to this tenant');
  }

  try {
    const customerRef = db.collection('customers').doc(customerId);
    const customerDoc = await customerRef.get();

    if (!customerDoc.exists) {
      throw new HttpsError('not-found', 'Customer not found');
    }

    const customerData = customerDoc.data();
    if (customerData?.tenantId !== tenantId) {
      throw new HttpsError('permission-denied', 'Access denied to this customer');
    }

    await customerRef.delete();

    return { success: true };
  } catch (error) {
    console.error('Error deleting customer:', error);
    throw new HttpsError('internal', 'Failed to delete customer');
  }
}); 
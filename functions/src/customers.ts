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
interface CustomerData {
  tenantId: string;
  createdAt?: FirebaseFirestore.Timestamp;
  updatedAt?: FirebaseFirestore.Timestamp;
  [key: string]: any;
}

// Zod schema for validation
const CustomerSchema = z.object({
  tenantId: z.string(),
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
}).passthrough();

// Get customers for a tenant
export const getCustomers = onCall<{ tenantId: string }>(async (request: CallableRequest<{ tenantId: string }>) => {
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
    
    const customers = snapshot.docs.map(doc => {
      const data = doc.data() as CustomerData;
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      };
    });

    return { customers };
  } catch (error) {
    logger.error('Error fetching customers:', error);
    throw new HttpsError('internal', 'Failed to fetch customers');
  }
});

// Get a single customer
export const getCustomer = onCall<{ tenantId: string; customerId: string }>(async (request: CallableRequest<{ tenantId: string; customerId: string }>) => {
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

    const customerData = customerDoc.data() as CustomerData;
    if (!customerData || customerData.tenantId !== tenantId) {
      throw new HttpsError('permission-denied', 'Access denied to this customer');
    }

    return {
      id: customerDoc.id,
      ...customerData,
      createdAt: customerData.createdAt?.toDate(),
      updatedAt: customerData.updatedAt?.toDate(),
    };
  } catch (error) {
    logger.error('Error fetching customer:', error);
    throw new HttpsError('internal', 'Failed to fetch customer');
  }
});

// Create a new customer
export const createCustomer = onCall<{ tenantId: string; customer: CustomerData }>(async (request: CallableRequest<{ tenantId: string; customer: CustomerData }>) => {
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
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const validatedData = CustomerSchema.parse(customerData);
    const customerRef = await db.collection('customers').add(validatedData);
    const newCustomerDoc = await customerRef.get();

    return {
      id: customerRef.id,
      ...newCustomerDoc.data(),
      createdAt: newCustomerDoc.data()?.createdAt?.toDate(),
      updatedAt: newCustomerDoc.data()?.updatedAt?.toDate(),
    };
  } catch (error) {
    logger.error('Error creating customer:', error);
    throw new HttpsError('internal', 'Failed to create customer');
  }
});

// Update a customer
export const updateCustomer = onCall<{ tenantId: string; customerId: string; customer: CustomerData }>(async (request: CallableRequest<{ tenantId: string; customerId: string; customer: CustomerData }>) => {
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

    const existingData = customerDoc.data() as CustomerData;
    if (!existingData || existingData.tenantId !== tenantId) {
      throw new HttpsError('permission-denied', 'Access denied to this customer');
    }

    const updateData = {
      ...customer,
      tenantId,
      updatedAt: new Date(),
    };

    const validatedData = CustomerSchema.parse(updateData);
    await customerRef.update(validatedData);

    return {
      id: customerId,
      ...existingData,
      ...updateData,
    };
  } catch (error) {
    logger.error('Error updating customer:', error);
    throw new HttpsError('internal', 'Failed to update customer');
  }
});

// Delete a customer
export const deleteCustomer = onCall<{ tenantId: string; customerId: string }>(async (request: CallableRequest<{ tenantId: string; customerId: string }>) => {
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

    const customerData = customerDoc.data() as CustomerData;
    if (!customerData || customerData.tenantId !== tenantId) {
      throw new HttpsError('permission-denied', 'Access denied to this customer');
    }

    await customerRef.delete();

    return { success: true };
  } catch (error) {
    logger.error('Error deleting customer:', error);
    throw new HttpsError('internal', 'Failed to delete customer');
  }
}); 
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp } from 'firebase-admin/app';

// Initialize Firebase Admin
initializeApp();

const auth = getAuth();
const db = getFirestore();

// Trigger: Create user document when a new user signs up
export const onUserCreate = onDocumentCreated('users/{uid}', async (event) => {
  const userData = event.data?.data();
  const uid = event.params.uid;

  if (!userData) {
    console.error('No user data found');
    return;
  }

  try {
    // Get the user from Firebase Auth
    const userRecord = await auth.getUser(uid);
    
    // Update the user document with additional information
    await db.collection('users').doc(uid).set({
      email: userRecord.email,
      displayName: userRecord.displayName || userRecord.email?.split('@')[0],
      phoneNumber: userRecord.phoneNumber,
      createdAt: new Date(),
      lastLoginAt: new Date(),
      isActive: true,
    }, { merge: true });

    console.log(`User document created for ${uid}`);
  } catch (error) {
    console.error('Error creating user document:', error);
  }
});

// Callable function: Set custom claims for user roles
export const setCustomClaims = onCall<{
  uid: string;
  role: 'admin' | 'manager' | 'cashier' | 'mechanic' | 'accountant';
  tenantId: string;
  permissions?: string[];
}>(async (request) => {
  // Check if the caller is authenticated
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { uid, role, tenantId, permissions } = request.data;

  try {
    // Verify the caller has admin privileges
    const callerUser = await auth.getUser(request.auth.uid);
    const callerClaims = callerUser.customClaims;
    
    if (!callerClaims || callerClaims.role !== 'admin') {
      throw new HttpsError('permission-denied', 'Only admins can set custom claims');
    }

    // Verify the caller is from the same tenant
    if (callerClaims.tenantId !== tenantId) {
      throw new HttpsError('permission-denied', 'Cannot modify users from different tenants');
    }

    // Set custom claims
    const customClaims = {
      role,
      tenantId,
      permissions: permissions || getDefaultPermissions(role),
    };

    await auth.setCustomUserClaims(uid, customClaims);

    // Update the user document
    await db.collection('users').doc(uid).update({
      role,
      tenantId,
      permissions: customClaims.permissions,
      updatedAt: new Date(),
    });

    return { success: true, message: 'Custom claims updated successfully' };
  } catch (error) {
    console.error('Error setting custom claims:', error);
    throw new HttpsError('internal', 'Failed to set custom claims');
  }
});

// Helper function to get default permissions for each role
function getDefaultPermissions(role: string): string[] {
  const permissions = {
    admin: [
      'create_invoice',
      'delete_vehicle',
      'manage_users',
      'view_reports',
      'manage_settings',
    ],
    manager: [
      'create_invoice',
      'delete_vehicle',
      'view_reports',
      'manage_settings',
    ],
    cashier: [
      'create_invoice',
      'view_customers',
      'process_payments',
    ],
    mechanic: [
      'update_job_cards',
      'view_vehicles',
      'view_inventory',
    ],
    accountant: [
      'view_reports',
      'manage_payroll',
      'view_financials',
    ],
  };

  return permissions[role as keyof typeof permissions] || [];
} 
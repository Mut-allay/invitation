"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setCustomClaims = exports.getUsers = exports.updateUserProfile = exports.getCurrentUser = exports.onUserCreate = void 0;
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-functions/v2/firestore");
const auth_1 = require("firebase-admin/auth");
const firestore_2 = require("firebase-admin/firestore");
const app_1 = require("firebase-admin/app");
// Initialize Firebase Admin
(0, app_1.initializeApp)();
const auth = (0, auth_1.getAuth)();
const db = (0, firestore_2.getFirestore)();
// Trigger: Create user document when a new user signs up
exports.onUserCreate = (0, firestore_1.onDocumentCreated)('users/{uid}', async (event) => {
    var _a, _b;
    const userData = (_a = event.data) === null || _a === void 0 ? void 0 : _a.data();
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
            displayName: userRecord.displayName || ((_b = userRecord.email) === null || _b === void 0 ? void 0 : _b.split('@')[0]),
            phoneNumber: userRecord.phoneNumber,
            createdAt: new Date(),
            lastLoginAt: new Date(),
            isActive: true,
        }, { merge: true });
        console.log(`User document created for ${uid}`);
    }
    catch (error) {
        console.error('Error creating user document:', error);
    }
});
// Get current user profile
exports.getCurrentUser = (0, https_1.onCall)(async (request) => {
    var _a, _b;
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    try {
        const userRef = db.collection('users').doc(request.auth.uid);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            throw new https_1.HttpsError('not-found', 'User profile not found');
        }
        const userData = userDoc.data();
        return Object.assign(Object.assign({ uid: request.auth.uid }, userData), { createdAt: (_a = userData.createdAt) === null || _a === void 0 ? void 0 : _a.toDate(), updatedAt: (_b = userData.updatedAt) === null || _b === void 0 ? void 0 : _b.toDate() });
    }
    catch (error) {
        console.error('Error fetching user profile:', error);
        throw new https_1.HttpsError('internal', 'Failed to fetch user profile');
    }
});
// Update user profile
exports.updateUserProfile = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { profile } = request.data;
    try {
        const userRef = db.collection('users').doc(request.auth.uid);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            throw new https_1.HttpsError('not-found', 'User profile not found');
        }
        const existingData = userDoc.data();
        if (!existingData) {
            throw new https_1.HttpsError('internal', 'Invalid user data');
        }
        const updateData = Object.assign(Object.assign({}, profile), { updatedAt: new Date() });
        await userRef.update(updateData);
        return Object.assign(Object.assign({ uid: request.auth.uid }, existingData), updateData);
    }
    catch (error) {
        console.error('Error updating user profile:', error);
        throw new https_1.HttpsError('internal', 'Failed to update user profile');
    }
});
// Get users for a tenant (admin only)
exports.getUsers = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { tenantId } = request.data;
    const userClaims = request.auth.token;
    if (userClaims.tenantId !== tenantId) {
        throw new https_1.HttpsError('permission-denied', 'Access denied to this tenant');
    }
    // Check if user is admin
    if (!userClaims.role || userClaims.role !== 'admin') {
        throw new https_1.HttpsError('permission-denied', 'Admin access required');
    }
    try {
        const usersRef = db.collection('users');
        const snapshot = await usersRef.where('tenantId', '==', tenantId).get();
        const users = snapshot.docs.map(doc => {
            var _a, _b;
            const data = doc.data();
            return Object.assign(Object.assign({ uid: doc.id }, data), { createdAt: (_a = data.createdAt) === null || _a === void 0 ? void 0 : _a.toDate(), updatedAt: (_b = data.updatedAt) === null || _b === void 0 ? void 0 : _b.toDate() });
        });
        return { users };
    }
    catch (error) {
        console.error('Error fetching users:', error);
        throw new https_1.HttpsError('internal', 'Failed to fetch users');
    }
});
// Callable function: Set custom claims for user roles
exports.setCustomClaims = (0, https_1.onCall)(async (request) => {
    // Check if the caller is authenticated
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { uid, role, tenantId, permissions } = request.data;
    try {
        // Verify the caller has admin privileges
        const callerUser = await auth.getUser(request.auth.uid);
        const callerClaims = callerUser.customClaims;
        if (!callerClaims || callerClaims.role !== 'admin') {
            throw new https_1.HttpsError('permission-denied', 'Only admins can set custom claims');
        }
        // Verify the caller is from the same tenant
        if (callerClaims.tenantId !== tenantId) {
            throw new https_1.HttpsError('permission-denied', 'Cannot modify users from different tenants');
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
    }
    catch (error) {
        console.error('Error setting custom claims:', error);
        throw new https_1.HttpsError('internal', 'Failed to set custom claims');
    }
});
// Helper function to get default permissions for each role
function getDefaultPermissions(role) {
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
    return permissions[role] || [];
}
//# sourceMappingURL=auth.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setCustomClaims = exports.onUserCreate = void 0;
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
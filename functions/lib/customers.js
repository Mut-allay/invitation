"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCustomer = exports.updateCustomer = exports.createCustomer = exports.getCustomer = exports.getCustomers = void 0;
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-admin/firestore");
const app_1 = require("firebase-admin/app");
// Initialize Firebase Admin
(0, app_1.initializeApp)();
const db = (0, firestore_1.getFirestore)();
// Get customers for a tenant
exports.getCustomers = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { tenantId } = request.data;
    const userClaims = request.auth.token;
    if (userClaims.tenantId !== tenantId) {
        throw new https_1.HttpsError('permission-denied', 'Access denied to this tenant');
    }
    try {
        const customersRef = db.collection('customers');
        const snapshot = await customersRef.where('tenantId', '==', tenantId).get();
        const customers = snapshot.docs.map(doc => {
            var _a, _b;
            return (Object.assign(Object.assign({ id: doc.id }, doc.data()), { createdAt: (_a = doc.data().createdAt) === null || _a === void 0 ? void 0 : _a.toDate(), updatedAt: (_b = doc.data().updatedAt) === null || _b === void 0 ? void 0 : _b.toDate() }));
        });
        return { customers };
    }
    catch (error) {
        console.error('Error fetching customers:', error);
        throw new https_1.HttpsError('internal', 'Failed to fetch customers');
    }
});
// Get a single customer
exports.getCustomer = (0, https_1.onCall)(async (request) => {
    var _a, _b;
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { tenantId, customerId } = request.data;
    const userClaims = request.auth.token;
    if (userClaims.tenantId !== tenantId) {
        throw new https_1.HttpsError('permission-denied', 'Access denied to this tenant');
    }
    try {
        const customerRef = db.collection('customers').doc(customerId);
        const customerDoc = await customerRef.get();
        if (!customerDoc.exists) {
            throw new https_1.HttpsError('not-found', 'Customer not found');
        }
        const customerData = customerDoc.data();
        if ((customerData === null || customerData === void 0 ? void 0 : customerData.tenantId) !== tenantId) {
            throw new https_1.HttpsError('permission-denied', 'Access denied to this customer');
        }
        return Object.assign(Object.assign({ id: customerDoc.id }, customerData), { createdAt: (_a = customerData.createdAt) === null || _a === void 0 ? void 0 : _a.toDate(), updatedAt: (_b = customerData.updatedAt) === null || _b === void 0 ? void 0 : _b.toDate() });
    }
    catch (error) {
        console.error('Error fetching customer:', error);
        throw new https_1.HttpsError('internal', 'Failed to fetch customer');
    }
});
// Create a new customer
exports.createCustomer = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { tenantId, customer } = request.data;
    const userClaims = request.auth.token;
    if (userClaims.tenantId !== tenantId) {
        throw new https_1.HttpsError('permission-denied', 'Access denied to this tenant');
    }
    try {
        const customerData = Object.assign(Object.assign({}, customer), { tenantId, vehiclesOwned: [], createdAt: new Date(), updatedAt: new Date() });
        const customerRef = await db.collection('customers').add(customerData);
        return Object.assign({ id: customerRef.id }, customerData);
    }
    catch (error) {
        console.error('Error creating customer:', error);
        throw new https_1.HttpsError('internal', 'Failed to create customer');
    }
});
// Update a customer
exports.updateCustomer = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { tenantId, customerId, customer } = request.data;
    const userClaims = request.auth.token;
    if (userClaims.tenantId !== tenantId) {
        throw new https_1.HttpsError('permission-denied', 'Access denied to this tenant');
    }
    try {
        const customerRef = db.collection('customers').doc(customerId);
        const customerDoc = await customerRef.get();
        if (!customerDoc.exists) {
            throw new https_1.HttpsError('not-found', 'Customer not found');
        }
        const existingData = customerDoc.data();
        if ((existingData === null || existingData === void 0 ? void 0 : existingData.tenantId) !== tenantId) {
            throw new https_1.HttpsError('permission-denied', 'Access denied to this customer');
        }
        const updateData = Object.assign(Object.assign({}, customer), { updatedAt: new Date() });
        await customerRef.update(updateData);
        return Object.assign(Object.assign({ id: customerId }, existingData), updateData);
    }
    catch (error) {
        console.error('Error updating customer:', error);
        throw new https_1.HttpsError('internal', 'Failed to update customer');
    }
});
// Delete a customer
exports.deleteCustomer = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { tenantId, customerId } = request.data;
    const userClaims = request.auth.token;
    if (userClaims.tenantId !== tenantId) {
        throw new https_1.HttpsError('permission-denied', 'Access denied to this tenant');
    }
    try {
        const customerRef = db.collection('customers').doc(customerId);
        const customerDoc = await customerRef.get();
        if (!customerDoc.exists) {
            throw new https_1.HttpsError('not-found', 'Customer not found');
        }
        const customerData = customerDoc.data();
        if ((customerData === null || customerData === void 0 ? void 0 : customerData.tenantId) !== tenantId) {
            throw new https_1.HttpsError('permission-denied', 'Access denied to this customer');
        }
        await customerRef.delete();
        return { success: true };
    }
    catch (error) {
        console.error('Error deleting customer:', error);
        throw new https_1.HttpsError('internal', 'Failed to delete customer');
    }
});
//# sourceMappingURL=customers.js.map
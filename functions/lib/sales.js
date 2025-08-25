"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSale = exports.updateSale = exports.createSale = exports.getSale = exports.getSales = void 0;
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-admin/firestore");
const app_1 = require("firebase-admin/app");
// Initialize Firebase Admin
(0, app_1.initializeApp)();
const db = (0, firestore_1.getFirestore)();
// Get sales for a tenant
exports.getSales = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { tenantId } = request.data;
    const userClaims = request.auth.token;
    if (userClaims.tenantId !== tenantId) {
        throw new https_1.HttpsError('permission-denied', 'Access denied to this tenant');
    }
    try {
        const salesRef = db.collection('sales');
        const snapshot = await salesRef.where('tenantId', '==', tenantId).get();
        const sales = snapshot.docs.map(doc => {
            var _a, _b;
            return (Object.assign(Object.assign({ id: doc.id }, doc.data()), { createdAt: (_a = doc.data().createdAt) === null || _a === void 0 ? void 0 : _a.toDate(), updatedAt: (_b = doc.data().updatedAt) === null || _b === void 0 ? void 0 : _b.toDate() }));
        });
        return { sales };
    }
    catch (error) {
        console.error('Error fetching sales:', error);
        throw new https_1.HttpsError('internal', 'Failed to fetch sales');
    }
});
// Get a single sale
exports.getSale = (0, https_1.onCall)(async (request) => {
    var _a, _b;
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { tenantId, saleId } = request.data;
    const userClaims = request.auth.token;
    if (userClaims.tenantId !== tenantId) {
        throw new https_1.HttpsError('permission-denied', 'Access denied to this tenant');
    }
    try {
        const saleRef = db.collection('sales').doc(saleId);
        const saleDoc = await saleRef.get();
        if (!saleDoc.exists) {
            throw new https_1.HttpsError('not-found', 'Sale not found');
        }
        const saleData = saleDoc.data();
        if ((saleData === null || saleData === void 0 ? void 0 : saleData.tenantId) !== tenantId) {
            throw new https_1.HttpsError('permission-denied', 'Access denied to this sale');
        }
        return Object.assign(Object.assign({ id: saleDoc.id }, saleData), { createdAt: (_a = saleData.createdAt) === null || _a === void 0 ? void 0 : _a.toDate(), updatedAt: (_b = saleData.updatedAt) === null || _b === void 0 ? void 0 : _b.toDate() });
    }
    catch (error) {
        console.error('Error fetching sale:', error);
        throw new https_1.HttpsError('internal', 'Failed to fetch sale');
    }
});
// Create a new sale
exports.createSale = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { tenantId, sale } = request.data;
    const userClaims = request.auth.token;
    if (userClaims.tenantId !== tenantId) {
        throw new https_1.HttpsError('permission-denied', 'Access denied to this tenant');
    }
    try {
        // Start a batch write
        const batch = db.batch();
        // Create the sale document
        const saleRef = db.collection('sales').doc();
        const saleData = Object.assign(Object.assign({}, sale), { tenantId, status: 'completed', createdAt: new Date(), updatedAt: new Date() });
        batch.set(saleRef, saleData);
        // Update vehicle status to sold
        const vehicleRef = db.collection('vehicles').doc(sale.vehicleId);
        batch.update(vehicleRef, {
            status: 'sold',
            updatedAt: new Date(),
        });
        // Update customer's vehicles owned
        const customerRef = db.collection('customers').doc(sale.customerId);
        batch.update(customerRef, {
            vehiclesOwned: firestore_1.FieldValue.arrayUnion(sale.vehicleId),
            updatedAt: new Date(),
        });
        // Create audit log
        const auditLogRef = db.collection('auditLogs').doc();
        const auditLog = {
            tenantId,
            actorUid: request.auth.uid,
            entityType: 'sale',
            entityId: saleRef.id,
            action: 'sale_created',
            diff: {
                vehicleId: sale.vehicleId,
                customerId: sale.customerId,
                salePrice: sale.salePrice,
                deposit: sale.deposit,
                balance: sale.balance,
            },
            timestamp: new Date(),
        };
        batch.set(auditLogRef, auditLog);
        // Commit the batch
        await batch.commit();
        return Object.assign({ id: saleRef.id }, saleData);
    }
    catch (error) {
        console.error('Error creating sale:', error);
        throw new https_1.HttpsError('internal', 'Failed to create sale');
    }
});
// Update a sale
exports.updateSale = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { tenantId, saleId, sale } = request.data;
    const userClaims = request.auth.token;
    if (userClaims.tenantId !== tenantId) {
        throw new https_1.HttpsError('permission-denied', 'Access denied to this tenant');
    }
    try {
        const saleRef = db.collection('sales').doc(saleId);
        const saleDoc = await saleRef.get();
        if (!saleDoc.exists) {
            throw new https_1.HttpsError('not-found', 'Sale not found');
        }
        const existingData = saleDoc.data();
        if ((existingData === null || existingData === void 0 ? void 0 : existingData.tenantId) !== tenantId) {
            throw new https_1.HttpsError('permission-denied', 'Access denied to this sale');
        }
        const updateData = Object.assign(Object.assign({}, sale), { updatedAt: new Date() });
        await saleRef.update(updateData);
        return Object.assign(Object.assign({ id: saleId }, existingData), updateData);
    }
    catch (error) {
        console.error('Error updating sale:', error);
        throw new https_1.HttpsError('internal', 'Failed to update sale');
    }
});
// Delete a sale
exports.deleteSale = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { tenantId, saleId } = request.data;
    const userClaims = request.auth.token;
    if (userClaims.tenantId !== tenantId) {
        throw new https_1.HttpsError('permission-denied', 'Access denied to this tenant');
    }
    try {
        const saleRef = db.collection('sales').doc(saleId);
        const saleDoc = await saleRef.get();
        if (!saleDoc.exists) {
            throw new https_1.HttpsError('not-found', 'Sale not found');
        }
        const saleData = saleDoc.data();
        if ((saleData === null || saleData === void 0 ? void 0 : saleData.tenantId) !== tenantId) {
            throw new https_1.HttpsError('permission-denied', 'Access denied to this sale');
        }
        await saleRef.delete();
        return { success: true };
    }
    catch (error) {
        console.error('Error deleting sale:', error);
        throw new https_1.HttpsError('internal', 'Failed to delete sale');
    }
});
//# sourceMappingURL=sales.js.map
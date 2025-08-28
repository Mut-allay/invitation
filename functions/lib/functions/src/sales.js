"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSale = exports.updateSale = exports.createSale = exports.getSale = exports.getSales = void 0;
const https_1 = require("firebase-functions/v2/https");
const firebase_admin_1 = require("./firebase-admin");
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
        const salesRef = firebase_admin_1.db.collection('sales');
        const snapshot = await salesRef.where('tenantId', '==', tenantId).get();
        const sales = snapshot.docs.map(doc => {
            var _a, _b;
            const data = doc.data();
            return Object.assign(Object.assign({ id: doc.id }, data), { createdAt: (_a = data.createdAt) === null || _a === void 0 ? void 0 : _a.toDate(), updatedAt: (_b = data.updatedAt) === null || _b === void 0 ? void 0 : _b.toDate() });
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
        const saleRef = firebase_admin_1.db.collection('sales').doc(saleId);
        const saleDoc = await saleRef.get();
        if (!saleDoc.exists) {
            throw new https_1.HttpsError('not-found', 'Sale not found');
        }
        const saleData = saleDoc.data();
        if (!saleData || saleData.tenantId !== tenantId) {
            throw new https_1.HttpsError('permission-denied', 'Access denied to this sale');
        }
        return Object.assign(Object.assign({ id: saleDoc.id }, saleData), { createdAt: (_a = saleData.createdAt) === null || _a === void 0 ? void 0 : _a.toDate(), updatedAt: (_b = saleData.updatedAt) === null || _b === void 0 ? void 0 : _b.toDate() });
    }
    catch (error) {
        console.error('Error fetching sale:', error);
        throw new https_1.HttpsError('internal', 'Failed to fetch sale');
    }
});
const rate_limiter_1 = require("./rate-limiter");
// Create a new sale
exports.createSale = (0, https_1.onCall)(async (request) => {
    var _a, _b, _c, _d;
    if (!request.auth || !request.rawRequest.ip) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated and have an IP address.');
    }
    await (0, rate_limiter_1.checkRateLimit)(request.rawRequest.ip);
    const { tenantId, sale } = request.data;
    const userClaims = request.auth.token;
    if (userClaims.tenantId !== tenantId) {
        throw new https_1.HttpsError('permission-denied', 'Access denied to this tenant');
    }
    try {
        const saleData = Object.assign(Object.assign({}, sale), { tenantId, createdAt: new Date(), updatedAt: new Date() });
        const saleRef = await firebase_admin_1.db.collection('sales').add(saleData);
        const newSaleDoc = await saleRef.get();
        return Object.assign(Object.assign({ id: saleRef.id }, newSaleDoc.data()), { createdAt: (_b = (_a = newSaleDoc.data()) === null || _a === void 0 ? void 0 : _a.createdAt) === null || _b === void 0 ? void 0 : _b.toDate(), updatedAt: (_d = (_c = newSaleDoc.data()) === null || _c === void 0 ? void 0 : _c.updatedAt) === null || _d === void 0 ? void 0 : _d.toDate() });
    }
    catch (error) {
        console.error('Error creating sale:', error);
        if (error instanceof https_1.HttpsError) {
            throw error;
        }
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
        const saleRef = firebase_admin_1.db.collection('sales').doc(saleId);
        const saleDoc = await saleRef.get();
        if (!saleDoc.exists) {
            throw new https_1.HttpsError('not-found', 'Sale not found');
        }
        const existingData = saleDoc.data();
        if (!existingData || existingData.tenantId !== tenantId) {
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
        const saleRef = firebase_admin_1.db.collection('sales').doc(saleId);
        const saleDoc = await saleRef.get();
        if (!saleDoc.exists) {
            throw new https_1.HttpsError('not-found', 'Sale not found');
        }
        const saleData = saleDoc.data();
        if (!saleData || saleData.tenantId !== tenantId) {
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
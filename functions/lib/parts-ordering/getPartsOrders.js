"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPartsOrders = void 0;
exports.getPartsOrdersLogic = getPartsOrdersLogic;
const firestore_1 = require("firebase-admin/firestore");
const https_1 = require("firebase-functions/v2/https");
const db = (0, firestore_1.getFirestore)();
// --- 1. Manual Validation Function ---
const validateGetOrdersData = (data) => {
    if (!data || typeof data.tenantId !== 'string' || data.tenantId.length === 0) {
        throw new https_1.HttpsError('invalid-argument', 'A valid tenantId is required.');
    }
    return data;
};
// --- 2. Core Business Logic ---
async function getPartsOrdersLogic(request) {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'You must be logged in to view orders.');
    }
    const { tenantId } = validateGetOrdersData(request.data);
    if (request.auth.token.tenantId !== tenantId) {
        throw new https_1.HttpsError('permission-denied', 'You are not authorized to view orders for this tenant.');
    }
    const ordersSnapshot = await db.collection('partsOrders')
        .where('tenantId', '==', tenantId)
        .orderBy('orderDate', 'desc')
        .get();
    const orders = await Promise.all(ordersSnapshot.docs.map(async (doc) => {
        const orderData = doc.data();
        const itemsSnapshot = await doc.ref.collection('orderItems').get();
        const items = itemsSnapshot.docs.map(itemDoc => (Object.assign({ id: itemDoc.id }, itemDoc.data())));
        return Object.assign(Object.assign({ id: doc.id }, orderData), { items });
    }));
    return { orders };
}
// --- 3. Thin Firebase Wrapper ---
exports.getPartsOrders = (0, https_1.onCall)(getPartsOrdersLogic);
//# sourceMappingURL=getPartsOrders.js.map
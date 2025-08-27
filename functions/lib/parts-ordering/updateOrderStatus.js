"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatus = void 0;
exports.updateOrderStatusLogic = updateOrderStatusLogic;
const firestore_1 = require("firebase-admin/firestore");
const https_1 = require("firebase-functions/v2/https");
const db = (0, firestore_1.getFirestore)();
// --- 1. Manual Validation Function ---
const validateUpdateStatusData = (data) => {
    if (!data) {
        throw new https_1.HttpsError('invalid-argument', 'Request data is missing.');
    }
    if (typeof data.tenantId !== 'string' || data.tenantId.length === 0) {
        throw new https_1.HttpsError('invalid-argument', 'A valid tenantId is required.');
    }
    if (typeof data.orderId !== 'string' || data.orderId.length === 0) {
        throw new https_1.HttpsError('invalid-argument', 'A valid orderId is required.');
    }
    const validStatuses = ['pending', 'confirmed', 'delivered', 'cancelled'];
    if (typeof data.status !== 'string' || !validStatuses.includes(data.status)) {
        throw new https_1.HttpsError('invalid-argument', 'A valid status is required.');
    }
    return data;
};
// --- 2. Core Business Logic ---
async function updateOrderStatusLogic(request) {
    var _a;
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'You must be logged in to update an order.');
    }
    const { tenantId, orderId, status, notes } = validateUpdateStatusData(request.data);
    if (request.auth.token.tenantId !== tenantId) {
        throw new https_1.HttpsError('permission-denied', 'You are not authorized to update orders for this tenant.');
    }
    const orderRef = db.collection('partsOrders').doc(orderId);
    const orderDoc = await orderRef.get();
    if (!orderDoc.exists || ((_a = orderDoc.data()) === null || _a === void 0 ? void 0 : _a.tenantId) !== tenantId) {
        throw new https_1.HttpsError('not-found', 'The specified order was not found.');
    }
    const updateData = {
        status,
        updatedAt: firestore_1.Timestamp.now(),
    };
    if (notes) {
        updateData.notes = notes;
    }
    await orderRef.update(updateData);
    return { status: 'success', message: 'Order status updated successfully.' };
}
// --- 3. Thin Firebase Wrapper ---
exports.updateOrderStatus = (0, https_1.onCall)(updateOrderStatusLogic);
//# sourceMappingURL=updateOrderStatus.js.map
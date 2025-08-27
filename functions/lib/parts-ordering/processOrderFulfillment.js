"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processOrderFulfillment = void 0;
exports.processOrderFulfillmentLogic = processOrderFulfillmentLogic;
const firestore_1 = require("firebase-admin/firestore");
const https_1 = require("firebase-functions/v2/https");
const db = (0, firestore_1.getFirestore)();
// --- 1. Manual Validation Function ---
const validateFulfillmentData = (data) => {
    if (!data) {
        throw new https_1.HttpsError('invalid-argument', 'Request data is missing.');
    }
    if (typeof data.tenantId !== 'string' || data.tenantId.length === 0) {
        throw new https_1.HttpsError('invalid-argument', 'A valid tenantId is required.');
    }
    if (typeof data.orderId !== 'string' || data.orderId.length === 0) {
        throw new https_1.HttpsError('invalid-argument', 'A valid orderId is required.');
    }
    return data;
};
// --- 2. Core Business Logic ---
async function processOrderFulfillmentLogic(request) {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'You must be logged in to fulfill an order.');
    }
    const { tenantId, orderId } = validateFulfillmentData(request.data);
    if (request.auth.token.tenantId !== tenantId) {
        throw new https_1.HttpsError('permission-denied', 'You are not authorized to fulfill orders for this tenant.');
    }
    const orderRef = db.collection('partsOrders').doc(orderId);
    await db.runTransaction(async (transaction) => {
        var _a;
        const orderDoc = await transaction.get(orderRef);
        if (!orderDoc.exists || ((_a = orderDoc.data()) === null || _a === void 0 ? void 0 : _a.tenantId) !== tenantId) {
            throw new https_1.HttpsError('not-found', 'The specified order was not found.');
        }
        const orderData = orderDoc.data();
        if ((orderData === null || orderData === void 0 ? void 0 : orderData.status) === 'delivered') {
            throw new https_1.HttpsError('failed-precondition', 'This order has already been delivered.');
        }
        if ((orderData === null || orderData === void 0 ? void 0 : orderData.status) === 'cancelled') {
            throw new https_1.HttpsError('failed-precondition', 'Cannot fulfill a cancelled order.');
        }
        // For Phase 1, we just update the status.
        transaction.update(orderRef, {
            status: 'delivered',
            updatedAt: firestore_1.Timestamp.now(),
        });
    });
    return { status: 'success', message: 'Order fulfilled successfully.' };
}
// --- 3. Thin Firebase Wrapper ---
exports.processOrderFulfillment = (0, https_1.onCall)(processOrderFulfillmentLogic);
//# sourceMappingURL=processOrderFulfillment.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPartsOrder = void 0;
exports.createPartsOrderLogic = createPartsOrderLogic;
const firestore_1 = require("firebase-admin/firestore");
const https_1 = require("firebase-functions/v2/https");
const db = (0, firestore_1.getFirestore)();
// --- 1. Manual Validation Function ---
const validateCreateOrderData = (data) => {
    if (!data) {
        throw new https_1.HttpsError('invalid-argument', 'Request data is missing.');
    }
    // Validate top-level fields
    if (typeof data.tenantId !== 'string' || data.tenantId.length === 0) {
        throw new https_1.HttpsError('invalid-argument', 'A valid tenantId is required.');
    }
    if (typeof data.supplierName !== 'string' || data.supplierName.length < 2) {
        throw new https_1.HttpsError('invalid-argument', 'Supplier name must be at least 2 characters long.');
    }
    if (!Array.isArray(data.items) || data.items.length === 0) {
        throw new https_1.HttpsError('invalid-argument', 'An order must contain at least one item.');
    }
    // Validate each item in the array
    for (const item of data.items) {
        if (typeof item.partName !== 'string' || item.partName.length < 3) {
            throw new https_1.HttpsError('invalid-argument', 'Each part name must be at least 3 characters long.');
        }
        if (typeof item.qty !== 'number' || !Number.isInteger(item.qty) || item.qty <= 0) {
            throw new https_1.HttpsError('invalid-argument', `Quantity for '${item.partName}' must be a positive integer.`);
        }
        if (typeof item.unitPrice !== 'number' || item.unitPrice < 0) {
            throw new https_1.HttpsError('invalid-argument', `Unit price for '${item.partName}' cannot be negative.`);
        }
    }
    // Return the validated data if all checks pass
    return data;
};
// --- 2. Core Business Logic (Using Manual Validation) ---
async function createPartsOrderLogic(request) {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'You must be logged in to create an order.');
    }
    // Input Validation using our manual function
    const { tenantId, supplierName, notes, items } = validateCreateOrderData(request.data);
    if (request.auth.token.tenantId !== tenantId) {
        throw new https_1.HttpsError('permission-denied', 'You are not authorized to perform this action for the specified tenant.');
    }
    const totalAmount = items.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0);
    const newOrder = {
        tenantId,
        supplierName,
        notes: notes || '',
        totalAmount,
        status: 'pending',
        orderDate: firestore_1.Timestamp.now(),
        updatedAt: firestore_1.Timestamp.now(),
        createdBy: request.auth.uid,
        itemCount: items.length,
    };
    const batch = db.batch();
    const orderRef = db.collection('partsOrders').doc();
    batch.set(orderRef, newOrder);
    items.forEach((item) => {
        const itemRef = orderRef.collection('orderItems').doc();
        batch.set(itemRef, {
            partName: item.partName,
            qty: item.qty,
            unitPrice: item.unitPrice,
            totalPrice: item.qty * item.unitPrice,
        });
    });
    await batch.commit();
    return { status: 'success', orderId: orderRef.id, message: 'Order created successfully.' };
}
// --- 3. Thin Firebase Wrapper (Unchanged) ---
exports.createPartsOrder = (0, https_1.onCall)(createPartsOrderLogic);
//# sourceMappingURL=createPartsOrder.js.map
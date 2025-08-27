"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePartsOrder = void 0;
const https_1 = require("firebase-functions/v2/https");
const firebase_functions_1 = require("firebase-functions");
const firestore_1 = require("firebase-admin/firestore");
const db = (0, firestore_1.getFirestore)();
exports.deletePartsOrder = (0, https_1.onCall)(async (request) => {
    try {
        const { tenantId, orderId } = request.data;
        if (!tenantId || !orderId) {
            throw new Error('Missing required parameters: tenantId and orderId');
        }
        firebase_functions_1.logger.info(`Deleting parts order ${orderId} for tenant ${tenantId}`);
        // Delete the order document
        const orderRef = db.collection('tenants').doc(tenantId).collection('partsOrders').doc(orderId);
        await orderRef.delete();
        // Delete all order items
        const itemsRef = db.collection('tenants').doc(tenantId).collection('partsOrders').doc(orderId).collection('items');
        const itemsSnapshot = await itemsRef.get();
        const deletePromises = itemsSnapshot.docs.map(doc => doc.ref.delete());
        await Promise.all(deletePromises);
        firebase_functions_1.logger.info(`Successfully deleted parts order ${orderId} and all its items`);
        return {
            success: true,
            message: 'Parts order deleted successfully'
        };
    }
    catch (error) {
        firebase_functions_1.logger.error('Error deleting parts order:', error);
        throw new Error(`Failed to delete parts order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
});
//# sourceMappingURL=deletePartsOrder.js.map
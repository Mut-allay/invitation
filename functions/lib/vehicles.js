"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onVehicleStatusUpdate = exports.deleteVehicle = exports.updateVehicle = exports.createVehicle = exports.getVehicle = exports.getVehicles = void 0;
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-functions/v2/firestore");
const firestore_2 = require("firebase-admin/firestore");
const app_1 = require("firebase-admin/app");
// Initialize Firebase Admin
(0, app_1.initializeApp)();
const db = (0, firestore_2.getFirestore)();
// Get vehicles for a tenant
exports.getVehicles = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { tenantId } = request.data;
    const userClaims = request.auth.token;
    // Verify user belongs to the tenant
    if (userClaims.tenantId !== tenantId) {
        throw new https_1.HttpsError('permission-denied', 'Access denied to this tenant');
    }
    try {
        const vehiclesRef = db.collection('vehicles');
        const snapshot = await vehiclesRef.where('tenantId', '==', tenantId).get();
        const vehicles = snapshot.docs.map(doc => {
            var _a, _b;
            return (Object.assign(Object.assign({ id: doc.id }, doc.data()), { createdAt: (_a = doc.data().createdAt) === null || _a === void 0 ? void 0 : _a.toDate(), updatedAt: (_b = doc.data().updatedAt) === null || _b === void 0 ? void 0 : _b.toDate() }));
        });
        return { vehicles };
    }
    catch (error) {
        console.error('Error fetching vehicles:', error);
        throw new https_1.HttpsError('internal', 'Failed to fetch vehicles');
    }
});
// Get a single vehicle
exports.getVehicle = (0, https_1.onCall)(async (request) => {
    var _a, _b;
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { tenantId, vehicleId } = request.data;
    const userClaims = request.auth.token;
    if (userClaims.tenantId !== tenantId) {
        throw new https_1.HttpsError('permission-denied', 'Access denied to this tenant');
    }
    try {
        const vehicleRef = db.collection('vehicles').doc(vehicleId);
        const vehicleDoc = await vehicleRef.get();
        if (!vehicleDoc.exists) {
            throw new https_1.HttpsError('not-found', 'Vehicle not found');
        }
        const vehicleData = vehicleDoc.data();
        if ((vehicleData === null || vehicleData === void 0 ? void 0 : vehicleData.tenantId) !== tenantId) {
            throw new https_1.HttpsError('permission-denied', 'Access denied to this vehicle');
        }
        return Object.assign(Object.assign({ id: vehicleDoc.id }, vehicleData), { createdAt: (_a = vehicleData.createdAt) === null || _a === void 0 ? void 0 : _a.toDate(), updatedAt: (_b = vehicleData.updatedAt) === null || _b === void 0 ? void 0 : _b.toDate() });
    }
    catch (error) {
        console.error('Error fetching vehicle:', error);
        throw new https_1.HttpsError('internal', 'Failed to fetch vehicle');
    }
});
// Create a new vehicle
exports.createVehicle = (0, https_1.onCall)(async (request) => {
    var _a;
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { tenantId, vehicle } = request.data;
    const userClaims = request.auth.token;
    if (userClaims.tenantId !== tenantId) {
        throw new https_1.HttpsError('permission-denied', 'Access denied to this tenant');
    }
    // Check permissions from custom claims
    if (!((_a = userClaims.permissions) === null || _a === void 0 ? void 0 : _a.includes('create_vehicle'))) {
        throw new https_1.HttpsError('permission-denied', 'Insufficient permissions');
    }
    try {
        const vehicleData = Object.assign(Object.assign({}, vehicle), { tenantId, createdAt: new Date(), updatedAt: new Date() });
        const vehicleRef = await db.collection('vehicles').add(vehicleData);
        return Object.assign({ id: vehicleRef.id }, vehicleData);
    }
    catch (error) {
        console.error('Error creating vehicle:', error);
        throw new https_1.HttpsError('internal', 'Failed to create vehicle');
    }
});
// Update a vehicle
exports.updateVehicle = (0, https_1.onCall)(async (request) => {
    var _a;
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { tenantId, vehicleId, vehicle } = request.data;
    const userClaims = request.auth.token;
    if (userClaims.tenantId !== tenantId) {
        throw new https_1.HttpsError('permission-denied', 'Access denied to this tenant');
    }
    if (!((_a = userClaims.permissions) === null || _a === void 0 ? void 0 : _a.includes('update_vehicle'))) {
        throw new https_1.HttpsError('permission-denied', 'Insufficient permissions');
    }
    try {
        const vehicleRef = db.collection('vehicles').doc(vehicleId);
        const vehicleDoc = await vehicleRef.get();
        if (!vehicleDoc.exists) {
            throw new https_1.HttpsError('not-found', 'Vehicle not found');
        }
        const existingData = vehicleDoc.data();
        if ((existingData === null || existingData === void 0 ? void 0 : existingData.tenantId) !== tenantId) {
            throw new https_1.HttpsError('permission-denied', 'Access denied to this vehicle');
        }
        const updateData = Object.assign(Object.assign({}, vehicle), { updatedAt: new Date() });
        await vehicleRef.update(updateData);
        return Object.assign(Object.assign({ id: vehicleId }, existingData), updateData);
    }
    catch (error) {
        console.error('Error updating vehicle:', error);
        throw new https_1.HttpsError('internal', 'Failed to update vehicle');
    }
});
// Delete a vehicle
exports.deleteVehicle = (0, https_1.onCall)(async (request) => {
    var _a;
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { tenantId, vehicleId } = request.data;
    const userClaims = request.auth.token;
    if (userClaims.tenantId !== tenantId) {
        throw new https_1.HttpsError('permission-denied', 'Access denied to this tenant');
    }
    if (!((_a = userClaims.permissions) === null || _a === void 0 ? void 0 : _a.includes('delete_vehicle'))) {
        throw new https_1.HttpsError('permission-denied', 'Insufficient permissions');
    }
    try {
        const vehicleRef = db.collection('vehicles').doc(vehicleId);
        const vehicleDoc = await vehicleRef.get();
        if (!vehicleDoc.exists) {
            throw new https_1.HttpsError('not-found', 'Vehicle not found');
        }
        const vehicleData = vehicleDoc.data();
        if ((vehicleData === null || vehicleData === void 0 ? void 0 : vehicleData.tenantId) !== tenantId) {
            throw new https_1.HttpsError('permission-denied', 'Access denied to this vehicle');
        }
        await vehicleRef.delete();
        return { success: true };
    }
    catch (error) {
        console.error('Error deleting vehicle:', error);
        throw new https_1.HttpsError('internal', 'Failed to delete vehicle');
    }
});
// Trigger: Update vehicle status when sold
exports.onVehicleStatusUpdate = (0, firestore_1.onDocumentUpdated)('vehicles/{vehicleId}', async (event) => {
    var _a, _b;
    const beforeData = (_a = event.data) === null || _a === void 0 ? void 0 : _a.before.data();
    const afterData = (_b = event.data) === null || _b === void 0 ? void 0 : _b.after.data();
    if ((beforeData === null || beforeData === void 0 ? void 0 : beforeData.status) !== 'sold' && (afterData === null || afterData === void 0 ? void 0 : afterData.status) === 'sold') {
        // Vehicle was just sold, create audit log
        const auditLog = {
            tenantId: afterData.tenantId,
            actorUid: 'system', // Or capture the user who made the change if available
            entityType: 'vehicle',
            entityId: event.params.vehicleId,
            action: 'vehicle_sold',
            diff: {
                status: { from: beforeData === null || beforeData === void 0 ? void 0 : beforeData.status, to: 'sold' }
            },
            timestamp: new Date(),
        };
        await db.collection('auditLogs').add(auditLog);
        console.log(`Vehicle ${event.params.vehicleId} marked as sold and logged.`);
    }
});
//# sourceMappingURL=vehicles.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onVehicleUpdated = exports.deleteVehicle = exports.updateVehicle = exports.createVehicle = exports.getVehicle = exports.getVehicles = void 0;
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-functions/v2/firestore");
const firebase_admin_1 = require("./firebase-admin");
// Get vehicles for a tenant
exports.getVehicles = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { tenantId } = request.data;
    const userClaims = request.auth.token;
    if (userClaims.tenantId !== tenantId) {
        throw new https_1.HttpsError('permission-denied', 'Access denied to this tenant');
    }
    try {
        const vehiclesRef = firebase_admin_1.db.collection('vehicles');
        const snapshot = await vehiclesRef.where('tenantId', '==', tenantId).get();
        const vehicles = snapshot.docs.map(doc => {
            var _a, _b;
            const data = doc.data();
            return Object.assign(Object.assign({ id: doc.id }, data), { createdAt: (_a = data.createdAt) === null || _a === void 0 ? void 0 : _a.toDate(), updatedAt: (_b = data.updatedAt) === null || _b === void 0 ? void 0 : _b.toDate() });
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
        const vehicleRef = firebase_admin_1.db.collection('vehicles').doc(vehicleId);
        const vehicleDoc = await vehicleRef.get();
        if (!vehicleDoc.exists) {
            throw new https_1.HttpsError('not-found', 'Vehicle not found');
        }
        const vehicleData = vehicleDoc.data();
        if (!vehicleData || vehicleData.tenantId !== tenantId) {
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
    var _a, _b, _c, _d;
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { tenantId, vehicle } = request.data;
    const userClaims = request.auth.token;
    if (userClaims.tenantId !== tenantId) {
        throw new https_1.HttpsError('permission-denied', 'Access denied to this tenant');
    }
    try {
        const vehicleData = Object.assign(Object.assign({}, vehicle), { tenantId, createdAt: new Date(), updatedAt: new Date() });
        const vehicleRef = await firebase_admin_1.db.collection('vehicles').add(vehicleData);
        const newVehicleDoc = await vehicleRef.get();
        return Object.assign(Object.assign({ id: vehicleRef.id }, newVehicleDoc.data()), { createdAt: (_b = (_a = newVehicleDoc.data()) === null || _a === void 0 ? void 0 : _a.createdAt) === null || _b === void 0 ? void 0 : _b.toDate(), updatedAt: (_d = (_c = newVehicleDoc.data()) === null || _c === void 0 ? void 0 : _c.updatedAt) === null || _d === void 0 ? void 0 : _d.toDate() });
    }
    catch (error) {
        console.error('Error creating vehicle:', error);
        throw new https_1.HttpsError('internal', 'Failed to create vehicle');
    }
});
// Update a vehicle
exports.updateVehicle = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { tenantId, vehicleId, vehicle } = request.data;
    const userClaims = request.auth.token;
    if (userClaims.tenantId !== tenantId) {
        throw new https_1.HttpsError('permission-denied', 'Access denied to this tenant');
    }
    try {
        const vehicleRef = firebase_admin_1.db.collection('vehicles').doc(vehicleId);
        const vehicleDoc = await vehicleRef.get();
        if (!vehicleDoc.exists) {
            throw new https_1.HttpsError('not-found', 'Vehicle not found');
        }
        const existingData = vehicleDoc.data();
        if (!existingData || existingData.tenantId !== tenantId) {
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
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { tenantId, vehicleId } = request.data;
    const userClaims = request.auth.token;
    if (userClaims.tenantId !== tenantId) {
        throw new https_1.HttpsError('permission-denied', 'Access denied to this tenant');
    }
    try {
        const vehicleRef = firebase_admin_1.db.collection('vehicles').doc(vehicleId);
        const vehicleDoc = await vehicleRef.get();
        if (!vehicleDoc.exists) {
            throw new https_1.HttpsError('not-found', 'Vehicle not found');
        }
        const vehicleData = vehicleDoc.data();
        if (!vehicleData || vehicleData.tenantId !== tenantId) {
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
// Firestore trigger for vehicle updates
exports.onVehicleUpdated = (0, firestore_1.onDocumentUpdated)('vehicles/{vehicleId}', async (event) => {
    var _a, _b;
    const vehicleId = event.params.vehicleId;
    const beforeData = (_a = event.data) === null || _a === void 0 ? void 0 : _a.before.data();
    const afterData = (_b = event.data) === null || _b === void 0 ? void 0 : _b.after.data();
    if (!beforeData || !afterData) {
        console.log('No data available for vehicle update trigger');
        return;
    }
    // Log the vehicle update
    console.log(`Vehicle ${vehicleId} updated:`, {
        before: beforeData,
        after: afterData,
    });
    // You can add additional logic here, such as:
    // - Updating related documents
    // - Sending notifications
    // - Creating audit logs
    // - Triggering workflows
});
//# sourceMappingURL=vehicles.js.map
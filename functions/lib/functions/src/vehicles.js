"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.onVehicleUpdated = exports.deleteVehicle = exports.updateVehicle = exports.createVehicle = exports.getVehicle = exports.getVehicles = void 0;
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-functions/v2/firestore");
const v1_1 = require("firebase-functions/v1");
const admin = __importStar(require("firebase-admin"));
// Initialize Firebase Admin if not already initialized
if (admin.apps.length === 0) {
    admin.initializeApp();
}
const db = admin.firestore();
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
        const vehiclesRef = db.collection('vehicles');
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
        const vehicleRef = db.collection('vehicles').doc(vehicleId);
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
        const vehicleRef = await db.collection('vehicles').add(vehicleData);
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
        const vehicleRef = db.collection('vehicles').doc(vehicleId);
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
        const vehicleRef = db.collection('vehicles').doc(vehicleId);
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
        v1_1.logger.warn('No vehicle data found for update:', vehicleId);
        return;
    }
    // Log the update for audit purposes
    v1_1.logger.info(`Vehicle ${vehicleId} updated:`, {
        before: beforeData,
        after: afterData,
    });
});
//# sourceMappingURL=vehicles.js.map
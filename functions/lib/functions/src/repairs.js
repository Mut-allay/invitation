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
exports.createJobCard = exports.getJobCards = exports.deleteRepair = exports.updateRepair = exports.createRepair = exports.getRepair = exports.getRepairs = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
// Initialize Firebase Admin if not already initialized
if (admin.apps.length === 0) {
    admin.initializeApp();
}
const db = admin.firestore();
// Get repairs for a tenant
exports.getRepairs = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { tenantId } = request.data;
    const userClaims = request.auth.token;
    if (userClaims.tenantId !== tenantId) {
        throw new https_1.HttpsError('permission-denied', 'Access denied to this tenant');
    }
    try {
        const repairsRef = db.collection('repairs');
        const snapshot = await repairsRef.where('tenantId', '==', tenantId).get();
        const repairs = snapshot.docs.map(doc => {
            var _a, _b, _c, _d, _e;
            const data = doc.data();
            return Object.assign(Object.assign({ id: doc.id }, data), { createdAt: (_a = data.createdAt) === null || _a === void 0 ? void 0 : _a.toDate(), updatedAt: (_b = data.updatedAt) === null || _b === void 0 ? void 0 : _b.toDate(), estimatedCompletion: (_c = data.estimatedCompletion) === null || _c === void 0 ? void 0 : _c.toDate(), actualCompletion: (_d = data.actualCompletion) === null || _d === void 0 ? void 0 : _d.toDate(), closedAt: (_e = data.closedAt) === null || _e === void 0 ? void 0 : _e.toDate() });
        });
        return { repairs };
    }
    catch (error) {
        console.error('Error fetching repairs:', error);
        throw new https_1.HttpsError('internal', 'Failed to fetch repairs');
    }
});
// Get a single repair
exports.getRepair = (0, https_1.onCall)(async (request) => {
    var _a, _b, _c, _d, _e;
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { tenantId, repairId } = request.data;
    const userClaims = request.auth.token;
    if (userClaims.tenantId !== tenantId) {
        throw new https_1.HttpsError('permission-denied', 'Access denied to this tenant');
    }
    try {
        const repairRef = db.collection('repairs').doc(repairId);
        const repairDoc = await repairRef.get();
        if (!repairDoc.exists) {
            throw new https_1.HttpsError('not-found', 'Repair not found');
        }
        const repairData = repairDoc.data();
        if (!repairData || repairData.tenantId !== tenantId) {
            throw new https_1.HttpsError('permission-denied', 'Access denied to this repair');
        }
        return Object.assign(Object.assign({ id: repairDoc.id }, repairData), { createdAt: (_a = repairData.createdAt) === null || _a === void 0 ? void 0 : _a.toDate(), updatedAt: (_b = repairData.updatedAt) === null || _b === void 0 ? void 0 : _b.toDate(), estimatedCompletion: (_c = repairData.estimatedCompletion) === null || _c === void 0 ? void 0 : _c.toDate(), actualCompletion: (_d = repairData.actualCompletion) === null || _d === void 0 ? void 0 : _d.toDate(), closedAt: (_e = repairData.closedAt) === null || _e === void 0 ? void 0 : _e.toDate() });
    }
    catch (error) {
        console.error('Error fetching repair:', error);
        throw new https_1.HttpsError('internal', 'Failed to fetch repair');
    }
});
// Create a new repair
exports.createRepair = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { tenantId, repair } = request.data;
    const userClaims = request.auth.token;
    if (userClaims.tenantId !== tenantId) {
        throw new https_1.HttpsError('permission-denied', 'Access denied to this tenant');
    }
    try {
        const repairData = Object.assign(Object.assign({}, repair), { tenantId, status: 'pending', totalCost: 0, laborCost: 0, partsCost: 0, createdAt: new Date(), updatedAt: new Date() });
        const repairRef = await db.collection('repairs').add(repairData);
        return Object.assign({ id: repairRef.id }, repairData);
    }
    catch (error) {
        console.error('Error creating repair:', error);
        throw new https_1.HttpsError('internal', 'Failed to create repair');
    }
});
// Update a repair
exports.updateRepair = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { tenantId, repairId, repair } = request.data;
    const userClaims = request.auth.token;
    if (userClaims.tenantId !== tenantId) {
        throw new https_1.HttpsError('permission-denied', 'Access denied to this tenant');
    }
    try {
        const repairRef = db.collection('repairs').doc(repairId);
        const repairDoc = await repairRef.get();
        if (!repairDoc.exists) {
            throw new https_1.HttpsError('not-found', 'Repair not found');
        }
        const existingData = repairDoc.data();
        if (!existingData || existingData.tenantId !== tenantId) {
            throw new https_1.HttpsError('permission-denied', 'Access denied to this repair');
        }
        const updateData = Object.assign(Object.assign({}, repair), { updatedAt: new Date() });
        // If status is being updated to completed, set closedAt
        if (repair.status === 'completed' && existingData.status !== 'completed') {
            updateData.closedAt = new Date();
            updateData.actualCompletion = new Date();
        }
        await repairRef.update(updateData);
        return Object.assign(Object.assign({ id: repairId }, existingData), updateData);
    }
    catch (error) {
        console.error('Error updating repair:', error);
        throw new https_1.HttpsError('internal', 'Failed to update repair');
    }
});
// Delete a repair
exports.deleteRepair = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { tenantId, repairId } = request.data;
    const userClaims = request.auth.token;
    if (userClaims.tenantId !== tenantId) {
        throw new https_1.HttpsError('permission-denied', 'Access denied to this tenant');
    }
    try {
        const repairRef = db.collection('repairs').doc(repairId);
        const repairDoc = await repairRef.get();
        if (!repairDoc.exists) {
            throw new https_1.HttpsError('not-found', 'Repair not found');
        }
        const repairData = repairDoc.data();
        if ((repairData === null || repairData === void 0 ? void 0 : repairData.tenantId) !== tenantId) {
            throw new https_1.HttpsError('permission-denied', 'Access denied to this repair');
        }
        await repairRef.delete();
        return { success: true };
    }
    catch (error) {
        console.error('Error deleting repair:', error);
        throw new https_1.HttpsError('internal', 'Failed to delete repair');
    }
});
// Get job cards for a repair
exports.getJobCards = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { tenantId, repairId } = request.data;
    const userClaims = request.auth.token;
    if (userClaims.tenantId !== tenantId) {
        throw new https_1.HttpsError('permission-denied', 'Access denied to this tenant');
    }
    try {
        const jobCardsRef = db.collection('repairs').doc(repairId).collection('jobCards');
        const snapshot = await jobCardsRef.get();
        const jobCards = snapshot.docs.map(doc => {
            var _a, _b;
            const data = doc.data();
            return Object.assign(Object.assign({ id: doc.id }, data), { createdAt: (_a = data.createdAt) === null || _a === void 0 ? void 0 : _a.toDate(), updatedAt: (_b = data.updatedAt) === null || _b === void 0 ? void 0 : _b.toDate() });
        });
        return { jobCards };
    }
    catch (error) {
        console.error('Error fetching job cards:', error);
        throw new https_1.HttpsError('internal', 'Failed to fetch job cards');
    }
});
// Create a job card
exports.createJobCard = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { tenantId, repairId, jobCard } = request.data;
    const userClaims = request.auth.token;
    if (userClaims.tenantId !== tenantId) {
        throw new https_1.HttpsError('permission-denied', 'Access denied to this tenant');
    }
    try {
        const jobCardData = Object.assign(Object.assign({}, jobCard), { repairId, status: 'pending', totalLabor: jobCard.estimatedHours * jobCard.rate, createdAt: new Date(), updatedAt: new Date() });
        const jobCardRef = await db.collection('repairs').doc(repairId).collection('jobCards').add(jobCardData);
        // Update repair status to in_progress if it was pending
        const repairRef = db.collection('repairs').doc(repairId);
        await repairRef.update({
            status: 'in_progress',
            updatedAt: new Date(),
        });
        return Object.assign({ id: jobCardRef.id }, jobCardData);
    }
    catch (error) {
        console.error('Error creating job card:', error);
        throw new https_1.HttpsError('internal', 'Failed to create job card');
    }
});
//# sourceMappingURL=repairs.js.map
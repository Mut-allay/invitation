"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createJobCard = exports.getJobCards = exports.deleteRepair = exports.updateRepair = exports.createRepair = exports.getRepair = exports.getRepairs = void 0;
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-admin/firestore");
const app_1 = require("firebase-admin/app");
// Initialize Firebase Admin
(0, app_1.initializeApp)();
const db = (0, firestore_1.getFirestore)();
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
            return (Object.assign(Object.assign({ id: doc.id }, doc.data()), { createdAt: (_a = doc.data().createdAt) === null || _a === void 0 ? void 0 : _a.toDate(), updatedAt: (_b = doc.data().updatedAt) === null || _b === void 0 ? void 0 : _b.toDate(), estimatedCompletion: (_c = doc.data().estimatedCompletion) === null || _c === void 0 ? void 0 : _c.toDate(), actualCompletion: (_d = doc.data().actualCompletion) === null || _d === void 0 ? void 0 : _d.toDate(), closedAt: (_e = doc.data().closedAt) === null || _e === void 0 ? void 0 : _e.toDate() }));
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
        if ((repairData === null || repairData === void 0 ? void 0 : repairData.tenantId) !== tenantId) {
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
        if ((existingData === null || existingData === void 0 ? void 0 : existingData.tenantId) !== tenantId) {
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
            return (Object.assign(Object.assign({ id: doc.id }, doc.data()), { createdAt: (_a = doc.data().createdAt) === null || _a === void 0 ? void 0 : _a.toDate(), updatedAt: (_b = doc.data().updatedAt) === null || _b === void 0 ? void 0 : _b.toDate() }));
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
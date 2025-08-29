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
exports.getSignedUrl = exports.deleteFile = exports.getUploadedFiles = exports.uploadFile = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
// Initialize Firebase Admin if not already initialized
if (admin.apps.length === 0) {
    admin.initializeApp();
}
const storage = admin.storage();
const db = admin.firestore();
const bucket = storage.bucket();
// Upload a file
exports.uploadFile = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { tenantId, file, metadata } = request.data;
    const userClaims = request.auth.token;
    if (userClaims.tenantId !== tenantId) {
        throw new https_1.HttpsError('permission-denied', 'Access denied to this tenant');
    }
    try {
        // Generate a unique filename
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const fileExtension = file.name.split('.').pop();
        const fileName = `${tenantId}/${timestamp}_${randomString}.${fileExtension}`;
        // Upload to Firebase Storage
        const fileBuffer = Buffer.from(file.data, 'base64');
        const storageFile = bucket.file(fileName);
        await storageFile.save(fileBuffer, {
            metadata: {
                contentType: file.type,
                metadata: Object.assign(Object.assign({}, metadata), { uploadedBy: request.auth.uid, tenantId }),
            },
        });
        // Save file metadata to Firestore
        const fileData = {
            tenantId,
            fileName: file.name,
            path: fileName,
            size: file.size,
            type: file.type,
            uploadedBy: request.auth.uid,
            metadata: metadata || {},
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const fileRef = await db.collection('files').add(fileData);
        return {
            id: fileRef.id,
            fileName: file.name,
            path: fileName,
            size: file.size,
            type: file.type,
            downloadUrl: await storageFile.getSignedUrl({
                action: 'read',
                expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
            }),
        };
    }
    catch (error) {
        console.error('Error uploading file:', error);
        throw new https_1.HttpsError('internal', 'Failed to upload file');
    }
});
// Get uploaded files for a tenant
exports.getUploadedFiles = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { tenantId, type, itemId } = request.data;
    const userClaims = request.auth.token;
    if (userClaims.tenantId !== tenantId) {
        throw new https_1.HttpsError('permission-denied', 'Access denied to this tenant');
    }
    try {
        let query = db.collection('files').where('tenantId', '==', tenantId);
        if (type) {
            query = query.where('type', '==', type);
        }
        if (itemId) {
            query = query.where('metadata.itemId', '==', itemId);
        }
        const snapshot = await query.get();
        const files = await Promise.all(snapshot.docs.map(async (doc) => {
            var _a, _b;
            const data = doc.data();
            const storageFile = bucket.file(data.path || '');
            return Object.assign(Object.assign({ id: doc.id }, data), { createdAt: (_a = data.createdAt) === null || _a === void 0 ? void 0 : _a.toDate(), updatedAt: (_b = data.updatedAt) === null || _b === void 0 ? void 0 : _b.toDate(), downloadUrl: await storageFile.getSignedUrl({
                    action: 'read',
                    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
                }) });
        }));
        return { files };
    }
    catch (error) {
        console.error('Error fetching files:', error);
        throw new https_1.HttpsError('internal', 'Failed to fetch files');
    }
});
// Delete a file
exports.deleteFile = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { tenantId, fileId } = request.data;
    const userClaims = request.auth.token;
    if (userClaims.tenantId !== tenantId) {
        throw new https_1.HttpsError('permission-denied', 'Access denied to this tenant');
    }
    try {
        const fileRef = db.collection('files').doc(fileId);
        const fileDoc = await fileRef.get();
        if (!fileDoc.exists) {
            throw new https_1.HttpsError('not-found', 'File not found');
        }
        const fileData = fileDoc.data();
        if (!fileData || fileData.tenantId !== tenantId) {
            throw new https_1.HttpsError('permission-denied', 'Access denied to this file');
        }
        // Delete from Storage
        const storageFile = bucket.file(fileData.path || '');
        await storageFile.delete();
        // Delete from Firestore
        await fileRef.delete();
        return { success: true };
    }
    catch (error) {
        console.error('Error deleting file:', error);
        throw new https_1.HttpsError('internal', 'Failed to delete file');
    }
});
// Get signed URL for file download
exports.getSignedUrl = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { tenantId, fileId } = request.data;
    const userClaims = request.auth.token;
    if (userClaims.tenantId !== tenantId) {
        throw new https_1.HttpsError('permission-denied', 'Access denied to this tenant');
    }
    try {
        const fileRef = db.collection('files').doc(fileId);
        const fileDoc = await fileRef.get();
        if (!fileDoc.exists) {
            throw new https_1.HttpsError('not-found', 'File not found');
        }
        const fileData = fileDoc.data();
        if (!fileData || fileData.tenantId !== tenantId) {
            throw new https_1.HttpsError('permission-denied', 'Access denied to this file');
        }
        const storageFile = bucket.file(fileData.path || '');
        const [url] = await storageFile.getSignedUrl({
            action: 'read',
            expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
        });
        return { url };
    }
    catch (error) {
        console.error('Error generating signed URL:', error);
        throw new https_1.HttpsError('internal', 'Failed to generate signed URL');
    }
});
//# sourceMappingURL=upload.js.map
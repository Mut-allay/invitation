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
const firestore_1 = require("firebase-admin/firestore");
const storage_1 = require("firebase-admin/storage");
const app_1 = require("firebase-admin/app");
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
// Initialize Firebase Admin
(0, app_1.initializeApp)();
const db = (0, firestore_1.getFirestore)();
const storage = (0, storage_1.getStorage)();
const bucket = storage.bucket();
// Upload file to Firebase Storage
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
        // Validate file data
        if (!file || !file.data || !file.name || !file.mimeType) {
            throw new https_1.HttpsError('invalid-argument', 'Invalid file data');
        }
        // Generate unique filename
        const fileExtension = path.extname(file.name);
        const fileName = `${crypto.randomBytes(16).toString('hex')}${fileExtension}`;
        const filePath = `tenants/${tenantId}/uploads/${fileName}`;
        // Upload to Firebase Storage
        const fileBuffer = Buffer.from(file.data, 'base64');
        const fileUpload = bucket.file(filePath);
        await fileUpload.save(fileBuffer, {
            metadata: {
                contentType: file.mimeType,
                metadata: Object.assign({ originalName: file.name, uploadedBy: request.auth.uid, tenantId }, metadata),
            },
        });
        // Get download URL
        const [url] = await fileUpload.getSignedUrl({
            action: 'read',
            expires: '03-01-2500', // Far future expiration
        });
        // Save file metadata to Firestore
        const fileDoc = {
            tenantId,
            fileName,
            originalName: file.name,
            fileSize: fileBuffer.length,
            mimeType: file.mimeType,
            url,
            path: filePath,
            uploadedBy: request.auth.uid,
            uploadedAt: new Date(),
            metadata: metadata || {},
        };
        const fileRef = await db.collection('uploads').add(fileDoc);
        return Object.assign({ id: fileRef.id }, fileDoc);
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
        let query = db.collection('uploads').where('tenantId', '==', tenantId);
        if (type) {
            query = query.where('metadata.type', '==', type);
        }
        if (itemId) {
            query = query.where('metadata.itemId', '==', itemId);
        }
        const snapshot = await query.orderBy('uploadedAt', 'desc').get();
        const files = snapshot.docs.map(doc => {
            var _a;
            return (Object.assign(Object.assign({ id: doc.id }, doc.data()), { uploadedAt: (_a = doc.data().uploadedAt) === null || _a === void 0 ? void 0 : _a.toDate() }));
        });
        return { files };
    }
    catch (error) {
        console.error('Error fetching uploaded files:', error);
        throw new https_1.HttpsError('internal', 'Failed to fetch uploaded files');
    }
});
// Delete uploaded file
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
        // Get file document
        const fileRef = db.collection('uploads').doc(fileId);
        const fileDoc = await fileRef.get();
        if (!fileDoc.exists) {
            throw new https_1.HttpsError('not-found', 'File not found');
        }
        const fileData = fileDoc.data();
        if ((fileData === null || fileData === void 0 ? void 0 : fileData.tenantId) !== tenantId) {
            throw new https_1.HttpsError('permission-denied', 'Access denied to this file');
        }
        // Delete from Firebase Storage
        const storageFile = bucket.file(fileData.path);
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
// Generate signed URL for file access
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
        const fileRef = db.collection('uploads').doc(fileId);
        const fileDoc = await fileRef.get();
        if (!fileDoc.exists) {
            throw new https_1.HttpsError('not-found', 'File not found');
        }
        const fileData = fileDoc.data();
        if ((fileData === null || fileData === void 0 ? void 0 : fileData.tenantId) !== tenantId) {
            throw new https_1.HttpsError('permission-denied', 'Access denied to this file');
        }
        const storageFile = bucket.file(fileData.path);
        const [signedUrl] = await storageFile.getSignedUrl({
            action: 'read',
            expires: Date.now() + 60 * 60 * 1000, // 1 hour
        });
        return { signedUrl };
    }
    catch (error) {
        console.error('Error generating signed URL:', error);
        throw new https_1.HttpsError('internal', 'Failed to generate signed URL');
    }
});
//# sourceMappingURL=upload.js.map
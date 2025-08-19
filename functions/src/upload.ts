import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { initializeApp } from 'firebase-admin/app';
import * as path from 'path';
import * as crypto from 'crypto';

// Initialize Firebase Admin
initializeApp();

const db = getFirestore();
const storage = getStorage();
const bucket = storage.bucket();

// Upload file to Firebase Storage
export const uploadFile = onCall<{ tenantId: string; file: any; metadata?: any }>(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { tenantId, file, metadata } = request.data;
  const userClaims = request.auth.token;

  if (userClaims.tenantId !== tenantId) {
    throw new HttpsError('permission-denied', 'Access denied to this tenant');
  }

  try {
    // Validate file data
    if (!file || !file.data || !file.name || !file.mimeType) {
      throw new HttpsError('invalid-argument', 'Invalid file data');
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
        metadata: {
          originalName: file.name,
          uploadedBy: request.auth.uid,
          tenantId,
          ...metadata,
        },
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

    return {
      id: fileRef.id,
      ...fileDoc,
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new HttpsError('internal', 'Failed to upload file');
  }
});

// Get uploaded files for a tenant
export const getUploadedFiles = onCall<{ tenantId: string; type?: string; itemId?: string }>(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { tenantId, type, itemId } = request.data;
  const userClaims = request.auth.token;

  if (userClaims.tenantId !== tenantId) {
    throw new HttpsError('permission-denied', 'Access denied to this tenant');
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
    
    const files = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      uploadedAt: doc.data().uploadedAt?.toDate(),
    }));

    return { files };
  } catch (error) {
    console.error('Error fetching uploaded files:', error);
    throw new HttpsError('internal', 'Failed to fetch uploaded files');
  }
});

// Delete uploaded file
export const deleteFile = onCall<{ tenantId: string; fileId: string }>(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { tenantId, fileId } = request.data;
  const userClaims = request.auth.token;

  if (userClaims.tenantId !== tenantId) {
    throw new HttpsError('permission-denied', 'Access denied to this tenant');
  }

  try {
    // Get file document
    const fileRef = db.collection('uploads').doc(fileId);
    const fileDoc = await fileRef.get();

    if (!fileDoc.exists) {
      throw new HttpsError('not-found', 'File not found');
    }

    const fileData = fileDoc.data();
    if (fileData?.tenantId !== tenantId) {
      throw new HttpsError('permission-denied', 'Access denied to this file');
    }

    // Delete from Firebase Storage
    const storageFile = bucket.file(fileData.path);
    await storageFile.delete();

    // Delete from Firestore
    await fileRef.delete();

    return { success: true };
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new HttpsError('internal', 'Failed to delete file');
  }
});

// Generate signed URL for file access
export const getSignedUrl = onCall<{ tenantId: string; fileId: string }>(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { tenantId, fileId } = request.data;
  const userClaims = request.auth.token;

  if (userClaims.tenantId !== tenantId) {
    throw new HttpsError('permission-denied', 'Access denied to this tenant');
  }

  try {
    const fileRef = db.collection('uploads').doc(fileId);
    const fileDoc = await fileRef.get();

    if (!fileDoc.exists) {
      throw new HttpsError('not-found', 'File not found');
    }

    const fileData = fileDoc.data();
    if (fileData?.tenantId !== tenantId) {
      throw new HttpsError('permission-denied', 'Access denied to this file');
    }

    const storageFile = bucket.file(fileData.path);
    const [signedUrl] = await storageFile.getSignedUrl({
      action: 'read',
      expires: Date.now() + 60 * 60 * 1000, // 1 hour
    });

    return { signedUrl };
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw new HttpsError('internal', 'Failed to generate signed URL');
  }
}); 
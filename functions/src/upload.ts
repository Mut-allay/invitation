import { onCall, HttpsError, CallableRequest } from 'firebase-functions/v2/https';
import { storage, db } from './firebase-admin';

const bucket = storage.bucket();

// Type definitions
interface FileData {
  tenantId: string;
  path?: string;
  createdAt?: FirebaseFirestore.Timestamp;
  updatedAt?: FirebaseFirestore.Timestamp;
  [key: string]: any;
}

// Upload a file
export const uploadFile = onCall<{ tenantId: string; file: any; metadata?: any }>(async (request: CallableRequest<{ tenantId: string; file: any; metadata?: any }>) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { tenantId, file, metadata } = request.data;
  const userClaims = request.auth.token;

  if (userClaims.tenantId !== tenantId) {
    throw new HttpsError('permission-denied', 'Access denied to this tenant');
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
        metadata: {
          ...metadata,
          uploadedBy: request.auth.uid,
          tenantId,
        },
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
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new HttpsError('internal', 'Failed to upload file');
  }
});

// Get uploaded files for a tenant
export const getUploadedFiles = onCall<{ tenantId: string; type?: string; itemId?: string }>(async (request: CallableRequest<{ tenantId: string; type?: string; itemId?: string }>) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { tenantId, type, itemId } = request.data;
  const userClaims = request.auth.token;

  if (userClaims.tenantId !== tenantId) {
    throw new HttpsError('permission-denied', 'Access denied to this tenant');
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
    
    const files = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data() as FileData;
        const storageFile = bucket.file(data.path || '');
        
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          downloadUrl: await storageFile.getSignedUrl({
            action: 'read',
            expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
          }),
        };
      })
    );

    return { files };
  } catch (error) {
    console.error('Error fetching files:', error);
    throw new HttpsError('internal', 'Failed to fetch files');
  }
});

// Delete a file
export const deleteFile = onCall<{ tenantId: string; fileId: string }>(async (request: CallableRequest<{ tenantId: string; fileId: string }>) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { tenantId, fileId } = request.data;
  const userClaims = request.auth.token;

  if (userClaims.tenantId !== tenantId) {
    throw new HttpsError('permission-denied', 'Access denied to this tenant');
  }

  try {
    const fileRef = db.collection('files').doc(fileId);
    const fileDoc = await fileRef.get();

    if (!fileDoc.exists) {
      throw new HttpsError('not-found', 'File not found');
    }

    const fileData = fileDoc.data() as FileData;
    if (!fileData || fileData.tenantId !== tenantId) {
      throw new HttpsError('permission-denied', 'Access denied to this file');
    }

    // Delete from Storage
    const storageFile = bucket.file(fileData.path || '');
    await storageFile.delete();

    // Delete from Firestore
    await fileRef.delete();

    return { success: true };
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new HttpsError('internal', 'Failed to delete file');
  }
});

// Get signed URL for file download
export const getSignedUrl = onCall<{ tenantId: string; fileId: string }>(async (request: CallableRequest<{ tenantId: string; fileId: string }>) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { tenantId, fileId } = request.data;
  const userClaims = request.auth.token;

  if (userClaims.tenantId !== tenantId) {
    throw new HttpsError('permission-denied', 'Access denied to this tenant');
  }

  try {
    const fileRef = db.collection('files').doc(fileId);
    const fileDoc = await fileRef.get();

    if (!fileDoc.exists) {
      throw new HttpsError('not-found', 'File not found');
    }

    const fileData = fileDoc.data() as FileData;
    if (!fileData || fileData.tenantId !== tenantId) {
      throw new HttpsError('permission-denied', 'Access denied to this file');
    }

    const storageFile = bucket.file(fileData.path || '');
    const [url] = await storageFile.getSignedUrl({
      action: 'read',
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
    });

    return { url };
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw new HttpsError('internal', 'Failed to generate signed URL');
  }
}); 
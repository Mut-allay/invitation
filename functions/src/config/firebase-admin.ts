import * as admin from 'firebase-admin';

// Get or initialize Firebase Admin
try {
    admin.app();
} catch {
    admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET
    });
}

// Export shared instances
export const db = admin.firestore();
export const storage = admin.storage();
export const auth = admin.auth();

// Configure Firestore
db.settings({ ignoreUndefinedProperties: true });

// Export storage bucket conditionally
export const bucket = process.env.FIREBASE_STORAGE_BUCKET ? storage.bucket() : null;

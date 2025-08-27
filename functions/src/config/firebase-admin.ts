import * as admin from 'firebase-admin';

// Initialize Firebase Admin
try {
    admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET
    });
} catch (error) {
    // Ignore the duplicate app error
    if (error instanceof Error && !error.message.includes('app/duplicate-app')) {
        throw error;
    }
}

// Export shared instances
export const db = admin.firestore();
export const storage = admin.storage();
export const auth = admin.auth();

// Configure Firestore
db.settings({ ignoreUndefinedProperties: true });

// Export storage bucket conditionally
export const bucket = process.env.FIREBASE_STORAGE_BUCKET ? storage.bucket() : null;

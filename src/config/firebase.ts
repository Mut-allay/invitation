import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// Test environment configuration
const firebaseConfig = {
  apiKey: "AIzaSyBvqKLZSeTmCRJiMBGOR3D3HH9F_IGkk60",
  authDomain: "garaji-flow-test.firebaseapp.com",
  projectId: "garaji-flow-test",
  storageBucket: "garaji-flow-test.firebasestorage.app",
  messagingSenderId: "280331745176",
  appId: "1:280331745176:web:19741936a1422663c79ded",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Connect to emulators in development if needed
if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATOR === 'true') {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099');
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectStorageEmulator(storage, 'localhost', 9199);
    connectFunctionsEmulator(functions, 'localhost', 5001);
    console.log('🔧 Connected to Firebase emulators');
  } catch (error) {
    console.warn('⚠️ Could not connect to emulators:', error);
  }
}

export default app; 
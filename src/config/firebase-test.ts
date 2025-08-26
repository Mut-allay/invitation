import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

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

export default app; 
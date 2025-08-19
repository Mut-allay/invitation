// Mock Firebase modules for testing
export const initializeApp = jest.fn(() => ({}));

export const getAuth = jest.fn(() => ({
  currentUser: null,
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
}));

export const getFirestore = jest.fn(() => ({
  collection: jest.fn(),
  doc: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  getDocs: jest.fn(),
  getDoc: jest.fn(),
}));

export const getStorage = jest.fn(() => ({
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn(),
}));

export const getFunctions = jest.fn(() => ({
  httpsCallable: jest.fn(),
}));

// Mock Firebase Auth methods
export const signInWithEmailAndPassword = jest.fn();
export const signOut = jest.fn();
export const onAuthStateChanged = jest.fn();

// Mock Firestore methods
export const collection = jest.fn();
export const doc = jest.fn();
export const addDoc = jest.fn();
export const updateDoc = jest.fn();
export const deleteDoc = jest.fn();
export const getDocs = jest.fn();
export const getDoc = jest.fn();
export const query = jest.fn();
export const where = jest.fn();
export const orderBy = jest.fn();
export const limit = jest.fn();

// Mock Storage methods
export const ref = jest.fn();
export const uploadBytes = jest.fn();
export const getDownloadURL = jest.fn();
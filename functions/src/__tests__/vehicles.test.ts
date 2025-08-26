// Mock Firebase Admin
jest.mock('firebase-admin/app', () => ({
  initializeApp: jest.fn(),
}));

jest.mock('firebase-admin/firestore', () => ({
  getFirestore: jest.fn(() => ({
    collection: jest.fn(() => ({
      where: jest.fn(() => ({
        get: jest.fn(),
      })),
      doc: jest.fn(() => ({
        get: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      })),
      add: jest.fn(),
    })),
  })),
}));

jest.mock('firebase-admin/auth', () => ({
  getAuth: jest.fn(() => ({
    verifyIdToken: jest.fn(),
  })),
}));

// Mock Firebase Functions v2
jest.mock('firebase-functions/v2/https', () => ({
  onCall: jest.fn((handler) => handler),
}));

jest.mock('firebase-functions/v2/firestore', () => ({
  onDocumentUpdated: jest.fn(),
}));

// Import the actual function implementations
import { getVehicles, getVehicle, createVehicle, updateVehicle, deleteVehicle } from '../vehicles';

describe('Vehicles Cloud Functions', () => {
  it('should export all required functions', () => {
    expect(getVehicles).toBeDefined();
    expect(getVehicle).toBeDefined();
    expect(createVehicle).toBeDefined();
    expect(updateVehicle).toBeDefined();
    expect(deleteVehicle).toBeDefined();
  });

  it('should have correct function types', () => {
    expect(typeof getVehicles).toBe('function');
    expect(typeof getVehicle).toBe('function');
    expect(typeof createVehicle).toBe('function');
    expect(typeof updateVehicle).toBe('function');
    expect(typeof deleteVehicle).toBe('function');
  });
}); 
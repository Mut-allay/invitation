import { initializeApp } from 'firebase-admin/app';

// Initialize Firebase Admin for testing
if (!process.env.FIREBASE_CONFIG) {
  process.env.FIREBASE_CONFIG = JSON.stringify({
    projectId: 'garaji-flow-dev',
    storageBucket: 'garaji-flow-dev.appspot.com',
  });
}

// Initialize Firebase Admin SDK
initializeApp();

// Simple test to make this a valid test suite
describe('Setup', () => {
  it('should initialize Firebase Admin', () => {
    expect(true).toBe(true);
  });
}); 
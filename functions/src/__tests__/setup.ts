// Mock Firebase Admin SDK
jest.mock('firebase-admin/app', () => ({
  initializeApp: jest.fn(),
}));

// Simple test to make this a valid test suite
describe('Setup', () => {
  it('should be a valid test suite', () => {
    expect(true).toBe(true);
  });
});
// Set up environment variables for tests
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
process.env.FIREBASE_STORAGE_EMULATOR_HOST = 'localhost:9199';
process.env.FUNCTIONS_EMULATOR = 'true';
process.env.FIREBASE_PROJECT_ID = 'garaji-flow-test';
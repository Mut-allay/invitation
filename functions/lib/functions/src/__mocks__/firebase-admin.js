"use strict";
// functions/src/__mocks__/firebase-admin.ts
const firestore = {
    collection: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    get: jest.fn(() => Promise.resolve({ docs: [] })),
    add: jest.fn(),
    doc: jest.fn().mockReturnThis(),
    update: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
};
const mockAdmin = {
    initializeApp: jest.fn(),
    firestore: () => firestore,
    auth: () => ({
        setCustomUserClaims: jest.fn(),
        getUser: jest.fn(() => Promise.resolve({ customClaims: { role: 'admin', tenantId: 'tenant-1' } })),
    }),
    storage: () => ({
        bucket: () => ({
            file: jest.fn(() => ({
                save: jest.fn(),
                getSignedUrl: jest.fn(() => Promise.resolve(['http://fake-url.com'])),
                delete: jest.fn(),
            })),
        }),
    }),
    apps: [{}], // Mock that an app is already initialized to prevent re-initialization
};
module.exports = mockAdmin;
//# sourceMappingURL=firebase-admin.js.map
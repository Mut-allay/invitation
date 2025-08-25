"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("firebase-admin/app");
// Initialize Firebase Admin for testing
if (!process.env.FIREBASE_CONFIG) {
    process.env.FIREBASE_CONFIG = JSON.stringify({
        projectId: 'garaji-flow-dev',
        storageBucket: 'garaji-flow-dev.appspot.com',
    });
}
// Initialize Firebase Admin SDK
(0, app_1.initializeApp)();
//# sourceMappingURL=setup.js.map
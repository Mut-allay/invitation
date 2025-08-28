"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRateLimit = void 0;
// functions/src/rate-limiter.ts
const firestore_1 = require("firebase-admin/firestore");
const https_1 = require("firebase-functions/v2/https");
const db = (0, firestore_1.getFirestore)();
const limit = 100; // 100 requests per 15 minutes
const windowMs = 15 * 60 * 1000;
const checkRateLimit = async (ip) => {
    const now = Date.now();
    const windowStart = now - windowMs;
    const rateLimitRef = db.collection('rateLimits').doc(ip);
    const doc = await rateLimitRef.get();
    if (!doc.exists) {
        await rateLimitRef.set({ count: 1, timestamp: now });
        return;
    }
    const data = doc.data();
    if (data.timestamp < windowStart) {
        await rateLimitRef.set({ count: 1, timestamp: now });
    }
    else {
        if (data.count >= limit) {
            throw new https_1.HttpsError('resource-exhausted', 'Too many requests.');
        }
        await rateLimitRef.update({ count: firestore_1.FieldValue.increment(1) });
    }
};
exports.checkRateLimit = checkRateLimit;
//# sourceMappingURL=rate-limiter.js.map
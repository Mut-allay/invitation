// functions/src/rate-limiter.ts
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { HttpsError } from 'firebase-functions/v2/https';

const db = getFirestore();
const limit = 100; // 100 requests per 15 minutes
const windowMs = 15 * 60 * 1000;

export const checkRateLimit = async (ip: string): Promise<void> => {
  const now = Date.now();
  const windowStart = now - windowMs;

  const rateLimitRef = db.collection('rateLimits').doc(ip);
  const doc = await rateLimitRef.get();

  if (!doc.exists) {
    await rateLimitRef.set({ count: 1, timestamp: now });
    return;
  }

  const data = doc.data()!;
  if (data.timestamp < windowStart) {
    await rateLimitRef.set({ count: 1, timestamp: now });
  } else {
    if (data.count >= limit) {
      throw new HttpsError('resource-exhausted', 'Too many requests.');
    }
    await rateLimitRef.update({ count: FieldValue.increment(1) });
  }
};

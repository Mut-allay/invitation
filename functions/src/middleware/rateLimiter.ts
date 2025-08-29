// functions/src/middleware/rateLimiter.ts
import { Request, Response, NextFunction } from 'express';
import { logger } from 'firebase-functions/v1';

const requests = new Map<string, { count: number, startTime: number }>();
const limit = 100; // 100 requests
const windowMs = 15 * 60 * 1000; // 15 minutes

export const rateLimiter = (req: Request, res: Response, next: NextFunction): void => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const windowStart = now - windowMs;

  const ipData = requests.get(ip) || { count: 0, startTime: now };

  if (ipData.startTime < windowStart) {
    // Reset window
    ipData.count = 1;
    ipData.startTime = now;
  } else {
    ipData.count++;
  }

  requests.set(ip, ipData);

  if (ipData.count > limit) {
    logger.warn(`Rate limit exceeded for IP: ${ip}`);
    res.status(429).send('Too many requests');
    return;
  }

  next();
};

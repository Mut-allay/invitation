"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimiter = void 0;
const v1_1 = require("firebase-functions/v1");
const requests = new Map();
const limit = 100; // 100 requests
const windowMs = 15 * 60 * 1000; // 15 minutes
const rateLimiter = (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    const windowStart = now - windowMs;
    const ipData = requests.get(ip) || { count: 0, startTime: now };
    if (ipData.startTime < windowStart) {
        // Reset window
        ipData.count = 1;
        ipData.startTime = now;
    }
    else {
        ipData.count++;
    }
    requests.set(ip, ipData);
    if (ipData.count > limit) {
        v1_1.logger.warn(`Rate limit exceeded for IP: ${ip}`);
        res.status(429).send('Too many requests');
        return;
    }
    next();
};
exports.rateLimiter = rateLimiter;
//# sourceMappingURL=rateLimiter.js.map
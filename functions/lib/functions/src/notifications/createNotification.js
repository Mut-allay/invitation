"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotification = void 0;
// functions/src/notifications/createNotification.ts
const firebase_admin_1 = require("firebase-admin");
const v1_1 = require("firebase-functions/v1");
const zod_1 = require("zod");
const NotificationSchema = zod_1.z.object({
    tenantId: zod_1.z.string(),
    userId: zod_1.z.string(),
    message: zod_1.z.string(),
    type: zod_1.z.enum(['order_update', 'settlement_ready', 'low_stock']),
    isRead: zod_1.z.boolean(),
    linkTo: zod_1.z.string(),
});
const createNotification = async (notification, now = firebase_admin_1.firestore.Timestamp.now()) => {
    const validatedNotification = NotificationSchema.parse(notification);
    try {
        await (0, firebase_admin_1.firestore)().collection('notifications').add(Object.assign(Object.assign({}, validatedNotification), { createdAt: now }));
    }
    catch (error) {
        v1_1.logger.error('Error creating notification:', error);
        throw new Error('Failed to create notification');
    }
};
exports.createNotification = createNotification;
//# sourceMappingURL=createNotification.js.map
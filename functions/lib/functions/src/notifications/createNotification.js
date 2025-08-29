"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotification = void 0;
// functions/src/notifications/createNotification.ts
const admin = __importStar(require("firebase-admin"));
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
const createNotification = async (notification, now = admin.firestore.Timestamp.now()) => {
    const validatedNotification = NotificationSchema.parse(notification);
    try {
        await admin.firestore().collection('notifications').add(Object.assign(Object.assign({}, validatedNotification), { createdAt: now }));
    }
    catch (error) {
        v1_1.logger.error('Error creating notification:', error);
        throw new Error('Failed to create notification');
    }
};
exports.createNotification = createNotification;
//# sourceMappingURL=createNotification.js.map
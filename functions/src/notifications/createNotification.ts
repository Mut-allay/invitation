// functions/src/notifications/createNotification.ts
import { firestore } from 'firebase-admin';
import { logger } from 'firebase-functions/v1';
import { z } from 'zod';

const NotificationSchema = z.object({
  tenantId: z.string(),
  userId: z.string(),
  message: z.string(),
  type: z.enum(['order_update', 'settlement_ready', 'low_stock']),
  isRead: z.boolean(),
  linkTo: z.string(),
});

export interface Notification {
  id: string;
  tenantId: string;
  userId: string;
  message: string;
  type: 'order_update' | 'settlement_ready' | 'low_stock';
  isRead: boolean;
  linkTo: string; // e.g., /orders/order-123
  createdAt: firestore.Timestamp;
}

export const createNotification = async (notification: Omit<Notification, 'id' | 'createdAt'>, now: firestore.Timestamp = firestore.Timestamp.now()): Promise<void> => {
  const validatedNotification = NotificationSchema.parse(notification);
  try {
    await firestore().collection('notifications').add({
      ...validatedNotification,
      createdAt: now,
    });
  } catch (error) {
    logger.error('Error creating notification:', error);
    throw new Error('Failed to create notification');
  }
};

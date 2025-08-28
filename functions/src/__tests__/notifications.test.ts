// functions/src/__tests__/notifications.test.ts
import { createNotification, Notification } from '../notifications/createNotification';
import * as admin from 'firebase-admin';

jest.mock('firebase-admin', () => {
  const firestore = {
    collection: jest.fn().mockReturnThis(),
    add: jest.fn(),
  };
  return {
    initializeApp: jest.fn(),
    firestore: () => firestore,
    apps: [{}],
  };
});

jest.mock('firebase-admin/firestore', () => ({
  Timestamp: {
    now: jest.fn(() => new Date('2025-01-01T12:00:00Z')),
  },
  getFirestore: () => admin.firestore(),
}));

const db = admin.firestore();

describe('createNotification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a notification in firestore', async () => {
    const notificationData: Omit<Notification, 'id' | 'createdAt'> = {
      tenantId: 'tenant-1',
      userId: 'user-1',
      message: 'Your order has been updated',
      type: 'order_update',
      isRead: false,
      linkTo: '/orders/order-123',
    };

    await createNotification(notificationData, new Date('2025-01-01T12:00:00Z') as any);

    expect(db.collection).toHaveBeenCalledWith('notifications');
    expect(db.collection('notifications').add).toHaveBeenCalledWith(expect.objectContaining({
      ...notificationData,
    }));
  });
});
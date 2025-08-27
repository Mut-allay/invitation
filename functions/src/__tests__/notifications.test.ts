// functions/src/__tests__/notifications.test.ts
import { createNotification, Notification } from '../notifications/createNotification';

// Mock Firebase Admin SDK
const firestoreMock = {
  collection: jest.fn().mockReturnThis(),
  add: jest.fn(),
};

jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  firestore: () => firestoreMock,
}));

describe('createNotification', () => {
  beforeEach(() => {
    firestoreMock.collection.mockClear();
    firestoreMock.add.mockClear();
  });

  it('should create a notification in firestore', async () => {
    const testDate = new Date('2025-01-01T12:00:00Z');
    const notificationData: Omit<Notification, 'id' | 'createdAt'> = {
      tenantId: 'tenant-1',
      userId: 'user-1',
      message: 'Your order has been updated',
      type: 'order_update',
      isRead: false,
      linkTo: '/orders/order-123',
    };

    // We cast to any to satisfy the Timestamp type for the test
    await createNotification(notificationData, testDate as any);

    expect(firestoreMock.collection).toHaveBeenCalledWith('notifications');
    expect(firestoreMock.add).toHaveBeenCalledWith({
      ...notificationData,
      createdAt: testDate,
    });
  });
});

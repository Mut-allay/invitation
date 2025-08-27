
import { createEqualizationLogic } from '../payment-equalization/createEqualization';
import * as admin from 'firebase-admin';
import { PartsOrderWithItems } from '../../../src/types/partsOrder';

// Mock Firebase Admin SDK
const addMock = jest.fn();
const getMock = jest.fn();

jest.mock('firebase-admin', () => ({
  apps: [{}], // Add a dummy app to prevent initializeApp from being called
  initializeApp: jest.fn(),
  firestore: Object.assign(
    jest.fn(() => ({
      collection: jest.fn(() => ({
        where: jest.fn(() => ({
          get: getMock,
        })),
        add: addMock,
      })),
    })),
    {
      Timestamp: {
        now: jest.fn(() => ({
          toDate: () => new Date(),
        })),
      },
    }
  ),
}));

describe('createEqualizationLogic', () => {
  const db = admin.firestore() as unknown as admin.firestore.Firestore;

  beforeEach(() => {
    addMock.mockClear();
    getMock.mockClear();
  });

  it('should create an equalization record for the previous month', async () => {
    const partsOrders: PartsOrderWithItems[] = [
      {
        id: 'order-1',
        tenantId: 'demo-tenant',
        supplierName: 'Test Supplier 1',
        status: 'delivered',
        totalAmount: 150.00,
        orderDate: new Date('2025-07-15'),
        items: [],
        expectedDelivery: new Date(),
        notes: '',
        createdBy: '',
        updatedAt: new Date(),
      },
    ];

    getMock.mockResolvedValue({
      docs: partsOrders.map(order => ({ data: () => order })),
    });

    const timestamp = new Date('2025-08-01T00:00:00Z').toISOString();

    await createEqualizationLogic(db, timestamp);

    expect(addMock).toHaveBeenCalledWith(expect.objectContaining({
      tenantId: 'demo-tenant',
      period: '2025-07',
      totalAmount: 150.00,
      status: 'calculated',
    }));
  });
});

import { createPartsOrderLogic } from '../parts-ordering/createPartsOrder';
import { getPartsOrdersLogic } from '../parts-ordering/getPartsOrders';
import { updateOrderStatusLogic } from '../parts-ordering/updateOrderStatus';
import { processOrderFulfillmentLogic } from '../parts-ordering/processOrderFulfillment';
import { HttpsError } from 'firebase-functions/v2/https';

// Mock Firestore before all tests
jest.mock('firebase-admin/firestore', () => {
  const mockSet = jest.fn();
  const mockGet = jest.fn();
  const mockUpdate = jest.fn();
  const mockDoc: any = jest.fn(() => ({
    id: 'mock-doc-id',
    set: mockSet,
    collection: jest.fn().mockReturnThis(),
    doc: mockDoc,
    get: mockGet,
    update: mockUpdate,
  }));
  const mockBatch = {
    set: jest.fn(),
    commit: jest.fn().mockResolvedValue(true),
  };
  const mockRunTransaction = jest.fn();

  return {
    getFirestore: () => ({
      collection: jest.fn(() => ({
        doc: mockDoc,
        where: jest.fn(() => ({
          orderBy: jest.fn(() => ({
            get: mockGet,
          })),
        })),
      })),
      batch: () => mockBatch,
      runTransaction: mockRunTransaction,
    }),
    Timestamp: {
      now: () => new Date('2025-08-26T10:00:00Z'),
    },
  };
});

// Clear mocks before each test to ensure isolation
beforeEach(() => {
  jest.clearAllMocks();
});

describe('Parts Ordering Logic', () => {
  const mockAuth = {
    uid: 'test-user-id',
    token: { tenantId: 'demo-tenant' },
  };

  describe('createPartsOrderLogic', () => {
    const validOrderData = {
      tenantId: 'demo-tenant',
      supplierName: 'Zambia Auto Parts',
      items: [
        { partName: 'Brake Pad Set', qty: 2, unitPrice: 250 },
        { partName: 'Oil Filter', qty: 1, unitPrice: 120 },
      ],
    };

    it('should create a new parts order successfully', async () => {
      const { getFirestore } = require('firebase-admin/firestore');
      const { batch } = getFirestore();
      const mockRequest = { auth: mockAuth, data: validOrderData };
      const result = await createPartsOrderLogic(mockRequest as any);

      expect(result.status).toBe('success');
      expect(result.orderId).toBeDefined();
      expect(batch().commit).toHaveBeenCalledTimes(1);
      const orderCall = (batch().set as jest.Mock).mock.calls[0][1];
      expect(orderCall.totalAmount).toBe(620);
    });

    it('should throw for unauthenticated users', async () => {
      const mockRequest = { auth: null, data: validOrderData };
      await expect(createPartsOrderLogic(mockRequest as any))
        .rejects.toThrow(new HttpsError('unauthenticated', 'You must be logged in to create an order.'));
    });
  });

  describe('getPartsOrdersLogic', () => {
    it('should retrieve a list of orders', async () => {
      const { getFirestore } = require('firebase-admin/firestore');
      const { collection } = getFirestore();
      (collection().where().orderBy().get).mockResolvedValue({
        docs: [
          { id: 'order-1', data: () => ({}), ref: { collection: () => ({ get: async () => ({ docs: [] }) }) } },
        ],
      });
      const mockRequest = { auth: mockAuth, data: { tenantId: 'demo-tenant' } };
      const result = await getPartsOrdersLogic(mockRequest as any);
      expect(result.orders).toHaveLength(1);
    });
  });

  describe('updateOrderStatusLogic', () => {
    it('should update an order status', async () => {
      const { getFirestore } = require('firebase-admin/firestore');
      const { collection } = getFirestore();
      (collection().doc().get).mockResolvedValue({ exists: true, data: () => ({ tenantId: 'demo-tenant' }) });
      const mockRequest = { auth: mockAuth, data: { tenantId: 'demo-tenant', orderId: 'order-1', status: 'confirmed' } };
      const result = await updateOrderStatusLogic(mockRequest as any);
      expect(result.status).toBe('success');
      expect(collection().doc().update).toHaveBeenCalledWith({
        status: 'confirmed',
        updatedAt: expect.any(Date),
      });
    });
  });

  describe('processOrderFulfillmentLogic', () => {
    it('should fulfill an order', async () => {
      const { getFirestore } = require('firebase-admin/firestore');
      const { runTransaction } = getFirestore();
      (runTransaction as jest.Mock).mockImplementation(async (updateFunction) => {
        const mockTransaction = {
          get: jest.fn().mockResolvedValue({
            exists: true,
            data: () => ({ tenantId: 'demo-tenant', status: 'confirmed' }),
          }),
          update: jest.fn(),
        };
        await updateFunction(mockTransaction);
      });
      const mockRequest = { auth: mockAuth, data: { tenantId: 'demo-tenant', orderId: 'order-1' } };
      const result = await processOrderFulfillmentLogic(mockRequest as any);
      expect(result.status).toBe('success');
    });
  });
});
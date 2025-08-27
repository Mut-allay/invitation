import { syncPartnerInventoryLogic } from '../partner-business/syncPartnerInventory';
import * as admin from 'firebase-admin';

// Mock Firebase Admin SDK
const docMock = jest.fn((path) => ({
  path,
}));
const updateMock = jest.fn();
const runTransactionMock = jest.fn();

jest.mock('firebase-admin', () => ({
  apps: [{}],
  initializeApp: jest.fn(),
  firestore: () => ({
    doc: docMock,
    runTransaction: runTransactionMock,
    collection: () => ({
      doc: docMock,
    }),
  }),
}));

describe('Inventory Synchronization', () => {
  const db = admin.firestore();

  beforeEach(() => {
    docMock.mockClear();
    updateMock.mockClear();
    runTransactionMock.mockClear();
  });

  it('should update the supplier inventory when a partner order is fulfilled', async () => {
    const before = { status: 'pending' };
    const after = {
      status: 'fulfilled',
      supplierTenantId: 'supplier-tenant',
      items: [
        { inventoryId: 'part-1', qty: 2 }, // Stock becomes 10 - 2 = 8
        { inventoryId: 'part-2', qty: 1 }, // Stock becomes 10 - 1 = 9
      ],
    };

    // Mock the transaction
    runTransactionMock.mockImplementation(async (updateFunction) => {
      const transaction = {
        get: jest.fn().mockResolvedValue({ exists: true, data: () => ({ currentStock: 10 }) }),
        update: (ref: admin.firestore.DocumentReference, data: { [key: string]: any }) => updateMock(ref, data),
      };
      await updateFunction(transaction);
    });

    await syncPartnerInventoryLogic(db, before, after);

    expect(runTransactionMock).toHaveBeenCalledTimes(2);
    
    // Check that the update mock was called for both inventory items with the correct new stock values,
    // without depending on the order of the calls.
    // Sort the calls to ensure a consistent order for assertions
    const sortedCalls = updateMock.mock.calls.sort((a, b) => a[1].currentStock - b[1].currentStock);

    expect(sortedCalls).toEqual([
      [{ path: 'part-1' }, { currentStock: 8 }],
      [{ path: 'part-2' }, { currentStock: 9 }],
    ]);
  });
});
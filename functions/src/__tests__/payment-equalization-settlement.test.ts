
import { processSettlement } from '../payment-equalization/processSettlement';
import * as admin from 'firebase-admin';

// Mock Firebase Admin SDK
const updateMock = jest.fn();
const docMock = jest.fn(() => ({
  update: updateMock,
}));

jest.mock('firebase-admin', () => ({
  apps: [{}],
  initializeApp: jest.fn(),
  firestore: Object.assign(
    jest.fn(() => ({
      collection: jest.fn(() => ({
        doc: docMock,
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

describe('processSettlement', () => {
  const db = admin.firestore() as unknown as admin.firestore.Firestore;

  beforeEach(() => {
    updateMock.mockClear();
    docMock.mockClear();
  });

  it('should update the equalization record to settled status', async () => {
    const tenantId = 'demo-tenant';
    const equalizationId = 'equalization-1';
    const settlementDetails = {
      settlementMethod: 'bank_transfer' as const,
      settlementReference: 'REF12345',
    };

    await processSettlement(db, tenantId, equalizationId, settlementDetails);

    expect(docMock).toHaveBeenCalledWith(equalizationId);
    expect(updateMock).toHaveBeenCalledWith(expect.objectContaining({
      status: 'settled',
      settlementMethod: 'bank_transfer',
      settlementReference: 'REF12345',
    }));
  });
});

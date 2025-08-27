
import { invitePartner } from '../partner-business/invitePartner';
import { acceptInvitation } from '../partner-business/acceptInvitation';
import * as admin from 'firebase-admin';

// Mock Firebase Admin SDK
const addMock = jest.fn();
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
        add: addMock,
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

describe('Partner Invitation Flow', () => {
  const db = admin.firestore() as unknown as admin.firestore.Firestore;

  beforeEach(() => {
    addMock.mockClear();
    updateMock.mockClear();
    docMock.mockClear();
  });

  describe('invitePartner', () => {
    it('should create a partner invitation', async () => {
      const tenantId = 'tenant-a';
      const partnerTenantId = 'tenant-b';
      const permissions = { canViewInventory: true, canPlaceOrders: true };

      await invitePartner(db, tenantId, partnerTenantId, permissions);

      expect(addMock).toHaveBeenCalledWith(expect.objectContaining({
        tenantId,
        partnerTenantId,
        status: 'pending',
        permissions,
      }));
    });
  });

  describe('acceptInvitation', () => {
    it('should accept a partner invitation', async () => {
      const invitationId = 'invitation-1';

      await acceptInvitation(db, invitationId);

      expect(docMock).toHaveBeenCalledWith(invitationId);
      expect(updateMock).toHaveBeenCalledWith(expect.objectContaining({
        status: 'active',
      }));
    });
  });
});


import { getPartnerCatalog } from '../partner-business/getPartnerCatalog';
import * as admin from 'firebase-admin';

// Mock Firebase Admin SDK
const getMock = jest.fn();

jest.mock('firebase-admin', () => ({
  apps: [{}],
  initializeApp: jest.fn(),
  firestore: () => ({
    collection: () => ({
      where: jest.fn().mockReturnThis(),
      get: getMock,
    }),
  }),
}));

describe('Cross-Tenant Authentication', () => {
  const db = admin.firestore();

  beforeEach(() => {
    getMock.mockClear();
  });

  describe('getPartnerCatalog', () => {
    it('should return the partner catalog if a valid partnership exists', async () => {
      const requestingTenantId = 'tenant-a';
      const partnerTenantId = 'tenant-b';

      // Mock a valid partnership
      getMock.mockResolvedValueOnce({
        empty: false,
        docs: [{ data: () => ({ permissions: { canViewInventory: true } }) }],
      });

      // Mock the partner's inventory
      getMock.mockResolvedValueOnce({
        docs: [{ id: 'part-1', data: () => ({ name: 'Brake Pads' }) }],
      });

      const catalog = await getPartnerCatalog(db, requestingTenantId, partnerTenantId);

      expect(catalog).toEqual([{ id: 'part-1', name: 'Brake Pads' }]);
    });

    it('should throw an error if no partnership exists', async () => {
      const requestingTenantId = 'tenant-a';
      const partnerTenantId = 'tenant-b';

      // Mock no partnership
      getMock.mockResolvedValueOnce({ empty: true });

      await expect(getPartnerCatalog(db, requestingTenantId, partnerTenantId)).rejects.toThrow(
        'No active partnership found or insufficient permissions.'
      );
    });

    it('should throw an error if the partnership does not grant permission', async () => {
      const requestingTenantId = 'tenant-a';
      const partnerTenantId = 'tenant-b';

      // Mock a partnership with no permissions
      getMock.mockResolvedValueOnce({
        empty: false,
        docs: [{ data: () => ({ permissions: { canViewInventory: false } }) }],
      });

      await expect(getPartnerCatalog(db, requestingTenantId, partnerTenantId)).rejects.toThrow(
        'No active partnership found or insufficient permissions.'
      );
    });
  });
});

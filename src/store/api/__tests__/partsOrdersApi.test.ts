import { partsOrdersApi } from '../partsOrdersApi';
import { store } from '../../index';

// Mock Firebase auth
jest.mock('../../../config/firebase', () => ({
  auth: {
    currentUser: {
      getIdToken: jest.fn().mockResolvedValue('mock-token'),
    },
  },
}));

describe('partsOrdersApi', () => {
  beforeEach(() => {
    // Clear any cached data
    store.dispatch(partsOrdersApi.util.resetApiState());
  });

  it('should be defined', () => {
    // This will fail because partsOrdersApi doesn't exist yet
    expect(partsOrdersApi).toBeDefined();
  });

  describe('getPartsOrders', () => {
    it('should have getPartsOrders endpoint', () => {
      expect(partsOrdersApi.endpoints.getPartsOrders).toBeDefined();
    });

    it('should have correct reducer path', () => {
      expect(partsOrdersApi.reducerPath).toBe('partsOrdersApi');
    });
  });

  describe('getPartsOrder', () => {
    it('should have getPartsOrder endpoint', () => {
      expect(partsOrdersApi.endpoints.getPartsOrder).toBeDefined();
    });
  });

  describe('createPartsOrder', () => {
    it('should have createPartsOrder endpoint', () => {
      expect(partsOrdersApi.endpoints.createPartsOrder).toBeDefined();
    });
  });

  describe('updateOrderStatus', () => {
    it('should have updateOrderStatus endpoint', () => {
      expect(partsOrdersApi.endpoints.updateOrderStatus).toBeDefined();
    });
  });

  describe('processOrderFulfillment', () => {
    it('should have processOrderFulfillment endpoint', () => {
      expect(partsOrdersApi.endpoints.processOrderFulfillment).toBeDefined();
    });
  });

  describe('hooks', () => {
    it('should export useGetPartsOrdersQuery hook', () => {
      expect(partsOrdersApi.useGetPartsOrdersQuery).toBeDefined();
    });

    it('should export useGetPartsOrderQuery hook', () => {
      expect(partsOrdersApi.useGetPartsOrderQuery).toBeDefined();
    });

    it('should export useCreatePartsOrderMutation hook', () => {
      expect(partsOrdersApi.useCreatePartsOrderMutation).toBeDefined();
    });

    it('should export useUpdateOrderStatusMutation hook', () => {
      expect(partsOrdersApi.useUpdateOrderStatusMutation).toBeDefined();
    });

    it('should export useProcessOrderFulfillmentMutation hook', () => {
      expect(partsOrdersApi.useProcessOrderFulfillmentMutation).toBeDefined();
    });
  });
});

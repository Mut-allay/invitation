// functions/src/__tests__/reporting.test.ts
import { generateReport } from '../reporting/generateReport';

// More robust mock for Firestore
const firestoreMock = {
  collection: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  get: jest.fn(),
};

jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  firestore: () => firestoreMock,
}));

describe('generateReport', () => {
  beforeEach(() => {
    // Reset mocks before each test
    firestoreMock.collection.mockClear();
    firestoreMock.where.mockClear();
    firestoreMock.get.mockClear();
  });

  it('should return an empty report if there is no data', async () => {
    firestoreMock.get.mockResolvedValue({ empty: true, docs: [] });
    const report = await generateReport({ startDate: '2025-01-01', endDate: '2025-01-31' });
    expect(report).toEqual({
      sales: 0,
      inventoryTurnover: 0,
      settlements: 0,
    });
  });

  it('should calculate the total sales in a given date range', async () => {
    firestoreMock.collection.mockImplementation((collectionName: string) => {
      if (collectionName === 'sales') {
        return {
          where: jest.fn().mockReturnThis(),
          get: jest.fn().mockResolvedValueOnce({
            empty: false,
            docs: [
              { data: () => ({ total: 100, saleDate: new Date('2025-01-10') }) },
              { data: () => ({ total: 200, saleDate: new Date('2025-01-20') }) },
            ],
          }),
        };
      }
      return { where: jest.fn().mockReturnThis(), get: jest.fn().mockResolvedValue({ empty: true, docs: [] }) };
    });

    const report = await generateReport({ startDate: '2025-01-01', endDate: '2025-01-31' });
    expect(report.sales).toBe(300);
  });

  it('should calculate the inventory turnover', async () => {
    firestoreMock.collection.mockImplementation((collectionName: string) => {
      if (collectionName === 'sales') {
        return {
          where: jest.fn().mockReturnThis(),
          get: jest.fn().mockResolvedValueOnce({
            empty: false,
            docs: [
              { data: () => ({ items: [{ quantity: 2, cost: 10 }, { quantity: 3, cost: 10 }] }) },
            ],
          }),
        };
      }
      if (collectionName === 'inventory') {
        return {
          where: jest.fn().mockReturnThis(),
          get: jest.fn()
            .mockResolvedValueOnce({ // Start inventory
              empty: false,
              docs: [
                { data: () => ({ quantity: 10, cost: 10, createdAt: new Date('2024-12-01') }) },
              ],
            })
            .mockResolvedValueOnce({ // End inventory
              empty: false,
              docs: [
                { data: () => ({ quantity: 10, cost: 10, createdAt: new Date('2025-01-15') }) },
              ],
            }),
        };
      }
      return { where: jest.fn().mockReturnThis(), get: jest.fn().mockResolvedValue({ empty: true, docs: [] }) };
    });

    const report = await generateReport({ startDate: '2025-01-01', endDate: '2025-01-31' });
    expect(report.inventoryTurnover).toBe(0.5); // COGS (50) / Avg Inventory (100)
  });

  it('should calculate the payment settlements', async () => {
    firestoreMock.collection.mockImplementation((collectionName: string) => {
      if (collectionName === 'partsEqualizations') {
        return {
          where: jest.fn().mockReturnThis(),
          get: jest.fn().mockResolvedValueOnce({
            empty: false,
            docs: [
              { data: () => ({ totalAmount: 100, settlementDate: new Date('2025-01-15') }) },
              { data: () => ({ totalAmount: 200, settlementDate: new Date('2025-01-25') }) },
            ],
          }),
        };
      }
      return { where: jest.fn().mockReturnThis(), get: jest.fn().mockResolvedValue({ empty: true, docs: [] }) };
    });

    const report = await generateReport({ startDate: '2025-01-01', endDate: '2025-01-31' });
    expect(report.settlements).toBe(300);
  });
});
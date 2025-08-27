// functions/src/__tests__/reporting.test.ts
import { generateReport } from '../reporting/generateReport';
import * as admin from 'firebase-admin';

const db = admin.firestore();

describe('generateReport', () => {
  beforeEach(() => {
    // Clear mock history before each test
    jest.clearAllMocks();
  });

  it('should return an empty report if there is no data', async () => {
    (db.collection('sales').get as jest.Mock).mockResolvedValue({ docs: [] });
    (db.collection('inventory').get as jest.Mock).mockResolvedValue({ docs: [] });
    (db.collection('partsEqualizations').get as jest.Mock).mockResolvedValue({ docs: [] });

    const report = await generateReport({ startDate: '2025-01-01', endDate: '2025-01-31' });
    expect(report).toEqual({
      sales: 0,
      inventoryTurnover: 0,
      settlements: 0,
    });
  });

  it('should calculate the total sales in a given date range', async () => {
    const salesDocs = [{ data: () => ({ total: 150 }) }, { data: () => ({ total: 250 }) }];
    (db.collection as jest.Mock).mockImplementation((collectionName: string) => {
      if (collectionName === 'sales') {
        return {
          where: jest.fn().mockReturnThis(),
          get: jest.fn().mockResolvedValue({ docs: salesDocs }),
        };
      }
      return {
        where: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue({ docs: [] }),
      };
    });

    const report = await generateReport({ startDate: '2025-01-01', endDate: '2025-01-31' });
    expect(report.sales).toBe(400);
  });
});
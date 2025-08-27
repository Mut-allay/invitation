// functions/src/reporting/generateReport.ts

import * as admin from 'firebase-admin';
import { z } from 'zod';

const DateRangeSchema = z.object({
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid start date" }),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid end date" }),
});

export interface ReportData {
  sales: number;
  inventoryTurnover: number;
  settlements: number;
}

export const generateReport = async (dateRange: { startDate: string, endDate: string }): Promise<ReportData> => {
  const validatedDateRange = DateRangeSchema.parse(dateRange);

  const db = admin.firestore();
  const startDate = new Date(validatedDateRange.startDate);
  const endDate = new Date(validatedDateRange.endDate);

  // Calculate total sales
  const salesSnapshot = await db.collection('sales')
    .where('saleDate', '>=', startDate)
    .where('saleDate', '<=', endDate)
    .get();
  const totalSales = salesSnapshot.docs.reduce((sum, doc) => sum + doc.data().total, 0);

  // Calculate inventory turnover
  const salesForInventorySnapshot = await db.collection('sales')
    .where('saleDate', '>=', startDate)
    .where('saleDate', '<=', endDate)
    .get();
  const cogs = salesForInventorySnapshot.docs.reduce((sum, doc) => {
    const items = doc.data().items;
    if (Array.isArray(items)) {
      return sum + items.reduce((itemSum: number, item: any) => itemSum + (item.quantity * item.cost), 0);
    }
    return sum;
  }, 0);

  const inventoryStartSnapshot = await db.collection('inventory').where('createdAt', '<', startDate).get();
  const inventoryEndSnapshot = await db.collection('inventory').where('createdAt', '<=', endDate).get();
  const averageInventory = (
    inventoryStartSnapshot.docs.reduce((sum, doc) => sum + doc.data().quantity * doc.data().cost, 0) +
    inventoryEndSnapshot.docs.reduce((sum, doc) => sum + doc.data().quantity * doc.data().cost, 0)
  ) / 2;
  
  const inventoryTurnover = averageInventory > 0 ? cogs / averageInventory : 0;

  // Calculate payment settlements
  const settlementsSnapshot = await db.collection('partsEqualizations')
    .where('settlementDate', '>=', startDate)
    .where('settlementDate', '<=', endDate)
    .get();
  const totalSettlements = settlementsSnapshot.docs.reduce((sum, doc) => sum + doc.data().totalAmount, 0);

  return {
    sales: totalSales,
    inventoryTurnover,
    settlements: totalSettlements,
  };
};

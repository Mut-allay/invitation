"use strict";
// functions/src/reporting/generateReport.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReport = void 0;
const admin = __importStar(require("firebase-admin"));
const zod_1 = require("zod");
const DateRangeSchema = zod_1.z.object({
    startDate: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid start date" }),
    endDate: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid end date" }),
});
const generateReport = async (dateRange) => {
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
            return sum + items.reduce((itemSum, item) => itemSum + (item.quantity * item.cost), 0);
        }
        return sum;
    }, 0);
    const inventoryStartSnapshot = await db.collection('inventory').where('createdAt', '<', startDate).get();
    const inventoryEndSnapshot = await db.collection('inventory').where('createdAt', '<=', endDate).get();
    const averageInventory = (inventoryStartSnapshot.docs.reduce((sum, doc) => sum + doc.data().quantity * doc.data().cost, 0) +
        inventoryEndSnapshot.docs.reduce((sum, doc) => sum + doc.data().quantity * doc.data().cost, 0)) / 2;
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
exports.generateReport = generateReport;
//# sourceMappingURL=generateReport.js.map
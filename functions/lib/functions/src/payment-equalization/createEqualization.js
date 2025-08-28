"use strict";
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
exports.createEqualization = exports.createEqualizationLogic = void 0;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const admin = __importStar(require("firebase-admin"));
const calculateEqualization_1 = require("./calculateEqualization");
if (admin.apps.length === 0) {
    admin.initializeApp();
}
const createEqualizationLogic = async (db, timestamp) => {
    const now = new Date(timestamp);
    const year = now.getFullYear();
    const month = now.getMonth();
    // Calculate the period for the previous month
    const lastMonth = new Date(year, month - 1, 1);
    const lastMonthYear = lastMonth.getFullYear();
    const lastMonthMonth = lastMonth.getMonth() + 1;
    const period = `${lastMonthYear}-${lastMonthMonth.toString().padStart(2, '0')}`;
    // For now, we'll assume a single tenant. This will be expanded later.
    const tenantId = 'demo-tenant';
    const partsOrdersSnapshot = await db.collection('partsOrders')
        .where('tenantId', '==', tenantId)
        .get();
    const partsOrders = partsOrdersSnapshot.docs.map(doc => doc.data());
    const totalAmount = (0, calculateEqualization_1.calculateEqualization)(partsOrders, period);
    if (totalAmount > 0) {
        const equalizationData = {
            tenantId,
            partnerTenantId: tenantId, // Internal equalization for now
            period,
            totalAmount,
            status: 'calculated',
            createdBy: 'system',
            createdAt: admin.firestore.Timestamp.now(),
        };
        await db.collection('partsEqualizations').add(equalizationData);
    }
};
exports.createEqualizationLogic = createEqualizationLogic;
exports.createEqualization = (0, scheduler_1.onSchedule)('0 0 1 * *', async (event) => {
    const db = admin.firestore();
    try {
        await (0, exports.createEqualizationLogic)(db, event.scheduleTime);
        console.log('Payment equalization created successfully.');
    }
    catch (error) {
        console.error('Error creating payment equalization:', error);
    }
});
//# sourceMappingURL=createEqualization.js.map
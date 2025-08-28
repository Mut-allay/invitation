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
exports.getPartnerCatalog = void 0;
const admin = __importStar(require("firebase-admin"));
if (admin.apps.length === 0) {
    admin.initializeApp();
}
const getPartnerCatalog = async (db, requestingTenantId, partnerTenantId) => {
    const partnershipSnapshot = await db.collection('partnerBusinesses')
        .where('tenantId', '==', requestingTenantId)
        .where('partnerTenantId', '==', partnerTenantId)
        .where('status', '==', 'active')
        .get();
    if (partnershipSnapshot.empty) {
        throw new Error('No active partnership found or insufficient permissions.');
    }
    const partnership = partnershipSnapshot.docs[0].data();
    if (!partnership.permissions.canViewInventory) {
        throw new Error('No active partnership found or insufficient permissions.');
    }
    const inventorySnapshot = await db.collection('inventories')
        .where('tenantId', '==', partnerTenantId)
        .get();
    return inventorySnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
};
exports.getPartnerCatalog = getPartnerCatalog;
//# sourceMappingURL=getPartnerCatalog.js.map
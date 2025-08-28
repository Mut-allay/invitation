"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = exports.AuditEventSchema = void 0;
const zod_1 = require("zod");
const firebase_admin_1 = require("./config/firebase-admin");
// Audit event types
exports.AuditEventSchema = zod_1.z.object({
    action: zod_1.z.string().min(1),
    entityType: zod_1.z.string().min(1),
    entityId: zod_1.z.string().min(1),
    changes: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).optional()
});
class AuditService {
    constructor() {
        this.collection = firebase_admin_1.db.collection('audit_trail');
    }
    async logEvent(event, context) {
        // Validate event
        exports.AuditEventSchema.parse(event);
        // Create audit record
        const auditRecord = Object.assign(Object.assign({}, event), { id: this.collection.doc().id, performedBy: context.auth.uid, performedAt: new Date(), tenantId: context.auth.token.tenant_id, ipAddress: 'unknown', userAgent: 'unknown' // In production, get from context.rawRequest?.headers?.['user-agent']
         });
        // Save to database
        await this.collection.doc(auditRecord.id).set(auditRecord);
        return auditRecord;
    }
    async getAuditTrail(entityType, entityId) {
        const snapshot = await this.collection
            .where('entityType', '==', entityType)
            .where('entityId', '==', entityId)
            .orderBy('performedAt', 'desc')
            .get();
        return snapshot.docs.map(doc => doc.data());
    }
    async getUserActivity(userId) {
        const snapshot = await this.collection
            .where('performedBy', '==', userId)
            .orderBy('performedAt', 'desc')
            .limit(100)
            .get();
        return snapshot.docs.map(doc => doc.data());
    }
}
exports.AuditService = AuditService;
//# sourceMappingURL=audit.js.map
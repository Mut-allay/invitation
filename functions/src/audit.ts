import { onCall, HttpsError, CallableRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { logger } from 'firebase-functions/v1';
import { z } from 'zod';

// Initialize Firebase Admin if not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();

// Audit event types
export const AuditEventSchema = z.object({
    action: z.string().min(1),
    entityType: z.string().min(1),
    entityId: z.string().min(1),
    changes: z.record(z.string(), z.unknown()).optional()
});

export type AuditEvent = z.infer<typeof AuditEventSchema>;

export interface AuditRecord extends AuditEvent {
    id: string;
    performedBy: string;
    performedAt: Date;
    tenantId: string;
    ipAddress: string;
    userAgent: string;
}

export class AuditService {
    private collection: FirebaseFirestore.CollectionReference;

    constructor() {
        // Initialize collection reference
        this.collection = db.collection('audit_trail');
    }

    public async logEvent(event: AuditEvent, context: { auth: { uid: string; token: { tenant_id: string } } }): Promise<AuditRecord> {
        // Validate event
        AuditEventSchema.parse(event);

        // Create audit record
        const auditRecord: AuditRecord = {
            ...event,
            id: this.collection.doc().id,
            performedBy: context.auth.uid,
            performedAt: new Date(),
            tenantId: context.auth.token.tenant_id,
            ipAddress: 'unknown', // In production, get from context.rawRequest?.ip
            userAgent: 'unknown' // In production, get from context.rawRequest?.headers?.['user-agent']
        };

        // Save to database
        await this.collection.doc(auditRecord.id).set(auditRecord);

        return auditRecord;
    }

    public async getAuditTrail(entityType: string, entityId: string): Promise<AuditRecord[]> {
        const snapshot = await this.collection
            .where('entityType', '==', entityType)
            .where('entityId', '==', entityId)
            .orderBy('performedAt', 'desc')
            .get();

        return snapshot.docs.map(doc => doc.data() as AuditRecord);
    }

    public async getUserActivity(userId: string): Promise<AuditRecord[]> {
        const snapshot = await this.collection
            .where('performedBy', '==', userId)
            .orderBy('performedAt', 'desc')
            .limit(100)
            .get();

        return snapshot.docs.map(doc => doc.data() as AuditRecord);
    }
}

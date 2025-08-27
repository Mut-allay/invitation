import { AuditService } from '../audit';
import type { AuditEvent } from '../audit';

describe('Audit Service', () => {
    let service: AuditService;
    const testContext = {
        auth: {
            uid: 'test-user',
            token: {
                tenant_id: 'test-tenant'
            }
        }
    };

    beforeEach(() => {
        service = new AuditService();
    });

    describe('Event Logging', () => {
        const validEvent: AuditEvent = {
            action: 'PAYMENT_RECEIVED',
            entityType: 'PAYMENT',
            entityId: 'PAY-001',
            changes: {
                status: 'COMPLETED',
                amount: 1000
            }
        };

        it('should log event successfully', async () => {
            const record = await service.logEvent(validEvent, testContext);
            expect(record.id).toBeDefined();
            expect(record.performedBy).toBe('test-user');
            expect(record.tenantId).toBe('test-tenant');
            expect(record.action).toBe('PAYMENT_RECEIVED');
            expect(record.changes).toEqual({
                status: 'COMPLETED',
                amount: 1000
            });
        });

        it('should reject empty action', async () => {
            const invalidEvent = {
                ...validEvent,
                action: ''
            };

            await expect(service.logEvent(invalidEvent, testContext))
                .rejects
                .toThrow();
        });

        it('should reject empty entityType', async () => {
            const invalidEvent = {
                ...validEvent,
                entityType: ''
            };

            await expect(service.logEvent(invalidEvent, testContext))
                .rejects
                .toThrow();
        });

        it('should reject empty entityId', async () => {
            const invalidEvent = {
                ...validEvent,
                entityId: ''
            };

            await expect(service.logEvent(invalidEvent, testContext))
                .rejects
                .toThrow();
        });
    });

    describe('Audit Trail', () => {
        it('should retrieve entity audit trail', async () => {
            // First create some audit records
            const event1: AuditEvent = {
                action: 'CREATED',
                entityType: 'VEHICLE',
                entityId: 'VEH-001'
            };

            const event2: AuditEvent = {
                action: 'UPDATED',
                entityType: 'VEHICLE',
                entityId: 'VEH-001',
                changes: { status: 'SOLD' }
            };

            await service.logEvent(event1, testContext);
            await service.logEvent(event2, testContext);

            // Get audit trail
            const trail = await service.getAuditTrail('VEHICLE', 'VEH-001');
            expect(trail.length).toBe(2);
            expect(trail[0].action).toBe('UPDATED');
            expect(trail[1].action).toBe('CREATED');
        });
    });

    describe('User Activity', () => {
        it('should retrieve user activity', async () => {
            // First create some audit records
            const event1: AuditEvent = {
                action: 'LOGIN',
                entityType: 'USER',
                entityId: 'test-user'
            };

            const event2: AuditEvent = {
                action: 'CREATE_SALE',
                entityType: 'SALE',
                entityId: 'SALE-001'
            };

            await service.logEvent(event1, testContext);
            await service.logEvent(event2, testContext);

            // Get user activity
            const activity = await service.getUserActivity('test-user');
            expect(activity.length).toBe(2);
            expect(activity[0].action).toBe('CREATE_SALE');
            expect(activity[1].action).toBe('LOGIN');
        });
    });
});

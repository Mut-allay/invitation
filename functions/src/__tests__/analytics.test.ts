import { AnalyticsService } from '../analytics';
import type { BusinessMetricsRequest, PredictiveAnalyticsRequest } from '../analytics';

describe('Analytics Service', () => {
    let service: AnalyticsService;

    beforeEach(() => {
        service = new AnalyticsService();
        process.env.NODE_ENV = 'development';
    });

    describe('Business Metrics', () => {
        const validRequest: BusinessMetricsRequest = {
            dateRange: {
                start: '2025-01-01T00:00:00Z',
                end: '2025-12-31T23:59:59Z'
            },
            metrics: ['sales', 'profit', 'inventory']
        };

        it('should return business metrics successfully', async () => {
            const response = await service.getBusinessMetrics(validRequest);
            expect(response.sales).toBeDefined();
            expect(response.inventory).toBeDefined();
            expect(response.profit).toBeDefined();
        });

        it('should reject invalid date range', async () => {
            const invalidRequest = {
                dateRange: {
                    start: 'invalid-date',
                    end: '2025-12-31T23:59:59Z'
                },
                metrics: ['sales']
            };

            await expect(service.getBusinessMetrics(invalidRequest as BusinessMetricsRequest))
                .rejects
                .toThrow();
        });

        it('should reject invalid metrics', async () => {
            const invalidRequest = {
                dateRange: {
                    start: '2025-01-01T00:00:00Z',
                    end: '2025-12-31T23:59:59Z'
                },
                metrics: ['invalid-metric']
            };

            await expect(service.getBusinessMetrics(invalidRequest as any))
                .rejects
                .toThrow();
        });
    });

    describe('Predictive Analytics', () => {
        const validRequest: PredictiveAnalyticsRequest = {
            category: 'vehicles',
            timeFrame: 90 // days
        };

        it('should return predictions successfully', async () => {
            const response = await service.predictInventoryNeeds(validRequest);
            expect(response.category).toBe('vehicles');
            expect(response.timeFrame).toBe(90);
            expect(response.metrics).toBeDefined();
        });

        it('should reject negative time frame', async () => {
            const invalidRequest = {
                category: 'vehicles',
                timeFrame: -90
            };

            await expect(service.predictInventoryNeeds(invalidRequest))
                .rejects
                .toThrow();
        });

        it('should reject empty category', async () => {
            const invalidRequest = {
                category: '',
                timeFrame: 90
            };

            await expect(service.predictInventoryNeeds(invalidRequest))
                .rejects
                .toThrow();
        });
    });
});

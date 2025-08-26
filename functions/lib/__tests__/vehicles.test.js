"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vehicles_1 = require("../vehicles");
// Mock Firebase Admin
jest.mock('firebase-admin/app', () => ({
    initializeApp: jest.fn(),
}));
jest.mock('firebase-admin/firestore', () => ({
    getFirestore: jest.fn(() => ({
        collection: jest.fn(() => ({
            where: jest.fn(() => ({
                get: jest.fn(),
            })),
            doc: jest.fn(() => ({
                get: jest.fn(),
                update: jest.fn(),
                delete: jest.fn(),
            })),
            add: jest.fn(),
        })),
    })),
}));
jest.mock('firebase-admin/auth', () => ({
    getAuth: jest.fn(() => ({
        verifyIdToken: jest.fn(),
    })),
}));
describe('Vehicles Cloud Functions', () => {
    const mockRequest = {
        auth: {
            token: {
                tenantId: 'demo-tenant',
                uid: 'test-user-id',
            },
        },
        data: {},
    };
    const mockVehicle = {
        id: '1',
        tenantId: 'demo-tenant',
        vin: 'ABC123456789',
        regNumber: 'ABC123',
        make: 'Toyota',
        model: 'Corolla',
        year: 2020,
        status: 'available',
        costPrice: 15000,
        sellingPrice: 18000,
        images: [],
        description: 'Well maintained vehicle',
        mileage: 50000,
        fuelType: 'petrol',
        transmission: 'automatic',
        color: 'White',
        features: ['Air Conditioning', 'Bluetooth'],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
    };
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('getVehicles', () => {
        it('returns vehicles for authenticated user with correct tenant', async () => {
            const { getFirestore } = require('firebase-admin/firestore');
            const mockSnapshot = {
                docs: [
                    {
                        id: '1',
                        data: () => mockVehicle,
                    },
                ],
            };
            getFirestore().collection().where().get.mockResolvedValue(mockSnapshot);
            const request = Object.assign(Object.assign({}, mockRequest), { data: { tenantId: 'demo-tenant' } });
            const result = await (0, vehicles_1.getVehicles)(request);
            expect(result).toEqual({
                vehicles: [
                    Object.assign(Object.assign({ id: '1' }, mockVehicle), { createdAt: mockVehicle.createdAt, updatedAt: mockVehicle.updatedAt }),
                ],
            });
        });
        it('throws error for unauthenticated user', async () => {
            const request = {
                auth: null,
                data: { tenantId: 'demo-tenant' },
            };
            await expect((0, vehicles_1.getVehicles)(request)).rejects.toThrow('User must be authenticated');
        });
        it('throws error for wrong tenant', async () => {
            const request = Object.assign(Object.assign({}, mockRequest), { data: { tenantId: 'wrong-tenant' } });
            await expect((0, vehicles_1.getVehicles)(request)).rejects.toThrow('Access denied to this tenant');
        });
    });
    describe('getVehicle', () => {
        it('returns vehicle when found', async () => {
            const { getFirestore } = require('firebase-admin/firestore');
            const mockDoc = {
                exists: true,
                data: () => mockVehicle,
            };
            getFirestore().collection().doc().get.mockResolvedValue(mockDoc);
            const request = Object.assign(Object.assign({}, mockRequest), { data: { tenantId: 'demo-tenant', vehicleId: '1' } });
            const result = await (0, vehicles_1.getVehicle)(request);
            expect(result).toEqual(Object.assign(Object.assign({ id: '1' }, mockVehicle), { createdAt: mockVehicle.createdAt, updatedAt: mockVehicle.updatedAt }));
        });
        it('throws error when vehicle not found', async () => {
            const { getFirestore } = require('firebase-admin/firestore');
            const mockDoc = {
                exists: false,
            };
            getFirestore().collection().doc().get.mockResolvedValue(mockDoc);
            const request = Object.assign(Object.assign({}, mockRequest), { data: { tenantId: 'demo-tenant', vehicleId: 'non-existent' } });
            await expect((0, vehicles_1.getVehicle)(request)).rejects.toThrow('Vehicle not found');
        });
    });
    describe('createVehicle', () => {
        it('creates vehicle successfully', async () => {
            const { getFirestore } = require('firebase-admin/firestore');
            const mockDocRef = {
                id: 'new-vehicle-id',
            };
            getFirestore().collection().add.mockResolvedValue(mockDocRef);
            const newVehicle = {
                vin: 'XYZ987654321',
                regNumber: 'XYZ987',
                make: 'Honda',
                model: 'Civic',
                year: 2021,
                costPrice: 16000,
                sellingPrice: 19000,
                description: 'New vehicle',
                mileage: 30000,
                fuelType: 'petrol',
                transmission: 'manual',
                color: 'Blue',
                features: ['Navigation'],
            };
            const request = Object.assign(Object.assign({}, mockRequest), { data: { tenantId: 'demo-tenant', vehicle: newVehicle } });
            const result = await (0, vehicles_1.createVehicle)(request);
            expect(result).toEqual(Object.assign(Object.assign({ id: 'new-vehicle-id' }, newVehicle), { tenantId: 'demo-tenant', createdAt: expect.any(Date), updatedAt: expect.any(Date) }));
        });
    });
    describe('updateVehicle', () => {
        it('updates vehicle successfully', async () => {
            const { getFirestore } = require('firebase-admin/firestore');
            const mockDoc = {
                exists: true,
                data: () => mockVehicle,
            };
            getFirestore().collection().doc().get.mockResolvedValue(mockDoc);
            getFirestore().collection().doc().update.mockResolvedValue(undefined);
            const updateData = {
                sellingPrice: 20000,
                description: 'Updated description',
            };
            const request = Object.assign(Object.assign({}, mockRequest), { data: { tenantId: 'demo-tenant', vehicleId: '1', vehicle: updateData } });
            const result = await (0, vehicles_1.updateVehicle)(request);
            expect(result).toEqual(Object.assign(Object.assign(Object.assign({ id: '1' }, mockVehicle), updateData), { updatedAt: expect.any(Date) }));
        });
    });
    describe('deleteVehicle', () => {
        it('deletes vehicle successfully', async () => {
            const { getFirestore } = require('firebase-admin/firestore');
            const mockDoc = {
                exists: true,
                data: () => mockVehicle,
            };
            getFirestore().collection().doc().get.mockResolvedValue(mockDoc);
            getFirestore().collection().doc().delete.mockResolvedValue(undefined);
            const request = Object.assign(Object.assign({}, mockRequest), { data: { tenantId: 'demo-tenant', vehicleId: '1' } });
            const result = await (0, vehicles_1.deleteVehicle)(request);
            expect(result).toEqual({ success: true });
        });
    });
});
//# sourceMappingURL=vehicles.test.js.map
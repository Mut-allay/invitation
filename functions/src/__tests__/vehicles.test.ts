import { getVehicles, getVehicle, createVehicle, updateVehicle, deleteVehicle } from '../vehicles';
import { onCall } from 'firebase-functions/v2/https';

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

      const request = {
        ...mockRequest,
        data: { tenantId: 'demo-tenant' },
      };

      const result = await getVehicles(request as any);

      expect(result).toEqual({
        vehicles: [
          {
            id: '1',
            ...mockVehicle,
            createdAt: mockVehicle.createdAt,
            updatedAt: mockVehicle.updatedAt,
          },
        ],
      });
    });

    it('throws error for unauthenticated user', async () => {
      const request = {
        auth: null,
        data: { tenantId: 'demo-tenant' },
      };

      await expect(getVehicles(request as any)).rejects.toThrow('User must be authenticated');
    });

    it('throws error for wrong tenant', async () => {
      const request = {
        ...mockRequest,
        data: { tenantId: 'wrong-tenant' },
      };

      await expect(getVehicles(request as any)).rejects.toThrow('Access denied to this tenant');
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

      const request = {
        ...mockRequest,
        data: { tenantId: 'demo-tenant', vehicleId: '1' },
      };

      const result = await getVehicle(request as any);

      expect(result).toEqual({
        id: '1',
        ...mockVehicle,
        createdAt: mockVehicle.createdAt,
        updatedAt: mockVehicle.updatedAt,
      });
    });

    it('throws error when vehicle not found', async () => {
      const { getFirestore } = require('firebase-admin/firestore');
      const mockDoc = {
        exists: false,
      };

      getFirestore().collection().doc().get.mockResolvedValue(mockDoc);

      const request = {
        ...mockRequest,
        data: { tenantId: 'demo-tenant', vehicleId: 'non-existent' },
      };

      await expect(getVehicle(request as any)).rejects.toThrow('Vehicle not found');
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
        fuelType: 'petrol' as const,
        transmission: 'manual' as const,
        color: 'Blue',
        features: ['Navigation'],
      };

      const request = {
        ...mockRequest,
        data: { tenantId: 'demo-tenant', vehicle: newVehicle },
      };

      const result = await createVehicle(request as any);

      expect(result).toEqual({
        id: 'new-vehicle-id',
        ...newVehicle,
        tenantId: 'demo-tenant',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
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

      const request = {
        ...mockRequest,
        data: { tenantId: 'demo-tenant', vehicleId: '1', vehicle: updateData },
      };

      const result = await updateVehicle(request as any);

      expect(result).toEqual({
        id: '1',
        ...mockVehicle,
        ...updateData,
        updatedAt: expect.any(Date),
      });
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

      const request = {
        ...mockRequest,
        data: { tenantId: 'demo-tenant', vehicleId: '1' },
      };

      const result = await deleteVehicle(request as any);

      expect(result).toEqual({ success: true });
    });
  });
}); 
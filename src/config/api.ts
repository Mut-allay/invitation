// API Configuration for Free Tier
export const getApiBaseUrl = (): string => {
  // For free tier, we'll use direct Firestore access instead of Cloud Functions
  return 'direct-firestore';
};

export const API_CONFIG = {
  baseUrl: getApiBaseUrl(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Check if we should use direct Firestore (free tier) or Cloud Functions
export const useDirectFirestore = (): boolean => {
  // Always use direct Firestore for free tier
  return true;
};

// Mock data for development when Cloud Functions are not available
export const getMockData = (endpoint: string) => {
  const mockData = {
    customers: [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+260 955 123 456',
        address: 'Lusaka, Zambia',
        tenantId: 'demo-tenant',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+260 955 789 012',
        address: 'Kitwe, Zambia',
        tenantId: 'demo-tenant',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ],
    vehicles: [
      {
        id: '1',
        make: 'Toyota',
        model: 'Hilux',
        year: 2020,
        plateNumber: 'ABC 123',
        customerId: '1',
        tenantId: 'demo-tenant',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ],
    sales: [
      {
        id: '1',
        customerId: '1',
        vehicleId: '1',
        amount: 50000,
        currency: 'ZMW',
        paymentMethod: 'mobile_money',
        tenantId: 'demo-tenant',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]
  };
  
  return mockData[endpoint as keyof typeof mockData] || [];
}; 
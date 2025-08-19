import { http, HttpResponse } from 'msw';

// Mock data
const mockVehicles = [
  {
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
  },
];

const mockCustomers = [
  {
    id: '1',
    tenantId: 'demo-tenant',
    name: 'John Doe',
    phone: '+260123456789',
    email: 'john@example.com',
    nrc: '123456/78/9',
    address: '123 Main St, Lusaka',
    vehiclesOwned: ['1'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

const mockSales = [
  {
    id: '1',
    tenantId: 'demo-tenant',
    vehicleId: '1',
    customerId: '1',
    salePrice: 18000,
    deposit: 5000,
    paymentMethod: 'bank_transfer',
    saleDate: new Date('2024-01-15'),
    notes: 'Excellent customer',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
];

const mockRepairs = [
  {
    id: '1',
    tenantId: 'demo-tenant',
    customerId: '1',
    vehicleId: '1',
    status: 'in_progress',
    reportedIssues: 'Engine making strange noise',
    estimatedCompletion: new Date('2024-02-01'),
    totalCost: 500,
    laborCost: 300,
    partsCost: 200,
    notes: 'Need to check engine',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
  },
];

const mockInventory = [
  {
    id: '1',
    tenantId: 'demo-tenant',
    type: 'part',
    sku: 'ENG001',
    name: 'Engine Oil Filter',
    description: 'High quality oil filter',
    currentStock: 50,
    reorderLevel: 10,
    supplierId: '1',
    cost: 25,
    sellingPrice: 35,
    unit: 'piece',
    category: 'Engine Parts',
    location: 'Warehouse A',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

const mockInvoices = [
  {
    id: '1',
    tenantId: 'demo-tenant',
    invoiceNumber: 'INV-2024-001',
    saleId: '1',
    customerId: '1',
    vehicleId: '1',
    totalAmount: 18000,
    subtotal: 15517.24,
    vatAmount: 2482.76,
    vatRate: 0.16,
    taxBreakdown: { vat: 2482.76 },
    status: 'paid',
    dueDate: new Date('2024-02-15'),
    issueDate: new Date('2024-01-15'),
    paidDate: new Date('2024-01-15'),
    paymentMethod: 'bank_transfer',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
];

// API handlers
export const handlers = [
  // Vehicles API
  http.get('/api/v1/tenant/:tenantId/vehicles', () => {
    return HttpResponse.json({ vehicles: mockVehicles });
  }),

  http.get('/api/v1/tenant/:tenantId/vehicles/:id', ({ params }) => {
    const vehicle = mockVehicles.find(v => v.id === params.id);
    if (!vehicle) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(vehicle);
  }),

  http.post('/api/v1/tenant/:tenantId/vehicles', async ({ request }) => {
    const vehicle = await request.json();
    return HttpResponse.json({ id: 'new-id', ...vehicle });
  }),

  // Customers API
  http.get('/api/v1/tenant/:tenantId/customers', () => {
    return HttpResponse.json({ customers: mockCustomers });
  }),

  http.get('/api/v1/tenant/:tenantId/customers/:id', ({ params }) => {
    const customer = mockCustomers.find(c => c.id === params.id);
    if (!customer) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(customer);
  }),

  http.post('/api/v1/tenant/:tenantId/customers', async ({ request }) => {
    const customer = await request.json();
    return HttpResponse.json({ id: 'new-id', ...customer });
  }),

  // Sales API
  http.get('/api/v1/tenant/:tenantId/sales', () => {
    return HttpResponse.json({ sales: mockSales });
  }),

  http.post('/api/v1/tenant/:tenantId/sales', async ({ request }) => {
    const sale = await request.json();
    return HttpResponse.json({ id: 'new-id', ...sale });
  }),

  // Repairs API
  http.get('/api/v1/tenant/:tenantId/repairs', () => {
    return HttpResponse.json({ repairs: mockRepairs });
  }),

  http.post('/api/v1/tenant/:tenantId/repairs', async ({ request }) => {
    const repair = await request.json();
    return HttpResponse.json({ id: 'new-id', ...repair });
  }),

  // Inventory API
  http.get('/api/v1/tenant/:tenantId/inventory', () => {
    return HttpResponse.json({ inventory: mockInventory });
  }),

  http.post('/api/v1/tenant/:tenantId/inventory', async ({ request }) => {
    const item = await request.json();
    return HttpResponse.json({ id: 'new-id', ...item });
  }),

  // Invoices API
  http.get('/api/v1/tenant/:tenantId/invoices', () => {
    return HttpResponse.json({ invoices: mockInvoices });
  }),

  http.post('/api/v1/tenant/:tenantId/invoices', async ({ request }) => {
    const invoice = await request.json();
    return HttpResponse.json({ id: 'new-id', ...invoice });
  }),

  // Upload API
  http.post('/api/v1/tenant/:tenantId/upload', async ({ request }) => {
    const formData = await request.formData();
    return HttpResponse.json({
      id: 'upload-id',
      fileName: 'test-file.jpg',
      url: 'https://example.com/test-file.jpg',
      uploadedAt: new Date(),
    });
  }),

  // Auth API
  http.post('/api/v1/auth/login', async ({ request }) => {
    const { email, password } = await request.json();
    if (email === 'test@example.com' && password === 'password') {
      return HttpResponse.json({
        user: {
          id: 'user-id',
          email: 'test@example.com',
          tenantId: 'demo-tenant',
          role: 'admin',
        },
        token: 'mock-jwt-token',
      });
    }
    return new HttpResponse(null, { status: 401 });
  }),

  // Default handler for unmatched requests
  http.all('*', ({ request }) => {
    console.warn(`Unhandled ${request.method} request to ${request.url}`);
    return new HttpResponse(null, { status: 404 });
  }),
]; 
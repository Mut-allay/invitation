
import { calculateEqualization } from '../payment-equalization/calculateEqualization';
import { PartsOrderWithItems } from '../../../src/types/partsOrder';

describe('calculateEqualization', () => {
  it('should calculate the total cost of parts orders for a given period', () => {
    const partsOrders: PartsOrderWithItems[] = [
      {
        id: 'order-1',
        tenantId: 'demo-tenant',
        supplierName: 'Test Supplier 1',
        status: 'delivered',
        totalAmount: 150.00,
        orderDate: new Date('2025-07-15'),
        items: [],
        expectedDelivery: new Date(),
        notes: '',
        createdBy: '',
        updatedAt: new Date(),
      },
      {
        id: 'order-2',
        tenantId: 'demo-tenant',
        supplierName: 'Test Supplier 2',
        status: 'delivered',
        totalAmount: 75.50,
        orderDate: new Date('2025-07-20'),
        items: [],
        expectedDelivery: new Date(),
        notes: '',
        createdBy: '',
        updatedAt: new Date(),
      },
      {
        id: 'order-3',
        tenantId: 'demo-tenant',
        supplierName: 'Test Supplier 3',
        status: 'pending',
        totalAmount: 100.00,
        orderDate: new Date('2025-07-25'),
        items: [],
        expectedDelivery: new Date(),
        notes: '',
        createdBy: '',
        updatedAt: new Date(),
      },
      {
        id: 'order-4',
        tenantId: 'demo-tenant',
        supplierName: 'Test Supplier 4',
        status: 'delivered',
        totalAmount: 50.00,
        orderDate: new Date('2025-08-05'),
        items: [],
        expectedDelivery: new Date(),
        notes: '',
        createdBy: '',
        updatedAt: new Date(),
      },
    ];

    const period = '2025-07';
    const total = calculateEqualization(partsOrders, period);

    // The total should only include 'delivered' orders from July 2025
    expect(total).toBe(225.50);
  });

  it('should return 0 if there are no delivered orders in the period', () => {
    const partsOrders: PartsOrderWithItems[] = [
      {
        id: 'order-1',
        tenantId: 'demo-tenant',
        supplierName: 'Test Supplier 1',
        status: 'pending',
        totalAmount: 150.00,
        orderDate: new Date('2025-07-15'),
        items: [],
        expectedDelivery: new Date(),
        notes: '',
        createdBy: '',
        updatedAt: new Date(),
      },
    ];

    const period = '2025-07';
    const total = calculateEqualization(partsOrders, period);

    expect(total).toBe(0);
  });
});

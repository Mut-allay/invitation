import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin
import serviceAccount from '../service-account-key.json';
initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();
const auth = getAuth();

const DEMO_TENANT_ID = 'demo-tenant-001';

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    // Create demo tenant
    await db.collection('tenants').doc(DEMO_TENANT_ID).set({
      name: 'Demo Auto Shop',
      slug: 'demo-auto-shop',
      logoUrl: 'https://via.placeholder.com/150x50/3B82F6/FFFFFF?text=Demo+Auto',
      plan: 'premium',
      isActive: true,
      address: '123 Great East Road, Lusaka, Zambia',
      TPIN: '123456789',
      createdAt: new Date(),
    });

    console.log('✅ Demo tenant created');

    // Create demo admin user
    const adminUser = await auth.createUser({
      email: 'admin@demoautoshop.com',
      password: 'demo123456',
      displayName: 'Demo Admin',
    });

    await auth.setCustomUserClaims(adminUser.uid, {
      role: 'admin',
      tenantId: DEMO_TENANT_ID,
      permissions: ['create_invoice', 'delete_vehicle', 'manage_users', 'view_reports', 'manage_settings'],
    });

    await db.collection('users').doc(adminUser.uid).set({
      tenantId: DEMO_TENANT_ID,
      role: 'admin',
      displayName: 'Demo Admin',
      email: 'admin@demoautoshop.com',
      phone: '+260955123456',
      createdAt: new Date(),
      lastLoginAt: new Date(),
      isActive: true,
    });

    console.log('✅ Demo admin user created');

    // Create 15 vehicles
    const vehicles = [
      { make: 'Toyota', model: 'Hilux', year: 2020, regNumber: 'ABC123', status: 'available', costPrice: 450000, sellingPrice: 520000 },
      { make: 'Toyota', model: 'Corolla', year: 2019, regNumber: 'DEF456', status: 'available', costPrice: 320000, sellingPrice: 380000 },
      { make: 'Honda', model: 'Civic', year: 2021, regNumber: 'GHI789', status: 'available', costPrice: 380000, sellingPrice: 450000 },
      { make: 'Nissan', model: 'Navara', year: 2018, regNumber: 'JKL012', status: 'sold', costPrice: 420000, sellingPrice: 480000 },
      { make: 'Mazda', model: 'CX-5', year: 2022, regNumber: 'MNO345', status: 'available', costPrice: 550000, sellingPrice: 620000 },
      { make: 'Suzuki', model: 'Swift', year: 2020, regNumber: 'PQR678', status: 'available', costPrice: 280000, sellingPrice: 330000 },
      { make: 'Hyundai', model: 'Tucson', year: 2021, regNumber: 'STU901', status: 'available', costPrice: 480000, sellingPrice: 540000 },
      { make: 'Kia', model: 'Sportage', year: 2019, regNumber: 'VWX234', status: 'available', costPrice: 420000, sellingPrice: 480000 },
      { make: 'Ford', model: 'Ranger', year: 2020, regNumber: 'YZA567', status: 'available', costPrice: 520000, sellingPrice: 580000 },
      { make: 'Mitsubishi', model: 'L200', year: 2018, regNumber: 'BCD890', status: 'available', costPrice: 450000, sellingPrice: 510000 },
      { make: 'BMW', model: 'X3', year: 2021, regNumber: 'EFG123', status: 'available', costPrice: 850000, sellingPrice: 920000 },
      { make: 'Mercedes', model: 'C-Class', year: 2020, regNumber: 'HIJ456', status: 'available', costPrice: 780000, sellingPrice: 850000 },
      { make: 'Audi', model: 'A4', year: 2019, regNumber: 'KLM789', status: 'available', costPrice: 720000, sellingPrice: 780000 },
      { make: 'Volkswagen', model: 'Golf', year: 2021, regNumber: 'NOP012', status: 'available', costPrice: 380000, sellingPrice: 440000 },
      { make: 'Volvo', model: 'XC60', year: 2020, regNumber: 'QRS345', status: 'available', costPrice: 680000, sellingPrice: 750000 },
    ];

    for (let i = 0; i < vehicles.length; i++) {
      const vehicle = vehicles[i];
      const vehicleId = `vehicle-${i + 1}`;
      await db.collection('vehicles').doc(vehicleId).set({
        tenantId: DEMO_TENANT_ID,
        vin: `VIN${String(i + 1).padStart(6, '0')}`,
        ...vehicle,
        images: [`https://via.placeholder.com/400x300/3B82F6/FFFFFF?text=${vehicle.make}+${vehicle.model}`],
        createdAt: new Date(),
      });
    }

    console.log('✅ 15 vehicles created');

    // Create 50 parts
    const parts = [
      { name: 'Oil Filter', sku: 'OF001', type: 'part', currentStock: 25, reorderLevel: 10, cost: 45, sellingPrice: 65 },
      { name: 'Air Filter', sku: 'AF001', type: 'part', currentStock: 18, reorderLevel: 8, cost: 35, sellingPrice: 50 },
      { name: 'Brake Pads', sku: 'BP001', type: 'part', currentStock: 12, reorderLevel: 5, cost: 120, sellingPrice: 180 },
      { name: 'Spark Plugs', sku: 'SP001', type: 'part', currentStock: 30, reorderLevel: 15, cost: 25, sellingPrice: 40 },
      { name: 'Battery', sku: 'BAT001', type: 'part', currentStock: 8, reorderLevel: 3, cost: 450, sellingPrice: 650 },
      { name: 'Tire Set', sku: 'TIR001', type: 'part', currentStock: 6, reorderLevel: 2, cost: 800, sellingPrice: 1200 },
      { name: 'Windshield Wipers', sku: 'WW001', type: 'part', currentStock: 20, reorderLevel: 10, cost: 30, sellingPrice: 45 },
      { name: 'Headlight Bulb', sku: 'HB001', type: 'part', currentStock: 15, reorderLevel: 8, cost: 20, sellingPrice: 35 },
      { name: 'Fuel Filter', sku: 'FF001', type: 'part', currentStock: 22, reorderLevel: 12, cost: 40, sellingPrice: 60 },
      { name: 'Timing Belt', sku: 'TB001', type: 'part', currentStock: 5, reorderLevel: 2, cost: 180, sellingPrice: 250 },
      { name: 'Clutch Kit', sku: 'CK001', type: 'part', currentStock: 3, reorderLevel: 1, cost: 350, sellingPrice: 500 },
      { name: 'Alternator', sku: 'ALT001', type: 'part', currentStock: 4, reorderLevel: 2, cost: 280, sellingPrice: 400 },
      { name: 'Starter Motor', sku: 'SM001', type: 'part', currentStock: 3, reorderLevel: 1, cost: 320, sellingPrice: 450 },
      { name: 'Radiator', sku: 'RAD001', type: 'part', currentStock: 2, reorderLevel: 1, cost: 450, sellingPrice: 650 },
      { name: 'Water Pump', sku: 'WP001', type: 'part', currentStock: 6, reorderLevel: 3, cost: 120, sellingPrice: 180 },
      { name: 'Power Steering Fluid', sku: 'PSF001', type: 'part', currentStock: 15, reorderLevel: 8, cost: 25, sellingPrice: 40 },
      { name: 'Brake Fluid', sku: 'BF001', type: 'part', currentStock: 12, reorderLevel: 6, cost: 30, sellingPrice: 45 },
      { name: 'Coolant', sku: 'COOL001', type: 'part', currentStock: 20, reorderLevel: 10, cost: 35, sellingPrice: 55 },
      { name: 'Transmission Oil', sku: 'TO001', type: 'part', currentStock: 18, reorderLevel: 9, cost: 40, sellingPrice: 60 },
      { name: 'Engine Oil 5W-30', sku: 'EO001', type: 'part', currentStock: 25, reorderLevel: 12, cost: 50, sellingPrice: 75 },
      { name: 'Wrench Set', sku: 'WS001', type: 'tool', currentStock: 8, reorderLevel: 3, cost: 150, sellingPrice: 200 },
      { name: 'Socket Set', sku: 'SS001', type: 'tool', currentStock: 6, reorderLevel: 2, cost: 200, sellingPrice: 280 },
      { name: 'Jack Stand', sku: 'JS001', type: 'tool', currentStock: 4, reorderLevel: 2, cost: 80, sellingPrice: 120 },
      { name: 'Diagnostic Tool', sku: 'DT001', type: 'tool', currentStock: 2, reorderLevel: 1, cost: 500, sellingPrice: 750 },
      { name: 'Torque Wrench', sku: 'TW001', type: 'tool', currentStock: 3, reorderLevel: 1, cost: 120, sellingPrice: 180 },
    ];

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const partId = `part-${i + 1}`;
      await db.collection('inventories').doc(partId).set({
        tenantId: DEMO_TENANT_ID,
        ...part,
        supplierId: `supplier-${Math.floor(Math.random() * 5) + 1}`,
        createdAt: new Date(),
      });
    }

    console.log('✅ 50 parts created');

    // Create 10 customers
    const customers = [
      { name: 'John Banda', phone: '+260955111111', nrc: '123456/78/9', address: '456 Independence Avenue, Lusaka' },
      { name: 'Mary Phiri', phone: '+260955222222', nrc: '234567/89/0', address: '789 Cairo Road, Lusaka' },
      { name: 'Peter Mwanza', phone: '+260955333333', nrc: '345678/90/1', address: '321 Great North Road, Lusaka' },
      { name: 'Sarah Ngoma', phone: '+260955444444', nrc: '456789/01/2', address: '654 Manda Hill, Lusaka' },
      { name: 'David Chilufya', phone: '+260955555555', nrc: '567890/12/3', address: '987 Arcades, Lusaka' },
      { name: 'Grace Mbewe', phone: '+260955666666', nrc: '678901/23/4', address: '147 Woodlands, Lusaka' },
      { name: 'Michael Sinkala', phone: '+260955777777', nrc: '789012/34/5', address: '258 Chainama, Lusaka' },
      { name: 'Patricia Lungu', phone: '+260955888888', nrc: '890123/45/6', address: '369 Olympia, Lusaka' },
      { name: 'Robert Chisenga', phone: '+260955999999', nrc: '901234/56/7', address: '741 Northmead, Lusaka' },
      { name: 'Elizabeth Mwale', phone: '+260955000000', nrc: '012345/67/8', address: '852 Kabulonga, Lusaka' },
    ];

    for (let i = 0; i < customers.length; i++) {
      const customer = customers[i];
      const customerId = `customer-${i + 1}`;
      await db.collection('customers').doc(customerId).set({
        tenantId: DEMO_TENANT_ID,
        ...customer,
        vehiclesOwned: [],
        createdAt: new Date(),
      });
    }

    console.log('✅ 10 customers created');

    // Create 5 job cards
    const jobCards = [
      { customerId: 'customer-1', vehicleId: 'vehicle-1', status: 'in_progress', reportedIssues: 'Engine making strange noise' },
      { customerId: 'customer-2', vehicleId: 'vehicle-2', status: 'completed', reportedIssues: 'Brake pads need replacement' },
      { customerId: 'customer-3', vehicleId: 'vehicle-3', status: 'pending', reportedIssues: 'Oil change and filter replacement' },
      { customerId: 'customer-4', vehicleId: 'vehicle-4', status: 'in_progress', reportedIssues: 'Air conditioning not working' },
      { customerId: 'customer-5', vehicleId: 'vehicle-5', status: 'completed', reportedIssues: 'Battery replacement' },
    ];

    for (let i = 0; i < jobCards.length; i++) {
      const jobCard = jobCards[i];
      const repairId = `repair-${i + 1}`;
      await db.collection('repairs').doc(repairId).set({
        tenantId: DEMO_TENANT_ID,
        ...jobCard,
        createdAt: new Date(),
        closedAt: jobCard.status === 'completed' ? new Date() : null,
      });
    }

    console.log('✅ 5 job cards created');

    console.log('🎉 Database seeding completed successfully!');
    console.log('📧 Admin login: admin@demoautoshop.com / demo123456');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase(); 
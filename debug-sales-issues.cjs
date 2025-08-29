const admin = require('firebase-admin');

// Initialize Firebase Admin for live database
admin.initializeApp({
  projectId: 'garaji-flow-test'
});

const db = admin.firestore();

async function debugSalesIssues() {
  try {
    console.log('🔍 Debugging Sales Page Issues...\n');

    // 1. Check vehicles data structure
    console.log('📊 Checking vehicles data structure...');
    const vehiclesSnapshot = await db.collection('vehicles').get();
    console.log(`Found ${vehiclesSnapshot.size} vehicles in Firestore`);
    
    if (vehiclesSnapshot.size > 0) {
      console.log('\n📋 Sample vehicle data structure:');
      const sampleVehicle = vehiclesSnapshot.docs[0].data();
      console.log('Vehicle fields:', Object.keys(sampleVehicle));
      console.log('Sample vehicle:', JSON.stringify(sampleVehicle, null, 2));
    }

    // 2. Check sales data structure
    console.log('\n💰 Checking sales data structure...');
    const salesSnapshot = await db.collection('sales').get();
    console.log(`Found ${salesSnapshot.size} sales in Firestore`);
    
    if (salesSnapshot.size > 0) {
      console.log('\n📋 Sample sale data structure:');
      const sampleSale = salesSnapshot.docs[0].data();
      console.log('Sale fields:', Object.keys(sampleSale));
      console.log('Sample sale:', JSON.stringify(sampleSale, null, 2));
    }

    // 3. Check customers data structure
    console.log('\n👥 Checking customers data structure...');
    const customersSnapshot = await db.collection('customers').get();
    console.log(`Found ${customersSnapshot.size} customers in Firestore`);
    
    if (customersSnapshot.size > 0) {
      console.log('\n📋 Sample customer data structure:');
      const sampleCustomer = customersSnapshot.docs[0].data();
      console.log('Customer fields:', Object.keys(sampleCustomer));
      console.log('Sample customer:', JSON.stringify(sampleCustomer, null, 2));
    }

    // 4. Check for any numeric fields that might be undefined
    console.log('\n🔢 Checking for undefined numeric fields...');
    
    // Check vehicles for undefined numeric fields
    vehiclesSnapshot.docs.forEach((doc, index) => {
      const vehicle = doc.data();
      const numericFields = ['year', 'costPrice', 'sellingPrice', 'mileage'];
      numericFields.forEach(field => {
        if (vehicle[field] === undefined || vehicle[field] === null) {
          console.log(`⚠️  Vehicle ${index + 1} (${doc.id}): ${field} is ${vehicle[field]}`);
        }
      });
    });

    // Check sales for undefined numeric fields
    salesSnapshot.docs.forEach((doc, index) => {
      const sale = doc.data();
      const numericFields = ['amount', 'salePrice', 'deposit', 'balance'];
      numericFields.forEach(field => {
        if (sale[field] === undefined || sale[field] === null) {
          console.log(`⚠️  Sale ${index + 1} (${doc.id}): ${field} is ${sale[field]}`);
        }
      });
    });

    // 5. Check for any components that might be causing issues
    console.log('\n🔧 Checking component data flow...');
    
    // Simulate the data flow that components would use
    const testVehicles = vehiclesSnapshot.docs.slice(0, 3).map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log('\n📋 Test vehicles for component rendering:');
    testVehicles.forEach((vehicle, index) => {
      console.log(`\nVehicle ${index + 1}:`);
      console.log('  ID:', vehicle.id);
      console.log('  Make:', vehicle.make);
      console.log('  Model:', vehicle.model);
      console.log('  Year:', vehicle.year);
      console.log('  Plate Number:', vehicle.plateNumber);
      console.log('  Customer ID:', vehicle.customerId);
      console.log('  Has sellingPrice:', 'sellingPrice' in vehicle);
      console.log('  Has costPrice:', 'costPrice' in vehicle);
      console.log('  Has mileage:', 'mileage' in vehicle);
    });

    // 6. Check for any missing required fields
    console.log('\n❌ Checking for missing required fields...');
    
    const requiredVehicleFields = ['make', 'model', 'year', 'plateNumber'];
    const requiredSaleFields = ['customerId', 'vehicleId', 'amount'];
    
    vehiclesSnapshot.docs.forEach((doc, index) => {
      const vehicle = doc.data();
      const missingFields = requiredVehicleFields.filter(field => !vehicle[field]);
      if (missingFields.length > 0) {
        console.log(`⚠️  Vehicle ${index + 1} (${doc.id}) missing fields:`, missingFields);
      }
    });

    salesSnapshot.docs.forEach((doc, index) => {
      const sale = doc.data();
      const missingFields = requiredSaleFields.filter(field => !sale[field]);
      if (missingFields.length > 0) {
        console.log(`⚠️  Sale ${index + 1} (${doc.id}) missing fields:`, missingFields);
      }
    });

    // 7. Check for any data inconsistencies
    console.log('\n🔄 Checking for data inconsistencies...');
    
    // Check if sales reference valid vehicles
    salesSnapshot.docs.forEach((doc, index) => {
      const sale = doc.data();
      if (sale.vehicleId) {
        const vehicleDoc = vehiclesSnapshot.docs.find(v => v.id === sale.vehicleId);
        if (!vehicleDoc) {
          console.log(`⚠️  Sale ${index + 1} (${doc.id}) references non-existent vehicle: ${sale.vehicleId}`);
        }
      }
    });

    // Check if vehicles reference valid customers
    vehiclesSnapshot.docs.forEach((doc, index) => {
      const vehicle = doc.data();
      if (vehicle.customerId) {
        const customerDoc = customersSnapshot.docs.find(c => c.id === vehicle.customerId);
        if (!customerDoc) {
          console.log(`⚠️  Vehicle ${index + 1} (${doc.id}) references non-existent customer: ${vehicle.customerId}`);
        }
      }
    });

    console.log('\n✅ Debug complete!');

  } catch (error) {
    console.error('❌ Error debugging:', error);
  } finally {
    process.exit(0);
  }
}

debugSalesIssues(); 
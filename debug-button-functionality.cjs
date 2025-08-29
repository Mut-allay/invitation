const admin = require('firebase-admin');

// Initialize Firebase Admin for live database
admin.initializeApp({
  projectId: 'garaji-flow-test'
});

const db = admin.firestore();

async function debugButtonFunctionality() {
  try {
    console.log('🔍 Debugging Button Functionality and Data Consistency...\n');

    // 1. Check Vehicles Data
    console.log('🚗 Checking Vehicles Collection...');
    const vehiclesSnapshot = await db.collection('vehicles').get();
    console.log(`Found ${vehiclesSnapshot.size} vehicles`);
    
    if (!vehiclesSnapshot.empty) {
      vehiclesSnapshot.docs.forEach((doc, index) => {
        const vehicle = doc.data();
        console.log(`\nVehicle ${index + 1} (${doc.id}):`);
        console.log(`  Plate Number: ${vehicle.plateNumber || 'N/A'}`);
        console.log(`  Make: ${vehicle.make || 'N/A'}`);
        console.log(`  Model: ${vehicle.model || 'N/A'}`);
        console.log(`  Year: ${vehicle.year || 'N/A'}`);
        console.log(`  Status: ${vehicle.status || 'N/A'}`);
        console.log(`  Customer ID: ${vehicle.customerId || 'N/A'}`);
        console.log(`  Has ID field: ${'id' in vehicle}`);
        console.log(`  Created At: ${vehicle.createdAt ? (vehicle.createdAt.toDate ? vehicle.createdAt.toDate().toISOString() : 'Invalid Timestamp') : 'N/A'}`);
        console.log(`  Updated At: ${vehicle.updatedAt ? (vehicle.updatedAt.toDate ? vehicle.updatedAt.toDate().toISOString() : 'Invalid Timestamp') : 'N/A'}`);
      });
    }

    // 2. Check Repairs Data
    console.log('\n🔧 Checking Repairs Collection...');
    const repairsSnapshot = await db.collection('repairs').get();
    console.log(`Found ${repairsSnapshot.size} repairs`);
    
    if (!repairsSnapshot.empty) {
      repairsSnapshot.docs.forEach((doc, index) => {
        const repair = doc.data();
        console.log(`\nRepair ${index + 1} (${doc.id}):`);
        console.log(`  Description: ${repair.description || 'N/A'}`);
        console.log(`  Status: ${repair.status || 'N/A'}`);
        console.log(`  Vehicle ID: ${repair.vehicleId || 'N/A'}`);
        console.log(`  Customer ID: ${repair.customerId || 'N/A'}`);
        console.log(`  Has ID field: ${'id' in repair}`);
        console.log(`  Created At: ${repair.createdAt ? (repair.createdAt.toDate ? repair.createdAt.toDate().toISOString() : 'Invalid Timestamp') : 'N/A'}`);
      });
    }

    // 3. Check Customers Data
    console.log('\n👤 Checking Customers Collection...');
    const customersSnapshot = await db.collection('customers').get();
    console.log(`Found ${customersSnapshot.size} customers`);
    
    if (!customersSnapshot.empty) {
      customersSnapshot.docs.forEach((doc, index) => {
        const customer = doc.data();
        console.log(`\nCustomer ${index + 1} (${doc.id}):`);
        console.log(`  Name: ${customer.name || 'N/A'}`);
        console.log(`  Email: ${customer.email || 'N/A'}`);
        console.log(`  Phone: ${customer.phone || 'N/A'}`);
        console.log(`  Vehicles Owned: ${customer.vehiclesOwned ? customer.vehiclesOwned.length : 0}`);
        console.log(`  Has ID field: ${'id' in customer}`);
        console.log(`  Created At: ${customer.createdAt ? (customer.createdAt.toDate ? customer.createdAt.toDate().toISOString() : 'Invalid Timestamp') : 'N/A'}`);
      });
    }

    // 4. Check for any data inconsistencies that might affect button functionality
    console.log('\n🔍 Checking for Data Inconsistencies...');
    
    // Check if vehicle IDs in repairs exist in vehicles collection
    const vehicleIds = vehiclesSnapshot.docs.map(doc => doc.id);
    const customerIds = customersSnapshot.docs.map(doc => doc.id);
    
    repairsSnapshot.docs.forEach(doc => {
      const repair = doc.data();
      if (repair.vehicleId && !vehicleIds.includes(repair.vehicleId)) {
        console.log(`⚠️  Repair ${doc.id} references non-existent vehicle: ${repair.vehicleId}`);
      }
      if (repair.customerId && !customerIds.includes(repair.customerId)) {
        console.log(`⚠️  Repair ${doc.id} references non-existent customer: ${repair.customerId}`);
      }
    });

    vehiclesSnapshot.docs.forEach(doc => {
      const vehicle = doc.data();
      if (vehicle.customerId && !customerIds.includes(vehicle.customerId)) {
        console.log(`⚠️  Vehicle ${doc.id} references non-existent customer: ${vehicle.customerId}`);
      }
    });

    // 5. Simulate the data that components would receive
    console.log('\n🧪 Simulating Component Data Flow...');
    
    const testVehicles = vehiclesSnapshot.docs.slice(0, 2).map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log('\n📋 Test vehicles for component rendering:');
    testVehicles.forEach((vehicle, index) => {
      console.log(`\nVehicle ${index + 1}:`);
      console.log('  ID:', vehicle.id);
      console.log('  Make:', vehicle.make);
      console.log('  Model:', vehicle.model);
      console.log('  Plate Number:', vehicle.plateNumber);
      console.log('  Customer ID:', vehicle.customerId);
      console.log('  Created At:', vehicle.createdAt);
      
      // Test toLocaleDateString
      if (vehicle.createdAt) {
        try {
          if (vehicle.createdAt.toDate) {
            const date = vehicle.createdAt.toDate();
            console.log('  ✅ toLocaleDateString():', date.toLocaleDateString());
          } else if (vehicle.createdAt instanceof Date) {
            console.log('  ✅ toLocaleDateString():', vehicle.createdAt.toLocaleDateString());
          } else {
            console.log('  ❌ createdAt is not a Date or Timestamp');
          }
        } catch (error) {
          console.log('  ❌ toLocaleDateString() error:', error.message);
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

debugButtonFunctionality(); 
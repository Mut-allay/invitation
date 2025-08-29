const admin = require('firebase-admin');

// Initialize Firebase Admin for live database
admin.initializeApp({
  projectId: 'garaji-flow-test'
});

const db = admin.firestore();

async function debugCurrentErrors() {
  try {
    console.log('🔍 Debugging Current Errors and Button Issues...\n');

    // 1. Check for toLocaleDateString errors - this suggests createdAt is not a Date object
    console.log('📅 Checking for toLocaleDateString errors...');
    
    const collections = ['vehicles', 'customers', 'sales', 'repairs', 'inventory', 'invoices'];
    
    for (const collectionName of collections) {
      const snapshot = await db.collection(collectionName).get();
      console.log(`\n📋 ${collectionName.toUpperCase()} collection (${snapshot.size} documents):`);
      
      if (snapshot.size > 0) {
        const sampleDoc = snapshot.docs[0].data();
        console.log('Sample document fields:', Object.keys(sampleDoc));
        
        // Check createdAt field specifically
        if (sampleDoc.createdAt) {
          console.log(`  createdAt type: ${typeof sampleDoc.createdAt}`);
          console.log(`  createdAt value: ${sampleDoc.createdAt}`);
          
          if (sampleDoc.createdAt.toDate) {
            console.log(`  ✅ createdAt is a Firestore Timestamp`);
            try {
              const date = sampleDoc.createdAt.toDate();
              console.log(`  ✅ toDate() works: ${date}`);
              console.log(`  ✅ toLocaleDateString() works: ${date.toLocaleDateString()}`);
            } catch (error) {
              console.log(`  ❌ toDate() error: ${error.message}`);
            }
          } else if (sampleDoc.createdAt instanceof Date) {
            console.log(`  ✅ createdAt is a JavaScript Date`);
            try {
              console.log(`  ✅ toLocaleDateString() works: ${sampleDoc.createdAt.toLocaleDateString()}`);
            } catch (error) {
              console.log(`  ❌ toLocaleDateString() error: ${error.message}`);
            }
          } else {
            console.log(`  ❌ createdAt is not a Date or Timestamp: ${typeof sampleDoc.createdAt}`);
          }
        } else {
          console.log(`  ⚠️  No createdAt field found`);
        }
      }
    }

    // 2. Check for length errors - this suggests arrays are undefined
    console.log('\n📊 Checking for length errors...');
    
    // Check customers for any array fields that might be undefined
    const customersSnapshot = await db.collection('customers').get();
    console.log(`\nFound ${customersSnapshot.size} customers in Firestore`);
    
    customersSnapshot.docs.forEach((doc, index) => {
      const customer = doc.data();
      console.log(`\nCustomer ${index + 1} (${doc.id}):`);
      console.log('  Fields:', Object.keys(customer));
      
      // Check for any array fields
      Object.keys(customer).forEach(field => {
        const value = customer[field];
        if (Array.isArray(value)) {
          console.log(`  ✅ ${field}: Array with ${value.length} items`);
        } else if (value === undefined || value === null) {
          console.log(`  ⚠️  ${field}: ${value}`);
        } else {
          console.log(`  📝 ${field}: ${typeof value} = ${value}`);
        }
      });
    });

    // 3. Check for button functionality issues
    console.log('\n🔘 Checking for button functionality issues...');
    
    // Check if vehicles have required fields for buttons to work
    const vehiclesSnapshot = await db.collection('vehicles').get();
    console.log(`\nFound ${vehiclesSnapshot.size} vehicles in Firestore`);
    
    vehiclesSnapshot.docs.forEach((doc, index) => {
      const vehicle = doc.data();
      console.log(`\nVehicle ${index + 1} (${doc.id}):`);
      console.log('  ID:', doc.id);
      console.log('  Make:', vehicle.make);
      console.log('  Model:', vehicle.model);
      console.log('  Plate Number:', vehicle.plateNumber);
      console.log('  Customer ID:', vehicle.customerId);
      console.log('  Has ID field:', 'id' in vehicle);
      console.log('  All fields:', Object.keys(vehicle));
    });

    // 4. Check for any missing required fields that buttons depend on
    console.log('\n❌ Checking for missing required fields...');
    
    const requiredVehicleFields = ['make', 'model', 'plateNumber'];
    const requiredCustomerFields = ['name', 'email'];
    
    vehiclesSnapshot.docs.forEach((doc, index) => {
      const vehicle = doc.data();
      const missingFields = requiredVehicleFields.filter(field => !vehicle[field]);
      if (missingFields.length > 0) {
        console.log(`⚠️  Vehicle ${index + 1} (${doc.id}) missing fields:`, missingFields);
      }
    });

    customersSnapshot.docs.forEach((doc, index) => {
      const customer = doc.data();
      const missingFields = requiredCustomerFields.filter(field => !customer[field]);
      if (missingFields.length > 0) {
        console.log(`⚠️  Customer ${index + 1} (${doc.id}) missing fields:`, missingFields);
      }
    });

    // 5. Simulate the exact data that components would receive
    console.log('\n🧪 Simulating component data flow...');
    
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

    // 6. Check for any data inconsistencies that might affect button functionality
    console.log('\n🔄 Checking for data inconsistencies...');
    
    // Check if vehicle customerId references exist
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

debugCurrentErrors(); 
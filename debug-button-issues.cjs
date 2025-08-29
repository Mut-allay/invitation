const admin = require('firebase-admin');

// Initialize Firebase Admin for live database
admin.initializeApp({
  projectId: 'garaji-flow-test'
});

const db = admin.firestore();

async function debugButtonIssues() {
  try {
    console.log('🔍 Debugging Button Issues and charAt/length Errors...\n');

    // 1. Check for string fields that might be undefined (causing charAt errors)
    console.log('📝 Checking for undefined string fields...');
    
    // Check vehicles for undefined string fields
    const vehiclesSnapshot = await db.collection('vehicles').get();
    console.log(`Found ${vehiclesSnapshot.size} vehicles in Firestore`);
    
    vehiclesSnapshot.docs.forEach((doc, index) => {
      const vehicle = doc.data();
      const stringFields = ['make', 'model', 'plateNumber', 'customerId'];
      stringFields.forEach(field => {
        if (vehicle[field] === undefined || vehicle[field] === null) {
          console.log(`⚠️  Vehicle ${index + 1} (${doc.id}): ${field} is ${vehicle[field]}`);
        } else if (typeof vehicle[field] !== 'string') {
          console.log(`⚠️  Vehicle ${index + 1} (${doc.id}): ${field} is not a string (${typeof vehicle[field]})`);
        }
      });
    });

    // Check customers for undefined string fields
    const customersSnapshot = await db.collection('customers').get();
    console.log(`\nFound ${customersSnapshot.size} customers in Firestore`);
    
    customersSnapshot.docs.forEach((doc, index) => {
      const customer = doc.data();
      const stringFields = ['name', 'email', 'phone', 'address'];
      stringFields.forEach(field => {
        if (customer[field] === undefined || customer[field] === null) {
          console.log(`⚠️  Customer ${index + 1} (${doc.id}): ${field} is ${customer[field]}`);
        } else if (typeof customer[field] !== 'string') {
          console.log(`⚠️  Customer ${index + 1} (${doc.id}): ${field} is not a string (${typeof customer[field]})`);
        }
      });
    });

    // 2. Check for array fields that might be undefined (causing length errors)
    console.log('\n📊 Checking for undefined array fields...');
    
    // Check if any collections have array fields that might be undefined
    const collections = ['vehicles', 'customers', 'sales', 'repairs', 'inventory', 'invoices'];
    
    for (const collectionName of collections) {
      const snapshot = await db.collection(collectionName).get();
      console.log(`\n📋 ${collectionName.toUpperCase()} collection (${snapshot.size} documents):`);
      
      if (snapshot.size > 0) {
        const sampleDoc = snapshot.docs[0].data();
        console.log('Sample document fields:', Object.keys(sampleDoc));
        
        // Check for any array fields
        Object.keys(sampleDoc).forEach(field => {
          const value = sampleDoc[field];
          if (Array.isArray(value)) {
            console.log(`  ✅ ${field}: Array with ${value.length} items`);
          } else if (value === undefined || value === null) {
            console.log(`  ⚠️  ${field}: ${value}`);
          }
        });
      }
    }

    // 3. Check for specific data structure issues
    console.log('\n🔧 Checking for specific data structure issues...');
    
    // Check if vehicles have required fields for buttons to work
    vehiclesSnapshot.docs.forEach((doc, index) => {
      const vehicle = doc.data();
      console.log(`\nVehicle ${index + 1} (${doc.id}):`);
      console.log('  Make:', vehicle.make);
      console.log('  Model:', vehicle.model);
      console.log('  Plate Number:', vehicle.plateNumber);
      console.log('  Customer ID:', vehicle.customerId);
      console.log('  Has ID field:', 'id' in vehicle);
      console.log('  Document ID:', doc.id);
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

    // 5. Check for any data inconsistencies that might affect button functionality
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

    // 6. Simulate the data that components would receive
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
      
      // Test potential charAt operations
      if (vehicle.make) {
        try {
          const firstChar = vehicle.make.charAt(0);
          console.log('  ✅ Make.charAt(0):', firstChar);
        } catch (error) {
          console.log('  ❌ Make.charAt(0) error:', error.message);
        }
      }
      
      if (vehicle.model) {
        try {
          const firstChar = vehicle.model.charAt(0);
          console.log('  ✅ Model.charAt(0):', firstChar);
        } catch (error) {
          console.log('  ❌ Model.charAt(0) error:', error.message);
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

debugButtonIssues(); 
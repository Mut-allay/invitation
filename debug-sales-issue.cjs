const admin = require('firebase-admin');

// Initialize Firebase Admin for live database
admin.initializeApp({
  projectId: 'garaji-flow-test'
});

const db = admin.firestore();

async function debugSalesIssue() {
  try {
    console.log('🔍 Debugging Sales Page charAt issue...\n');

    // Check vehicles data structure
    const vehiclesSnapshot = await db.collection('vehicles').get();
    console.log(`🚗 Vehicles: ${vehiclesSnapshot.size} records`);
    
    if (vehiclesSnapshot.size > 0) {
      console.log('\n📋 Vehicle data structure:');
      vehiclesSnapshot.docs.forEach((doc, index) => {
        const vehicle = doc.data();
        console.log(`\nVehicle ${index + 1}:`);
        console.log('  ID:', doc.id);
        console.log('  Fields:', Object.keys(vehicle));
        console.log('  Data:', JSON.stringify(vehicle, null, 2));
      });
    }

    // Check if there are any undefined values in statuses array
    console.log('\n🔍 Checking for undefined values in statuses array...');
    const statuses = ['available', 'sold', 'reserved'];
    console.log('Statuses array:', statuses);
    
    statuses.forEach((status, index) => {
      console.log(`Status ${index}: "${status}" (type: ${typeof status})`);
      if (status === undefined || status === null) {
        console.log(`⚠️  Status ${index} is undefined/null!`);
      }
    });

    // Test charAt operation
    console.log('\n🧪 Testing charAt operations:');
    statuses.forEach((status, index) => {
      try {
        const result = status ? status.charAt(0).toUpperCase() + status.slice(1) : '';
        console.log(`Status ${index}: "${status}" -> "${result}" ✅`);
      } catch (error) {
        console.log(`Status ${index}: "${status}" -> ERROR: ${error.message} ❌`);
      }
    });

    console.log('\n✅ Debug complete!');

  } catch (error) {
    console.error('❌ Error debugging:', error);
  } finally {
    process.exit(0);
  }
}

debugSalesIssue(); 
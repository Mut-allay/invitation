const admin = require('firebase-admin');

// Initialize Firebase Admin for live database
admin.initializeApp({
  projectId: 'garaji-flow-test'
});

const db = admin.firestore();

async function debugCustomersIssue() {
  try {
    console.log('🔍 Debugging Customers Page length issue...\n');

    // Check customers data structure
    const customersSnapshot = await db.collection('customers').get();
    console.log(`📊 Customers: ${customersSnapshot.size} records`);
    
    if (customersSnapshot.size > 0) {
      console.log('\n📋 Customers data structure:');
      customersSnapshot.docs.forEach((doc, index) => {
        const customer = doc.data();
        console.log(`\nCustomer ${index + 1}:`);
        console.log('  ID:', doc.id);
        console.log('  Fields:', Object.keys(customer));
        console.log('  Data:', JSON.stringify(customer, null, 2));
      });
    }

    // Test customers array operations
    console.log('\n🧪 Testing customers array operations:');
    const customers = customersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log('Customers array length:', customers.length);
    console.log('Customers array type:', typeof customers);
    console.log('Is array:', Array.isArray(customers));
    
    // Test safe customers
    const safeCustomers = customers || [];
    console.log('Safe customers length:', safeCustomers.length);
    
    // Test filtering
    const filteredCustomers = safeCustomers.filter(customer => {
      const matchesSearch = customer.name.toLowerCase().includes('test');
      return matchesSearch;
    });
    console.log('Filtered customers length:', filteredCustomers.length);

    console.log('\n✅ Debug complete!');

  } catch (error) {
    console.error('❌ Error debugging:', error);
  } finally {
    process.exit(0);
  }
}

debugCustomersIssue(); 
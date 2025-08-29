const admin = require('firebase-admin');

// Initialize Firebase Admin for live database
admin.initializeApp({
  projectId: 'garaji-flow-test'
});

const db = admin.firestore();

async function debugDashboardIssue() {
  try {
    console.log('🔍 Debugging Dashboard toLocaleString issue...\n');

    // Check sales data structure
    const salesSnapshot = await db.collection('sales').get();
    console.log(`💰 Sales: ${salesSnapshot.size} records`);
    
    if (salesSnapshot.size > 0) {
      console.log('\n📋 Sales data structure:');
      salesSnapshot.docs.forEach((doc, index) => {
        const sale = doc.data();
        console.log(`\nSale ${index + 1}:`);
        console.log('  ID:', doc.id);
        console.log('  Fields:', Object.keys(sale));
        console.log('  Data:', JSON.stringify(sale, null, 2));
        
        // Check for amount field
        if (sale.amount !== undefined) {
          console.log(`  Amount: ${sale.amount} (type: ${typeof sale.amount})`);
        } else {
          console.log(`  ⚠️  Amount field is undefined!`);
        }
      });
    }

    // Test totalSales calculation
    console.log('\n🧪 Testing totalSales calculation:');
    const sales = salesSnapshot.docs.map(doc => doc.data());
    console.log('Sales array length:', sales.length);
    
    const totalSales = sales.reduce((sum, sale) => {
      const amount = sale.amount || 0;
      console.log(`Sale amount: ${amount} (type: ${typeof amount})`);
      return sum + amount;
    }, 0);
    
    console.log(`Total sales: ${totalSales} (type: ${typeof totalSales})`);
    
    try {
      const formatted = totalSales.toLocaleString();
      console.log(`Formatted: ${formatted} ✅`);
    } catch (error) {
      console.log(`Error formatting: ${error.message} ❌`);
    }

    console.log('\n✅ Debug complete!');

  } catch (error) {
    console.error('❌ Error debugging:', error);
  } finally {
    process.exit(0);
  }
}

debugDashboardIssue(); 
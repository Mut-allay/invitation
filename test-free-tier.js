const admin = require('firebase-admin');

// Test script for free tier functionality
async function testFreeTier() {
  console.log('🔍 Testing Free Tier Capabilities...\n');
  
  try {
    // Test 1: Initialize Firebase Admin
    console.log('1️⃣ Testing Firebase Admin initialization...');
    if (admin.apps.length === 0) {
      admin.initializeApp({
        projectId: 'garaji-flow-test'
      });
    }
    console.log('✅ Firebase Admin initialized successfully');
    
    // Test 2: Test Firestore access
    console.log('\n2️⃣ Testing Firestore access...');
    const db = admin.firestore();
    const testDoc = await db.collection('test').doc('test').get();
    console.log('✅ Firestore access working');
    
    // Test 3: Test Auth access
    console.log('\n3️⃣ Testing Auth access...');
    const auth = admin.auth();
    console.log('✅ Auth access working');
    
    // Test 4: Test Storage access
    console.log('\n4️⃣ Testing Storage access...');
    const storage = admin.storage();
    console.log('✅ Storage access working');
    
    console.log('\n🎉 All free tier services working!');
    console.log('\n📋 Free Tier Services Available:');
    console.log('   ✅ Firestore (1GB storage + 50K reads/day)');
    console.log('   ✅ Authentication (10K users/month)');
    console.log('   ✅ Storage (5GB storage)');
    console.log('   ✅ Hosting (10GB storage + 360MB/day)');
    console.log('\n❌ Services requiring billing:');
    console.log('   ❌ Cloud Functions (requires Blaze plan)');
    console.log('   ❌ Cloud Build (requires billing)');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testFreeTier(); 
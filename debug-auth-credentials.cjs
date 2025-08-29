const admin = require('firebase-admin');

// Initialize Firebase Admin for live database
admin.initializeApp({
  projectId: 'garaji-flow-test'
});

const db = admin.firestore();
const auth = admin.auth();

async function debugAuthCredentials() {
  try {
    console.log('🔍 Debugging Authentication Credentials...\n');

    // 1. Check if users exist in Firebase Auth
    console.log('👤 Checking Firebase Auth Users...');
    try {
      const listUsersResult = await auth.listUsers();
      console.log(`Found ${listUsersResult.users.length} users in Firebase Auth`);
      
      if (listUsersResult.users.length > 0) {
        listUsersResult.users.forEach((user, index) => {
          console.log(`\nUser ${index + 1}:`);
          console.log(`  UID: ${user.uid}`);
          console.log(`  Email: ${user.email}`);
          console.log(`  Email Verified: ${user.emailVerified}`);
          console.log(`  Disabled: ${user.disabled}`);
          console.log(`  Created At: ${user.metadata.creationTime}`);
          console.log(`  Last Sign In: ${user.metadata.lastSignInTime}`);
          console.log(`  Custom Claims:`, user.customClaims || 'None');
        });
      } else {
        console.log('  ❌ No users found in Firebase Auth');
      }
    } catch (error) {
      console.log(`  ❌ Error listing Firebase Auth users: ${error.message}`);
    }

    // 2. Check if users exist in Firestore
    console.log('\n📋 Checking Firestore Users Collection...');
    try {
      const usersSnapshot = await db.collection('users').get();
      console.log(`Found ${usersSnapshot.size} users in Firestore`);
      
      if (!usersSnapshot.empty) {
        usersSnapshot.docs.forEach((doc, index) => {
          const user = doc.data();
          console.log(`\nUser ${index + 1} (${doc.id}):`);
          console.log(`  Email: ${user.email || 'N/A'}`);
          console.log(`  Role: ${user.role || 'N/A'}`);
          console.log(`  Name: ${user.name || 'N/A'}`);
          console.log(`  Password: ${user.password ? '***HIDDEN***' : 'N/A'}`);
          console.log(`  Created At: ${user.createdAt ? (user.createdAt.toDate ? user.createdAt.toDate().toISOString() : 'Invalid Timestamp') : 'N/A'}`);
          console.log(`  All fields:`, Object.keys(user));
        });
      } else {
        console.log('  ❌ No users found in Firestore users collection');
      }
    } catch (error) {
      console.log(`  ❌ Error accessing Firestore users: ${error.message}`);
    }

    // 3. Check for users in other collections
    console.log('\n🔍 Checking for users in other collections...');
    const collections = ['customers', 'employees', 'staff'];
    
    for (const collectionName of collections) {
      try {
        const snapshot = await db.collection(collectionName).get();
        console.log(`\n📋 ${collectionName.toUpperCase()} collection (${snapshot.size} documents):`);
        
        if (!snapshot.empty) {
          snapshot.docs.forEach((doc, index) => {
            const data = doc.data();
            console.log(`  ${index + 1}. ${doc.id}:`);
            console.log(`     Email: ${data.email || 'N/A'}`);
            console.log(`     Role: ${data.role || 'N/A'}`);
            console.log(`     Name: ${data.name || 'N/A'}`);
            if (data.password) {
              console.log(`     Password: ***HIDDEN***`);
            }
          });
        }
      } catch (error) {
        console.log(`  ❌ Error accessing ${collectionName}: ${error.message}`);
      }
    }

    // 4. Check authentication configuration
    console.log('\n⚙️ Checking Authentication Configuration...');
    try {
      const authConfig = await auth.getAuthConfig();
      console.log('  ✅ Firebase Auth is properly configured');
      console.log(`  Allowed Domains: ${authConfig.allowedDomains || 'None'}`);
    } catch (error) {
      console.log(`  ❌ Error checking auth config: ${error.message}`);
    }

    // 5. Test specific credentials from the list
    console.log('\n🧪 Testing Specific Credentials...');
    const testCredentials = [
      { email: 'admin@garajiflow.com', password: 'Admin123!', uid: 'user_1756458339122_c6o6otpms' },
      { email: 'manager@garajiflow.com', password: 'Manager123!', uid: 'user_1756458342664_lxgnsbclb' },
      { email: 'mechanic@garajiflow.com', password: 'Mechanic123!', uid: 'user_1756458343251_ssajro312' },
      { email: 'sales@garajiflow.com', password: 'Sales123!', uid: 'user_1756458344215_h3k50medt' },
      { email: 'accountant@garajiflow.com', password: 'Accountant123!', uid: 'user_1756458344829_r7fgy8ov7' },
      { email: 'receptionist@garajiflow.com', password: 'Reception123!', uid: 'user_1756458346745_tsap39toj' }
    ];

    for (const cred of testCredentials) {
      console.log(`\n🔍 Testing: ${cred.email}`);
      
      // Check if UID exists in Firebase Auth
      try {
        const userRecord = await auth.getUser(cred.uid);
        console.log(`  ✅ UID ${cred.uid} exists in Firebase Auth`);
        console.log(`     Email: ${userRecord.email}`);
        console.log(`     Email Verified: ${userRecord.emailVerified}`);
        console.log(`     Disabled: ${userRecord.disabled}`);
      } catch (error) {
        console.log(`  ❌ UID ${cred.uid} not found in Firebase Auth: ${error.message}`);
      }

      // Check if user exists in Firestore
      try {
        const userDoc = await db.collection('users').doc(cred.uid).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          console.log(`  ✅ User found in Firestore`);
          console.log(`     Role: ${userData.role || 'N/A'}`);
          console.log(`     Name: ${userData.name || 'N/A'}`);
          console.log(`     Has Password: ${userData.password ? 'Yes' : 'No'}`);
        } else {
          console.log(`  ❌ User not found in Firestore users collection`);
        }
      } catch (error) {
        console.log(`  ❌ Error checking Firestore: ${error.message}`);
      }
    }

    // 6. Check for any authentication rules or restrictions
    console.log('\n🔐 Checking Authentication Rules...');
    try {
      const projectConfig = await db.app.options;
      console.log(`  Project ID: ${projectConfig.projectId}`);
      console.log(`  Database URL: ${projectConfig.databaseURL || 'Not set'}`);
    } catch (error) {
      console.log(`  ❌ Error checking project config: ${error.message}`);
    }

    console.log('\n✅ Auth debugging complete!');

  } catch (error) {
    console.error('❌ Error during auth debugging:', error);
  } finally {
    process.exit(0);
  }
}

debugAuthCredentials(); 
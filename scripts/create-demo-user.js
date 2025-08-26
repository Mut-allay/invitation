const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

// Initialize Firebase Admin (you'll need to add your service account key)
const serviceAccount = require('../service-account-key.json');

initializeApp({
  credential: require('firebase-admin').credential.cert(serviceAccount),
});

const auth = getAuth();

async function createDemoUser() {
  try {
    console.log('🔐 Creating demo user...');
    
    const userRecord = await auth.createUser({
      email: 'admin@demoautoshop.com',
      password: 'demo123456',
      displayName: 'Demo Admin',
      emailVerified: true,
    });

    console.log('✅ Demo user created successfully!');
    console.log('User ID:', userRecord.uid);
    console.log('Email:', userRecord.email);
    
    // Set custom claims for admin role
    await auth.setCustomUserClaims(userRecord.uid, {
      role: 'admin',
      tenantId: 'demo-tenant-001',
      permissions: ['create_invoice', 'delete_vehicle', 'manage_users', 'view_reports', 'manage_settings'],
    });

    console.log('✅ Admin role and permissions set!');
    console.log('\n🎉 Demo user ready!');
    console.log('Email: admin@demoautoshop.com');
    console.log('Password: demo123456');
    
  } catch (error) {
    console.error('❌ Error creating demo user:', error.message);
    
    if (error.code === 'auth/email-already-exists') {
      console.log('ℹ️  User already exists. You can use the existing credentials.');
    } else if (error.code === 'auth/operation-not-allowed') {
      console.log('❌ Email/Password authentication is not enabled.');
      console.log('Please enable it in Firebase Console first.');
    }
  }
}

createDemoUser(); 
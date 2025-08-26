import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin with default credentials
// This will use the current user's credentials from gcloud auth
initializeApp({
  projectId: 'garaji-flow-test',
});

const auth = getAuth();

async function createDemoUser() {
  try {
    console.log('🔐 Creating demo user...');
    
    // Check if user already exists
    try {
      const existingUser = await auth.getUserByEmail('admin@demoautoshop.com');
      console.log('✅ Demo user already exists!');
      console.log('User ID:', existingUser.uid);
      console.log('Email:', existingUser.email);
      console.log('\n🎉 You can log in with:');
      console.log('Email: admin@demoautoshop.com');
      console.log('Password: demo123456');
      return;
    } catch (error) {
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
    }
    
    // Create new user
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
    console.log('\n🌐 Test login at: https://garaji-flow-test.web.app');
    
  } catch (error) {
    console.error('❌ Error creating demo user:', error.message);
    
    if (error.code === 'auth/email-already-exists') {
      console.log('ℹ️  User already exists. You can use the existing credentials.');
    } else if (error.code === 'auth/operation-not-allowed') {
      console.log('❌ Email/Password authentication is not enabled.');
      console.log('Please enable it in Firebase Console first.');
    } else if (error.code === 'auth/insufficient-permission') {
      console.log('❌ Insufficient permissions. Please check your Firebase Admin setup.');
    } else {
      console.log('❌ Unexpected error. Please check the error details above.');
    }
  }
}

createDemoUser(); 
const admin = require('firebase-admin');

// Initialize Firebase Admin for the correct project
admin.initializeApp({
  projectId: 'garaji-flow-test'
});

const db = admin.firestore();
const auth = admin.auth();

async function createUsersInCorrectProject() {
  try {
    console.log('🔧 Creating Users in garaji-flow-test Project...\n');

    const users = [
      {
        email: 'admin@garajiflow.com',
        password: 'Admin123!',
        role: 'admin',
        displayName: 'System Administrator',
        permissions: ['all'],
        tenantId: 'demo-tenant',
        isActive: true
      },
      {
        email: 'manager@garajiflow.com',
        password: 'Manager123!',
        role: 'manager',
        displayName: 'Service Manager',
        permissions: ['service_management', 'reports', 'inventory', 'repairs'],
        tenantId: 'demo-tenant',
        isActive: true
      },
      {
        email: 'mechanic@garajiflow.com',
        password: 'Mechanic123!',
        role: 'mechanic',
        displayName: 'Lead Mechanic',
        permissions: ['repairs', 'inventory', 'vehicles'],
        tenantId: 'demo-tenant',
        isActive: true
      },
      {
        email: 'sales@garajiflow.com',
        password: 'Sales123!',
        role: 'sales',
        displayName: 'Sales Representative',
        permissions: ['customers', 'vehicles', 'sales', 'invoices'],
        tenantId: 'demo-tenant',
        isActive: true
      },
      {
        email: 'accountant@garajiflow.com',
        password: 'Accountant123!',
        role: 'accountant',
        displayName: 'Accountant',
        permissions: ['invoices', 'reports', 'customers', 'financial'],
        tenantId: 'demo-tenant',
        isActive: true
      },
      {
        email: 'receptionist@garajiflow.com',
        password: 'Reception123!',
        role: 'receptionist',
        displayName: 'Receptionist',
        permissions: ['customers', 'appointments', 'basic_reports'],
        tenantId: 'demo-tenant',
        isActive: true
      }
    ];

    for (const userData of users) {
      console.log(`\n👤 Creating user: ${userData.email}`);
      
      try {
        // Create user in Firebase Auth
        const userRecord = await auth.createUser({
          email: userData.email,
          password: userData.password,
          displayName: userData.displayName,
          emailVerified: true
        });

        console.log(`  ✅ Created in Firebase Auth with UID: ${userRecord.uid}`);

        // Set custom claims for role-based access
        await auth.setCustomUserClaims(userRecord.uid, {
          role: userData.role,
          permissions: userData.permissions,
          tenantId: userData.tenantId
        });

        console.log(`  ✅ Set custom claims for role: ${userData.role}`);

        // Store user data in Firestore
        await db.collection('users').doc(userRecord.uid).set({
          uid: userRecord.uid,
          email: userData.email,
          password: userData.password, // For custom auth fallback
          displayName: userData.displayName,
          role: userData.role,
          permissions: userData.permissions,
          tenantId: userData.tenantId,
          isActive: userData.isActive,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log(`  ✅ Stored in Firestore with UID: ${userRecord.uid}`);

      } catch (error) {
        if (error.code === 'auth/email-already-exists') {
          console.log(`  ⚠️  User ${userData.email} already exists in Firebase Auth`);
          
          // Try to get the existing user
          try {
            const existingUser = await auth.getUserByEmail(userData.email);
            console.log(`  ✅ Found existing user with UID: ${existingUser.uid}`);
            
            // Update custom claims
            await auth.setCustomUserClaims(existingUser.uid, {
              role: userData.role,
              permissions: userData.permissions,
              tenantId: userData.tenantId
            });
            console.log(`  ✅ Updated custom claims for role: ${userData.role}`);
            
            // Update Firestore data
            await db.collection('users').doc(existingUser.uid).set({
              uid: existingUser.uid,
              email: userData.email,
              password: userData.password,
              displayName: userData.displayName,
              role: userData.role,
              permissions: userData.permissions,
              tenantId: userData.tenantId,
              isActive: userData.isActive,
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            
            console.log(`  ✅ Updated Firestore data`);
            
          } catch (getUserError) {
            console.log(`  ❌ Error getting existing user: ${getUserError.message}`);
          }
        } else {
          console.log(`  ❌ Error creating user: ${error.message}`);
        }
      }
    }

    console.log('\n✅ User creation complete!');
    console.log('\n📋 Updated Login Credentials:');
    console.log('🌐 URL: https://garaji-flow-test.web.app/settings');
    
    users.forEach(user => {
      console.log(`\n${getRoleIcon(user.role)} ${user.role.toUpperCase()} (${user.displayName}):`);
      console.log(`    • Email: ${user.email}`);
      console.log(`    • Password: ${user.password}`);
    });

  } catch (error) {
    console.error('❌ Error during user creation:', error);
  } finally {
    process.exit(0);
  }
}

function getRoleIcon(role) {
  const icons = {
    admin: '👑',
    manager: '👔',
    mechanic: '🔧',
    sales: '💰',
    accountant: '📊',
    receptionist: '📞'
  };
  return icons[role] || '👤';
}

createUsersInCorrectProject(); 
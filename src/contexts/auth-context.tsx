import React, { useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile as updateFirebaseProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, getDocs, query, collection, where } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { AuthContext } from './auth-context-definition';
import type { UserProfile, UserRole, RegistrationData, PasswordResetData } from './auth-types';

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (uid: string): Promise<UserProfile | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data() as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  const createUserProfile = async (uid: string, data: RegistrationData): Promise<UserProfile> => {
    const userProfile: UserProfile = {
      uid,
      email: data.email,
      displayName: data.displayName,
      role: data.role,
      isActive: true,
      createdAt: new Date(),
      permissions: getDefaultPermissions(data.role)
    };

    await setDoc(doc(db, 'users', uid), userProfile);
    return userProfile;
  };

  const getDefaultPermissions = (role: UserRole): string[] => {
    switch (role) {
      case 'admin':
        return ['manage_users', 'manage_vehicles', 'manage_customers', 'manage_invoices', 'view_reports'];
      case 'manager':
        return ['manage_vehicles', 'manage_customers', 'manage_invoices', 'view_reports'];
      case 'technician':
        return ['manage_repairs', 'view_vehicles', 'view_customers'];
      case 'cashier':
        return ['manage_invoices', 'view_vehicles', 'view_customers'];
      default:
        return [];
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const profile = await fetchUserProfile(user.uid);
        setUserProfile(profile);
        
        // Update last login time
        if (profile) {
          await updateDoc(doc(db, 'users', user.uid), {
            lastLoginAt: new Date()
          });
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // First try Firebase Auth
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      // If Firebase Auth fails, try custom authentication with Firestore users
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        console.log('Firebase Auth failed, trying custom authentication...');
        
        // Query Firestore for user
        const userQuery = await getDocs(query(collection(db, 'users'), where('email', '==', email)));
        
        if (userQuery.empty) {
          throw new Error('User not found');
        }
        
        const userDoc = userQuery.docs[0];
        const userData = userDoc.data();
        
        // Check password (in production, this should be hashed)
        if (userData.password !== password) {
          throw new Error('Invalid password');
        }
        
        // Create a mock Firebase user object
        const mockUser = {
          uid: userData.uid,
          email: userData.email,
          displayName: userData.displayName,
          emailVerified: true,
        } as any;
        
        // Set the user directly (bypass Firebase Auth)
        setUser(mockUser);
        setUserProfile(userData as UserProfile);
        
        // Update last login time
        await updateDoc(doc(db, 'users', userData.uid), {
          lastLoginAt: new Date()
        });
        
        return; // Success
      }
      
      // Re-throw other errors
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const register = async (data: RegistrationData) => {
    const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
    const user = userCredential.user;
    
    // Update Firebase profile
    await updateFirebaseProfile(user, {
      displayName: data.displayName
    });
    
    // Create user profile in Firestore
    const profile = await createUserProfile(user.uid, data);
    setUserProfile(profile);
  };

  const resetPassword = async (data: PasswordResetData) => {
    await sendPasswordResetEmail(auth, data.email);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in');
    
    await updateDoc(doc(db, 'users', user.uid), updates);
    
    if (userProfile) {
      setUserProfile({ ...userProfile, ...updates });
    }
  };

  const hasPermission = (permission: string): boolean => {
    return userProfile?.permissions?.includes(permission) || false;
  };

  const hasRole = (role: UserRole): boolean => {
    return userProfile?.role === role;
  };

  const value = {
    user,
    userProfile,
    loading,
    login,
    logout,
    register,
    resetPassword,
    updateProfile,
    hasPermission,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export { AuthProvider };

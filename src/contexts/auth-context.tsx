import React, { useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile as updateFirebaseProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
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
    await signInWithEmailAndPassword(auth, email, password);
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

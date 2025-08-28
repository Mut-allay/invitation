import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '../config/firebase';
import { AuthContext } from './auth-context-definition';
import type { UserProfile } from './auth-types';
import { UserRole } from './auth-types';

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      // Mock user profile for testing - in real app this would come from Firestore
      if (user) {
        setUserProfile({
          id: user.uid,
          email: user.email || '',
          name: user.displayName || 'User',
          role: UserRole.ADMIN,
          tenantId: 'test-tenant'
        });
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

  const register = async (email: string, password: string, userData: Partial<UserProfile>) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    // In real app, you would save userData to Firestore here
    console.log('User registered:', result.user, 'with data:', userData);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const hasPermission = (permission: string): boolean => {
    // Mock permission check - in real app this would check user role and permissions
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _permission = permission; // Use permission parameter to avoid linting error
    return userProfile?.role === UserRole.ADMIN || userProfile?.role === UserRole.MANAGER;
  };

  const value = {
    user,
    userProfile,
    loading,
    login,
    logout,
    register,
    resetPassword,
    hasPermission,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export { AuthProvider };

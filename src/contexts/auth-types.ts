import type { User as FirebaseUser } from 'firebase/auth';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId?: string;
}

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  MECHANIC = 'mechanic',
  CASHIER = 'cashier',
  VIEWER = 'viewer'
}

export interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, userData: Partial<UserProfile>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

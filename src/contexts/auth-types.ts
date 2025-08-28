import type { User as FirebaseUser } from 'firebase/auth';

export type UserRole = 'admin' | 'manager' | 'technician' | 'cashier';

export enum UserRoleEnum {
  ADMIN = 'admin',
  MANAGER = 'manager',
  TECHNICIAN = 'technician',
  CASHIER = 'cashier',
  VIEWER = 'viewer'
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  tenantId?: string;
  isActive: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
  permissions: string[];
}

export interface RegistrationData {
  email: string;
  password: string;
  displayName: string;
  role: UserRole;
}

export interface PasswordResetData {
  email: string;
}

export interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegistrationData) => Promise<void>;
  resetPassword: (data: PasswordResetData) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: UserRole) => boolean;
}

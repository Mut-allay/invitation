
import * as admin from 'firebase-admin';

export interface PartsEqualization {
  id: string;
  tenantId: string;
  partnerTenantId: string; // Initially, this will be the same as tenantId
  period: string; // YYYY-MM format
  totalAmount: number;
  status: 'pending' | 'calculated' | 'settled';
  settlementDate?: admin.firestore.Timestamp;
  settlementMethod?: 'mobile_money' | 'bank_transfer' | 'cash';
  settlementReference?: string;
  createdBy: string;
  createdAt: admin.firestore.Timestamp;
}

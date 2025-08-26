export interface Customer {
  id: string;
  tenantId: string;
  name: string;
  phone: string;
  nrc: string;
  address: string;
  email?: string;
  vehiclesOwned: string[];
  createdAt: Date;
  updatedAt: Date;
  // Advanced CRM fields
  serviceHistory?: ServiceRecord[];
  communicationPreferences?: CommunicationPreferences;
  customerSegment?: CustomerSegment;
  lastServiceDate?: Date;
  nextServiceDue?: Date;
  totalSpent?: number;
  loyaltyPoints?: number;
  notes?: string;
  tags?: string[];
}

export interface CustomerFormData {
  name: string;
  phone: string;
  nrc: string;
  address: string;
  email?: string;
  communicationPreferences?: CommunicationPreferences;
  customerSegment?: CustomerSegment;
  notes?: string;
  tags?: string[];
}

// Service History
export interface ServiceRecord {
  id: string;
  customerId: string;
  vehicleId: string;
  serviceDate: Date;
  serviceType: ServiceType;
  description: string;
  cost: number;
  mileage: number;
  nextServiceMileage?: number;
  nextServiceDate?: Date;
  technician?: string;
  status: ServiceStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type ServiceType = 
  | 'oil_change'
  | 'brake_service'
  | 'tire_rotation'
  | 'engine_tune_up'
  | 'transmission_service'
  | 'air_filter_replacement'
  | 'battery_replacement'
  | 'coolant_flush'
  | 'other';

export type ServiceStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

// Communication Preferences
export interface CommunicationPreferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  whatsappNotifications: boolean;
  serviceReminders: boolean;
  promotionalMessages: boolean;
  preferredContactMethod: 'email' | 'sms' | 'whatsapp' | 'phone';
  preferredContactTime: 'morning' | 'afternoon' | 'evening' | 'anytime';
  language: 'en' | 'bem' | 'nya' | 'toi';
}

// Customer Segmentation
export type CustomerSegment = 
  | 'premium'
  | 'regular'
  | 'occasional'
  | 'prospect'
  | 'inactive';

// Service Reminders
export interface ServiceReminder {
  id: string;
  customerId: string;
  vehicleId: string;
  reminderType: 'mileage' | 'time' | 'manual';
  dueDate: Date;
  dueMileage?: number;
  currentMileage?: number;
  message: string;
  status: ReminderStatus;
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type ReminderStatus = 'pending' | 'sent' | 'acknowledged' | 'completed' | 'cancelled';

// Communication History
export interface CommunicationRecord {
  id: string;
  customerId: string;
  type: 'email' | 'sms' | 'whatsapp' | 'phone_call';
  direction: 'inbound' | 'outbound';
  subject?: string;
  message: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  sentAt: Date;
  deliveredAt?: Date;
  readAt?: Date;
  createdAt: Date;
}

// Customer Analytics
export interface CustomerAnalytics {
  customerId: string;
  totalServices: number;
  totalSpent: number;
  averageServiceCost: number;
  lastServiceDate?: Date;
  nextServiceDue?: Date;
  loyaltyPoints: number;
  serviceFrequency: number; // services per year
  customerLifetimeValue: number;
  retentionRate: number;
  createdAt: Date;
  updatedAt: Date;
} 
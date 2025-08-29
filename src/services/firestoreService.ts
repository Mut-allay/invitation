import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  limit,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Generic Firestore service for free tier
export class FirestoreService {
  
  // Get all documents from a collection
  static async getAll<T>(collectionName: string, tenantId?: string): Promise<T[]> {
    try {
      let q = collection(db, collectionName);
      
      if (tenantId) {
        q = query(q, where('tenantId', '==', tenantId));
      }
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];
    } catch (error) {
      console.error(`Error getting ${collectionName}:`, error);
      return [];
    }
  }

  // Get a single document
  static async getById<T>(collectionName: string, id: string): Promise<T | null> {
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as T;
      }
      return null;
    } catch (error) {
      console.error(`Error getting ${collectionName} by id:`, error);
      return null;
    }
  }

  // Add a new document
  static async add<T>(collectionName: string, data: Omit<T, 'id'>): Promise<string | null> {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error(`Error adding ${collectionName}:`, error);
      return null;
    }
  }

  // Update a document
  static async update<T>(collectionName: string, id: string, data: Partial<T>): Promise<boolean> {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
      return true;
    } catch (error) {
      console.error(`Error updating ${collectionName}:`, error);
      return false;
    }
  }

  // Delete a document
  static async delete(collectionName: string, id: string): Promise<boolean> {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error(`Error deleting ${collectionName}:`, error);
      return false;
    }
  }

  // Query documents with filters
  static async query<T>(
    collectionName: string, 
    filters: Array<{ field: string; operator: any; value: any }>,
    orderByField?: string,
    limitCount?: number
  ): Promise<T[]> {
    try {
      let q = collection(db, collectionName);
      
      // Apply filters
      filters.forEach(filter => {
        q = query(q, where(filter.field, filter.operator, filter.value));
      });
      
      // Apply ordering
      if (orderByField) {
        q = query(q, orderBy(orderByField));
      }
      
      // Apply limit
      if (limitCount) {
        q = query(q, limit(limitCount));
      }
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];
    } catch (error) {
      console.error(`Error querying ${collectionName}:`, error);
      return [];
    }
  }
}

// Specific services for each collection
export const customersService = {
  getAll: (tenantId?: string) => FirestoreService.getAll('customers', tenantId),
  getById: (id: string) => FirestoreService.getById('customers', id),
  add: (data: any) => FirestoreService.add('customers', data),
  update: (id: string, data: any) => FirestoreService.update('customers', id, data),
  delete: (id: string) => FirestoreService.delete('customers', id),
};

export const vehiclesService = {
  getAll: (tenantId?: string) => FirestoreService.getAll('vehicles', tenantId),
  getById: (id: string) => FirestoreService.getById('vehicles', id),
  add: (data: any) => FirestoreService.add('vehicles', data),
  update: (id: string, data: any) => FirestoreService.update('vehicles', id, data),
  delete: (id: string) => FirestoreService.delete('vehicles', id),
};

export const salesService = {
  getAll: (tenantId?: string) => FirestoreService.getAll('sales', tenantId),
  getById: (id: string) => FirestoreService.getById('sales', id),
  add: (data: any) => FirestoreService.add('sales', data),
  update: (id: string, data: any) => FirestoreService.update('sales', id, data),
  delete: (id: string) => FirestoreService.delete('sales', id),
};

export const repairsService = {
  getAll: (tenantId?: string) => FirestoreService.getAll('repairs', tenantId),
  getById: (id: string) => FirestoreService.getById('repairs', id),
  add: (data: any) => FirestoreService.add('repairs', data),
  update: (id: string, data: any) => FirestoreService.update('repairs', id, data),
  delete: (id: string) => FirestoreService.delete('repairs', id),
};

export const invoicesService = {
  getAll: (tenantId?: string) => FirestoreService.getAll('invoices', tenantId),
  getById: (id: string) => FirestoreService.getById('invoices', id),
  add: (data: any) => FirestoreService.add('invoices', data),
  update: (id: string, data: any) => FirestoreService.update('invoices', id, data),
  delete: (id: string) => FirestoreService.delete('invoices', id),
}; 
import { useState, useEffect } from 'react';
import type { Customer } from '../types/index';

// Mock customer data
const mockCustomers: Customer[] = [
  {
    id: '1',
    tenantId: 'demo-tenant',
    name: 'John Banda',
    phone: '+260 955 123 456',
    nrc: '1234567890',
    address: '123 Great East Road, Lusaka',
    email: 'john.banda@email.com',
    vehiclesOwned: [],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    tenantId: 'demo-tenant',
    name: 'Sarah Mwale',
    phone: '+260 966 234 567',
    nrc: '0987654321',
    address: '456 Cairo Road, Lusaka',
    email: 'sarah.mwale@email.com',
    vehiclesOwned: [],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '3',
    tenantId: 'demo-tenant',
    name: 'Zambia Motors Ltd',
    phone: '+260 211 345 678',
    nrc: 'ZM123456789',
    address: '789 Independence Avenue, Lusaka',
    email: 'info@zambiamotors.co.zm',
    vehiclesOwned: [],
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
  },
  {
    id: '4',
    tenantId: 'demo-tenant',
    name: 'Michael Phiri',
    phone: '+260 977 456 789',
    nrc: '1122334455',
    address: '321 Manda Hill, Lusaka',
    email: 'michael.phiri@email.com',
    vehiclesOwned: [],
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-02-15'),
  },
];

export const useMockCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setCustomers(mockCustomers);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return { 
    customers, 
    loading, 
    error
  };
};

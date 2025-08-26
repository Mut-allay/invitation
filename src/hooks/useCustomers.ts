import { useGetCustomersQuery } from '../store/api/customersApi';

export const useCustomers = () => {
  // TODO: Get tenant ID from user context or auth
  const tenantId = 'demo-tenant'; // Default tenant ID for now
  const { data, isLoading, error } = useGetCustomersQuery(tenantId);
  
  return { 
    customers: data || [], 
    loading: isLoading, 
    error 
  };
}; 
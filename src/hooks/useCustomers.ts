import { useGetCustomersQuery } from '../store/api/customersApi';
import { useAuth } from '../contexts/AuthContext';

export const useCustomers = () => {
  const { user } = useAuth();
  const tenantId = user?.tenantId;

  const { data: customers = [], isLoading: loading, error } = useGetCustomersQuery(tenantId, {
    skip: !tenantId,
  });

  return {
    customers,
    loading,
    error: error ? (error as any)?.data?.message || 'Failed to load customers' : null,
  };
}; 
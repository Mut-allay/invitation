import { useGetSalesQuery } from '../store/api/salesApi';
import { useAuth } from '../contexts/AuthContext';

export const useSales = () => {
  const { user } = useAuth();
  const tenantId = user?.tenantId;

  const { data: sales = [], isLoading: loading, error } = useGetSalesQuery(tenantId, {
    skip: !tenantId,
  });

  return {
    sales,
    loading,
    error: error ? (error as any)?.data?.message || 'Failed to load sales' : null,
  };
}; 
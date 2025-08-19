import { useGetRepairsQuery } from '../store/api/repairsApi';
import { useAuth } from '../contexts/AuthContext';

export const useRepairs = () => {
  const { user } = useAuth();
  const tenantId = user?.tenantId;

  const { data: repairs = [], isLoading: loading, error } = useGetRepairsQuery(tenantId, {
    skip: !tenantId,
  });

  return {
    repairs,
    loading,
    error: error ? (error as any)?.data?.message || 'Failed to load repairs' : null,
  };
}; 
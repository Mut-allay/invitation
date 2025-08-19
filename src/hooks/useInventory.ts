import { useGetInventoryQuery } from '../store/api/inventoryApi';
import { useAuth } from '../contexts/AuthContext';

export const useInventory = () => {
  const { user } = useAuth();
  const tenantId = user?.tenantId;

  const { data: inventory = [], isLoading: loading, error } = useGetInventoryQuery(tenantId, {
    skip: !tenantId,
  });

  return {
    inventory,
    loading,
    error: error ? (error as any)?.data?.message || 'Failed to load inventory' : null,
  };
}; 
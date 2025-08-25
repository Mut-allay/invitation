import { useGetInventoryQuery } from '../store/api/inventoryApi';

export const useInventory = () => {
  // TODO: Get tenant ID from user context or auth
  const tenantId = 'demo-tenant'; // Default tenant ID for now
  const { data, isLoading, error } = useGetInventoryQuery(tenantId);
  
  return { 
    inventory: data || [], 
    loading: isLoading, 
    error 
  };
}; 
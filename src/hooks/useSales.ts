import { useGetSalesQuery } from '../store/api/salesApi';

export const useSales = () => {
  // TODO: Get tenant ID from user context or auth
  const tenantId = 'demo-tenant'; // Default tenant ID for now
  const { data, isLoading, error } = useGetSalesQuery({ tenantId });
  
  return { 
    sales: data || [], 
    loading: isLoading, 
    error 
  };
}; 
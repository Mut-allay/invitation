import { useGetRepairsQuery } from '../store/api/repairsApi';

export const useRepairs = () => {
  // TODO: Get tenant ID from user context or auth
  const tenantId = 'demo-tenant'; // Default tenant ID for now
  const { data, isLoading, error } = useGetRepairsQuery(tenantId);
  
  return { 
    repairs: data || [], 
    loading: isLoading, 
    error 
  };
}; 
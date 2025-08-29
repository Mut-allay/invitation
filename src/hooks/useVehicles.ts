import { useGetVehiclesQuery } from '../store/api/vehiclesApi';

export const useVehicles = () => {
  // TODO: Get tenant ID from user context or auth
  const tenantId = 'demo-tenant'; // Default tenant ID for now
  const { data, isLoading, error } = useGetVehiclesQuery({ tenantId });
  
  return { 
    vehicles: data || [], 
    loading: isLoading, 
    error 
  };
}; 
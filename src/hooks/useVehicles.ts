import { useGetVehiclesQuery } from '../store/api/vehiclesApi';
import { useAuth } from '../contexts/AuthContext';

export const useVehicles = () => {
  const { user } = useAuth();
  const tenantId = user?.tenantId;

  const { data: vehicles = [], isLoading: loading, error } = useGetVehiclesQuery(tenantId, {
    skip: !tenantId,
  });

  return {
    vehicles,
    loading,
    error: error ? (error as any)?.data?.message || 'Failed to load vehicles' : null,
  };
}; 
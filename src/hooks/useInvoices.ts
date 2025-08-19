import { useGetInvoicesQuery } from '../store/api/invoicesApi';
import { useAuth } from '../contexts/AuthContext';

export const useInvoices = () => {
  const { user } = useAuth();
  const tenantId = user?.tenantId;

  const { data: invoices = [], isLoading: loading, error } = useGetInvoicesQuery(tenantId, {
    skip: !tenantId,
  });

  return {
    invoices,
    loading,
    error: error ? (error as any)?.data?.message || 'Failed to load invoices' : null,
  };
}; 
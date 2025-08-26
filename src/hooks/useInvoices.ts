import { useGetInvoicesQuery } from '../store/api/invoicesApi';

export const useInvoices = () => {
  // TODO: Get tenant ID from user context or auth
  const tenantId = 'demo-tenant'; // Default tenant ID for now
  const { data, isLoading, error } = useGetInvoicesQuery(tenantId);
  
  return { 
    invoices: data || [], 
    loading: isLoading, 
    error 
  };
}; 
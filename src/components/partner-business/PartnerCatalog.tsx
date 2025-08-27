
import React from 'react';
import { useGetPartnerCatalogQuery } from '../../store/api/partnerBusinessApi';

interface PartnerCatalogProps {
  partnerTenantId: string;
}

export const PartnerCatalog: React.FC<PartnerCatalogProps> = ({ partnerTenantId }) => {
  const tenantId = 'demo-tenant'; // This will be replaced with the actual tenantId from context
  const { data: catalog, error, isLoading } = useGetPartnerCatalogQuery({ tenantId, partnerTenantId });

  return (
    <div>
      <h2>Partner Catalog for {partnerTenantId}</h2>
      {isLoading && <p>Loading...</p>}
      {error && <p>Error loading catalog.</p>}
      {catalog && (
        <ul>
          {catalog.map((item) => (
            <li key={item.id}>{item.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

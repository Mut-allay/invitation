
import React from 'react';
import { useGetEqualizationsQuery } from '../../store/api/paymentEqualizationApi';

export const EqualizationDashboard: React.FC = () => {
  const tenantId = 'demo-tenant'; // This will be replaced with the actual tenantId from context
  const { data: equalizations, error, isLoading } = useGetEqualizationsQuery(tenantId);

  return (
    <div>
      <h1>Payment Equalization Dashboard</h1>
      {isLoading && <p>Loading...</p>}
      {error && <p>Error loading data.</p>}
      {equalizations && (
        <table>
          <thead>
            <tr>
              <th>Period</th>
              <th>Total Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {equalizations.map((eq) => (
              <tr key={eq.id}>
                <td>{eq.period}</td>
                <td>{eq.totalAmount.toFixed(2)}</td>
                <td>{eq.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

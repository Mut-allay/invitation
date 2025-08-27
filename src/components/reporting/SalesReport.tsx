// src/components/reporting/SalesReport.tsx
import React from 'react';

interface SalesReportProps {
  salesData: {
    sales: number;
  } | null;
}

const SalesReport: React.FC<SalesReportProps> = ({ salesData }) => {
  return (
    <div className="p-4 border rounded shadow">
      <h2 className="text-xl font-bold">Sales Report</h2>
      {salesData ? (
        <div>
          <p className="text-lg">Total Sales: <span className="font-bold">${salesData.sales.toFixed(2)}</span></p>
          {/* TODO: Add charts for sales data visualization */}
        </div>
      ) : (
        <p>No sales data available.</p>
      )}
    </div>
  );
};

export default SalesReport;

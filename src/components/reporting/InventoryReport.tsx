// src/components/reporting/InventoryReport.tsx
import React from 'react';

interface InventoryReportProps {
  inventoryData: {
    inventoryTurnover: number;
  } | null;
}

const InventoryReport: React.FC<InventoryReportProps> = ({ inventoryData }) => {
  return (
    <div className="p-4 border rounded shadow">
      <h2 className="text-xl font-bold">Inventory Report</h2>
      {inventoryData ? (
        <div>
          <p className="text-lg">Inventory Turnover: <span className="font-bold">{inventoryData.inventoryTurnover.toFixed(2)}</span></p>
          {/* TODO: Add charts for inventory data visualization */}
        </div>
      ) : (
        <p>No inventory data available.</p>
      )}
    </div>
  );
};

export default InventoryReport;

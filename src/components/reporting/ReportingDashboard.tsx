// src/components/reporting/ReportingDashboard.tsx
import React, { useState } from 'react';
import SalesReport from './SalesReport';
import InventoryReport from './InventoryReport';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { ReportData } from '../../../functions/src/reporting/generateReport';

const ReportingDashboard: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const handleGenerateReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const functions = getFunctions();
      const generateReport = httpsCallable(functions, 'generateReport');
      const result = await generateReport(dateRange);
      setReportData(result.data as ReportData);
    } catch (err) {
      setError('Failed to generate report.');
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Reporting Dashboard</h1>
      <div className="mt-4 flex items-center space-x-2">
        <input
          type="date"
          value={dateRange.startDate}
          onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          type="date"
          value={dateRange.endDate}
          onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
          className="border p-2 rounded"
        />
        <button onClick={handleGenerateReport} disabled={loading} className="bg-blue-500 text-white p-2 rounded">
          {loading ? 'Generating...' : 'Generate Report'}
        </button>
      </div>
      {error && <div className="text-red-500 mt-2">{error}</div>}
      {reportData && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <SalesReport salesData={{ sales: reportData.sales }} />
          <InventoryReport inventoryData={{ inventoryTurnover: reportData.inventoryTurnover }} />
        </div>
      )}
    </div>
  );
};

export default ReportingDashboard;

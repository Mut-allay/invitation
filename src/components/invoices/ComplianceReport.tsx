import React, { useState, useEffect, useCallback } from 'react';
import {
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  CloudIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { zraApi, ZRAComplianceReport } from '../../store/api/zraApi';
import { formatZMW } from '../../utils/zraValidation';

interface ComplianceReportProps {
  onClose: () => void;
}

const ComplianceReport: React.FC<ComplianceReportProps> = ({ onClose }) => {
  const [report, setReport] = useState<ZRAComplianceReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [zraStatus, setZraStatus] = useState<'ONLINE' | 'OFFLINE'>('OFFLINE');

  const periods = [
    { value: 'current-month', label: 'Current Month' },
    { value: 'last-month', label: 'Last Month' },
    { value: 'current-quarter', label: 'Current Quarter' },
    { value: 'last-quarter', label: 'Last Quarter' },
    { value: 'current-year', label: 'Current Year' }
  ];

  const loadComplianceReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const complianceReport = await zraApi.getComplianceReport(selectedPeriod);
      setReport(complianceReport);
    } catch (err) {
      setError('Failed to load compliance report');
      console.error('Error loading compliance report:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    loadComplianceReport();
    checkZRAStatus();
  }, [selectedPeriod, loadComplianceReport]);

  const checkZRAStatus = async () => {
    try {
      const status = await zraApi.checkZRAStatus();
      setZraStatus(status.status);
    } catch (err) {
      console.error('Error checking ZRA status:', err);
      setZraStatus('OFFLINE');
    }
  };

  const getComplianceStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLIANT':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'NON_COMPLIANT':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getComplianceStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLIANT':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'NON_COMPLIANT':
        return <XCircleIcon className="h-5 w-5 text-red-600" />;
      case 'PENDING':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getZRAStatusColor = (status: 'ONLINE' | 'OFFLINE') => {
    return status === 'ONLINE' 
      ? 'text-green-600 bg-green-50 border-green-200' 
      : 'text-red-600 bg-red-50 border-red-200';
  };

  const getZRAStatusIcon = (status: 'ONLINE' | 'OFFLINE') => {
    return status === 'ONLINE' 
      ? <CloudIcon className="h-5 w-5 text-green-600" />
      : <XCircleIcon className="h-5 w-5 text-red-600" />;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <DocumentTextIcon className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">ZRA Compliance Report</h1>
              <p className="text-gray-600">Monitor your ZRA compliance status and reporting</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Close
          </button>
        </div>

        {/* ZRA Status Indicator */}
        <div className="mb-6">
          <div className={`inline-flex items-center px-3 py-2 rounded-full border ${getZRAStatusColor(zraStatus)}`}>
            {getZRAStatusIcon(zraStatus)}
            <span className="ml-2 text-sm font-medium">
              ZRA API: {zraStatus === 'ONLINE' ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Period Selector */}
        <div className="mb-6">
          <label htmlFor="period" className="block text-sm font-medium text-gray-700 mb-2">
            Report Period
          </label>
          <select
            id="period"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="input-field max-w-xs"
          >
            {periods.map(period => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading compliance report...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <XCircleIcon className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {report && !loading && (
          <>
            {/* Compliance Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Invoices</p>
                    <p className="text-2xl font-bold text-gray-900">{report.totalInvoices}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Amount</p>
                    <p className="text-2xl font-bold text-gray-900">{formatZMW(report.totalAmount)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <ChartBarIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total VAT</p>
                    <p className="text-2xl font-bold text-gray-900">{formatZMW(report.totalVAT)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <CheckCircleIcon className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Submitted</p>
                    <p className="text-2xl font-bold text-gray-900">{report.submittedInvoices}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Compliance Status */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Compliance Status</h2>
              <div className={`inline-flex items-center px-4 py-2 rounded-lg border ${getComplianceStatusColor(report.complianceStatus)}`}>
                {getComplianceStatusIcon(report.complianceStatus)}
                <span className="ml-2 font-medium">
                  {report.complianceStatus === 'COMPLIANT' && 'Fully Compliant'}
                  {report.complianceStatus === 'NON_COMPLIANT' && 'Non-Compliant'}
                  {report.complianceStatus === 'PENDING' && 'Pending Review'}
                </span>
              </div>
              
              {report.lastSubmissionDate && (
                <p className="text-sm text-gray-600 mt-2">
                  Last submission: {new Date(report.lastSubmissionDate).toLocaleDateString()}
                </p>
              )}
            </div>

            {/* Detailed Statistics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Status Breakdown</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Submitted to ZRA</span>
                    <span className="font-semibold text-green-600">{report.submittedInvoices}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Pending Submission</span>
                    <span className="font-semibold text-yellow-600">{report.pendingInvoices}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Invoices</span>
                    <span className="font-semibold text-gray-900">{report.totalInvoices}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Invoice Value</span>
                    <span className="font-semibold text-gray-900">{formatZMW(report.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total VAT Collected</span>
                    <span className="font-semibold text-purple-600">{formatZMW(report.totalVAT)}</span>
                  </div>
                  <div className="flex justify-between items-center border-t pt-2">
                    <span className="text-gray-600">Net Amount</span>
                    <span className="font-semibold text-blue-600">{formatZMW(report.totalAmount - report.totalVAT)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Compliance Recommendations */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Recommendations</h3>
              <div className="space-y-3">
                {report.complianceStatus === 'COMPLIANT' && (
                  <div className="flex items-start">
                    <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5 mr-3" />
                    <div>
                      <p className="text-green-800 font-medium">Excellent compliance status</p>
                      <p className="text-green-700 text-sm">All invoices have been properly submitted to ZRA</p>
                    </div>
                  </div>
                )}
                
                {report.complianceStatus === 'NON_COMPLIANT' && (
                  <div className="flex items-start">
                    <XCircleIcon className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
                    <div>
                      <p className="text-red-800 font-medium">Immediate action required</p>
                      <p className="text-red-700 text-sm">Submit pending invoices to ZRA to maintain compliance</p>
                    </div>
                  </div>
                )}
                
                {report.complianceStatus === 'PENDING' && (
                  <div className="flex items-start">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                    <div>
                      <p className="text-yellow-800 font-medium">Review required</p>
                      <p className="text-yellow-700 text-sm">Some invoices are pending ZRA review</p>
                    </div>
                  </div>
                )}

                {report.pendingInvoices > 0 && (
                  <div className="flex items-start">
                    <ClockIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                    <div>
                      <p className="text-blue-800 font-medium">Pending submissions</p>
                      <p className="text-blue-700 text-sm">
                        {report.pendingInvoices} invoice(s) need to be submitted to ZRA
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ComplianceReport;

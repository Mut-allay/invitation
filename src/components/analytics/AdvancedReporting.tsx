import React, { useState } from 'react';
import { 
  DocumentTextIcon,
  ChartBarIcon,
  TableCellsIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  CogIcon,
  PlusIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'sales' | 'inventory' | 'customers' | 'repairs' | 'financial';
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
}

interface CustomReport {
  id: string;
  name: string;
  description: string;
  filters: any;
  columns: string[];
  schedule?: string;
  lastGenerated?: Date;
}

interface AdvancedReportingProps {
  className?: string;
}

const AdvancedReporting: React.FC<AdvancedReportingProps> = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState<'templates' | 'custom' | 'scheduled'>('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showReportBuilder, setShowReportBuilder] = useState(false);
  const [customReports, setCustomReports] = useState<CustomReport[]>([]);

  const reportTemplates: ReportTemplate[] = [
    {
      id: 'sales-summary',
      name: 'Sales Summary Report',
      description: 'Comprehensive sales performance analysis with trends and comparisons',
      type: 'sales',
      icon: ChartBarIcon,
      color: 'text-blue-600 bg-blue-50'
    },
    {
      id: 'inventory-status',
      name: 'Inventory Status Report',
      description: 'Current inventory levels, low stock alerts, and turnover analysis',
      type: 'inventory',
      icon: TableCellsIcon,
      color: 'text-green-600 bg-green-50'
    },
    {
      id: 'customer-insights',
      name: 'Customer Insights Report',
      description: 'Customer behavior analysis, retention rates, and acquisition metrics',
      type: 'customers',
      icon: DocumentTextIcon,
      color: 'text-purple-600 bg-purple-50'
    },
    {
      id: 'repair-performance',
      name: 'Repair Performance Report',
      description: 'Service completion rates, technician performance, and repair trends',
      type: 'repairs',
      icon: CogIcon,
      color: 'text-yellow-600 bg-yellow-50'
    },
    {
      id: 'financial-summary',
      name: 'Financial Summary Report',
      description: 'Revenue analysis, profit margins, and financial performance metrics',
      type: 'financial',
      icon: ChartBarIcon,
      color: 'text-emerald-600 bg-emerald-50'
    }
  ];

  const handleGenerateReport = (templateId: string) => {
    setSelectedTemplate(templateId);
    setShowReportBuilder(true);
  };

  const handleExportReport = (format: 'pdf' | 'excel' | 'csv') => {
    console.log(`Exporting report in ${format} format`);
    // Simulate export process
    setTimeout(() => {
      alert(`${format.toUpperCase()} report exported successfully!`);
    }, 1000);
  };

  const handleScheduleReport = (templateId: string) => {
    console.log(`Scheduling report: ${templateId}`);
    // Simulate scheduling process
    setTimeout(() => {
      alert('Report scheduled successfully!');
    }, 1000);
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <DocumentTextIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Advanced Reporting</h3>
              <p className="text-indigo-100 text-sm">Custom reports, exports, and scheduled analytics</p>
            </div>
          </div>
          <button
            onClick={() => setShowReportBuilder(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
            <span>New Report</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex">
          {[
            { id: 'templates', label: 'Report Templates', count: reportTemplates.length },
            { id: 'custom', label: 'Custom Reports', count: customReports.length },
            { id: 'scheduled', label: 'Scheduled Reports', count: 2 }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-all duration-200 ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <span>{tab.label}</span>
                <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-xs">
                  {tab.count}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'templates' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reportTemplates.map((template) => {
                const IconComponent = template.icon;
                return (
                  <div
                    key={template.id}
                    className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-lg ${template.color}`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleScheduleReport(template.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                          title="Schedule Report"
                        >
                          <CalendarIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{template.name}</h4>
                    <p className="text-gray-600 text-sm mb-4">{template.description}</p>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleGenerateReport(template.id)}
                        className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                      >
                        Generate
                      </button>
                      <button
                        onClick={() => handleExportReport('pdf')}
                        className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        title="Export as PDF"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'custom' && (
          <div className="space-y-6">
            {customReports.length === 0 ? (
              <div className="text-center py-12">
                <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Custom Reports</h3>
                <p className="text-gray-600 mb-4">Create your first custom report to get started</p>
                <button
                  onClick={() => setShowReportBuilder(true)}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Create Custom Report
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {customReports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div>
                      <h4 className="font-medium text-gray-900">{report.name}</h4>
                      <p className="text-sm text-gray-600">{report.description}</p>
                      {report.lastGenerated && (
                        <p className="text-xs text-gray-500 mt-1">
                          Last generated: {report.lastGenerated.toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'scheduled' && (
          <div className="space-y-4">
            {[
              { name: 'Daily Sales Report', schedule: 'Daily at 8:00 AM', lastRun: '2024-01-15 08:00' },
              { name: 'Weekly Inventory Report', schedule: 'Every Monday at 9:00 AM', lastRun: '2024-01-15 09:00' }
            ].map((report, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div>
                  <h4 className="font-medium text-gray-900">{report.name}</h4>
                  <p className="text-sm text-gray-600">Schedule: {report.schedule}</p>
                  <p className="text-xs text-gray-500 mt-1">Last run: {report.lastRun}</p>
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    Active
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <CogIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Report Builder Modal */}
      {showReportBuilder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Report Builder</h3>
              <button
                onClick={() => setShowReportBuilder(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-6">
                Configure your custom report with filters, columns, and export options.
              </p>
              {/* Report builder form would go here */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="reportName" className="block text-sm font-medium text-gray-700 mb-2">Report Name</label>
                  <input
                    id="reportName"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter report name"
                  />
                </div>
                <div>
                  <label htmlFor="reportDescription" className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    id="reportDescription"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    rows={3}
                    placeholder="Enter report description"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowReportBuilder(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowReportBuilder(false);
                    alert('Report created successfully!');
                  }}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Create Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedReporting;

import React, { useState } from 'react';
import { CalendarIcon } from '@heroicons/react/24/outline';

interface DateRangeFilterProps {
  onDateRangeChange: (startDate: Date, endDate: Date) => void;
  className?: string;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({ 
  onDateRangeChange, 
  className = '' 
}) => {
  const [selectedRange, setSelectedRange] = useState('7');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const predefinedRanges = [
    { value: '7', label: 'Last 7 days', color: 'from-blue-500 to-blue-600' },
    { value: '30', label: 'Last 30 days', color: 'from-green-500 to-green-600' },
    { value: '90', label: 'Last 90 days', color: 'from-yellow-500 to-yellow-600' },
    { value: '365', label: 'Last year', color: 'from-purple-500 to-purple-600' },
    { value: 'custom', label: 'Custom Range', color: 'from-gray-500 to-gray-600' }
  ];

  const handleRangeChange = (range: string) => {
    setSelectedRange(range);
    
    if (range !== 'custom') {
      const days = parseInt(range);
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      onDateRangeChange(startDate, endDate);
    }
  };

  const handleCustomDateChange = () => {
    if (customStartDate && customEndDate) {
      const startDate = new Date(customStartDate);
      const endDate = new Date(customEndDate);
      
      if (startDate <= endDate) {
        onDateRangeChange(startDate, endDate);
      }
    }
  };

  const getMaxDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className={`bg-gradient-to-r from-white to-gray-50 p-6 rounded-xl shadow-sm border border-gray-200 ${className}`}>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl shadow-lg">
            <CalendarIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Date Range Filter</h3>
            <p className="text-sm text-gray-600">Select a time period to analyze your data</p>
          </div>
        </div>
        
        <div className="flex flex-col space-y-4">
          {/* Predefined Ranges */}
          <div className="flex flex-wrap gap-3">
            {predefinedRanges.map((range) => (
              <button
                key={range.value}
                onClick={() => handleRangeChange(range.value)}
                className={`group px-4 py-2 text-sm font-medium rounded-lg border-2 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 ${
                  selectedRange === range.value
                    ? `bg-gradient-to-r ${range.color} text-white border-transparent shadow-lg`
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:shadow-md'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <span>{range.label}</span>
                  {selectedRange === range.value && (
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  )}
                </span>
              </button>
            ))}
          </div>

          {/* Custom Date Range */}
          {selectedRange === 'custom' && (
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="flex items-center space-x-3">
                  <label htmlFor="startDate" className="text-sm font-medium text-gray-700">
                    From:
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    max={getMaxDate()}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  />
                </div>
                
                <div className="flex items-center space-x-3">
                  <label htmlFor="endDate" className="text-sm font-medium text-gray-700">
                    To:
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    max={getMaxDate()}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  />
                </div>
                
                <button
                  onClick={handleCustomDateChange}
                  disabled={!customStartDate || !customEndDate}
                  className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 hover:shadow-lg disabled:hover:scale-100 disabled:hover:shadow-none"
                >
                  Apply Filter
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DateRangeFilter;

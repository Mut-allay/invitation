import React from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface ChartData {
  [key: string]: string | number;
}

interface MainChartProps {
  data: ChartData[];
  type: 'bar' | 'line';
  dataKey: string;
  xAxisKey?: string;
  title?: string;
  loading?: boolean;
  height?: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number | string }>;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="text-sm font-medium text-gray-900">{`${label}`}</p>
        <p className="text-sm text-blue-600 font-semibold">
          {`${payload[0].name}: ${payload[0].value}`}
        </p>
      </div>
    );
  }
  return null;
};

const LoadingSkeleton: React.FC<{ height?: number }> = ({ height = 300 }) => (
  <div 
    className="bg-gray-100 rounded-lg animate-pulse"
    style={{ height: `${height}px` }}
  >
    <div className="h-full flex items-center justify-center">
      <div className="text-gray-400">Loading chart...</div>
    </div>
  </div>
);

const MainChart: React.FC<MainChartProps> = ({
  data,
  type,
  dataKey,
  xAxisKey = 'name',
  title,
  loading = false,
  height = 300
}) => {
  if (loading) {
    return <LoadingSkeleton height={height} />;
  }

  if (!data || data.length === 0) {
    return (
      <div 
        className="bg-white border border-gray-200 rounded-lg flex items-center justify-center"
        style={{ height: `${height}px` }}
      >
        <div className="text-gray-500">No data available</div>
      </div>
    );
  }

  const chartColors = {
    bar: {
      fill: '#3B82F6', // blue-500
      stroke: '#1D4ED8', // blue-700
    },
    line: {
      stroke: '#3B82F6', // blue-500
      fill: '#DBEAFE', // blue-100
    }
  };

  const renderChart = () => {
    if (type === 'bar') {
      return (
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis 
            dataKey={xAxisKey} 
            stroke="#6B7280"
            fontSize={12}
          />
          <YAxis 
            stroke="#6B7280"
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey={dataKey} 
            fill={chartColors.bar.fill}
            stroke={chartColors.bar.stroke}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      );
    }

    if (type === 'line') {
      return (
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis 
            dataKey={xAxisKey} 
            stroke="#6B7280"
            fontSize={12}
          />
          <YAxis 
            stroke="#6B7280"
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone"
            dataKey={dataKey} 
            stroke={chartColors.line.stroke}
            strokeWidth={2}
            dot={{ fill: chartColors.line.stroke, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: chartColors.line.stroke, strokeWidth: 2 }}
          />
        </LineChart>
      );
    }

    return null;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
};

export default MainChart;

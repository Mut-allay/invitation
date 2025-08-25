import React from 'react';
import { 
  EyeIcon, 
  PencilIcon, 
  CubeIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import type { Inventory } from '../../types/index';

interface InventoryCardProps {
  item: Inventory;
  onView: () => void;
  onEdit: () => void;
}

export const InventoryCard: React.FC<InventoryCardProps> = ({ item, onView, onEdit }) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'part':
        return <CubeIcon className="h-4 w-4" />;
      case 'tool':
        return <CubeIcon className="h-4 w-4" />; // Assuming WrenchScrewdriverIcon is removed or replaced
      case 'consumable':
        return <CubeIcon className="h-4 w-4" />; // Assuming BeakerIcon is removed or replaced
      default:
        return <CubeIcon className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'part':
        return 'bg-blue-100 text-blue-800';
      case 'tool':
        return 'bg-yellow-100 text-yellow-800';
      case 'consumable':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStockStatus = () => {
    if (item.currentStock <= 0) {
      return { color: 'bg-red-100 text-red-800', text: 'Out of Stock' };
    } else if (item.currentStock <= item.reorderLevel) {
      return { color: 'bg-yellow-100 text-yellow-800', text: 'Low Stock' };
    } else {
      return { color: 'bg-green-100 text-green-800', text: 'In Stock' };
    }
  };

  const stockStatus = getStockStatus();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{item.name}</h3>
            <p className="text-sm text-gray-600 font-mono">{item.sku}</p>
          </div>
          <div className="flex space-x-1 ml-2">
            <button
              onClick={onView}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <EyeIcon className="h-4 w-4" />
            </button>
            <button
              onClick={onEdit}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(item.type)}`}>
            {getTypeIcon(item.type)}
            <span className="ml-1">{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</span>
          </span>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${stockStatus.color}`}>
            {stockStatus.text}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Description */}
        {item.description && (
          <div>
            <p className="text-sm text-gray-700 line-clamp-2">{item.description}</p>
          </div>
        )}

        {/* Stock Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-600">Current Stock</label>
            <p className="text-sm font-semibold text-gray-900">{item.currentStock} {item.unit}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Reorder Level</label>
            <p className="text-sm text-gray-900">{item.reorderLevel} {item.unit}</p>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-600">Cost:</span>
            <span className="text-sm font-medium">K{item.cost.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">Selling Price:</span>
            <span className="text-sm font-bold text-green-600">K{item.sellingPrice.toLocaleString()}</span>
          </div>
        </div>

        {/* Location */}
        {item.location && (
          <div>
            <label className="text-xs font-medium text-gray-600">Location</label>
            <p className="text-sm text-gray-900">{item.location}</p>
          </div>
        )}

        {/* Low Stock Warning */}
        {item.currentStock <= item.reorderLevel && (
          <div className="flex items-center space-x-2 p-2 bg-red-50 rounded-lg">
            <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
            <span className="text-xs text-red-700">
              {item.currentStock === 0 ? 'Out of stock' : 'Low stock - reorder needed'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}; 
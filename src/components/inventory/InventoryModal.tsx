import React from 'react';
import { Inventory } from '../../types/inventory';

interface InventoryModalProps {
  item: Inventory | null;
  isOpen: boolean;
  isCreating: boolean;
  onClose: () => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({ 
  item, 
  isOpen, 
  isCreating, 
  onClose 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {isCreating ? 'Add Inventory Item' : 'Edit Inventory Item'}
        </h2>
        {item && (
          <p className="text-gray-600 mb-4">{item.name} - {item.sku}</p>
        )}
        <p className="text-gray-700 mb-4">Inventory management form will be implemented here.</p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}; 
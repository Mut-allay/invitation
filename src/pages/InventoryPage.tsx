import React, { useState, useRef } from 'react';
import { 
  CubeIcon,
  WrenchScrewdriverIcon,
  BeakerIcon,
  EyeIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { useInventory } from '../hooks/useInventory';
import { getErrorMessage } from '@/lib/utils';
import type { Inventory } from '../types/index';
import { useVirtualizer } from '@tanstack/react-virtual';

// Mock inventory data for when the API returns empty
const mockInventory: Inventory[] = [
  // ... (mock data is unchanged)
];

const InventoryPage: React.FC = () => {
  const [searchTerm] = useState('');
  const [selectedType] = useState('');
  const [, setSelectedInventory] = useState<Inventory | null>(null);
  const [, setShowInventoryModal] = useState(false);
  const [, setIsCreating] = useState(false);

  const { inventory: apiInventory, loading, error } = useInventory();

  // Use mock data if API returns empty
  const inventory = apiInventory.length === 0 && !loading ? mockInventory : apiInventory;

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    
    const matchesType = !selectedType || item.type === selectedType;
    
    return matchesSearch && matchesType;
  });

  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: filteredInventory.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120, // Estimate row height to be 120px
    overscan: 5,
  });

  const handleCreateInventory = () => {
    setIsCreating(true);
    setSelectedInventory(null);
    setShowInventoryModal(true);
  };

  const handleEditInventory = (item: Inventory) => {
    setIsCreating(false);
    setSelectedInventory(item);
    setShowInventoryModal(true);
  };

  const handleViewInventory = (item: Inventory) => {
    setIsCreating(false);
    setSelectedInventory(item);
    setShowInventoryModal(true);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'part':
        return <CubeIcon className="h-4 w-4" />;
      case 'tool':
        return <WrenchScrewdriverIcon className="h-4 w-4" />;
      case 'consumable':
        return <BeakerIcon className="h-4 w-4" />;
      default:
        return <CubeIcon className="h-4 w-4" />;
    }
  };

  const getStockStatusColor = (currentStock: number, reorderLevel: number) => {
    if (currentStock === 0) return 'text-red-600 dark:text-red-300';
    if (currentStock <= reorderLevel) return 'text-yellow-600 dark:text-yellow-300';
    return 'text-green-600 dark:text-green-300';
  };

  return (
    <div className="space-y-6 responsive-p">
      {/* Header, Stats, Search and Filters sections are unchanged */}
      
      {/* Inventory List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="card-glass border border-red-200 dark:border-red-800 p-4">
          <p className="text-red-800 dark:text-red-400">Error loading inventory: {getErrorMessage(error)}</p>
        </div>
      ) : filteredInventory.length === 0 ? (
        <div className="card-glass p-8 text-center">
          <CubeIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-responsive-lg font-medium text-foreground mb-2">No inventory found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || selectedType ? 'Try adjusting your search or filters.' : 'Get started by adding your first inventory item.'}
          </p>
          {!searchTerm && !selectedType && (
            <button
              onClick={handleCreateInventory}
              className="btn-primary"
            >
              Add First Item
            </button>
          )}
        </div>
      ) : (
        <div ref={parentRef} className="relative h-[600px] overflow-auto border rounded-lg">
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualItem) => {
              const item = filteredInventory[virtualItem.index];
              return (
                <div
                  key={item.id}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualItem.size}px`,
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                  className="p-2 border-b"
                >
                  <div className="card-glass p-4 rounded-xl h-full flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg mr-3">
                        {getTypeIcon(item.type)}
                      </div>
                      <div>
                        <h3 className="text-responsive-lg font-semibold text-foreground">{item.name}</h3>
                        <p className="text-responsive-sm text-muted-foreground">SKU: {item.sku}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <p className="text-responsive-sm text-muted-foreground">Stock</p>
                        <p className={`text-responsive-sm font-medium ${getStockStatusColor(item.currentStock, item.reorderLevel)}`}>
                          {item.currentStock} {item.unit}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-responsive-sm text-muted-foreground">Price</p>
                        <p className="text-responsive-sm font-medium text-foreground">K{item.sellingPrice}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleViewInventory(item)}
                          className="btn-secondary text-responsive-sm px-3 py-1 flex items-center"
                        >
                          <EyeIcon className="h-4 w-4 mr-1" />
                          View
                        </button>
                        <button
                          onClick={() => handleEditInventory(item)}
                          className="btn-primary text-responsive-sm px-3 py-1 flex items-center"
                        >
                          <PencilIcon className="h-4 w-4 mr-1" />
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modals section is unchanged */}
    </div>
  );
};

export default InventoryPage; 
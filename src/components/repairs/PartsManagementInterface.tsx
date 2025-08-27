import React, { useState, useEffect } from 'react';
import { 
  ExclamationTriangleIcon,
  XMarkIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { Button } from '../ui/button';
import type { 
  PartsInventory, 
  PartsUsage, 
  PartsManagementFormData
} from '../../types/repair';

interface PartsManagementInterfaceProps {
  repairId: string;
  tenantId: string;
  onPartsUsed?: (usage: PartsUsage) => void;
  onStockAlert?: (inventory: PartsInventory) => void;
}

interface PartsManagementState {
  selectedParts: PartsManagementFormData['parts'];
  isAddingParts: boolean;
  searchTerm: string;
  filterCategory: string;
  filterStatus: string;
}

export const PartsManagementInterface: React.FC<PartsManagementInterfaceProps> = ({
  repairId,
  tenantId,
  onPartsUsed,
  onStockAlert
}) => {
  const [partsState, setPartsState] = useState<PartsManagementState>({
    selectedParts: [],
    isAddingParts: false,
    searchTerm: '',
    filterCategory: '',
    filterStatus: ''
  });

  const [partsInventory, setPartsInventory] = useState<PartsInventory[]>([]);
  const [partsUsage, setPartsUsage] = useState<PartsUsage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data - in real implementation, this would come from API
  useEffect(() => {
    const mockPartsInventory: PartsInventory[] = [
      {
        id: '1',
        tenantId,
        sku: 'ENG001',
        name: 'Engine Oil Filter',
        description: 'High quality oil filter for various engine types',
        category: 'Engine Parts',
        currentStock: 50,
        reorderLevel: 10,
        unitCost: 25,
        supplierId: 'supplier-1',
        location: 'Warehouse A - Shelf 1',
        status: 'available',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        tenantId,
        sku: 'BRAKE002',
        name: 'Brake Pads Set',
        description: 'Front brake pads for most vehicles',
        category: 'Brake System',
        currentStock: 8,
        reorderLevel: 15,
        unitCost: 45,
        supplierId: 'supplier-2',
        location: 'Warehouse A - Shelf 2',
        status: 'low_stock',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        tenantId,
        sku: 'BAT003',
        name: 'Car Battery 12V',
        description: '12V car battery with 2-year warranty',
        category: 'Electrical',
        currentStock: 0,
        reorderLevel: 5,
        unitCost: 120,
        supplierId: 'supplier-3',
        location: 'Warehouse B - Shelf 1',
        status: 'out_of_stock',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '4',
        tenantId,
        sku: 'AIR004',
        name: 'Air Filter',
        description: 'Engine air filter for improved performance',
        category: 'Engine Parts',
        currentStock: 25,
        reorderLevel: 8,
        unitCost: 15,
        supplierId: 'supplier-1',
        location: 'Warehouse A - Shelf 3',
        status: 'available',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '5',
        tenantId,
        sku: 'SPARK005',
        name: 'Spark Plugs Set',
        description: 'Set of 4 spark plugs for gasoline engines',
        category: 'Engine Parts',
        currentStock: 12,
        reorderLevel: 10,
        unitCost: 35,
        supplierId: 'supplier-2',
        location: 'Warehouse A - Shelf 4',
        status: 'available',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const mockPartsUsage: PartsUsage[] = [
      {
        id: '1',
        repairId,
        partsInventoryId: '1',
        quantity: 2,
        unitCost: 25,
        totalCost: 50,
        usedBy: 'mechanic-1',
        usedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        notes: 'Oil change service'
      },
      {
        id: '2',
        repairId,
        partsInventoryId: '4',
        quantity: 1,
        unitCost: 15,
        totalCost: 15,
        usedBy: 'mechanic-1',
        usedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        notes: 'Regular maintenance'
      }
    ];

    setPartsInventory(mockPartsInventory);
    setPartsUsage(mockPartsUsage);
  }, [repairId, tenantId]);

  const handleAddParts = () => {
    setPartsState(prev => ({
      ...prev,
      isAddingParts: true,
      selectedParts: []
    }));
  };

  const handlePartsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate form
      if (partsState.selectedParts.length === 0) {
        throw new Error('Please select at least one part');
      }

      // Check stock availability
      const stockErrors: string[] = [];
      partsState.selectedParts.forEach(part => {
        const inventory = partsInventory.find(p => p.id === part.partsInventoryId);
        if (inventory && inventory.currentStock < part.quantity) {
          stockErrors.push(`${inventory.name}: Insufficient stock (${inventory.currentStock} available, ${part.quantity} requested)`);
        }
      });

      if (stockErrors.length > 0) {
        throw new Error(stockErrors.join('\n'));
      }

      // Create parts usage records
      const newUsageRecords: PartsUsage[] = partsState.selectedParts.map(part => {
        const inventory = partsInventory.find(p => p.id === part.partsInventoryId)!;
        return {
          id: Date.now().toString() + Math.random(),
          repairId,
          partsInventoryId: part.partsInventoryId,
          quantity: part.quantity,
          unitCost: inventory.unitCost,
          totalCost: inventory.unitCost * part.quantity,
          usedBy: 'current-user',
          usedAt: new Date(),
          notes: part.notes
        };
      });

      // Update inventory stock
      const updatedInventory = partsInventory.map(inventory => {
        const usedPart = partsState.selectedParts.find(p => p.partsInventoryId === inventory.id);
        if (usedPart) {
          const newStock = inventory.currentStock - usedPart.quantity;
          const newStatus: PartsInventory['status'] = newStock === 0 ? 'out_of_stock' : 
                           newStock <= inventory.reorderLevel ? 'low_stock' : 'available';
          
          return {
            ...inventory,
            currentStock: newStock,
            status: newStatus,
            updatedAt: new Date()
          };
        }
        return inventory;
      });

      setPartsInventory(updatedInventory);
      setPartsUsage(prev => [...prev, ...newUsageRecords]);

      // Trigger stock alerts for low stock items
      updatedInventory.forEach(inventory => {
        if (inventory.status === 'low_stock' || inventory.status === 'out_of_stock') {
          onStockAlert?.(inventory);
        }
      });

      // Notify parent component
      newUsageRecords.forEach(usage => {
        onPartsUsed?.(usage);
      });

      setPartsState(prev => ({
        ...prev,
        isAddingParts: false,
        selectedParts: []
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add parts');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePartSelection = (inventoryId: string, quantity: number, notes?: string) => {
    setPartsState(prev => {
      const existingIndex = prev.selectedParts.findIndex(p => p.partsInventoryId === inventoryId);
      
      if (existingIndex >= 0) {
        // Update existing selection
        const updatedParts = [...prev.selectedParts];
        updatedParts[existingIndex] = { ...updatedParts[existingIndex], quantity, notes };
        return { ...prev, selectedParts: updatedParts };
      } else {
        // Add new selection
        return {
          ...prev,
          selectedParts: [...prev.selectedParts, { partsInventoryId: inventoryId, quantity, notes }]
        };
      }
    });
  };

  const handleRemovePart = (inventoryId: string) => {
    setPartsState(prev => ({
      ...prev,
      selectedParts: prev.selectedParts.filter(p => p.partsInventoryId !== inventoryId)
    }));
  };

  const getFilteredInventory = () => {
    return partsInventory.filter(part => {
      const matchesSearch = part.name.toLowerCase().includes(partsState.searchTerm.toLowerCase()) ||
                           part.sku.toLowerCase().includes(partsState.searchTerm.toLowerCase()) ||
                           part.description.toLowerCase().includes(partsState.searchTerm.toLowerCase());
      
      const matchesCategory = !partsState.filterCategory || part.category === partsState.filterCategory;
      const matchesStatus = !partsState.filterStatus || part.status === partsState.filterStatus;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  };

  const getTotalPartsCost = () => {
    return partsUsage.reduce((total, usage) => total + usage.totalCost, 0);
  };

  const getStockStatusColor = (status: PartsInventory['status']) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'low_stock':
        return 'bg-yellow-100 text-yellow-800';
      case 'out_of_stock':
        return 'bg-red-100 text-red-800';
      case 'discontinued':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategories = () => {
    return [...new Set(partsInventory.map(part => part.category))];
  };

  const formatCurrency = (amount: number) => {
    return `K${amount.toLocaleString()}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Parts Management Interface</h3>
          <p className="text-sm text-gray-600">Repair #{repairId.slice(-6)}</p>
        </div>
        <Button onClick={handleAddParts}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Parts
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-800 whitespace-pre-line">{error}</span>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search parts by name, SKU, or description..."
              value={partsState.searchTerm}
              onChange={(e) => setPartsState(prev => ({ ...prev, searchTerm: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={partsState.filterCategory}
            onChange={(e) => setPartsState(prev => ({ ...prev, filterCategory: e.target.value }))}
            className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Categories</option>
            {getCategories().map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <select
            value={partsState.filterStatus}
            onChange={(e) => setPartsState(prev => ({ ...prev, filterStatus: e.target.value }))}
            className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="available">Available</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
            <option value="discontinued">Discontinued</option>
          </select>
        </div>
      </div>

      {/* Parts Inventory */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Available Parts</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {getFilteredInventory().map(part => (
            <div
              key={part.id}
              className={`p-4 border rounded-lg ${
                part.status === 'out_of_stock' ? 'border-red-200 bg-red-50' :
                part.status === 'low_stock' ? 'border-yellow-200 bg-yellow-50' :
                'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900">{part.name}</h5>
                  <p className="text-sm text-gray-600">{part.sku}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStockStatusColor(part.status)}`}>
                  {part.status.replace('_', ' ')}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{part.description}</p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Stock:</span>
                  <span className={`font-medium ${
                    part.currentStock <= part.reorderLevel ? 'text-red-600' : 'text-gray-900'
                  }`}>
                    {part.currentStock} / {part.reorderLevel} (reorder)
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Cost:</span>
                  <span className="font-medium text-gray-900">{formatCurrency(part.unitCost)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Location:</span>
                  <span className="text-gray-900">{part.location}</span>
                </div>
              </div>

              {part.status !== 'out_of_stock' && part.status !== 'discontinued' && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="1"
                      max={part.currentStock}
                      placeholder="Qty"
                      className="w-16 p-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      onChange={(e) => {
                        const quantity = parseInt(e.target.value) || 0;
                        if (quantity > 0 && quantity <= part.currentStock) {
                          handlePartSelection(part.id, quantity);
                        }
                      }}
                    />
                    <span className="text-xs text-gray-500">max: {part.currentStock}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Parts Usage Summary */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Parts Used in This Repair</h4>
        {partsUsage.length === 0 ? (
          <p className="text-gray-500 italic">No parts used yet</p>
        ) : (
          <div className="space-y-3">
            {partsUsage.map(usage => {
              const part = partsInventory.find(p => p.id === usage.partsInventoryId);
              return (
                <div key={usage.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900">{part?.name}</h5>
                    <p className="text-sm text-gray-600">
                      {usage.quantity} × {formatCurrency(usage.unitCost)} = {formatCurrency(usage.totalCost)}
                    </p>
                    {usage.notes && (
                      <p className="text-xs text-gray-500 mt-1">{usage.notes}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{formatCurrency(usage.totalCost)}</p>
                    <p className="text-xs text-gray-500">
                      {usage.usedAt.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              );
            })}
            
            <div className="border-t pt-3">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900">Total Parts Cost:</span>
                <span className="text-lg font-bold text-green-600">
                  {formatCurrency(getTotalPartsCost())}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Parts Modal */}
      {partsState.isAddingParts && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Add Parts to Repair</h4>
            
            <form onSubmit={handlePartsSubmit} className="space-y-4">
              {/* Selected Parts */}
              {partsState.selectedParts.length > 0 && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-3">Selected Parts:</h5>
                  <div className="space-y-2">
                    {partsState.selectedParts.map(selectedPart => {
                      const part = partsInventory.find(p => p.id === selectedPart.partsInventoryId);
                      return (
                        <div key={selectedPart.partsInventoryId} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{part?.name}</p>
                            <p className="text-sm text-gray-600">
                              Qty: {selectedPart.quantity} × {formatCurrency(part?.unitCost || 0)} = {formatCurrency((part?.unitCost || 0) * selectedPart.quantity)}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemovePart(selectedPart.partsInventoryId)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Parts Selection */}
              <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-3">Available Parts:</h5>
                <div className="space-y-2">
                  {getFilteredInventory()
                    .filter(part => part.status !== 'out_of_stock' && part.status !== 'discontinued')
                    .map(part => (
                    <div key={part.id} className="flex justify-between items-center p-2 border border-gray-200 rounded">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{part.name}</p>
                        <p className="text-sm text-gray-600">
                          Stock: {part.currentStock} | Cost: {formatCurrency(part.unitCost)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min="1"
                          max={part.currentStock}
                          placeholder="Qty"
                          className="w-16 p-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          onChange={(e) => {
                            const quantity = parseInt(e.target.value) || 0;
                            if (quantity > 0 && quantity <= part.currentStock) {
                              handlePartSelection(part.id, quantity);
                            }
                          }}
                        />
                        <span className="text-xs text-gray-500">max: {part.currentStock}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPartsState(prev => ({ ...prev, isAddingParts: false }))}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || partsState.selectedParts.length === 0}
                  className="flex-1"
                >
                  {isLoading ? 'Adding...' : 'Add Parts'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}; 
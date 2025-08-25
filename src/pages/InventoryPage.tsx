import React, { useState } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
<<<<<<< Updated upstream
  WrenchScrewdriverIcon,
  BeakerIcon,
  TruckIcon,
  EyeIcon,
  PencilIcon,
  ArrowPathIcon,
  ShoppingCartIcon
=======
  TruckIcon,
  WrenchScrewdriverIcon
>>>>>>> Stashed changes
} from '@heroicons/react/24/outline';
import { useInventory } from '../hooks/useInventory';
import { useVehicles } from '../hooks/useVehicles';
import { InventoryCard } from '../components/inventory/InventoryCard';
import { InventoryModal } from '../components/inventory/InventoryModal';
import { SupplierModal } from '../components/inventory/SupplierModal';
import { useToast } from '../contexts/ToastContext';
import type { Inventory } from '../types/index';

// Mock inventory data for when the API returns empty
const mockInventory: Inventory[] = [
  {
    id: '1',
    tenantId: 'tenant1',
    type: 'part',
    sku: 'OF-001',
    name: 'Oil Filter',
    description: 'High-quality oil filter for various engine types',
    currentStock: 8,
    reorderLevel: 10,
    supplierId: 'supplier1',
    cost: 15,
    sellingPrice: 25,
    unit: 'piece',
    category: 'Engine Parts',
    location: 'Shelf A1',
    barcode: '123456789',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: '2',
    tenantId: 'tenant1',
    type: 'part',
    sku: 'BP-002',
    name: 'Brake Pads',
    description: 'Ceramic brake pads for front wheels',
    currentStock: 3,
    reorderLevel: 5,
    supplierId: 'supplier2',
    cost: 45,
    sellingPrice: 75,
    unit: 'set',
    category: 'Brake System',
    location: 'Shelf B2',
    barcode: '123456790',
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: '3',
    tenantId: 'tenant1',
    type: 'tool',
    sku: 'WR-003',
    name: 'Wrench Set',
    description: 'Professional grade wrench set (10 pieces)',
    currentStock: 2,
    reorderLevel: 3,
    supplierId: 'supplier3',
    cost: 120,
    sellingPrice: 180,
    unit: 'set',
    category: 'Tools',
    location: 'Tool Cabinet',
    barcode: '123456791',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: '4',
    tenantId: 'tenant1',
    type: 'consumable',
    sku: 'OL-004',
    name: 'Engine Oil 5W-30',
    description: 'Synthetic engine oil, 5W-30 grade, 1L bottles',
    currentStock: 25,
    reorderLevel: 20,
    supplierId: 'supplier1',
    cost: 8,
    sellingPrice: 15,
    unit: 'liter',
    category: 'Lubricants',
    location: 'Shelf C3',
    barcode: '123456792',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: '5',
    tenantId: 'tenant1',
    type: 'part',
    sku: 'SP-005',
    name: 'Spark Plugs',
    description: 'Iridium spark plugs, 4-pack',
    currentStock: 12,
    reorderLevel: 8,
    supplierId: 'supplier2',
    cost: 20,
    sellingPrice: 35,
    unit: 'pack',
    category: 'Engine Parts',
    location: 'Shelf A2',
    barcode: '123456793',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: '6',
    tenantId: 'tenant1',
    type: 'consumable',
    sku: 'AC-006',
    name: 'AC Refrigerant',
    description: 'R134a refrigerant, 12oz cans',
    currentStock: 6,
    reorderLevel: 10,
    supplierId: 'supplier4',
    cost: 12,
    sellingPrice: 22,
    unit: 'can',
    category: 'AC System',
    location: 'Shelf D1',
    barcode: '123456794',
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
];

// Mock suppliers data
const mockSuppliers = [
  { id: 'supplier1', name: 'Auto Parts Pro', contactPerson: 'John Smith', phone: '+260 955 123 456' },
  { id: 'supplier2', name: 'Brake Masters', contactPerson: 'Mike Johnson', phone: '+260 955 234 567' },
  { id: 'supplier3', name: 'Tool World', contactPerson: 'Sarah Wilson', phone: '+260 955 345 678' },
  { id: 'supplier4', name: 'Cooling Systems Ltd', contactPerson: 'David Brown', phone: '+260 955 456 789' },
];

const InventoryPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedInventory, setSelectedInventory] = useState<Inventory | null>(null);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const { inventory: apiInventory, loading, error } = useInventory();
  const { success, error: toastError } = useToast();

  // Use mock data if API returns empty
  const inventory = apiInventory.length === 0 && !loading ? mockInventory : apiInventory;

  const types = ['part', 'tool', 'consumable'];

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    
    const matchesType = !selectedType || item.type === selectedType;
    
    return matchesSearch && matchesType;
  });

  const getInventoryStats = () => {
    const totalItems = inventory.length;
    const lowStockItems = inventory.filter(item => item.currentStock <= item.reorderLevel).length;
    const totalValue = inventory.reduce((sum, item) => sum + (item.currentStock * item.cost), 0);
    const parts = inventory.filter(item => item.type === 'part').length;
    const tools = inventory.filter(item => item.type === 'tool').length;
    const consumables = inventory.filter(item => item.type === 'consumable').length;
    const outOfStockItems = inventory.filter(item => item.currentStock === 0).length;

    return { totalItems, lowStockItems, totalValue, parts, tools, consumables, outOfStockItems };
  };

  const stats = getInventoryStats();

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

<<<<<<< Updated upstream
  const handleRestock = (item: Inventory) => {
    setSelectedInventory(item);
    setShowRestockModal(true);
  };

  const handleRestockSubmit = (itemId: string, quantity: number) => {
    // In a real app, this would update the API
    success(`Restocked ${quantity} units for item #${itemId}`);
    setShowRestockModal(false);
  };

  const handleContactSupplier = (supplierId: string) => {
    const supplier = mockSuppliers.find(s => s.id === supplierId);
    if (supplier) {
      success(`Contacting ${supplier.name} at ${supplier.phone}`);
    }
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
=======

>>>>>>> Stashed changes

  const getStockStatusColor = (currentStock: number, reorderLevel: number) => {
    if (currentStock === 0) return 'text-red-600 dark:text-red-300';
    if (currentStock <= reorderLevel) return 'text-yellow-600 dark:text-yellow-300';
    return 'text-green-600 dark:text-green-300';
  };

  const getStockStatusText = (currentStock: number, reorderLevel: number) => {
    if (currentStock === 0) return 'Out of Stock';
    if (currentStock <= reorderLevel) return 'Low Stock';
    return 'In Stock';
  };

  return (
    <div className="space-y-6 responsive-p">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-responsive-2xl font-bold text-foreground">Inventory Management</h1>
          <p className="text-responsive-base text-muted-foreground">Manage parts, tools, and consumables</p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <button 
            onClick={() => setShowSupplierModal(true)}
            className="btn-secondary flex items-center space-x-2 w-full sm:w-auto"
          >
            <TruckIcon className="h-5 w-5" />
            <span>Suppliers</span>
          </button>
          <button 
            onClick={handleCreateInventory}
            className="btn-primary flex items-center space-x-2 w-full sm:w-auto"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="fluid-grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-glass p-6 rounded-xl shadow-layered">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
              <CubeIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-responsive-sm font-medium text-muted-foreground">Total Items</p>
              <p className="text-responsive-2xl font-bold text-foreground">{stats.totalItems}</p>
            </div>
          </div>
        </div>

        <div className="card-glass p-6 rounded-xl shadow-layered">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-xl">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-responsive-sm font-medium text-muted-foreground">Low Stock</p>
              <p className="text-responsive-2xl font-bold text-foreground">{stats.lowStockItems}</p>
            </div>
          </div>
        </div>

        <div className="card-glass p-6 rounded-xl shadow-layered">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-xl">
              <CurrencyDollarIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-responsive-sm font-medium text-muted-foreground">Total Value</p>
              <p className="text-responsive-2xl font-bold text-foreground">K{stats.totalValue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="card-glass p-6 rounded-xl shadow-layered">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-xl">
              <WrenchScrewdriverIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-responsive-sm font-medium text-muted-foreground">Categories</p>
              <p className="text-responsive-sm text-foreground">
                {stats.parts} Parts • {stats.tools} Tools • {stats.consumables} Consumables
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="fluid-grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-glass p-6 rounded-xl shadow-layered">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-responsive-sm font-medium text-muted-foreground">Out of Stock</p>
              <p className="text-responsive-xl font-bold text-foreground">{stats.outOfStockItems}</p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-xl">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <p className="text-responsive-sm text-muted-foreground mt-2">
            Items requiring immediate attention
          </p>
        </div>

        <div className="card-glass p-6 rounded-xl shadow-layered">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-responsive-sm font-medium text-muted-foreground">Stock Health</p>
              <p className="text-responsive-xl font-bold text-foreground">
                {stats.totalItems > 0 ? Math.round(((stats.totalItems - stats.lowStockItems) / stats.totalItems) * 100) : 0}%
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-xl">
              <CubeIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="text-responsive-sm text-muted-foreground mt-2">
            Items with adequate stock levels
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card-glass p-6 rounded-xl shadow-layered">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search inventory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-glass w-full pl-10 pr-4 py-2"
            />
          </div>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="input-glass px-4 py-2"
          >
            <option value="">All Types</option>
            {types.map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}s
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Inventory List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="card-glass border border-red-200 dark:border-red-800 p-4">
          <p className="text-red-800 dark:text-red-400">Error loading inventory: {error}</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredInventory.map((item) => (
            <div key={item.id} className="card-glass p-6 rounded-xl shadow-layered hover:shadow-glow transition-all duration-300">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg mr-3">
                    {getTypeIcon(item.type)}
                  </div>
                  <div>
                    <h3 className="text-responsive-lg font-semibold text-foreground">{item.name}</h3>
                    <p className="text-responsive-sm text-muted-foreground">SKU: {item.sku}</p>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-responsive-sm text-muted-foreground">Stock:</span>
                  <span className={`text-responsive-sm font-medium ${getStockStatusColor(item.currentStock, item.reorderLevel)}`}>
                    {item.currentStock} {item.unit}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-responsive-sm text-muted-foreground">Status:</span>
                  <span className={`text-responsive-xs px-2 py-1 rounded-full ${getStockStatusColor(item.currentStock, item.reorderLevel)} bg-opacity-10`}>
                    {getStockStatusText(item.currentStock, item.reorderLevel)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-responsive-sm text-muted-foreground">Cost:</span>
                  <span className="text-responsive-sm font-medium text-foreground">K{item.cost}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-responsive-sm text-muted-foreground">Price:</span>
                  <span className="text-responsive-sm font-medium text-foreground">K{item.sellingPrice}</span>
                </div>
                {item.location && (
                  <div className="flex justify-between items-center">
                    <span className="text-responsive-sm text-muted-foreground">Location:</span>
                    <span className="text-responsive-sm text-foreground">{item.location}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
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
                <button
                  onClick={() => handleRestock(item)}
                  className="btn-ghost text-responsive-sm px-3 py-1 flex items-center"
                >
                  <ArrowPathIcon className="h-4 w-4 mr-1" />
                  Restock
                </button>
                
                {/* Low Stock Alert */}
                {item.currentStock <= item.reorderLevel && (
                  <button
                    onClick={() => handleContactSupplier(item.supplierId)}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white text-responsive-sm px-3 py-1 rounded-lg transition-all duration-200 flex items-center"
                  >
                    <ShoppingCartIcon className="h-4 w-4 mr-1" />
                    Order
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <InventoryModal
        item={selectedInventory}
        isOpen={showInventoryModal}
        isCreating={isCreating}
        onClose={() => setShowInventoryModal(false)}
      />
      <SupplierModal
        isOpen={showSupplierModal}
        onClose={() => setShowSupplierModal(false)}
      />
      
      {/* Restock Modal */}
      {selectedInventory && showRestockModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card-glass p-6 rounded-xl max-w-md w-full mx-4">
            <h3 className="text-responsive-lg font-semibold text-foreground mb-4">
              Restock {selectedInventory.name}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-responsive-sm font-medium text-foreground mb-2">
                  Current Stock: {selectedInventory.currentStock} {selectedInventory.unit}
                </label>
                <label className="block text-responsive-sm font-medium text-foreground mb-2">
                  Quantity to Add
                </label>
                <input
                  type="number"
                  min="1"
                  defaultValue="1"
                  className="input-glass w-full"
                  id="restock-quantity"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    const quantity = parseInt((document.getElementById('restock-quantity') as HTMLInputElement).value);
                    handleRestockSubmit(selectedInventory.id, quantity);
                  }}
                  className="btn-primary flex-1"
                >
                  Confirm Restock
                </button>
                <button
                  onClick={() => setShowRestockModal(false)}
                  className="btn-ghost flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage; 
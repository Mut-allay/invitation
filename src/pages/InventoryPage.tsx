import React, { useState } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  CubeIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  TruckIcon,
  WrenchScrewdriverIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';
import { InventoryCard } from '../components/inventory/InventoryCard';
import { InventoryModal } from '../components/inventory/InventoryModal';
import { SupplierModal } from '../components/inventory/SupplierModal';
import { useInventory } from '../hooks/useInventory';
import { Inventory } from '../types/inventory';

const InventoryPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedInventory, setSelectedInventory] = useState<Inventory | null>(null);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const { inventory, loading, error } = useInventory();

  const types = ['part', 'tool', 'consumable'];

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
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

    return { totalItems, lowStockItems, totalValue, parts, tools, consumables };
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600">Manage parts, tools, and consumables</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setShowSupplierModal(true)}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-700"
          >
            <TruckIcon className="h-5 w-5" />
            <span>Suppliers</span>
          </button>
          <button 
            onClick={handleCreateInventory}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CubeIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalItems}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold text-gray-900">{stats.lowStockItems}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">K{stats.totalValue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <WrenchScrewdriverIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Categories</p>
              <p className="text-sm text-gray-900">
                {stats.parts} Parts • {stats.tools} Tools • {stats.consumables} Consumables
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search inventory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading inventory: {error}</p>
        </div>
      ) : filteredInventory.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <CubeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No inventory found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedType ? 'Try adjusting your search or filters.' : 'Get started by adding your first inventory item.'}
          </p>
          {!searchTerm && !selectedType && (
            <button
              onClick={handleCreateInventory}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Add First Item
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredInventory.map((item) => (
            <InventoryCard
              key={item.id}
              item={item}
              onView={() => handleViewInventory(item)}
              onEdit={() => handleEditInventory(item)}
            />
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
    </div>
  );
};

export default InventoryPage; 
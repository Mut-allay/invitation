import React, { useState } from 'react';
import { useVehicles } from '../hooks/useVehicles';
import { useCustomers } from '../hooks/useCustomers';
import { useSales } from '../hooks/useSales';
import { useRepairs } from '../hooks/useRepairs';
import { useInventory } from '../hooks/useInventory';
import { useInvoices } from '../hooks/useInvoices';

const AppDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState('vehicles');
  
  const vehiclesData = useVehicles();
  const customersData = useCustomers();
  const salesData = useSales();
  const repairsData = useRepairs();
  const inventoryData = useInventory();
  const invoicesData = useInvoices();

  const tabs = [
    { id: 'vehicles', label: 'Vehicles', count: vehiclesData.vehicles.length },
    { id: 'customers', label: 'Customers', count: customersData.customers.length },
    { id: 'sales', label: 'Sales', count: salesData.sales.length },
    { id: 'repairs', label: 'Repairs', count: repairsData.repairs.length },
    { id: 'inventory', label: 'Inventory', count: inventoryData.inventory.length },
    { id: 'invoices', label: 'Invoices', count: invoicesData.invoices.length },
  ];

  const renderVehiclesTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {vehiclesData.vehicles.map((vehicle) => (
        <div key={vehicle.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
          <div className="h-48 bg-gray-200 flex items-center justify-center">
            {vehicle.images && vehicle.images.length > 0 ? (
              <img
                src={vehicle.images[0]}
                alt={`${vehicle.make} ${vehicle.model}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-gray-500 text-center p-4">
                <div className="text-4xl mb-2">🚗</div>
                <div>No Image</div>
              </div>
            )}
          </div>
          <div className="p-6">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-semibold text-gray-900">
                {vehicle.make} {vehicle.model}
              </h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                vehicle.status === 'available' ? 'bg-green-100 text-green-800' :
                vehicle.status === 'sold' ? 'bg-red-100 text-red-800' :
                vehicle.status === 'reserved' ? 'bg-yellow-100 text-yellow-800' :
                'bg-orange-100 text-orange-800'
              }`}>
                {vehicle.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <p className="text-gray-600 mb-4">{vehicle.year} • {vehicle.regNumber}</p>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Cost Price:</span>
                <span className="font-medium">K{(vehicle.costPrice || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Selling Price:</span>
                <span className="font-medium text-green-600">K{(vehicle.sellingPrice || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderCustomersTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {customersData.customers.map((customer) => (
        <div key={customer.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <span className="text-blue-600 font-semibold text-lg">
                {customer.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{customer.name}</h3>
              <p className="text-gray-600">{customer.email}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Phone:</span>
              <span className="font-medium">{customer.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Address:</span>
              <span className="font-medium">{customer.address}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderSalesTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {salesData.sales.map((sale) => (
        <div key={sale.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Sale #{sale.id}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              sale.status === 'completed' ? 'bg-green-100 text-green-800' :
              sale.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {sale.status.toUpperCase()}
            </span>
          </div>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span className="text-gray-500">Sale Price:</span>
              <span className="font-medium text-green-600">K{(sale.salePrice || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Down Payment:</span>
              <span className="font-medium">K{((sale.salePrice || 0) * 0.2).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Monthly Payment:</span>
              <span className="font-medium">K{((sale.salePrice || 0) / 12).toLocaleString()}</span>
            </div>
          </div>
          <p className="text-sm text-gray-600">{sale.notes}</p>
        </div>
      ))}
    </div>
  );

  const renderRepairsTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {repairsData.repairs.map((repair) => (
        <div key={repair.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Repair #{repair.id}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              repair.status === 'completed' ? 'bg-green-100 text-green-800' :
              repair.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {repair.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <p className="text-gray-700 mb-4">{repair.reportedIssues}</p>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span className="text-gray-500">Estimated Cost:</span>
              <span className="font-medium">K{(repair.totalCost || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Actual Cost:</span>
              <span className="font-medium">
                {repair.totalCost > 0 ? `K${(repair.totalCost || 0).toLocaleString()}` : 'Pending'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Mechanic:</span>
              <span className="font-medium">John Smith</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderInventoryTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {inventoryData.inventory.map((item) => (
        <div key={item.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              item.currentStock <= item.reorderLevel ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
            }`}>
              {item.currentStock <= item.reorderLevel ? 'LOW STOCK' : 'IN STOCK'}
            </span>
          </div>
          <p className="text-gray-600 mb-4">{item.description}</p>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span className="text-gray-500">Category:</span>
              <span className="font-medium">{item.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Quantity:</span>
              <span className="font-medium">{item.currentStock} {item.unit}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Cost Price:</span>
              <span className="font-medium">K{(item.cost || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Selling Price:</span>
              <span className="font-medium text-green-600">K{(item.sellingPrice || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderInvoicesTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {invoicesData.invoices.map((invoice) => (
        <div key={invoice.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{invoice.invoiceNumber}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
              invoice.status === 'sent' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {invoice.status.toUpperCase()}
            </span>
          </div>
          <p className="text-gray-600 mb-4">{invoice.notes}</p>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal:</span>
              <span className="font-medium">K{(invoice.subtotal || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Tax:</span>
              <span className="font-medium">K{(invoice.vatAmount || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Total:</span>
              <span className="font-medium text-green-600">K{(invoice.totalAmount || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Due Date:</span>
              <span className="font-medium">{invoice.dueDate.toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'vehicles':
        return renderVehiclesTab();
      case 'customers':
        return renderCustomersTab();
      case 'sales':
        return renderSalesTab();
      case 'repairs':
        return renderRepairsTab();
      case 'inventory':
        return renderInventoryTab();
      case 'invoices':
        return renderInvoicesTab();
      default:
        return renderVehiclesTab();
    }
  };

  if (vehiclesData.loading || customersData.loading || salesData.loading || 
      repairsData.loading || inventoryData.loading || invoicesData.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading demo data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            GarajiFlow Demo Dashboard
          </h1>
          <p className="text-gray-600">
            Complete mock data demo for all entities. No backend required!
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="mb-8">
          {renderTabContent()}
        </div>

        {/* Stats Dashboard */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{vehiclesData.vehicles.length}</div>
              <div className="text-sm text-gray-600">Vehicles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{customersData.customers.length}</div>
              <div className="text-sm text-gray-600">Customers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{salesData.sales.length}</div>
              <div className="text-sm text-gray-600">Sales</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{repairsData.repairs.length}</div>
              <div className="text-sm text-gray-600">Repairs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{inventoryData.inventory.length}</div>
              <div className="text-sm text-gray-600">Inventory Items</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{invoicesData.invoices.length}</div>
              <div className="text-sm text-gray-600">Invoices</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppDemo;

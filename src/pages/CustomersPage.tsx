import React, { useState } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  UserGroupIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { CustomerCard } from '../components/customers/CustomerCard';
import { CustomerModal } from '../components/customers/CustomerModal';
import { useCustomers } from '../hooks/useCustomers';
import { Customer } from '../types/customer';

const CustomersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const { customers, loading, error } = useCustomers();

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.nrc.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const handleCreateCustomer = () => {
    setIsCreating(true);
    setSelectedCustomer(null);
    setShowCustomerModal(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setIsCreating(false);
    setSelectedCustomer(customer);
    setShowCustomerModal(true);
  };

  const handleViewCustomer = (customer: Customer) => {
    setIsCreating(false);
    setSelectedCustomer(customer);
    setShowCustomerModal(true);
  };

  const getCustomerStats = () => {
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.vehiclesOwned.length > 0).length;
    const newCustomers = customers.filter(c => {
      const createdAt = new Date(c.createdAt);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return createdAt > thirtyDaysAgo;
    }).length;

    return { totalCustomers, activeCustomers, newCustomers };
  };

  const stats = getCustomerStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-gray-600">Manage your customer database and relationships</p>
        </div>
        <button 
          onClick={handleCreateCustomer}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <PhoneIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Customers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeCustomers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <EnvelopeIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">New (30 days)</p>
              <p className="text-2xl font-bold text-gray-900">{stats.newCustomers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search customers by name, phone, NRC, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Customers List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading customers: {error}</p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first customer.'}
          </p>
          {!searchTerm && (
            <button
              onClick={handleCreateCustomer}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Add First Customer
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              onView={() => handleViewCustomer(customer)}
              onEdit={() => handleEditCustomer(customer)}
            />
          ))}
        </div>
      )}

      {/* Customer Modal */}
      <CustomerModal
        customer={selectedCustomer}
        isOpen={showCustomerModal}
        isCreating={isCreating}
        onClose={() => setShowCustomerModal(false)}
      />
    </div>
  );
};

export default CustomersPage; 
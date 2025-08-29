import React, { useState } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  UserGroupIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { CustomerCard } from '../components/customers/CustomerCard';
import { CustomerModal } from '../components/customers/CustomerModal';
import CustomerDetailView from '../components/customers/CustomerDetailView';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { useCustomers } from '../hooks/useCustomers';
import { getErrorMessage } from '@/lib/utils';
import type { Customer } from '../types/index';

const CustomersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const { customers, loading, error } = useCustomers();

  // Ensure customers is always an array to prevent undefined errors
  const safeCustomers = customers || [];
  
  const filteredCustomers = safeCustomers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
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
    setSelectedCustomer(customer);
  };

  const handleEditFromDetail = () => {
    if (selectedCustomer) {
      handleEditCustomer(selectedCustomer);
    }
  };

  const getCustomerStats = () => {
    const totalCustomers = safeCustomers.length;
    const activeCustomers = safeCustomers.length; // All customers are considered active for now
    const newCustomers = safeCustomers.filter(c => {
      const createdAt = new Date(c.createdAt);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return createdAt > thirtyDaysAgo;
    }).length;

    return { totalCustomers, activeCustomers, newCustomers };
  };

  const stats = getCustomerStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading customers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-red-500">Error loading customers: {getErrorMessage(error)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Left Pane - Customer List */}
        <ResizablePanel defaultSize={40} minSize={30}>
          <div className="h-full flex flex-col space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Customer Management</h1>
                <p className="text-sm text-muted-foreground">Manage your customer database and relationships</p>
              </div>
              <Button onClick={handleCreateCustomer} className="flex items-center space-x-2 w-full sm:w-auto">
                <PlusIcon className="h-5 w-5" />
                <span>Add Customer</span>
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <UserGroupIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
                      <p className="text-2xl font-bold">{stats.totalCustomers}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <PhoneIcon className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Active Customers</p>
                      <p className="text-2xl font-bold">{stats.activeCustomers}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <EnvelopeIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">New (30 days)</p>
                      <p className="text-2xl font-bold">{stats.newCustomers}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers by name, phone, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Customer List */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {filteredCustomers.length === 0 ? (
                <div className="text-center py-8">
                  <UserGroupIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No customers found</p>
                  <Button onClick={handleCreateCustomer} className="mt-2">
                    Add your first customer
                  </Button>
                </div>
              ) : (
                filteredCustomers.map((customer) => (
                  <CustomerCard
                    key={customer.id}
                    customer={customer}
                    onEdit={() => handleEditCustomer(customer)}
                    onClick={() => handleViewCustomer(customer)}
                    isSelected={selectedCustomer?.id === customer.id}
                  />
                ))
              )}
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle />

        {/* Right Pane - Customer Detail */}
        <ResizablePanel defaultSize={60}>
          <div className="h-full p-6">
            {selectedCustomer ? (
              <CustomerDetailView
                customer={selectedCustomer}
                onEdit={handleEditFromDetail}
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <UserGroupIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Select a customer</h3>
                  <p className="text-muted-foreground">Choose a customer from the list to view their details</p>
                </div>
              </div>
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Customer Modal */}
      <CustomerModal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        customer={selectedCustomer}
        isCreating={isCreating}
      />
    </div>
  );
};

export default CustomersPage; 
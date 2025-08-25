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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

    const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.nrc.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
    <div className="h-full flex flex-col">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Left Pane - Customer List */}
        <ResizablePanel defaultSize={40} minSize={30}>
          <div className="h-full flex flex-col responsive-p space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                                 <h1 className="text-responsive-2xl font-bold text-foreground">Customer Management</h1>
                 <p className="text-responsive-sm text-muted-foreground">Manage your customer database and relationships</p>
              </div>
              <Button onClick={handleCreateCustomer} className="flex items-center space-x-2 w-full sm:w-auto">
                <PlusIcon className="h-5 w-5" />
                <span>Add Customer</span>
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="fluid-grid">
              <Card className="card-glass">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <UserGroupIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="ml-4">
                                             <p className="text-responsive-sm font-medium text-muted-foreground">Total Customers</p>
                       <p className="text-responsive-2xl font-bold text-foreground">{stats.totalCustomers}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-glass">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-secondary/10 rounded-lg">
                      <PhoneIcon className="h-6 w-6 text-secondary" />
                    </div>
                    <div className="ml-4">
                                             <p className="text-responsive-sm font-medium text-muted-foreground">Active Customers</p>
                       <p className="text-responsive-2xl font-bold text-foreground">{stats.activeCustomers}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-glass">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-slate-100 rounded-lg">
                      <EnvelopeIcon className="h-6 w-6 text-slate-600" />
                    </div>
                    <div className="ml-4">
                                             <p className="text-responsive-sm font-medium text-muted-foreground">New (30 days)</p>
                       <p className="text-responsive-2xl font-bold text-foreground">{stats.newCustomers}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search */}
            <Card className="card-glass">
              <CardContent className="p-4">
                <div className="relative">
                                       <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search customers by name, phone, NRC, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 input-glass"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Customers List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : error ? (
                <Card>
                  <CardContent className="p-4">
                    <p className="text-destructive">Error loading customers: {getErrorMessage(error)}</p>
                  </CardContent>
                </Card>
              ) : filteredCustomers.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                                         <UserGroupIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                     <h3 className="text-lg font-medium text-foreground mb-2">No customers found</h3>
                     <p className="text-muted-foreground mb-4">
                      {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first customer.'}
                    </p>
                    {!searchTerm && (
                      <Button onClick={handleCreateCustomer}>
                        Add First Customer
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {filteredCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      className={`cursor-pointer transition-all duration-200 ${
                        selectedCustomer?.id === customer.id
                          ? 'ring-2 ring-blue-500 ring-offset-2'
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => handleViewCustomer(customer)}
                    >
                      <CustomerCard
                        customer={customer}
                        onView={() => handleViewCustomer(customer)}
                        onEdit={() => handleEditCustomer(customer)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ResizablePanel>

        {/* Resizable Handle */}
        <ResizableHandle withHandle />

        {/* Right Pane - Customer Detail */}
        <ResizablePanel defaultSize={60} minSize={40}>
                     <div className="h-full bg-background">
            {selectedCustomer ? (
              <CustomerDetailView
                customer={selectedCustomer}
                onEdit={handleEditFromDetail}
              />
                          ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                                         <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                       <UserGroupIcon className="h-8 w-8 text-muted-foreground" />
                     </div>
                     <h3 className="text-responsive-lg font-medium text-foreground mb-2">Select a customer</h3>
                     <p className="text-responsive-sm text-muted-foreground">Choose a customer from the list to view their details</p>
                  </div>
                </div>
              )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

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
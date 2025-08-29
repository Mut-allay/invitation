import React, { useState, useEffect } from 'react';
import { 
  UserIcon, 
  EnvelopeIcon, 
  TruckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  StarIcon,
  TagIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  CalendarIcon,
  WrenchScrewdriverIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { Customer, CustomerSegment } from '../../types/customer';
import { createMockVehicle } from '../../test/utils/test-utils';

interface CustomerProfileManagerProps {
  customer: Customer;
  onUpdate: (customer: Partial<Customer>) => void;
  onClose: () => void;
}

export const CustomerProfileManager: React.FC<CustomerProfileManagerProps> = ({
  customer,
  onUpdate,
  onClose
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedCustomer, setEditedCustomer] = useState<Customer>(customer);
  const [activeTab, setActiveTab] = useState<'overview' | 'service-history' | 'vehicles' | 'communications' | 'analytics'>('overview');

  useEffect(() => {
    setEditedCustomer(customer);
  }, [customer]);

  const handleSave = () => {
    onUpdate(editedCustomer);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedCustomer(customer);
    setIsEditing(false);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZM', {
      style: 'currency',
      currency: 'ZMW'
    }).format(amount);
  };

  const getSegmentColor = (segment: CustomerSegment) => {
    const colors = {
      premium: 'bg-purple-100 text-purple-800',
      regular: 'bg-green-100 text-green-800',
      occasional: 'bg-yellow-100 text-yellow-800',
      prospect: 'bg-blue-100 text-blue-800',
      inactive: 'bg-gray-100 text-gray-800'
    };
    return colors[segment] || colors.regular;
  };

  const getSegmentIcon = (segment: CustomerSegment) => {
    const icons = {
      premium: StarIcon,
      regular: UserIcon,
      occasional: ClockIcon,
      prospect: TagIcon,
      inactive: XMarkIcon
    };
    return icons[segment] || UserIcon;
  };

  const SegmentIcon = getSegmentIcon(customer.customerSegment || 'regular');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: UserIcon },
    { id: 'service-history', label: 'Service History', icon: WrenchScrewdriverIcon },
    { id: 'vehicles', label: 'Vehicles', icon: TruckIcon },
    { id: 'communications', label: 'Communications', icon: EnvelopeIcon },
    { id: 'analytics', label: 'Analytics', icon: ChartBarIcon }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <UserIcon className="h-6 w-6 text-gray-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {isEditing ? 'Edit Customer Profile' : 'Customer Profile'}
                </h2>
                <p className="text-sm text-gray-600">Manage customer information and history</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    <CheckIcon className="h-4 w-4" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center space-x-1 px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    <XMarkIcon className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <PencilIcon className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={onClose}
                    className="flex items-center space-x-1 px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    <XMarkIcon className="h-4 w-4" />
                    <span>Close</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'overview' | 'service-history' | 'vehicles' | 'communications' | 'analytics')}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <TabIcon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedCustomer.name}
                          onChange={(e) => setEditedCustomer({ ...editedCustomer, name: e.target.value })}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="mt-1 text-sm text-gray-900">{customer.name}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={editedCustomer.phone}
                          onChange={(e) => setEditedCustomer({ ...editedCustomer, phone: e.target.value })}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="mt-1 text-sm text-gray-900">{customer.phone}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      {isEditing ? (
                        <input
                          type="email"
                          value={editedCustomer.email || ''}
                          onChange={(e) => setEditedCustomer({ ...editedCustomer, email: e.target.value })}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="mt-1 text-sm text-gray-900">{customer.email || 'Not provided'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Address</label>
                      {isEditing ? (
                        <textarea
                          value={editedCustomer.address}
                          onChange={(e) => setEditedCustomer({ ...editedCustomer, address: e.target.value })}
                          rows={3}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="mt-1 text-sm text-gray-900">{customer.address}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">NRC Number</label>
                      <p className="mt-1 text-sm text-gray-900 font-mono">{customer.nrc}</p>
                    </div>
                  </div>
                </div>

                {/* Customer Segment */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Segment</h3>
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSegmentColor(customer.customerSegment || 'regular')}`}>
                      <SegmentIcon className="h-4 w-4 mr-1" />
                      {customer.customerSegment || 'regular'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Statistics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{customer.vehiclesOwned?.length || 0}</div>
                      <div className="text-sm text-gray-600">Vehicles Owned</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {customer.serviceHistory?.length || 0}
                      </div>
                      <div className="text-sm text-gray-600">Services</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {formatCurrency(customer.totalSpent || 0)}
                      </div>
                      <div className="text-sm text-gray-600">Total Spent</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {customer.loyaltyPoints || 0}
                      </div>
                      <div className="text-sm text-gray-600">Loyalty Points</div>
                    </div>
                  </div>
                </div>

                {/* Service Information */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Last Service:</span>
                      <span className="text-sm text-gray-900">
                        {customer.lastServiceDate ? formatDate(customer.lastServiceDate) : 'Never'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Next Service Due:</span>
                      <span className="text-sm text-gray-900">
                        {customer.nextServiceDue ? formatDate(customer.nextServiceDue) : 'Not scheduled'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
                  {isEditing ? (
                    <textarea
                      value={editedCustomer.notes || ''}
                      onChange={(e) => setEditedCustomer({ ...editedCustomer, notes: e.target.value })}
                      rows={4}
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Add notes about this customer..."
                    />
                  ) : (
                    <p className="text-sm text-gray-900">
                      {customer.notes || 'No notes available'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'service-history' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Service History</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  Add Service Record
                </button>
              </div>
              
              {customer.serviceHistory && customer.serviceHistory.length > 0 ? (
                <div className="space-y-4">
                  {customer.serviceHistory.map((service) => (
                    <div key={service.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{service.description}</h4>
                          <p className="text-sm text-gray-600">{service.serviceType.replace('_', ' ')}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{formatCurrency(service.cost)}</p>
                          <p className="text-sm text-gray-600">{formatDate(service.serviceDate)}</p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                        <span>Mileage: {(service.mileage || 0).toLocaleString()} km</span>
                        {service.technician && <span>Technician: {service.technician}</span>}
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          service.status === 'completed' ? 'bg-green-100 text-green-800' :
                          service.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {service.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <WrenchScrewdriverIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No service history available</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'vehicles' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Owned Vehicles</h3>
              
              {customer.vehiclesOwned?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {customer.vehiclesOwned.map((vehicleId) => {
                    // In a real app, you'd fetch vehicle details
                    const mockVehicle = createMockVehicle({ id: vehicleId });
                    return (
                      <div key={vehicleId} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center space-x-3 mb-3">
                          <TruckIcon className="h-6 w-6 text-gray-400" />
                          <div>
                            <h4 className="font-medium text-gray-900">{mockVehicle.make} {mockVehicle.model}</h4>
                            <p className="text-sm text-gray-600">{mockVehicle.year}</p>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Registration:</span>
                            <span className="text-gray-900">{mockVehicle.regNumber}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">VIN:</span>
                            <span className="text-gray-900 font-mono">{mockVehicle.vin}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Mileage:</span>
                            <span className="text-gray-900">{(mockVehicle.mileage || 0).toLocaleString()} km</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TruckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No vehicles owned</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'communications' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Communication Preferences</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  Send Message
                </button>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Notification Preferences</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Email Notifications</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          customer.communicationPreferences?.emailNotifications 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {customer.communicationPreferences?.emailNotifications ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">SMS Notifications</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          customer.communicationPreferences?.smsNotifications 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {customer.communicationPreferences?.smsNotifications ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">WhatsApp Notifications</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          customer.communicationPreferences?.whatsappNotifications 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {customer.communicationPreferences?.whatsappNotifications ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Contact Preferences</h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-600">Preferred Method:</span>
                        <p className="text-sm text-gray-900 capitalize">
                          {customer.communicationPreferences?.preferredContactMethod || 'Not set'}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Preferred Time:</span>
                        <p className="text-sm text-gray-900 capitalize">
                          {customer.communicationPreferences?.preferredContactTime || 'Not set'}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Language:</span>
                        <p className="text-sm text-gray-900 capitalize">
                          {customer.communicationPreferences?.language || 'English'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Customer Analytics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Spent</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatCurrency(customer.totalSpent || 0)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <WrenchScrewdriverIcon className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Services</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {customer.serviceHistory?.length || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <StarIcon className="h-8 w-8 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Loyalty Points</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {customer.loyaltyPoints || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CalendarIcon className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Customer Since</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatDate(customer.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-4">Service Frequency</h4>
                <div className="text-center py-8">
                  <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Service frequency chart will be displayed here</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 
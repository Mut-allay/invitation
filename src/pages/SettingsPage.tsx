import React, { useState } from 'react';
import { 
  BuildingOfficeIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  CloudArrowUpIcon,
  ArrowPathIcon,
  CheckIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { useToast } from '../contexts/ToastContext';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

interface ServiceType {
  id: string;
  name: string;
  basePrice: number;
  description: string;
}

// Mock data
const mockCompanyData = {
  name: 'Garaji Flow Auto Services',
  address: '123 Main Street, Lusaka, Zambia',
  phone: '+260 955 123 456',
  email: 'info@garajiflow.com',
  website: 'www.garajiflow.com',
  taxNumber: 'TAX123456789',
  logo: null,
};

const mockUsers = [
  { id: '1', name: 'Admin User', email: 'admin@garajiflow.com', role: 'admin', status: 'active' },
  { id: '2', name: 'John Smith', email: 'john@garajiflow.com', role: 'manager', status: 'active' },
  { id: '3', name: 'Sarah Wilson', email: 'sarah@garajiflow.com', role: 'technician', status: 'active' },
  { id: '4', name: 'Mike Johnson', email: 'mike@garajiflow.com', role: 'technician', status: 'inactive' },
];

const mockServiceTypes = [
  { id: '1', name: 'Oil Change', basePrice: 50, description: 'Standard oil change service' },
  { id: '2', name: 'Brake Service', basePrice: 120, description: 'Brake pad replacement and adjustment' },
  { id: '3', name: 'Engine Tune-up', basePrice: 200, description: 'Complete engine tune-up service' },
  { id: '4', name: 'AC Service', basePrice: 80, description: 'Air conditioning system service' },
];

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('company');
  const [companyData, setCompanyData] = useState(mockCompanyData);
  const [users, setUsers] = useState(mockUsers);
  const [serviceTypes, setServiceTypes] = useState(mockServiceTypes);
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    autoBackup: true,
    darkMode: false,
    taxRate: 25,
    currency: 'ZMW',
    laborRate: 50,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddService, setShowAddService] = useState(false);

  const { success } = useToast();

  const tabs = [
    { id: 'company', name: 'Company Profile', icon: BuildingOfficeIcon },
    { id: 'users', name: 'User Management', icon: UserGroupIcon },
    { id: 'services', name: 'Service Types', icon: DocumentTextIcon },
    { id: 'preferences', name: 'Preferences', icon: Cog6ToothIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'backup', name: 'Backup & Restore', icon: CloudArrowUpIcon },
  ];

  const handleSaveCompany = () => {
    setIsEditing(false);
    success('Company profile updated successfully');
  };

  const handleAddUser = (userData: Record<string, unknown>) => {
    const newUser: User = {
      id: (users.length + 1).toString(),
      name: userData.name as string,
      email: userData.email as string,
      role: userData.role as string,
      status: 'active',
    };
    setUsers([...users, newUser]);
    setShowAddUser(false);
    success('User added successfully');
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter(user => user.id !== userId));
    success('User deleted successfully');
  };

  const handleAddService = (serviceData: Record<string, unknown>) => {
    const newService: ServiceType = {
      id: (serviceTypes.length + 1).toString(),
      name: serviceData.name as string,
      basePrice: serviceData.basePrice as number,
      description: serviceData.description as string,
    };
    setServiceTypes([...serviceTypes, newService]);
    setShowAddService(false);
    success('Service type added successfully');
  };

  const handleDeleteService = (serviceId: string) => {
    setServiceTypes(serviceTypes.filter(service => service.id !== serviceId));
    success('Service type deleted successfully');
  };

  const handleBackup = () => {
    success('Backup created successfully');
  };

  const handleRestore = () => {
    success('System restored from backup');
  };

  const handlePreferenceChange = (key: string, value: string | number | boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    success('Preference updated');
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'manager': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'technician': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
  };

  return (
    <div className="space-y-6 responsive-p">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-responsive-2xl font-bold text-foreground">Settings</h1>
          <p className="text-responsive-base text-muted-foreground">Manage your garage system configuration</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="card-glass p-2 rounded-xl shadow-layered">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-responsive-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="card-glass p-6 rounded-xl shadow-layered">
        {activeTab === 'company' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-responsive-xl font-semibold text-foreground">Company Profile</h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="btn-secondary flex items-center space-x-2"
              >
                <PencilIcon className="h-4 w-4" />
                <span>{isEditing ? 'Cancel' : 'Edit'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-responsive-sm font-medium text-foreground mb-2">Company Name</label>
                <input
                  type="text"
                  value={companyData.name}
                  onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                  disabled={!isEditing}
                  className="input-glass w-full"
                />
              </div>
              <div>
                <label className="block text-responsive-sm font-medium text-foreground mb-2">Email</label>
                <input
                  type="email"
                  value={companyData.email}
                  onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
                  disabled={!isEditing}
                  className="input-glass w-full"
                />
              </div>
              <div>
                <label className="block text-responsive-sm font-medium text-foreground mb-2">Phone</label>
                <input
                  type="tel"
                  value={companyData.phone}
                  onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })}
                  disabled={!isEditing}
                  className="input-glass w-full"
                />
              </div>
              <div>
                <label className="block text-responsive-sm font-medium text-foreground mb-2">Website</label>
                <input
                  type="url"
                  value={companyData.website}
                  onChange={(e) => setCompanyData({ ...companyData, website: e.target.value })}
                  disabled={!isEditing}
                  className="input-glass w-full"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-responsive-sm font-medium text-foreground mb-2">Address</label>
                <textarea
                  value={companyData.address}
                  onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })}
                  disabled={!isEditing}
                  rows={3}
                  className="input-glass w-full"
                />
              </div>
              <div>
                <label className="block text-responsive-sm font-medium text-foreground mb-2">Tax Number</label>
                <input
                  type="text"
                  value={companyData.taxNumber}
                  onChange={(e) => setCompanyData({ ...companyData, taxNumber: e.target.value })}
                  disabled={!isEditing}
                  className="input-glass w-full"
                />
              </div>
              <div>
                <label className="block text-responsive-sm font-medium text-foreground mb-2">Logo</label>
                <input
                  type="file"
                  accept="image/*"
                  disabled={!isEditing}
                  className="input-glass w-full"
                />
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsEditing(false)}
                  className="btn-ghost"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCompany}
                  className="btn-primary"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-responsive-xl font-semibold text-foreground">User Management</h2>
              <button
                onClick={() => setShowAddUser(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <PlusIcon className="h-4 w-4" />
                <span>Add User</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-responsive-sm font-medium text-foreground">Name</th>
                    <th className="text-left py-3 px-4 text-responsive-sm font-medium text-foreground">Email</th>
                    <th className="text-left py-3 px-4 text-responsive-sm font-medium text-foreground">Role</th>
                    <th className="text-left py-3 px-4 text-responsive-sm font-medium text-foreground">Status</th>
                    <th className="text-left py-3 px-4 text-responsive-sm font-medium text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4 text-responsive-sm text-foreground">{user.name}</td>
                      <td className="py-3 px-4 text-responsive-sm text-foreground">{user.email}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-responsive-xl font-semibold text-foreground">Service Types</h2>
              <button
                onClick={() => setShowAddService(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <PlusIcon className="h-4 w-4" />
                <span>Add Service</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {serviceTypes.map((service) => (
                <div key={service.id} className="card-glass p-4 rounded-xl shadow-layered">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-responsive-lg font-semibold text-foreground">{service.name}</h3>
                    <button
                      onClick={() => handleDeleteService(service.id)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-responsive-sm text-muted-foreground mb-3">{service.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-responsive-sm text-muted-foreground">Base Price:</span>
                    <span className="text-responsive-lg font-bold text-foreground">K{service.basePrice}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="space-y-6">
            <h2 className="text-responsive-xl font-semibold text-foreground">System Preferences</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-responsive-lg font-medium text-foreground">Notifications</h3>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-responsive-sm font-medium text-foreground">Email Notifications</p>
                    <p className="text-responsive-xs text-muted-foreground">Receive email alerts for important events</p>
                  </div>
                  <button
                    onClick={() => handlePreferenceChange('emailNotifications', !preferences.emailNotifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      preferences.emailNotifications ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        preferences.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-responsive-sm font-medium text-foreground">SMS Notifications</p>
                    <p className="text-responsive-xs text-muted-foreground">Receive SMS alerts for urgent matters</p>
                  </div>
                  <button
                    onClick={() => handlePreferenceChange('smsNotifications', !preferences.smsNotifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      preferences.smsNotifications ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        preferences.smsNotifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-responsive-lg font-medium text-foreground">Business Settings</h3>
                
                <div>
                  <label className="block text-responsive-sm font-medium text-foreground mb-2">Tax Rate (%)</label>
                  <input
                    type="number"
                    value={preferences.taxRate}
                    onChange={(e) => handlePreferenceChange('taxRate', parseFloat(e.target.value))}
                    className="input-glass w-full"
                  />
                </div>

                <div>
                  <label className="block text-responsive-sm font-medium text-foreground mb-2">Labor Rate (K/hour)</label>
                  <input
                    type="number"
                    value={preferences.laborRate}
                    onChange={(e) => handlePreferenceChange('laborRate', parseFloat(e.target.value))}
                    className="input-glass w-full"
                  />
                </div>

                <div>
                  <label className="block text-responsive-sm font-medium text-foreground mb-2">Currency</label>
                  <select
                    value={preferences.currency}
                    onChange={(e) => handlePreferenceChange('currency', e.target.value)}
                    className="input-glass w-full"
                  >
                    <option value="ZMW">ZMW (Zambian Kwacha)</option>
                    <option value="USD">USD (US Dollar)</option>
                    <option value="EUR">EUR (Euro)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <h2 className="text-responsive-xl font-semibold text-foreground">Security Settings</h2>

            <div className="space-y-4">
              <div className="card-glass p-4 rounded-xl">
                <h3 className="text-responsive-lg font-medium text-foreground mb-3">Password Policy</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckIcon className="h-4 w-4 text-green-600" />
                    <span className="text-responsive-sm text-foreground">Minimum 8 characters</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckIcon className="h-4 w-4 text-green-600" />
                    <span className="text-responsive-sm text-foreground">Must contain uppercase and lowercase letters</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckIcon className="h-4 w-4 text-green-600" />
                    <span className="text-responsive-sm text-foreground">Must contain at least one number</span>
                  </div>
                </div>
              </div>

              <div className="card-glass p-4 rounded-xl">
                <h3 className="text-responsive-lg font-medium text-foreground mb-3">Session Management</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-responsive-sm text-foreground">Session Timeout</span>
                    <select className="input-glass">
                      <option value="30">30 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="120">2 hours</option>
                      <option value="480">8 hours</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-responsive-sm text-foreground">Force Logout on Inactivity</span>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'backup' && (
          <div className="space-y-6">
            <h2 className="text-responsive-xl font-semibold text-foreground">Backup & Restore</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card-glass p-6 rounded-xl shadow-layered">
                <div className="flex items-center space-x-3 mb-4">
                  <CloudArrowUpIcon className="h-8 w-8 text-primary" />
                  <h3 className="text-responsive-lg font-medium text-foreground">Create Backup</h3>
                </div>
                <p className="text-responsive-sm text-muted-foreground mb-4">
                  Create a complete backup of your system data including customers, vehicles, repairs, and settings.
                </p>
                <button
                  onClick={handleBackup}
                  className="btn-primary w-full"
                >
                  Create Backup
                </button>
              </div>

              <div className="card-glass p-6 rounded-xl shadow-layered">
                <div className="flex items-center space-x-3 mb-4">
                  <ArrowPathIcon className="h-8 w-8 text-secondary" />
                  <h3 className="text-responsive-lg font-medium text-foreground">Restore System</h3>
                </div>
                <p className="text-responsive-sm text-muted-foreground mb-4">
                  Restore your system from a previous backup. This will overwrite current data.
                </p>
                <div className="space-y-3">
                  <input
                    type="file"
                    accept=".json,.zip"
                    className="input-glass w-full"
                  />
                  <button
                    onClick={handleRestore}
                    className="btn-secondary w-full"
                  >
                    Restore from Backup
                  </button>
                </div>
              </div>
            </div>

            <div className="card-glass p-6 rounded-xl shadow-layered">
              <h3 className="text-responsive-lg font-medium text-foreground mb-4">Recent Backups</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-responsive-sm font-medium text-foreground">Backup_2024_01_15_143022.zip</p>
                    <p className="text-responsive-xs text-muted-foreground">January 15, 2024 at 2:30 PM</p>
                  </div>
                  <span className="text-responsive-xs text-green-600 dark:text-green-400">2.3 MB</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-responsive-sm font-medium text-foreground">Backup_2024_01_10_093045.zip</p>
                    <p className="text-responsive-xs text-muted-foreground">January 10, 2024 at 9:30 AM</p>
                  </div>
                  <span className="text-responsive-xs text-green-600 dark:text-green-400">2.1 MB</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card-glass p-6 rounded-xl max-w-md w-full mx-4">
            <h3 className="text-responsive-lg font-semibold text-foreground mb-4">Add New User</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-responsive-sm font-medium text-foreground mb-2">Name</label>
                <input type="text" className="input-glass w-full" id="user-name" />
              </div>
              <div>
                <label className="block text-responsive-sm font-medium text-foreground mb-2">Email</label>
                <input type="email" className="input-glass w-full" id="user-email" />
              </div>
              <div>
                <label className="block text-responsive-sm font-medium text-foreground mb-2">Role</label>
                <select className="input-glass w-full" id="user-role">
                  <option value="technician">Technician</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    const name = (document.getElementById('user-name') as HTMLInputElement).value;
                    const email = (document.getElementById('user-email') as HTMLInputElement).value;
                    const role = (document.getElementById('user-role') as HTMLSelectElement).value;
                    handleAddUser({ name, email, role });
                  }}
                  className="btn-primary flex-1"
                >
                  Add User
                </button>
                <button
                  onClick={() => setShowAddUser(false)}
                  className="btn-ghost flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Service Modal */}
      {showAddService && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card-glass p-6 rounded-xl max-w-md w-full mx-4">
            <h3 className="text-responsive-lg font-semibold text-foreground mb-4">Add New Service</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-responsive-sm font-medium text-foreground mb-2">Service Name</label>
                <input type="text" className="input-glass w-full" id="service-name" />
              </div>
              <div>
                <label className="block text-responsive-sm font-medium text-foreground mb-2">Description</label>
                <textarea className="input-glass w-full" rows={3} id="service-description" />
              </div>
              <div>
                <label className="block text-responsive-sm font-medium text-foreground mb-2">Base Price (K)</label>
                <input type="number" className="input-glass w-full" id="service-price" />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    const name = (document.getElementById('service-name') as HTMLInputElement).value;
                    const description = (document.getElementById('service-description') as HTMLTextAreaElement).value;
                    const basePrice = parseFloat((document.getElementById('service-price') as HTMLInputElement).value);
                    handleAddService({ name, description, basePrice });
                  }}
                  className="btn-primary flex-1"
                >
                  Add Service
                </button>
                <button
                  onClick={() => setShowAddService(false)}
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

export default SettingsPage;

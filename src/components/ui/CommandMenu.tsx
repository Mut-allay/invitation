import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon,
  TruckIcon,
  WrenchScrewdriverIcon,
  UserGroupIcon,
  CubeIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  HomeIcon,
  PlusIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

interface CommandItem {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  action: () => void;
  category: 'navigation' | 'actions' | 'recent';
  keywords: string[];
}

interface CommandMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const CommandMenu: React.FC<CommandMenuProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commandItems: CommandItem[] = [
    // Navigation
    {
      id: 'dashboard',
      title: 'Go to Dashboard',
      description: 'Return to the main dashboard',
      icon: HomeIcon,
      action: () => {
        window.location.href = '/';
        onClose();
      },
      category: 'navigation',
      keywords: ['dashboard', 'home', 'main', 'overview']
    },
    {
      id: 'sales',
      title: 'Go to Sales',
      description: 'View and manage vehicle sales',
      icon: TruckIcon,
      action: () => {
        window.location.href = '/sales';
        onClose();
      },
      category: 'navigation',
      keywords: ['sales', 'vehicles', 'cars', 'trucks', 'inventory']
    },
    {
      id: 'repairs',
      title: 'Go to Repairs',
      description: 'View and manage repair jobs',
      icon: WrenchScrewdriverIcon,
      action: () => {
        window.location.href = '/repairs';
        onClose();
      },
      category: 'navigation',
      keywords: ['repairs', 'service', 'maintenance', 'jobs']
    },
    {
      id: 'customers',
      title: 'Go to Customers',
      description: 'View and manage customer profiles',
      icon: UserGroupIcon,
      action: () => {
        window.location.href = '/customers';
        onClose();
      },
      category: 'navigation',
      keywords: ['customers', 'clients', 'people', 'profiles']
    },
    {
      id: 'inventory',
      title: 'Go to Inventory',
      description: 'View and manage parts inventory',
      icon: CubeIcon,
      action: () => {
        window.location.href = '/inventory';
        onClose();
      },
      category: 'navigation',
      keywords: ['inventory', 'parts', 'stock', 'supplies']
    },
    {
      id: 'invoices',
      title: 'Go to Invoices',
      description: 'View and manage invoices',
      icon: DocumentTextIcon,
      action: () => {
        window.location.href = '/invoices';
        onClose();
      },
      category: 'navigation',
      keywords: ['invoices', 'billing', 'payments', 'finance']
    },
    {
      id: 'settings',
      title: 'Go to Settings',
      description: 'Configure application settings',
      icon: Cog6ToothIcon,
      action: () => {
        window.location.href = '/settings';
        onClose();
      },
      category: 'navigation',
      keywords: ['settings', 'config', 'preferences', 'options']
    },
    
    // Actions
    {
      id: 'add-vehicle',
      title: 'Add New Vehicle',
      description: 'Register a new vehicle in inventory',
      icon: PlusIcon,
      action: () => {
        console.log('Add Vehicle clicked');
        onClose();
      },
      category: 'actions',
      keywords: ['add', 'new', 'vehicle', 'car', 'register']
    },
    {
      id: 'new-repair',
      title: 'Create New Repair',
      description: 'Log a new service job',
      icon: PlusIcon,
      action: () => {
        console.log('New Repair clicked');
        onClose();
      },
      category: 'actions',
      keywords: ['create', 'new', 'repair', 'service', 'job']
    },
    {
      id: 'add-customer',
      title: 'Add New Customer',
      description: 'Create a new customer profile',
      icon: PlusIcon,
      action: () => {
        console.log('Add Customer clicked');
        onClose();
      },
      category: 'actions',
      keywords: ['add', 'new', 'customer', 'client', 'profile']
    },
    {
      id: 'create-invoice',
      title: 'Create New Invoice',
      description: 'Generate a new invoice',
      icon: PlusIcon,
      action: () => {
        console.log('Create Invoice clicked');
        onClose();
      },
      category: 'actions',
      keywords: ['create', 'new', 'invoice', 'bill', 'generate']
    }
  ];

  const filteredItems = commandItems.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.keywords.some(keyword => keyword.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredItems.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].action();
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  };

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle command menu
        if (isOpen) {
          onClose();
        } else {
          // This would be handled by the parent component
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-start justify-center min-h-screen pt-16 px-4">
        <div className="fixed inset-0 bg-black bg-opacity-25 transition-opacity" onClick={onClose} />
        
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-96 overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="flex items-center space-x-3 p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search commands, navigate, or take actions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-500 text-lg"
              autoFocus
            />
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <kbd className="px-2 py-1 bg-gray-200 rounded">⌘</kbd>
              <span>+</span>
              <kbd className="px-2 py-1 bg-gray-200 rounded">K</kbd>
            </div>
          </div>

          {/* Content */}
          <div className="max-h-80 overflow-y-auto">
            {filteredItems.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <MagnifyingGlassIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No commands found</p>
                <p className="text-sm">Try a different search term</p>
              </div>
            ) : (
              <div className="p-2">
                {filteredItems.map((item, index) => {
                  const IconComponent = item.icon;
                  const isSelected = index === selectedIndex;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={item.action}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-all duration-150 ${
                        isSelected 
                          ? 'bg-blue-50 border border-blue-200 shadow-sm' 
                          : 'hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${
                        isSelected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium ${
                          isSelected ? 'text-blue-900' : 'text-gray-900'
                        }`}>
                          {item.title}
                        </p>
                        <p className={`text-sm ${
                          isSelected ? 'text-blue-700' : 'text-gray-500'
                        } truncate`}>
                          {item.description}
                        </p>
                      </div>
                      
                      <div className={`flex items-center space-x-2 ${
                        isSelected ? 'text-blue-600' : 'text-gray-400'
                      }`}>
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                          {item.category}
                        </span>
                        <ArrowRightIcon className="h-4 w-4" />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 text-center">
            <span>Use ↑↓ to navigate, Enter to select, Esc to close</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandMenu;

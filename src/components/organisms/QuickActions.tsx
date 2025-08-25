import React from 'react';
import { 
  TruckIcon,
  WrenchScrewdriverIcon,
  UserGroupIcon,
  DocumentTextIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
  onClick: () => void;
}

interface QuickActionsProps {
  actions?: QuickAction[];
  className?: string;
}

const QuickActions: React.FC<QuickActionsProps> = ({ 
  actions,
  className = '' 
}) => {
  const defaultActions: QuickAction[] = [
    {
      id: 'add-vehicle',
      title: 'Add Vehicle',
      description: 'Register a new vehicle in inventory',
      icon: TruckIcon,
      color: 'text-blue-600 bg-blue-50 hover:bg-blue-100',
      onClick: () => console.log('Add Vehicle clicked')
    },
    {
      id: 'new-repair',
      title: 'New Repair',
      description: 'Log a new service job',
      icon: WrenchScrewdriverIcon,
      color: 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100',
      onClick: () => console.log('New Repair clicked')
    },
    {
      id: 'add-customer',
      title: 'Add Customer',
      description: 'Create a new customer profile',
      icon: UserGroupIcon,
      color: 'text-purple-600 bg-purple-50 hover:bg-purple-100',
      onClick: () => console.log('Add Customer clicked')
    },
    {
      id: 'create-invoice',
      title: 'Create Invoice',
      description: 'Generate a new invoice',
      icon: DocumentTextIcon,
      color: 'text-green-600 bg-green-50 hover:bg-green-100',
      onClick: () => console.log('Create Invoice clicked')
    }
  ];

  const actionsToShow = actions || defaultActions;

  return (
    <div className={`bg-white p-8 rounded-xl shadow-sm border border-gray-100 ${className}`}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Quick Actions</h3>
          <p className="text-gray-600">Common tasks to get you started</p>
        </div>
        <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl">
          <PlusIcon className="h-6 w-6 text-white" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {actionsToShow.map((action) => {
          const IconComponent = action.icon;
          return (
            <button
              key={action.id}
              onClick={action.onClick}
              className="group p-6 border border-gray-200 rounded-xl hover:shadow-xl hover:-translate-y-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 bg-gradient-to-br from-white to-gray-50 hover:from-blue-50 hover:to-indigo-50 hover:border-blue-200"
              aria-label={action.title}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-blue-100 group-hover:to-indigo-100 transition-all duration-300 transform group-hover:scale-110 group-hover:shadow-lg">
                  <IconComponent className="h-10 w-10 text-gray-600 group-hover:text-blue-600 transition-colors duration-300" />
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-bold text-gray-900 group-hover:text-blue-900 transition-colors duration-300 text-lg">
                    {action.title}
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {action.description}
                  </p>
                </div>
                
                {/* Hover indicator */}
                <div className="w-8 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;

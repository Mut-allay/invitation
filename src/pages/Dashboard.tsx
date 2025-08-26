import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import {
  HomeIcon,
  TruckIcon,
  WrenchScrewdriverIcon,
  UserGroupIcon,
  CubeIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  BellIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';

// Import actual page components
import DashboardHome from './DashboardHome';
import SalesPage from './SalesPage';
import RepairsPage from './RepairsPage';
import CustomersPage from './CustomersPage';
import InventoryPage from './InventoryPage';
import InvoicesPage from './InvoicesPage';
import WizardDemo from './WizardDemo';
import SettingsPage from './SettingsPage';
import CommandMenu from '../components/ui/CommandMenu';
import ThemeToggle from '@/components/ui/theme-toggle';
import MobileNav from '@/components/ui/mobile-nav';
import PageTransition from '@/components/ui/page-transition';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { success } = useToast();
  const location = useLocation();
  // Mobile navigation is handled by MobileNav component
  const [commandMenuOpen, setCommandMenuOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['management', 'business']));

  const navigation = [
    {
      group: 'management',
      name: 'Management',
      items: [
        { name: 'Sales', href: '/sales', icon: TruckIcon, description: 'Manage vehicle sales' },
        { name: 'Repairs', href: '/repairs', icon: WrenchScrewdriverIcon, description: 'Service and maintenance' },
        { name: 'Customers', href: '/customers', icon: UserGroupIcon, description: 'Customer profiles' },
      ]
    },
    {
      group: 'business',
      name: 'Business',
      items: [
        { name: 'Inventory', href: '/inventory', icon: CubeIcon, description: 'Parts and supplies' },
        { name: 'Invoices', href: '/invoices', icon: DocumentTextIcon, description: 'Billing and payments' },
        { name: 'Settings', href: '/settings', icon: Cog6ToothIcon, description: 'System configuration' },
      ]
    },
    {
      group: 'tools',
      name: 'Tools',
      items: [
        { name: 'Wizard Demo', href: '/wizard', icon: Cog6ToothIcon, description: 'Form wizard examples' },
      ]
    }
  ];

  const handleLogout = async () => {
    try {
      await logout();
      success('Successfully logged out');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleGroup = (groupName: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupName)) {
      newExpanded.delete(groupName);
    } else {
      newExpanded.add(groupName);
    }
    setExpandedGroups(newExpanded);
  };

  const isGroupExpanded = (groupName: string) => expandedGroups.has(groupName);

  const SidebarContent = () => (
    <div className="flex-1 flex flex-col min-h-0 bg-card border-r border-border transition-colors duration-300">
      {/* Logo */}
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center mr-3 shadow-lg">
            <span className="text-lg font-bold text-white">GF</span>
          </div>
          <h1 className="text-xl font-bold text-foreground">Garaji Flow</h1>
        </div>

        {/* Command Menu Trigger */}
        <div className="px-4 mb-6">
          <button
            onClick={() => setCommandMenuOpen(true)}
            className="w-full flex items-center px-3 py-2 text-sm font-medium text-muted-foreground bg-muted/50 rounded-lg hover:bg-muted hover:text-foreground transition-all duration-200 group interactive"
          >
            <MagnifyingGlassIcon className="h-4 w-4 mr-3 text-muted-foreground group-hover:text-foreground" />
            <span className="flex-1 text-left">Search or jump to...</span>
            <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-xs font-medium text-muted-foreground bg-muted rounded">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 space-y-1">
          {/* Dashboard Link */}
          <Link
            to="/"
            className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 interactive ${
              location.pathname === '/'
                ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <HomeIcon className="mr-3 flex-shrink-0 h-5 w-5" />
            Dashboard
          </Link>

          {/* Grouped Navigation */}
          {navigation.map((group) => (
            <div key={group.group} className="space-y-1">
              <button
                onClick={() => toggleGroup(group.group)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all duration-200 interactive"
              >
                <span className="flex items-center">
                  <span className="text-xs font-semibold uppercase tracking-wider">{group.name}</span>
                </span>
                {isGroupExpanded(group.group) ? (
                  <ChevronDownIcon className="h-4 w-4" />
                ) : (
                  <ChevronRightIcon className="h-4 w-4" />
                )}
              </button>
              
              {isGroupExpanded(group.group) && (
                <div className="ml-4 space-y-1">
                  {group.items.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 interactive ${
                          isActive
                            ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                        title={item.description}
                      >
                        <item.icon className="mr-3 flex-shrink-0 h-4 w-4" />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* User Profile */}
      <div className="flex-shrink-0 flex border-t border-border p-4">
        <div className="flex items-center w-full">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
              <span className="text-sm font-medium text-white">
                {user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{user?.email}</p>
            <div className="flex items-center space-x-2 mt-1">
              <button
                onClick={handleLogout}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center transition-colors duration-200 interactive"
              >
                <ArrowRightOnRectangleIcon className="h-3 w-3 mr-1" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Mobile Navigation */}
      <MobileNav>
        <SidebarContent />
      </MobileNav>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <SidebarContent />
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-card/80 backdrop-blur-sm border-b border-border px-4 sm:px-6 lg:px-8 transition-colors duration-300">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                type="button"
                className="lg:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary transition-all duration-200 interactive"
                onClick={() => {/* Mobile navigation handled by MobileNav component */}}
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
              <h1 className="ml-2 lg:ml-0 text-lg font-semibold text-foreground">
                {navigation.flatMap(g => g.items).find(item => item.href === location.pathname)?.name || 'Dashboard'}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all duration-200 interactive">
                <BellIcon className="h-5 w-5" />
              </button>
              
              {/* Theme Toggle */}
              <ThemeToggle />
              
              {/* Command Menu Trigger */}
              <button
                onClick={() => setCommandMenuOpen(true)}
                className="hidden sm:flex items-center px-3 py-2 text-sm text-muted-foreground bg-muted/50 rounded-lg hover:bg-muted hover:text-foreground transition-all duration-200 interactive"
              >
                <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
                <span>Search</span>
                <kbd className="ml-2 px-2 py-0.5 text-xs font-medium text-muted-foreground bg-muted rounded">
                  ⌘K
                </kbd>
              </button>
            </div>
          </div>
        </div>

        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <PageTransition>
                <Routes>
                  <Route path="/" element={<DashboardHome />} />
                  <Route path="/sales" element={<SalesPage />} />
                  <Route path="/repairs" element={<RepairsPage />} />
                  <Route path="/customers" element={<CustomersPage />} />
                  <Route path="/inventory" element={<InventoryPage />} />
                  <Route path="/invoices" element={<InvoicesPage />} />
                  <Route path="/wizard" element={<WizardDemo />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Routes>
              </PageTransition>
            </div>
          </div>
        </main>
      </div>

      {/* Command Menu */}
      <CommandMenu 
        isOpen={commandMenuOpen} 
        onClose={() => setCommandMenuOpen(false)} 
      />
    </div>
  );
};

export default Dashboard; 
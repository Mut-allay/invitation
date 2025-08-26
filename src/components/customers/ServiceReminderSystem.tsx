import React, { useState, useEffect } from 'react';
import { 
  BellIcon, 
  ClockIcon, 
  TruckIcon, 
  EnvelopeIcon, 
  ChatBubbleLeftRightIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';
import { ServiceReminder, Customer, ReminderStatus } from '../../types/customer';

interface ServiceReminderSystemProps {
  customer: Customer;
  onSendReminder: (reminderId: string, method: 'email' | 'sms' | 'whatsapp') => void;
  onUpdateReminder: (reminderId: string, updates: Partial<ServiceReminder>) => void;
  onDeleteReminder: (reminderId: string) => void;
  onClose: () => void;
}

export const ServiceReminderSystem: React.FC<ServiceReminderSystemProps> = ({
  customer,
  onSendReminder,
  onUpdateReminder,
  onDeleteReminder,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'reminders' | 'schedule' | 'history'>('reminders');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState<ServiceReminder | null>(null);
  const [newReminder, setNewReminder] = useState({
    reminderType: 'time' as 'mileage' | 'time' | 'manual',
    dueDate: new Date(),
    dueMileage: 0,
    message: '',
    vehicleId: customer.vehiclesOwned[0] || ''
  });

  // Mock reminders data - in real app, this would come from API
  const [reminders, setReminders] = useState<ServiceReminder[]>([
    {
      id: '1',
      customerId: customer.id,
      vehicleId: customer.vehiclesOwned[0] || '',
      reminderType: 'time',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      message: 'Your vehicle is due for an oil change service',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      customerId: customer.id,
      vehicleId: customer.vehiclesOwned[0] || '',
      reminderType: 'mileage',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      dueMileage: 75000,
      currentMileage: 72000,
      message: 'Your vehicle will need service at 75,000 km',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: ReminderStatus) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      sent: 'bg-blue-100 text-blue-800',
      acknowledged: 'bg-green-100 text-green-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || colors.pending;
  };

  const getReminderTypeIcon = (type: 'mileage' | 'time' | 'manual') => {
    const icons = {
      mileage: TruckIcon,
      time: ClockIcon,
      manual: BellIcon
    };
    return icons[type];
  };

  const handleCreateReminder = () => {
    const reminder: ServiceReminder = {
      id: Date.now().toString(),
      customerId: customer.id,
      vehicleId: newReminder.vehicleId,
      reminderType: newReminder.reminderType,
      dueDate: newReminder.dueDate,
      dueMileage: newReminder.reminderType === 'mileage' ? newReminder.dueMileage : undefined,
      message: newReminder.message,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setReminders([...reminders, reminder]);
    setShowCreateForm(false);
    setNewReminder({
      reminderType: 'time',
      dueDate: new Date(),
      dueMileage: 0,
      message: '',
      vehicleId: customer.vehiclesOwned[0] || ''
    });
  };

  const handleSendReminder = (reminderId: string, method: 'email' | 'sms' | 'whatsapp') => {
    onSendReminder(reminderId, method);
    // Update local state
    setReminders(reminders.map(r => 
      r.id === reminderId 
        ? { ...r, status: 'sent', sentAt: new Date() }
        : r
    ));
  };

  const handleDeleteReminder = (reminderId: string) => {
    onDeleteReminder(reminderId);
    setReminders(reminders.filter(r => r.id !== reminderId));
  };

  const pendingReminders = reminders.filter(r => r.status === 'pending');
  const sentReminders = reminders.filter(r => r.status === 'sent');
  const completedReminders = reminders.filter(r => r.status === 'completed');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <BellIcon className="h-6 w-6 text-gray-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Service Reminder System</h2>
                <p className="text-sm text-gray-600">Manage service reminders for {customer.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex items-center space-x-1 px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              <XMarkIcon className="h-4 w-4" />
              <span>Close</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('reminders')}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'reminders'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BellIcon className="h-4 w-4" />
              <span>Active Reminders</span>
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'schedule'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <CalendarIcon className="h-4 w-4" />
              <span>Schedule New</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ClockIcon className="h-4 w-4" />
              <span>History</span>
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'reminders' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Active Reminders</h3>
                <button
                  onClick={() => setActiveTab('schedule')}
                  className="flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>New Reminder</span>
                </button>
              </div>

              {pendingReminders.length > 0 ? (
                <div className="space-y-4">
                  {pendingReminders.map((reminder) => {
                    const TypeIcon = getReminderTypeIcon(reminder.reminderType);
                    return (
                      <div key={reminder.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start space-x-3">
                            <TypeIcon className="h-5 w-5 text-blue-600 mt-1" />
                            <div>
                              <h4 className="font-medium text-gray-900">{reminder.message}</h4>
                              <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                                <span className="flex items-center space-x-1">
                                  <CalendarIcon className="h-4 w-4" />
                                  <span>Due: {formatDate(reminder.dueDate)}</span>
                                </span>
                                {reminder.dueMileage && (
                                  <span className="flex items-center space-x-1">
                                    <TruckIcon className="h-4 w-4" />
                                    <span>At {reminder.dueMileage.toLocaleString()} km</span>
                                  </span>
                                )}
                                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(reminder.status)}`}>
                                  {reminder.status}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleSendReminder(reminder.id, 'email')}
                              className="flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors"
                            >
                              <EnvelopeIcon className="h-3 w-3" />
                              <span>Email</span>
                            </button>
                            <button
                              onClick={() => handleSendReminder(reminder.id, 'sms')}
                              className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 transition-colors"
                            >
                              <ChatBubbleLeftRightIcon className="h-3 w-3" />
                              <span>SMS</span>
                            </button>
                            <button
                              onClick={() => handleSendReminder(reminder.id, 'whatsapp')}
                              className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 transition-colors"
                            >
                              <ChatBubbleLeftRightIcon className="h-3 w-3" />
                              <span>WhatsApp</span>
                            </button>
                            <button
                              onClick={() => handleDeleteReminder(reminder.id)}
                              className="flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors"
                            >
                              <TrashIcon className="h-3 w-3" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No active reminders</p>
                </div>
              )}

              {sentReminders.length > 0 && (
                <div className="mt-8">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Recently Sent</h4>
                  <div className="space-y-3">
                    {sentReminders.slice(0, 3).map((reminder) => {
                      const TypeIcon = getReminderTypeIcon(reminder.reminderType);
                      return (
                        <div key={reminder.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center space-x-3">
                            <TypeIcon className="h-4 w-4 text-gray-400" />
                            <div className="flex-1">
                              <p className="text-sm text-gray-900">{reminder.message}</p>
                              <p className="text-xs text-gray-600">
                                Sent: {reminder.sentAt ? formatDateTime(reminder.sentAt) : 'Unknown'}
                              </p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(reminder.status)}`}>
                              {reminder.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Schedule New Reminder</h3>
              
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Reminder Type</label>
                    <select
                      value={newReminder.reminderType}
                      onChange={(e) => setNewReminder({ ...newReminder, reminderType: e.target.value as any })}
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="time">Time-based</option>
                      <option value="mileage">Mileage-based</option>
                      <option value="manual">Manual</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle</label>
                    <select
                      value={newReminder.vehicleId}
                      onChange={(e) => setNewReminder({ ...newReminder, vehicleId: e.target.value })}
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {customer.vehiclesOwned.map((vehicleId) => (
                        <option key={vehicleId} value={vehicleId}>
                          Vehicle {vehicleId}
                        </option>
                      ))}
                    </select>
                  </div>

                  {newReminder.reminderType === 'time' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                      <input
                        type="date"
                        value={newReminder.dueDate.toISOString().split('T')[0]}
                        onChange={(e) => setNewReminder({ ...newReminder, dueDate: new Date(e.target.value) })}
                        className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}

                  {newReminder.reminderType === 'mileage' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Due Mileage (km)</label>
                      <input
                        type="number"
                        value={newReminder.dueMileage}
                        onChange={(e) => setNewReminder({ ...newReminder, dueMileage: parseInt(e.target.value) })}
                        className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 75000"
                      />
                    </div>
                  )}

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                    <textarea
                      value={newReminder.message}
                      onChange={(e) => setNewReminder({ ...newReminder, message: e.target.value })}
                      rows={3}
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter reminder message..."
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setActiveTab('reminders')}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateReminder}
                    disabled={!newReminder.message.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Create Reminder
                  </button>
                </div>
              </div>

              {/* Quick Templates */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-4">Quick Templates</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    'Your vehicle is due for an oil change service',
                    'Time for your scheduled maintenance check',
                    'Your vehicle needs a brake inspection',
                    'Tire rotation service is due',
                    'Annual service reminder',
                    'Battery check reminder'
                  ].map((template, index) => (
                    <button
                      key={index}
                      onClick={() => setNewReminder({ ...newReminder, message: template })}
                      className="text-left p-3 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <p className="text-sm text-gray-900">{template}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Reminder History</h3>
              
              <div className="space-y-4">
                {[...sentReminders, ...completedReminders].length > 0 ? (
                  [...sentReminders, ...completedReminders]
                    .sort((a, b) => new Date(b.sentAt || b.createdAt).getTime() - new Date(a.sentAt || a.createdAt).getTime())
                    .map((reminder) => {
                      const TypeIcon = getReminderTypeIcon(reminder.reminderType);
                      return (
                        <div key={reminder.id} className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <TypeIcon className="h-5 w-5 text-gray-400 mt-1" />
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{reminder.message}</h4>
                              <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                                <span>Created: {formatDateTime(reminder.createdAt)}</span>
                                {reminder.sentAt && <span>Sent: {formatDateTime(reminder.sentAt)}</span>}
                                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(reminder.status)}`}>
                                  {reminder.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                ) : (
                  <div className="text-center py-8">
                    <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No reminder history available</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 
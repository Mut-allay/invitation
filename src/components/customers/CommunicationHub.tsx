import React, { useState, useEffect } from 'react';
import { 
  ChatBubbleLeftRightIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  PaperAirplaneIcon,
  PlusIcon,
  XMarkIcon,
  CheckIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  UserIcon,
  DocumentTextIcon,
  MegaphoneIcon,
  ArchiveBoxIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { Customer, CommunicationRecord, CommunicationPreferences } from '../../types/customer';

interface CommunicationHubProps {
  customer: Customer;
  onSendMessage: (message: Partial<CommunicationRecord>) => void;
  onUpdatePreferences: (preferences: CommunicationPreferences) => void;
  onClose: () => void;
}

export const CommunicationHub: React.FC<CommunicationHubProps> = ({
  customer,
  onSendMessage,
  onUpdatePreferences,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'compose' | 'history' | 'campaigns' | 'preferences'>('compose');
  const [selectedChannel, setSelectedChannel] = useState<'email' | 'sms' | 'whatsapp' | 'phone_call'>('email');
  const [message, setMessage] = useState({
    subject: '',
    content: '',
    type: 'email' as 'email' | 'sms' | 'whatsapp' | 'phone_call',
    direction: 'outbound' as 'inbound' | 'outbound'
  });
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingPreferences, setEditingPreferences] = useState(false);

  // Mock communication history - in real app, this would come from API
  const [communicationHistory, setCommunicationHistory] = useState<CommunicationRecord[]>([
    {
      id: '1',
      customerId: customer.id,
      type: 'email',
      direction: 'outbound',
      subject: 'Service Reminder',
      message: 'Your vehicle is due for service on Friday',
      status: 'delivered',
      sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      deliveredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000),
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      id: '2',
      customerId: customer.id,
      type: 'sms',
      direction: 'outbound',
      message: 'Service reminder: Your vehicle needs maintenance',
      status: 'read',
      sentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      deliveredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 2 * 60 * 1000),
      readAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    },
    {
      id: '3',
      customerId: customer.id,
      type: 'whatsapp',
      direction: 'inbound',
      message: 'Can I book an appointment for next week?',
      status: 'read',
      sentAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      deliveredAt: new Date(Date.now() - 12 * 60 * 60 * 1000 + 1 * 60 * 1000),
      readAt: new Date(Date.now() - 12 * 60 * 60 * 1000 + 5 * 60 * 1000),
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
    }
  ]);

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: 'sent' | 'delivered' | 'read' | 'failed') => {
    const colors = {
      sent: 'bg-blue-100 text-blue-800',
      delivered: 'bg-green-100 text-green-800',
      read: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.sent;
  };

  const getChannelIcon = (type: 'email' | 'sms' | 'whatsapp' | 'phone_call') => {
    const icons = {
      email: EnvelopeIcon,
      sms: ChatBubbleLeftRightIcon,
      whatsapp: ChatBubbleLeftRightIcon,
      phone_call: PhoneIcon
    };
    return icons[type];
  };

  const getChannelColor = (type: 'email' | 'sms' | 'whatsapp' | 'phone_call') => {
    const colors = {
      email: 'text-blue-600',
      sms: 'text-green-600',
      whatsapp: 'text-green-600',
      phone_call: 'text-purple-600'
    };
    return colors[type];
  };

  const handleSendMessage = () => {
    const newMessage: CommunicationRecord = {
      id: Date.now().toString(),
      customerId: customer.id,
      type: message.type,
      direction: message.direction,
      subject: message.subject,
      message: message.content,
      status: 'sent',
      sentAt: new Date(),
      createdAt: new Date()
    };

    onSendMessage(newMessage);
    setCommunicationHistory([newMessage, ...communicationHistory]);
    
    // Reset form
    setMessage({
      subject: '',
      content: '',
      type: 'email',
      direction: 'outbound'
    });
  };

  const messageTemplates = {
    service_reminder: {
      subject: 'Service Reminder',
      content: `Dear ${customer.name},\n\nYour vehicle is due for service. Please contact us to schedule an appointment.\n\nBest regards,\nYour Service Team`
    },
    appointment_confirmation: {
      subject: 'Appointment Confirmation',
      content: `Dear ${customer.name},\n\nYour appointment has been confirmed. We look forward to seeing you.\n\nBest regards,\nYour Service Team`
    },
    follow_up: {
      subject: 'Service Follow-up',
      content: `Dear ${customer.name},\n\nThank you for choosing our service. How was your experience?\n\nBest regards,\nYour Service Team`
    },
    promotional: {
      subject: 'Special Offer',
      content: `Dear ${customer.name},\n\nWe have a special offer for our valued customers. Contact us for details.\n\nBest regards,\nYour Service Team`
    }
  };

  const tabs = [
    { id: 'compose', label: 'Compose', icon: PaperAirplaneIcon },
    { id: 'history', label: 'History', icon: ArchiveBoxIcon },
    { id: 'campaigns', label: 'Campaigns', icon: MegaphoneIcon },
    { id: 'preferences', label: 'Preferences', icon: UserIcon }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-gray-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Communication Hub</h2>
                <p className="text-sm text-gray-600">Connect with {customer.name}</p>
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
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
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
          {activeTab === 'compose' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Compose Message</h3>
                <button
                  onClick={() => setShowTemplateModal(true)}
                  className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <DocumentTextIcon className="h-4 w-4" />
                  <span>Templates</span>
                </button>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                {/* Channel Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Communication Channel</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {(['email', 'sms', 'whatsapp', 'phone_call'] as const).map((channel) => {
                      const ChannelIcon = getChannelIcon(channel);
                      const isSelected = selectedChannel === channel;
                      return (
                        <button
                          key={channel}
                          onClick={() => {
                            setSelectedChannel(channel);
                            setMessage({ ...message, type: channel });
                          }}
                          className={`flex items-center space-x-2 p-3 border rounded-lg transition-colors ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <ChannelIcon className={`h-5 w-5 ${isSelected ? 'text-blue-600' : getChannelColor(channel)}`} />
                          <span className="text-sm font-medium capitalize">
                            {channel.replace('_', ' ')}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Message Form */}
                <div className="space-y-4">
                  {message.type === 'email' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                      <input
                        type="text"
                        value={message.subject}
                        onChange={(e) => setMessage({ ...message, subject: e.target.value })}
                        className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter subject..."
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                    <textarea
                      value={message.content}
                      onChange={(e) => setMessage({ ...message, content: e.target.value })}
                      rows={6}
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`Enter your ${message.type.replace('_', ' ')} message...`}
                    />
                  </div>

                  {/* Character count for SMS */}
                  {message.type === 'sms' && (
                    <div className="text-sm text-gray-600">
                      {message.content.length}/160 characters
                      {message.content.length > 160 && (
                        <span className="text-red-600 ml-2">Message too long for SMS</span>
                      )}
                    </div>
                  )}

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setMessage({ subject: '', content: '', type: 'email', direction: 'outbound' })}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                    >
                      Clear
                    </button>
                    <button
                      onClick={handleSendMessage}
                      disabled={!message.content.trim() || (message.type === 'sms' && message.content.length > 160)}
                      className="flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      <PaperAirplaneIcon className="h-4 w-4" />
                      <span>Send Message</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-4">Quick Actions</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { label: 'Service Reminder', icon: ClockIcon },
                    { label: 'Appointment Confirmation', icon: CheckIcon },
                    { label: 'Follow-up', icon: ChatBubbleLeftRightIcon },
                    { label: 'Promotional', icon: MegaphoneIcon }
                  ].map((action, index) => {
                    const ActionIcon = action.icon;
                    return (
                      <button
                        key={index}
                        onClick={() => {
                          const template = messageTemplates[Object.keys(messageTemplates)[index] as keyof typeof messageTemplates];
                          setMessage({
                            ...message,
                            subject: template.subject,
                            content: template.content
                          });
                        }}
                        className="flex items-center space-x-2 p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <ActionIcon className="h-4 w-4 text-gray-600" />
                        <span className="text-sm text-gray-900">{action.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Communication History</h3>
              
              <div className="space-y-4">
                {communicationHistory.length > 0 ? (
                  communicationHistory.map((record) => {
                    const ChannelIcon = getChannelIcon(record.type);
                    return (
                      <div key={record.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <div className={`flex-shrink-0 p-2 rounded-full ${record.direction === 'outbound' ? 'bg-blue-100' : 'bg-green-100'}`}>
                            <ChannelIcon className={`h-5 w-5 ${getChannelColor(record.type)}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {record.direction === 'outbound' ? 'Outbound' : 'Inbound'} {record.type.replace('_', ' ')}
                                </h4>
                                {record.subject && (
                                  <p className="text-sm text-gray-600">{record.subject}</p>
                                )}
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(record.status)}`}>
                                {record.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-900 mt-2">{record.message}</p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-600">
                              <span>Sent: {formatDateTime(record.sentAt)}</span>
                              {record.deliveredAt && <span>Delivered: {formatDateTime(record.deliveredAt)}</span>}
                              {record.readAt && <span>Read: {formatDateTime(record.readAt)}</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <ArchiveBoxIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No communication history available</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'campaigns' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Email Campaigns</h3>
                <button className="flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  <PlusIcon className="h-4 w-4" />
                  <span>New Campaign</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'Service Reminders', status: 'active', sent: 45, opened: 32 },
                  { name: 'Promotional Offers', status: 'draft', sent: 0, opened: 0 },
                  { name: 'Follow-up Survey', status: 'scheduled', sent: 0, opened: 0 }
                ].map((campaign, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">{campaign.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                        campaign.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {campaign.status}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Sent:</span>
                        <span>{campaign.sent}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Opened:</span>
                        <span>{campaign.opened}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Open Rate:</span>
                        <span>{campaign.sent > 0 ? Math.round((campaign.opened / campaign.sent) * 100) : 0}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Communication Preferences</h3>
                <button
                  onClick={() => setEditingPreferences(!editingPreferences)}
                  className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <PencilIcon className="h-4 w-4" />
                  <span>{editingPreferences ? 'Save' : 'Edit'}</span>
                </button>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Notification Preferences</h4>
                    <div className="space-y-3">
                      {[
                        { key: 'emailNotifications', label: 'Email Notifications', icon: EnvelopeIcon },
                        { key: 'smsNotifications', label: 'SMS Notifications', icon: ChatBubbleLeftRightIcon },
                        { key: 'whatsappNotifications', label: 'WhatsApp Notifications', icon: ChatBubbleLeftRightIcon },
                        { key: 'serviceReminders', label: 'Service Reminders', icon: ClockIcon },
                        { key: 'promotionalMessages', label: 'Promotional Messages', icon: MegaphoneIcon }
                      ].map((pref) => {
                        const PrefIcon = pref.icon;
                        const isEnabled = customer.communicationPreferences?.[pref.key as keyof CommunicationPreferences] || false;
                        return (
                          <div key={pref.key} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <PrefIcon className="h-4 w-4 text-gray-600" />
                              <span className="text-sm text-gray-700">{pref.label}</span>
                            </div>
                            {editingPreferences ? (
                              <input
                                type="checkbox"
                                checked={Boolean(isEnabled)}
                                onChange={(e) => {
                                  // In real app, this would update the preferences
                                  console.log(`${pref.key}: ${e.target.checked}`);
                                }}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                            ) : (
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                isEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {isEnabled ? 'Enabled' : 'Disabled'}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Contact Preferences</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Contact Method</label>
                        {editingPreferences ? (
                          <select
                            value={customer.communicationPreferences?.preferredContactMethod || 'email'}
                            onChange={(e) => {
                              // In real app, this would update the preferences
                              console.log('Preferred method:', e.target.value);
                            }}
                            className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="email">Email</option>
                            <option value="sms">SMS</option>
                            <option value="whatsapp">WhatsApp</option>
                            <option value="phone">Phone</option>
                          </select>
                        ) : (
                          <p className="text-sm text-gray-900 capitalize">
                            {customer.communicationPreferences?.preferredContactMethod || 'Not set'}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Contact Time</label>
                        {editingPreferences ? (
                          <select
                            value={customer.communicationPreferences?.preferredContactTime || 'anytime'}
                            onChange={(e) => {
                              // In real app, this would update the preferences
                              console.log('Preferred time:', e.target.value);
                            }}
                            className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="morning">Morning</option>
                            <option value="afternoon">Afternoon</option>
                            <option value="evening">Evening</option>
                            <option value="anytime">Anytime</option>
                          </select>
                        ) : (
                          <p className="text-sm text-gray-900 capitalize">
                            {customer.communicationPreferences?.preferredContactTime || 'Not set'}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                        {editingPreferences ? (
                          <select
                            value={customer.communicationPreferences?.language || 'en'}
                            onChange={(e) => {
                              // In real app, this would update the preferences
                              console.log('Language:', e.target.value);
                            }}
                            className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="en">English</option>
                            <option value="bem">Bemba</option>
                            <option value="nya">Nyanja</option>
                            <option value="toi">Tonga</option>
                          </select>
                        ) : (
                          <p className="text-sm text-gray-900 capitalize">
                            {customer.communicationPreferences?.language === 'en' ? 'English' :
                             customer.communicationPreferences?.language === 'bem' ? 'Bemba' :
                             customer.communicationPreferences?.language === 'nya' ? 'Nyanja' :
                             customer.communicationPreferences?.language === 'toi' ? 'Tonga' : 'English'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Message Templates</h3>
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {Object.entries(messageTemplates).map(([key, template]) => (
                  <div key={key} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">{template.subject}</h4>
                    <p className="text-sm text-gray-600 mb-3 whitespace-pre-line">{template.content}</p>
                    <button
                      onClick={() => {
                        setMessage({
                          ...message,
                          subject: template.subject,
                          content: template.content
                        });
                        setShowTemplateModal(false);
                      }}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      Use Template
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 
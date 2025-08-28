import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  ChevronDownIcon, 
  ChevronUpIcon, 
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  helpful: number;
  notHelpful: number;
}

interface FAQSectionProps {
  searchQuery?: string;
  onContactSupport?: () => void;
}

const faqItems: FAQItem[] = [
  {
    id: 'what-is-garajiflow',
    question: 'What is GarajiFlow and how can it help my workshop?',
    answer: `GarajiFlow is a comprehensive automotive workshop management system designed specifically for Zambian workshops. It helps you:

• Manage job cards and track repair progress
• Maintain customer records and service history
• Control inventory and parts management
• Generate ZRA-compliant invoices
• Track financial performance and generate reports
• Schedule appointments and manage staff

The system is designed to streamline your operations, reduce paperwork, and improve customer satisfaction while ensuring compliance with Zambian tax regulations.`,
    category: 'General',
    tags: ['overview', 'benefits', 'features'],
    difficulty: 'beginner',
    helpful: 45,
    notHelpful: 2,
  },
  {
    id: 'getting-started',
    question: 'How do I get started with GarajiFlow?',
    answer: `Getting started with GarajiFlow is simple:

1. **Complete Workshop Setup**: Enter your workshop information, location, and contact details
2. **Add Staff Members**: Create user accounts for your team with appropriate roles
3. **Configure Services**: Define the services you offer and their pricing
4. **Set Up Inventory**: Add your parts inventory and supplier information
5. **Create Your First Job**: Start with a simple job card to familiarize yourself with the system

Our onboarding guide will walk you through each step, and our support team is available to help with any questions.`,
    category: 'Getting Started',
    tags: ['setup', 'onboarding', 'first-steps'],
    difficulty: 'beginner',
    helpful: 38,
    notHelpful: 1,
  },
  {
    id: 'user-roles',
    question: 'What are the different user roles and permissions?',
    answer: `GarajiFlow offers four main user roles:

**Administrator**
• Full system access and configuration
• User management and role assignment
• Financial reports and analytics
• System settings and integrations

**Manager**
• Workshop operations management
• Staff scheduling and supervision
• Customer relationship management
• Inventory and parts management

**Technician**
• Job card management and updates
• Parts usage tracking
• Work progress reporting
• Time tracking and billing

**Receptionist**
• Customer registration and check-in
• Appointment scheduling
• Invoice generation and payments
• Customer communication

Each role has specific permissions to ensure data security and operational efficiency.`,
    category: 'User Management',
    tags: ['roles', 'permissions', 'access'],
    difficulty: 'beginner',
    helpful: 52,
    notHelpful: 3,
  },
  {
    id: 'job-cards',
    question: 'How do I create and manage job cards?',
    answer: `Creating and managing job cards is straightforward:

**Creating a Job Card:**
1. Navigate to the Jobs section
2. Click "Create New Job Card"
3. Enter customer and vehicle information
4. Select required services
5. Assign technicians
6. Set estimated completion time

**Job Card Statuses:**
• Pending: Job created, waiting to start
• In Progress: Work has begun
• Parts Required: Waiting for parts
• Quality Check: Work completed, under review
• Ready for Delivery: Job completed and approved
• Delivered: Vehicle returned to customer

**Best Practices:**
• Update status regularly
• Add detailed notes and photos
• Track parts usage accurately
• Communicate with customers about progress`,
    category: 'Operations',
    tags: ['job-cards', 'workflow', 'status'],
    difficulty: 'beginner',
    helpful: 67,
    notHelpful: 4,
  },
  {
    id: 'zra-compliance',
    question: 'How does GarajiFlow ensure ZRA compliance?',
    answer: `GarajiFlow is designed to ensure full compliance with Zambian Revenue Authority (ZRA) requirements:

**Automatic VAT Calculations**
• 16% VAT automatically calculated on all taxable items
• Separate tracking of VAT-able and non-VAT-able services
• Proper VAT allocation for different service types

**ZRA-Compliant Invoices**
• Official ZRA invoice format
• Required tax identification numbers
• Proper invoice numbering sequence
• Complete audit trail

**Tax Reporting**
• Monthly VAT returns preparation
• Tax liability reports
• Transaction history for audits
• Export capabilities for ZRA submissions

**Best Practices**
• All transactions are logged with timestamps
• User activity tracking for accountability
• Regular backup of financial data
• Compliance with ZRA record-keeping requirements`,
    category: 'Finance',
    tags: ['zra', 'tax', 'compliance', 'vat'],
    difficulty: 'intermediate',
    helpful: 89,
    notHelpful: 2,
  },
  {
    id: 'inventory-management',
    question: 'How does inventory management work?',
    answer: `GarajiFlow's inventory management system helps you track parts efficiently:

**Adding Parts**
1. Navigate to Inventory section
2. Click "Add New Part"
3. Enter part details (name, number, description)
4. Set minimum stock levels
5. Add supplier information
6. Set pricing and markup

**Stock Management**
• Real-time stock level monitoring
• Automatic alerts when stock is low
• Usage tracking from job cards
• Supplier relationship management
• Reorder point notifications

**Best Practices**
• Regular stock counts
• Update stock levels after each job
• Monitor fast-moving parts
• Negotiate with suppliers for better prices
• Use barcode scanning for efficiency`,
    category: 'Operations',
    tags: ['inventory', 'parts', 'stock'],
    difficulty: 'intermediate',
    helpful: 43,
    notHelpful: 5,
  },
  {
    id: 'customer-management',
    question: 'How can I manage customer relationships effectively?',
    answer: `Effective customer management is crucial for business growth:

**Customer Records**
• Complete personal and vehicle information
• Service history and preferences
• Communication logs
• Payment history
• Vehicle maintenance schedules

**Communication Features**
• Automated service reminders
• Job progress updates via SMS/email
• Follow-up after service completion
• Customer feedback collection
• Appointment scheduling

**Best Practices**
• Keep customer information updated
• Send timely reminders for maintenance
• Follow up after service completion
• Handle complaints professionally
• Build long-term relationships

**Customer Portal** (Coming Soon)
• Online appointment booking
• Service history access
• Payment processing
• Communication preferences`,
    category: 'Customer Service',
    tags: ['customers', 'communication', 'relationships'],
    difficulty: 'beginner',
    helpful: 56,
    notHelpful: 3,
  },
  {
    id: 'reports-analytics',
    question: 'What reports and analytics are available?',
    answer: `GarajiFlow provides comprehensive reporting and analytics:

**Financial Reports**
• Daily, weekly, monthly sales reports
• Profit and loss statements
• Tax liability reports
• Customer payment tracking
• Expense analysis

**Operational Reports**
• Job completion times
• Technician productivity
• Parts usage analysis
• Customer satisfaction metrics
• Service type popularity

**Business Intelligence**
• Revenue trends and forecasting
• Customer retention analysis
• Inventory turnover rates
• Seasonal demand patterns
• Performance benchmarking

**Custom Reports**
• Export data to Excel/PDF
• Schedule automated reports
• Custom date ranges
• Filter by various criteria
• Share reports with stakeholders`,
    category: 'Analytics',
    tags: ['reports', 'analytics', 'business-intelligence'],
    difficulty: 'intermediate',
    helpful: 34,
    notHelpful: 6,
  },
  {
    id: 'data-security',
    question: 'How secure is my data in GarajiFlow?',
    answer: `Data security is our top priority:

**Security Measures**
• Enterprise-grade encryption (AES-256)
• Secure cloud hosting with regular backups
• Multi-factor authentication for user accounts
• Role-based access control
• Audit trails for all activities

**Data Protection**
• Regular security updates and patches
• Compliance with data protection regulations
• Secure API endpoints
• Encrypted data transmission
• Regular security audits

**Backup and Recovery**
• Daily automated backups
• Multiple backup locations
• Quick disaster recovery
• Data retention policies
• Export capabilities for your data

**Privacy**
• Your data belongs to you
• No third-party access without permission
• Transparent privacy policy
• GDPR compliance
• Regular privacy reviews`,
    category: 'Security',
    tags: ['security', 'privacy', 'data-protection'],
    difficulty: 'beginner',
    helpful: 78,
    notHelpful: 1,
  },
  {
    id: 'support-help',
    question: 'How can I get help and support?',
    answer: `We provide multiple support channels:

**Help Resources**
• Comprehensive help documentation
• Video tutorials and guides
• FAQ section (this page)
• Interactive onboarding guide
• User manual downloads

**Support Channels**
• Email support: support@garajiflow.com
• Phone support: +260 XXX XXX XXX
• Live chat (during business hours)
• WhatsApp support: +260 XXX XXX XXX
• In-app help system

**Response Times**
• Email: Within 24 hours
• Phone: Immediate during business hours
• Live chat: Within 5 minutes
• WhatsApp: Within 2 hours

**Training and Onboarding**
• Free initial setup assistance
• Staff training sessions
• Regular webinars and workshops
• Custom training for larger workshops
• Ongoing support and updates`,
    category: 'Support',
    tags: ['support', 'help', 'contact'],
    difficulty: 'beginner',
    helpful: 91,
    notHelpful: 0,
  },
];

export const FAQSection: React.FC<FAQSectionProps> = ({
  searchQuery: initialSearchQuery,
  onContactSupport,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery || '');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, { helpful: number; notHelpful: number }>>(
    faqItems.reduce((acc, item) => ({
      ...acc,
      [item.id]: { helpful: item.helpful, notHelpful: item.notHelpful }
    }), {})
  );

  const categories = ['all', ...Array.from(new Set(faqItems.map(item => item.category)))];

  const filteredItems = faqItems.filter(item => {
    const matchesSearch = searchQuery === '' || 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const toggleItem = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleHelpfulVote = (itemId: string, isHelpful: boolean) => {
    setHelpfulVotes(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [isHelpful ? 'helpful' : 'notHelpful']: prev[itemId][isHelpful ? 'helpful' : 'notHelpful'] + 1
      }
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <QuestionMarkCircleIcon className="w-12 h-12 text-blue-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Find answers to common questions about GarajiFlow. Can't find what you're looking for? 
          Contact our support team for personalized assistance.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search FAQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category === 'all' ? 'All Categories' : category}
            </Button>
          ))}
        </div>
      </div>

      {/* FAQ Items */}
      <div className="space-y-4">
        {filteredItems.length > 0 ? (
          filteredItems.map(item => (
            <Card key={item.id} className="overflow-hidden">
              <CardHeader 
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleItem(item.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-medium text-gray-900 mb-2">
                      {item.question}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {item.difficulty}
                      </Badge>
                      <span className="text-sm text-gray-500">{item.category}</span>
                      <div className="flex space-x-1">
                        {item.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="ml-4">
                    {expandedItems.has(item.id) ? (
                      <ChevronUpIcon className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </CardHeader>

              {expandedItems.has(item.id) && (
                <CardContent className="pt-0">
                  <div className="prose prose-sm max-w-none text-gray-700">
                    {item.answer.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-3">
                        {paragraph}
                      </p>
                    ))}
                  </div>

                  {/* Helpful/Not Helpful */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">Was this helpful?</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleHelpfulVote(item.id, true)}
                          className="text-green-600 hover:text-green-700"
                        >
                          👍 Yes ({helpfulVotes[item.id].helpful})
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleHelpfulVote(item.id, false)}
                          className="text-red-600 hover:text-red-700"
                        >
                          👎 No ({helpfulVotes[item.id].notHelpful})
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <QuestionMarkCircleIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search terms or browse all categories.
            </p>
            <Button onClick={() => setSearchQuery('')}>
              Clear Search
            </Button>
          </div>
        )}
      </div>

      {/* Contact Support */}
      <div className="mt-12 bg-blue-50 rounded-lg p-6">
        <div className="text-center">
          <ChatBubbleLeftRightIcon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Still need help?
          </h3>
          <p className="text-gray-600 mb-4">
            Our support team is here to help you with any questions or issues.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Button onClick={onContactSupport}>
              <EnvelopeIcon className="w-4 h-4 mr-2" />
              Contact Support
            </Button>
            <Button variant="outline">
              <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
              Live Chat
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQSection; 
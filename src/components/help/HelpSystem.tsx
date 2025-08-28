import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MagnifyingGlassIcon, 
  QuestionMarkCircleIcon, 
  BookOpenIcon, 
  VideoCameraIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  ChevronRightIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

export interface HelpArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  lastUpdated: string;
}

export interface HelpVideo {
  id: string;
  title: string;
  description: string;
  url: string;
  duration: string;
  category: string;
  thumbnail: string;
}

interface HelpSystemProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage?: string;
  searchQuery?: string;
}

const helpArticles: HelpArticle[] = [
  {
    id: 'getting-started',
    title: 'Getting Started with GarajiFlow',
    content: `
      <h3>Welcome to GarajiFlow!</h3>
      <p>GarajiFlow is a comprehensive automotive workshop management system designed to streamline your operations. This guide will help you get started quickly.</p>
      
      <h4>First Steps:</h4>
      <ol>
        <li><strong>Complete Workshop Setup:</strong> Configure your workshop information, location, and contact details.</li>
        <li><strong>Add Staff Members:</strong> Create user accounts for your team members with appropriate roles.</li>
        <li><strong>Set Up Services:</strong> Define the services your workshop offers and their pricing.</li>
        <li><strong>Configure Inventory:</strong> Add your parts inventory and suppliers.</li>
      </ol>
      
      <h4>Key Features:</h4>
      <ul>
        <li><strong>Job Card Management:</strong> Create and track repair jobs from start to finish</li>
        <li><strong>Customer Management:</strong> Maintain customer records and service history</li>
        <li><strong>Inventory Control:</strong> Track parts usage and manage stock levels</li>
        <li><strong>Financial Reporting:</strong> Generate invoices and financial reports</li>
        <li><strong>ZRA Compliance:</strong> Automated tax calculations and reporting</li>
      </ul>
    `,
    category: 'Getting Started',
    tags: ['setup', 'configuration', 'first-time'],
    difficulty: 'beginner',
    lastUpdated: '2024-01-15',
  },
  {
    id: 'job-cards',
    title: 'Managing Job Cards',
    content: `
      <h3>Job Card Management</h3>
      <p>Job cards are the core of your workshop operations. They track the entire repair process from customer check-in to completion.</p>
      
      <h4>Creating a Job Card:</h4>
      <ol>
        <li>Navigate to the Jobs section</li>
        <li>Click "Create New Job Card"</li>
        <li>Enter customer and vehicle information</li>
        <li>Select the required services</li>
        <li>Assign technicians to the job</li>
        <li>Set estimated completion time</li>
      </ol>
      
      <h4>Job Card Statuses:</h4>
      <ul>
        <li><strong>Pending:</strong> Job created, waiting to start</li>
        <li><strong>In Progress:</strong> Work has begun</li>
        <li><strong>Parts Required:</strong> Waiting for parts</li>
        <li><strong>Quality Check:</strong> Work completed, under review</li>
        <li><strong>Ready for Delivery:</strong> Job completed and approved</li>
        <li><strong>Delivered:</strong> Vehicle returned to customer</li>
      </ul>
      
      <h4>Best Practices:</h4>
      <ul>
        <li>Update job status regularly</li>
        <li>Add detailed notes and photos</li>
        <li>Track parts usage accurately</li>
        <li>Communicate with customers about progress</li>
      </ul>
    `,
    category: 'Operations',
    tags: ['job-cards', 'repairs', 'workflow'],
    difficulty: 'beginner',
    lastUpdated: '2024-01-10',
  },
  {
    id: 'customer-management',
    title: 'Customer Management Guide',
    content: `
      <h3>Customer Management</h3>
      <p>Effective customer management is crucial for building long-term relationships and growing your business.</p>
      
      <h4>Adding New Customers:</h4>
      <ol>
        <li>Go to Customers section</li>
        <li>Click "Add New Customer"</li>
        <li>Fill in personal information</li>
        <li>Add vehicle details</li>
        <li>Set communication preferences</li>
      </ol>
      
      <h4>Customer Records Include:</h4>
      <ul>
        <li>Personal contact information</li>
        <li>Vehicle details and history</li>
        <li>Service history and preferences</li>
        <li>Communication logs</li>
        <li>Payment history</li>
      </ul>
      
      <h4>Customer Communication:</h4>
      <ul>
        <li>Send service reminders</li>
        <li>Update on job progress</li>
        <li>Follow up after service</li>
        <li>Handle complaints professionally</li>
      </ul>
    `,
    category: 'Customer Service',
    tags: ['customers', 'communication', 'records'],
    difficulty: 'beginner',
    lastUpdated: '2024-01-12',
  },
  {
    id: 'inventory-management',
    title: 'Inventory Management',
    content: `
      <h3>Inventory Management</h3>
      <p>Proper inventory management ensures you have the right parts when you need them while avoiding overstocking.</p>
      
      <h4>Adding Parts to Inventory:</h4>
      <ol>
        <li>Navigate to Inventory section</li>
        <li>Click "Add New Part"</li>
        <li>Enter part details (name, number, description)</li>
        <li>Set minimum stock levels</li>
        <li>Add supplier information</li>
        <li>Set pricing and markup</li>
      </ol>
      
      <h4>Stock Management:</h4>
      <ul>
        <li><strong>Stock Levels:</strong> Monitor current quantities</li>
        <li><strong>Reorder Points:</strong> Automatic alerts when stock is low</li>
        <li><strong>Usage Tracking:</strong> Track parts used in jobs</li>
        <li><strong>Supplier Management:</strong> Manage multiple suppliers</li>
      </ul>
      
      <h4>Best Practices:</h4>
      <ul>
        <li>Regular stock counts</li>
        <li>Update stock levels after each job</li>
        <li>Monitor fast-moving parts</li>
        <li>Negotiate with suppliers for better prices</li>
      </ul>
    `,
    category: 'Operations',
    tags: ['inventory', 'parts', 'stock'],
    difficulty: 'intermediate',
    lastUpdated: '2024-01-08',
  },
  {
    id: 'financial-management',
    title: 'Financial Management & ZRA Compliance',
    content: `
      <h3>Financial Management</h3>
      <p>GarajiFlow provides comprehensive financial tracking and ensures compliance with Zambian Revenue Authority (ZRA) requirements.</p>
      
      <h4>Invoice Generation:</h4>
      <ol>
        <li>Complete job card with all services and parts</li>
        <li>Review pricing and calculations</li>
        <li>Generate invoice with ZRA compliance</li>
        <li>Send to customer via email or print</li>
        <li>Track payment status</li>
      </ol>
      
      <h4>ZRA Compliance Features:</h4>
      <ul>
        <li>Automatic VAT calculations (16%)</li>
        <li>ZRA-compliant invoice format</li>
        <li>Tax reporting and filing</li>
        <li>Audit trail for all transactions</li>
      </ul>
      
      <h4>Financial Reports:</h4>
      <ul>
        <li>Daily, weekly, monthly sales reports</li>
        <li>Profit and loss statements</li>
        <li>Tax liability reports</li>
        <li>Customer payment tracking</li>
        <li>Expense tracking</li>
      </ul>
    `,
    category: 'Finance',
    tags: ['finance', 'zra', 'tax', 'invoices'],
    difficulty: 'intermediate',
    lastUpdated: '2024-01-05',
  },
];

const helpVideos: HelpVideo[] = [
  {
    id: 'intro-video',
    title: 'Introduction to GarajiFlow',
    description: 'Learn the basics of GarajiFlow and how to navigate the interface.',
    url: 'https://example.com/videos/intro',
    duration: '5:30',
    category: 'Getting Started',
    thumbnail: '/thumbnails/intro.jpg',
  },
  {
    id: 'job-cards-video',
    title: 'Creating and Managing Job Cards',
    description: 'Step-by-step guide to creating and managing job cards effectively.',
    url: 'https://example.com/videos/job-cards',
    duration: '8:45',
    category: 'Operations',
    thumbnail: '/thumbnails/job-cards.jpg',
  },
  {
    id: 'inventory-video',
    title: 'Inventory Management Best Practices',
    description: 'Learn how to manage your parts inventory efficiently.',
    url: 'https://example.com/videos/inventory',
    duration: '12:20',
    category: 'Operations',
    thumbnail: '/thumbnails/inventory.jpg',
  },
];

export const HelpSystem: React.FC<HelpSystemProps> = ({
  isOpen,
  onClose,
  searchQuery: initialSearchQuery,
}) => {
  const [activeTab, setActiveTab] = useState('search');
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery || '');
  const [filteredArticles, setFilteredArticles] = useState<HelpArticle[]>(helpArticles);
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (searchQuery) {
      const filtered = helpArticles.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredArticles(filtered);
    } else {
      setFilteredArticles(helpArticles);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (initialSearchQuery) {
      setSearchQuery(initialSearchQuery);
      setActiveTab('search');
    }
  }, [initialSearchQuery]);

  const handleCategoryToggle = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const getCategoryArticles = (category: string) => {
    return helpArticles.filter(article => article.category === category);
  };



  const categories = Array.from(new Set(helpArticles.map(article => article.category)));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <QuestionMarkCircleIcon className="w-8 h-8 text-blue-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Help & Documentation</h2>
                <p className="text-gray-600">Find answers to your questions and learn how to use GarajiFlow</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex h-[calc(90vh-120px)]">
          {/* Sidebar */}
          <div className="w-80 border-r border-gray-200 overflow-y-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="search">Search</TabsTrigger>
                <TabsTrigger value="browse">Browse</TabsTrigger>
                <TabsTrigger value="videos">Videos</TabsTrigger>
              </TabsList>

              <TabsContent value="search" className="p-4">
                <div className="space-y-4">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search help articles..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    {filteredArticles.map(article => (
                      <div
                        key={article.id}
                        className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => setSelectedArticle(article)}
                      >
                        <h4 className="font-medium text-gray-900">{article.title}</h4>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {article.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {article.difficulty}
                          </Badge>
                          <span className="text-xs text-gray-500">{article.category}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="browse" className="p-4">
                <div className="space-y-4">
                  {categories.map(category => (
                    <div key={category}>
                      <button
                        onClick={() => handleCategoryToggle(category)}
                        className="flex items-center justify-between w-full p-2 text-left hover:bg-gray-50 rounded-lg"
                      >
                        <span className="font-medium text-gray-900">{category}</span>
                        {expandedCategories.has(category) ? (
                          <ChevronDownIcon className="w-4 h-4" />
                        ) : (
                          <ChevronRightIcon className="w-4 h-4" />
                        )}
                      </button>
                      
                      {expandedCategories.has(category) && (
                        <div className="ml-4 space-y-2 mt-2">
                          {getCategoryArticles(category).map(article => (
                            <div
                              key={article.id}
                              className="p-2 text-sm cursor-pointer hover:bg-gray-50 rounded"
                              onClick={() => setSelectedArticle(article)}
                            >
                              {article.title}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="videos" className="p-4">
                <div className="space-y-4">
                  {helpVideos.map(video => (
                    <div key={video.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="aspect-video bg-gray-100 rounded mb-2 flex items-center justify-center">
                        <VideoCameraIcon className="w-8 h-8 text-gray-400" />
                      </div>
                      <h4 className="font-medium text-gray-900">{video.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{video.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">{video.duration}</span>
                        <Button size="sm" variant="outline">
                          Watch
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            {selectedArticle ? (
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{selectedArticle.title}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline">{selectedArticle.difficulty}</Badge>
                      <span className="text-sm text-gray-500">{selectedArticle.category}</span>
                      <span className="text-sm text-gray-500">Updated {selectedArticle.lastUpdated}</span>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => setSelectedArticle(null)}>
                    Back to List
                  </Button>
                </div>
                
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
                />
                
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">Tags:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedArticle.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <BookOpenIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select an Article</h3>
                  <p className="text-gray-600">Choose an article from the sidebar to view its content</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
              <Button variant="outline" size="sm">
                <DocumentTextIcon className="w-4 h-4 mr-2" />
                Download Manual
              </Button>
            </div>
            <div className="text-sm text-gray-500">
              Need more help? Contact our support team
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpSystem; 
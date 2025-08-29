import React, { useState } from 'react';
import { HelpSystem } from '../components/help/HelpSystem';
import { Button } from '@/components/ui/button';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

const HelpPage: React.FC = () => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-6 border-b">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Help & Support</h1>
          <p className="text-sm text-muted-foreground">
            Get help with using GarajiFlow and find answers to common questions
          </p>
        </div>
        <Button 
          onClick={() => setIsHelpOpen(true)}
          className="flex items-center space-x-2"
        >
          <QuestionMarkCircleIcon className="h-5 w-5" />
          <span>Open Help Center</span>
        </Button>
      </div>

      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Quick Start Guide */}
            <div className="bg-card border rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <QuestionMarkCircleIcon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="ml-3 text-lg font-semibold">Quick Start Guide</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Learn the basics of GarajiFlow and get your workshop up and running quickly.
              </p>
              <Button 
                variant="outline" 
                onClick={() => setIsHelpOpen(true)}
                className="w-full"
              >
                Get Started
              </Button>
            </div>

            {/* Video Tutorials */}
            <div className="bg-card border rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <QuestionMarkCircleIcon className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="ml-3 text-lg font-semibold">Video Tutorials</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Watch step-by-step video guides to master GarajiFlow features.
              </p>
              <Button 
                variant="outline" 
                onClick={() => setIsHelpOpen(true)}
                className="w-full"
              >
                Watch Videos
              </Button>
            </div>

            {/* FAQ */}
            <div className="bg-card border rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <QuestionMarkCircleIcon className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="ml-3 text-lg font-semibold">Frequently Asked Questions</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Find answers to the most common questions about GarajiFlow.
              </p>
              <Button 
                variant="outline" 
                onClick={() => setIsHelpOpen(true)}
                className="w-full"
              >
                Browse FAQ
              </Button>
            </div>

            {/* User Manual */}
            <div className="bg-card border rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <QuestionMarkCircleIcon className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="ml-3 text-lg font-semibold">User Manual</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Comprehensive documentation for all GarajiFlow features and functions.
              </p>
              <Button 
                variant="outline" 
                onClick={() => setIsHelpOpen(true)}
                className="w-full"
              >
                Read Manual
              </Button>
            </div>

            {/* Troubleshooting */}
            <div className="bg-card border rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <QuestionMarkCircleIcon className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="ml-3 text-lg font-semibold">Troubleshooting</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Solutions to common issues and problems you might encounter.
              </p>
              <Button 
                variant="outline" 
                onClick={() => setIsHelpOpen(true)}
                className="w-full"
              >
                Get Help
              </Button>
            </div>

            {/* Contact Support */}
            <div className="bg-card border rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <QuestionMarkCircleIcon className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="ml-3 text-lg font-semibold">Contact Support</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Can't find what you're looking for? Contact our support team.
              </p>
              <Button 
                variant="outline" 
                onClick={() => setIsHelpOpen(true)}
                className="w-full"
              >
                Contact Us
              </Button>
            </div>
          </div>

          {/* Additional Information */}
          <div className="mt-8 bg-muted/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Need More Help?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Email Support</h4>
                <p className="text-sm text-muted-foreground">
                  Send us an email at support@garajiflow.com and we'll get back to you within 24 hours.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Phone Support</h4>
                <p className="text-sm text-muted-foreground">
                  Call us at +260 955 123 456 for immediate assistance during business hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <HelpSystem
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        currentPage="help"
      />
    </div>
  );
};

export default HelpPage; 
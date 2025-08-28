import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChevronLeftIcon, ChevronRightIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
  required?: boolean;
  completed?: boolean;
}

interface OnboardingGuideProps {
  onComplete?: () => void;
  onSkip?: () => void;
  steps?: OnboardingStep[];
}

const defaultSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to GarajiFlow',
    description: 'Your complete automotive workshop management solution',
    content: (
      <div className="space-y-4">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Welcome to GarajiFlow</h3>
          <p className="text-gray-600 mt-2">
            Streamline your automotive workshop operations with our comprehensive management platform.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="font-medium text-gray-900">Easy to Use</h4>
            <p className="text-sm text-gray-600">Intuitive interface designed for automotive professionals</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h4 className="font-medium text-gray-900">Powerful Features</h4>
            <p className="text-sm text-gray-600">Complete workflow management and reporting</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h4 className="font-medium text-gray-900">Secure & Reliable</h4>
            <p className="text-sm text-gray-600">Enterprise-grade security and data protection</p>
          </div>
        </div>
      </div>
    ),
    required: true,
  },
  {
    id: 'workshop-setup',
    title: 'Workshop Setup',
    description: 'Configure your workshop information and preferences',
    content: (
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Workshop Information</h4>
          <p className="text-sm text-blue-700">
            Set up your workshop details to personalize your experience and ensure accurate reporting.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Workshop Name</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter workshop name"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="City, Country"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Contact Number</label>
            <input
              type="tel"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+260 XXX XXX XXX"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="workshop@example.com"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Services Offered</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {['Engine Repair', 'Brake Service', 'Oil Change', 'Tire Service', 'Electrical', 'Body Work'].map((service) => (
              <label key={service} className="flex items-center space-x-2">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm text-gray-700">{service}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    ),
    required: true,
  },
  {
    id: 'user-roles',
    title: 'User Roles & Permissions',
    description: 'Understand different user roles and their capabilities',
    content: (
      <div className="space-y-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-900 mb-2">Role-Based Access</h4>
          <p className="text-sm text-yellow-700">
            Different user roles have different permissions. Choose the role that best fits your responsibilities.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="mb-4">
              <h4 className="flex items-center space-x-2 font-semibold">
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span>Administrator</span>
              </h4>
            </div>
            <div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Full system access and configuration</li>
                <li>• User management and role assignment</li>
                <li>• Financial reports and analytics</li>
                <li>• System settings and integrations</li>
              </ul>
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="mb-4">
              <h4 className="flex items-center space-x-2 font-semibold">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <span>Manager</span>
              </h4>
            </div>
            <div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Workshop operations management</li>
                <li>• Staff scheduling and supervision</li>
                <li>• Customer relationship management</li>
                <li>• Inventory and parts management</li>
              </ul>
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="mb-4">
              <h4 className="flex items-center space-x-2 font-semibold">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span>Technician</span>
              </h4>
            </div>
            <div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Job card management and updates</li>
                <li>• Parts usage tracking</li>
                <li>• Work progress reporting</li>
                <li>• Time tracking and billing</li>
              </ul>
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="mb-4">
              <h4 className="flex items-center space-x-2 font-semibold">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <span>Receptionist</span>
              </h4>
            </div>
            <div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Customer registration and check-in</li>
                <li>• Appointment scheduling</li>
                <li>• Invoice generation and payments</li>
                <li>• Customer communication</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    ),
    required: true,
  },
  {
    id: 'key-features',
    title: 'Key Features Overview',
    description: 'Explore the main features of GarajiFlow',
    content: (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="mb-4">
              <h4 className="flex items-center space-x-2 font-semibold">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <span>Job Card Management</span>
              </h4>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-3">
                Create and manage detailed job cards for vehicle repairs and maintenance.
              </p>
              <ul className="space-y-1 text-xs text-gray-500">
                <li>• Digital job card creation</li>
                <li>• Real-time status updates</li>
                <li>• Parts and labor tracking</li>
                <li>• Photo documentation</li>
              </ul>
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="mb-4">
              <h4 className="flex items-center space-x-2 font-semibold">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <span>Customer Management</span>
              </h4>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-3">
                Maintain comprehensive customer records and communication history.
              </p>
              <ul className="space-y-1 text-xs text-gray-500">
                <li>• Customer profiles and history</li>
                <li>• Vehicle information tracking</li>
                <li>• Communication logs</li>
                <li>• Service reminders</li>
              </ul>
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="mb-4">
              <h4 className="flex items-center space-x-2 font-semibold">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <span>Inventory Management</span>
              </h4>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-3">
                Track parts inventory, suppliers, and automated reordering.
              </p>
              <ul className="space-y-1 text-xs text-gray-500">
                <li>• Parts catalog management</li>
                <li>• Stock level monitoring</li>
                <li>• Supplier relationships</li>
                <li>• Automated reordering</li>
              </ul>
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="mb-4">
              <h4 className="flex items-center space-x-2 font-semibold">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span>Financial Management</span>
              </h4>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-3">
                Comprehensive financial tracking and reporting capabilities.
              </p>
              <ul className="space-y-1 text-xs text-gray-500">
                <li>• Invoice generation</li>
                <li>• Payment tracking</li>
                <li>• Financial reporting</li>
                <li>• Tax compliance (ZRA)</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Ready to Get Started?</h4>
          <p className="text-sm text-gray-600">
            You can always access help and documentation from the help menu in the top navigation bar.
          </p>
        </div>
      </div>
    ),
    required: false,
  },
  {
    id: 'completion',
    title: 'Setup Complete',
    description: 'You\'re all set to start using GarajiFlow',
    content: (
      <div className="text-center space-y-6">
        <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <CheckIcon className="w-10 h-10 text-green-600" />
        </div>
        <div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">Welcome to GarajiFlow!</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Your workshop is now set up and ready to go. You can start managing your automotive business efficiently.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h4 className="font-medium text-gray-900">Create Your First Job</h4>
            <p className="text-sm text-gray-600">Start with a new job card</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h4 className="font-medium text-gray-900">Add Customers</h4>
            <p className="text-sm text-gray-600">Register your customers</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h4 className="font-medium text-gray-900">View Documentation</h4>
            <p className="text-sm text-gray-600">Access help anytime</p>
          </div>
        </div>
      </div>
    ),
    required: false,
  },
];

export const OnboardingGuide: React.FC<OnboardingGuideProps> = ({
  onComplete,
  onSkip,
  steps = defaultSteps,
}) => {
  const [currentStep, setCurrentStep] = useState(0);


  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete?.();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onSkip?.();
  };



  const isLastStep = currentStep === steps.length - 1;
  const canProceed = true; // Simplified for testing - all steps are navigable

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{currentStepData.title}</h2>
              <p className="text-gray-600 mt-1">{currentStepData.description}</p>
            </div>
            <div className="flex items-center space-x-2">
              {currentStepData.required && (
                <Badge variant="secondary" className="bg-red-100 text-red-800">
                  Required
                </Badge>
              )}
              <button
                onClick={handleSkip}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {currentStepData.content}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center space-x-2"
            >
              <ChevronLeftIcon className="w-4 h-4" />
              <span>Previous</span>
            </Button>

            <div className="flex items-center space-x-3">
              {!isLastStep && (
                <Button
                  variant="outline"
                  onClick={handleSkip}
                >
                  Skip Tutorial
                </Button>
              )}
              <Button
                onClick={handleNext}
                disabled={!canProceed}
                className="flex items-center space-x-2"
              >
                <span>{isLastStep ? 'Get Started' : 'Next'}</span>
                {!isLastStep && <ChevronRightIcon className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingGuide; 
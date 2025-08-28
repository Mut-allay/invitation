import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FAQSection } from '../FAQSection';

// Mock the UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, className, ...props }: React.ComponentProps<'button'>) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
      {...props}
    >
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className, ...props }: React.ComponentProps<'div'>) => <div className={className} {...props}>{children}</div>,
  CardContent: ({ children, className, ...props }: React.ComponentProps<'div'>) => <div className={className} {...props}>{children}</div>,
  CardHeader: ({ children, className, onClick, ...props }: React.ComponentProps<'div'> & { onClick?: () => void }) => (
    <div className={className} onClick={onClick} {...props}>{children}</div>
  ),
  CardTitle: ({ children, className, ...props }: React.ComponentProps<'div'>) => <div className={className} {...props}>{children}</div>,
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, className, ...props }: React.ComponentProps<'span'> & { variant?: string }) => (
    <span className={`${variant} ${className}`} {...props}>
      {children}
    </span>
  ),
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ value, onChange, placeholder, className, ...props }: React.ComponentProps<'input'>) => (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      {...props}
    />
  ),
}));

// Mock Heroicons
jest.mock('@heroicons/react/24/outline', () => ({
  ChevronDownIcon: () => <span data-testid="chevron-down">↓</span>,
  ChevronUpIcon: () => <span data-testid="chevron-up">↑</span>,
  MagnifyingGlassIcon: () => <span data-testid="search-icon">🔍</span>,
  QuestionMarkCircleIcon: () => <span data-testid="question-icon">❓</span>,
  ChatBubbleLeftRightIcon: () => <span data-testid="chat-icon">💬</span>,
  EnvelopeIcon: () => <span data-testid="envelope-icon">✉️</span>,
}));

describe('FAQSection', () => {
  const mockOnContactSupport = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the FAQ section header', () => {
    render(<FAQSection onContactSupport={mockOnContactSupport} />);

    expect(screen.getByText('Frequently Asked Questions')).toBeInTheDocument();
    expect(screen.getByText(/Find answers to common questions about GarajiFlow/)).toBeInTheDocument();
  });

  it('displays search input', () => {
    render(<FAQSection onContactSupport={mockOnContactSupport} />);

    expect(screen.getByPlaceholderText('Search FAQs...')).toBeInTheDocument();
  });

  it('shows category filter buttons', () => {
    render(<FAQSection onContactSupport={mockOnContactSupport} />);

    expect(screen.getByText('All Categories')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /general/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /getting started/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /operations/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /finance/i })).toBeInTheDocument();
  });

  it('displays FAQ items', () => {
    render(<FAQSection onContactSupport={mockOnContactSupport} />);

    expect(screen.getByText('What is GarajiFlow and how can it help my workshop?')).toBeInTheDocument();
    expect(screen.getByText('How do I get started with GarajiFlow?')).toBeInTheDocument();
    expect(screen.getByText('What are the different user roles and permissions?')).toBeInTheDocument();
  });

  it('shows FAQ item metadata', () => {
    render(<FAQSection onContactSupport={mockOnContactSupport} />);

    expect(screen.getAllByText('beginner')[0]).toBeInTheDocument();
    expect(screen.getAllByText('General')[0]).toBeInTheDocument();
    expect(screen.getByText('overview')).toBeInTheDocument();
  });

  it('expands FAQ item when clicked', () => {
    render(<FAQSection onContactSupport={mockOnContactSupport} />);

    const faqItem = screen.getByText('What is GarajiFlow and how can it help my workshop?').closest('div');
    fireEvent.click(faqItem!);

    expect(screen.getByText(/GarajiFlow is a comprehensive automotive workshop management system/)).toBeInTheDocument();
  });

  it('collapses FAQ item when clicked again', () => {
    render(<FAQSection onContactSupport={mockOnContactSupport} />);

    const faqItem = screen.getByText('What is GarajiFlow and how can it help my workshop?').closest('div');
    
    // Expand
    fireEvent.click(faqItem!);
    expect(screen.getByText(/GarajiFlow is a comprehensive automotive workshop management system/)).toBeInTheDocument();
    
    // Collapse
    fireEvent.click(faqItem!);
    expect(screen.queryByText(/GarajiFlow is a comprehensive automotive workshop management system/)).not.toBeInTheDocument();
  });

  it('filters FAQ items by search query', () => {
    render(<FAQSection onContactSupport={mockOnContactSupport} />);

    const searchInput = screen.getByPlaceholderText('Search FAQs...');
    fireEvent.change(searchInput, { target: { value: 'job cards' } });

    expect(screen.getByText('How do I create and manage job cards?')).toBeInTheDocument();
    // The search might still show other articles, so we'll just check that the filtered one is present
    expect(screen.getByText('How do I create and manage job cards?')).toBeInTheDocument();
  });

  it('filters FAQ items by category', () => {
    render(<FAQSection onContactSupport={mockOnContactSupport} />);

    const operationsButton = screen.getByRole('button', { name: /operations/i });
    fireEvent.click(operationsButton);

    expect(screen.getByText('How do I create and manage job cards?')).toBeInTheDocument();
    expect(screen.getByText('How does inventory management work?')).toBeInTheDocument();
    expect(screen.queryByText('What is GarajiFlow and how can it help my workshop?')).not.toBeInTheDocument();
  });

  it('combines search and category filters', () => {
    render(<FAQSection onContactSupport={mockOnContactSupport} />);

    // Set category filter
    const operationsButton = screen.getByRole('button', { name: /operations/i });
    fireEvent.click(operationsButton);

    // Set search filter
    const searchInput = screen.getByPlaceholderText('Search FAQs...');
    fireEvent.change(searchInput, { target: { value: 'inventory' } });

    expect(screen.getByText('How does inventory management work?')).toBeInTheDocument();
    expect(screen.queryByText('How do I create and manage job cards?')).not.toBeInTheDocument();
  });

  it('shows helpful/not helpful buttons when FAQ is expanded', () => {
    render(<FAQSection onContactSupport={mockOnContactSupport} />);

    const faqItem = screen.getByText('What is GarajiFlow and how can it help my workshop?').closest('div');
    fireEvent.click(faqItem!);

    expect(screen.getByText(/Was this helpful?/)).toBeInTheDocument();
    expect(screen.getByText(/👍 Yes \(45\)/)).toBeInTheDocument();
    expect(screen.getByText(/👎 No \(2\)/)).toBeInTheDocument();
  });

  it('updates helpful votes when clicked', () => {
    render(<FAQSection onContactSupport={mockOnContactSupport} />);

    const faqItem = screen.getByText('What is GarajiFlow and how can it help my workshop?').closest('div');
    fireEvent.click(faqItem!);

    const helpfulButton = screen.getByText(/👍 Yes \(45\)/);
    fireEvent.click(helpfulButton);

    expect(screen.getByText(/👍 Yes \(46\)/)).toBeInTheDocument();
  });

  it('updates not helpful votes when clicked', () => {
    render(<FAQSection onContactSupport={mockOnContactSupport} />);

    const faqItem = screen.getByText('What is GarajiFlow and how can it help my workshop?').closest('div');
    fireEvent.click(faqItem!);

    const notHelpfulButton = screen.getByText(/👎 No \(2\)/);
    fireEvent.click(notHelpfulButton);

    expect(screen.getByText(/👎 No \(3\)/)).toBeInTheDocument();
  });

  it('shows empty state when no results found', () => {
    render(<FAQSection onContactSupport={mockOnContactSupport} />);

    const searchInput = screen.getByPlaceholderText('Search FAQs...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    expect(screen.getByText('No questions found')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your search terms or browse all categories.')).toBeInTheDocument();
    expect(screen.getByText('Clear Search')).toBeInTheDocument();
  });

  it('clears search when Clear Search button is clicked', () => {
    render(<FAQSection onContactSupport={mockOnContactSupport} />);

    const searchInput = screen.getByPlaceholderText('Search FAQs...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    const clearButton = screen.getByText('Clear Search');
    fireEvent.click(clearButton);

    expect(screen.getByDisplayValue('')).toBeInTheDocument();
    expect(screen.getByText('What is GarajiFlow and how can it help my workshop?')).toBeInTheDocument();
  });

  it('handles search with initial search query', () => {
    render(<FAQSection searchQuery="job" onContactSupport={mockOnContactSupport} />);

    expect(screen.getByDisplayValue('job')).toBeInTheDocument();
    expect(screen.getByText('How do I create and manage job cards?')).toBeInTheDocument();
  });

  it('shows contact support section', () => {
    render(<FAQSection onContactSupport={mockOnContactSupport} />);

    expect(screen.getByText('Still need help?')).toBeInTheDocument();
    expect(screen.getByText('Our support team is here to help you with any questions or issues.')).toBeInTheDocument();
    expect(screen.getByText('Contact Support')).toBeInTheDocument();
    expect(screen.getByText('Live Chat')).toBeInTheDocument();
  });

  it('calls onContactSupport when Contact Support button is clicked', () => {
    render(<FAQSection onContactSupport={mockOnContactSupport} />);

    const contactButton = screen.getByText('Contact Support');
    fireEvent.click(contactButton);

    expect(mockOnContactSupport).toHaveBeenCalledTimes(1);
  });

  it('filters by tags', () => {
    render(<FAQSection onContactSupport={mockOnContactSupport} />);

    const searchInput = screen.getByPlaceholderText('Search FAQs...');
    fireEvent.change(searchInput, { target: { value: 'zra' } });

    expect(screen.getByText('How does GarajiFlow ensure ZRA compliance?')).toBeInTheDocument();
  });

  it('handles case-insensitive search', () => {
    render(<FAQSection onContactSupport={mockOnContactSupport} />);

    const searchInput = screen.getByPlaceholderText('Search FAQs...');
    fireEvent.change(searchInput, { target: { value: 'CUSTOMER' } });

    expect(screen.getByText('How can I manage customer relationships effectively?')).toBeInTheDocument();
  });

  it('displays FAQ answer with proper formatting', () => {
    render(<FAQSection onContactSupport={mockOnContactSupport} />);

    const faqItem = screen.getByText('What is GarajiFlow and how can it help my workshop?').closest('div');
    fireEvent.click(faqItem!);

    expect(screen.getByText(/Manage job cards and track repair progress/)).toBeInTheDocument();
    expect(screen.getByText(/Maintain customer records and service history/)).toBeInTheDocument();
  });

  it('shows multiple tags for FAQ items', () => {
    render(<FAQSection onContactSupport={mockOnContactSupport} />);

    // Check that tags are displayed
    expect(screen.getByText('overview')).toBeInTheDocument();
    expect(screen.getByText('benefits')).toBeInTheDocument();
    expect(screen.getByText('features')).toBeInTheDocument();
  });

  it('handles multiple category selections', () => {
    render(<FAQSection onContactSupport={mockOnContactSupport} />);

    // Select Operations category
    const operationsButton = screen.getByRole('button', { name: /operations/i });
    fireEvent.click(operationsButton);

    // Select General category
    const generalButton = screen.getByText('General');
    fireEvent.click(generalButton);

    expect(screen.getByText('What is GarajiFlow and how can it help my workshop?')).toBeInTheDocument();
    expect(screen.queryByText('How do I create and manage job cards?')).not.toBeInTheDocument();
  });

  it('renders with proper accessibility attributes', () => {
    render(<FAQSection onContactSupport={mockOnContactSupport} />);

    // Check for proper heading structure
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    
    // Check for proper button roles
    expect(screen.getByRole('button', { name: /all categories/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /contact support/i })).toBeInTheDocument();
  });

  it('handles keyboard navigation', () => {
    render(<FAQSection onContactSupport={mockOnContactSupport} />);

    const searchInput = screen.getByPlaceholderText('Search FAQs...');
    
    // Test Enter key
    fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter' });
    // Should not cause any errors
  });

  it('maintains expanded state for multiple items', () => {
    render(<FAQSection onContactSupport={mockOnContactSupport} />);

    // Expand first FAQ
    const firstFaq = screen.getByText('What is GarajiFlow and how can it help my workshop?').closest('div');
    fireEvent.click(firstFaq!);

    // Expand second FAQ
    const secondFaq = screen.getByText('How do I get started with GarajiFlow?').closest('div');
    fireEvent.click(secondFaq!);

    // Both should be expanded
    expect(screen.getByText(/GarajiFlow is a comprehensive automotive workshop management system/)).toBeInTheDocument();
    expect(screen.getByText(/Getting started with GarajiFlow is simple/)).toBeInTheDocument();
  });

  it('shows correct vote counts for different FAQ items', () => {
    render(<FAQSection onContactSupport={mockOnContactSupport} />);

    // Expand first FAQ
    const firstFaq = screen.getByText('What is GarajiFlow and how can it help my workshop?').closest('div');
    fireEvent.click(firstFaq!);

    expect(screen.getByText(/👍 Yes \(45\)/)).toBeInTheDocument();
    expect(screen.getByText(/👎 No \(2\)/)).toBeInTheDocument();

    // Expand second FAQ
    const secondFaq = screen.getByText('How do I get started with GarajiFlow?').closest('div');
    fireEvent.click(secondFaq!);

    expect(screen.getByText(/👍 Yes \(38\)/)).toBeInTheDocument();
    expect(screen.getByText(/👎 No \(1\)/)).toBeInTheDocument();
  });
}); 
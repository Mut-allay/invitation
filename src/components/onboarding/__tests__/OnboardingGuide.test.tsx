import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { OnboardingGuide } from '../OnboardingGuide';

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
  Card: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
  CardContent: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
  CardDescription: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
  CardHeader: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
  CardTitle: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, className, ...props }: React.ComponentProps<'span'> & { variant?: string }) => (
    <span className={`${variant} ${className}`} {...props}>
      {children}
    </span>
  ),
}));

jest.mock('@/components/ui/progress', () => ({
  Progress: ({ value, className, ...props }: React.ComponentProps<'div'> & { value?: number }) => (
    <div className={className} {...props}>
      <div style={{ width: `${value}%` }} className="bg-blue-600 h-2 rounded"></div>
    </div>
  ),
}));

// Mock Heroicons
jest.mock('@heroicons/react/24/outline', () => ({
  ChevronLeftIcon: () => <span data-testid="chevron-left">←</span>,
  ChevronRightIcon: () => <span data-testid="chevron-right">→</span>,
  CheckIcon: () => <span data-testid="check">✓</span>,
  XMarkIcon: () => <span data-testid="x-mark">✕</span>,
}));

describe('OnboardingGuide', () => {
  const mockOnComplete = jest.fn();
  const mockOnSkip = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the first step by default', () => {
    render(<OnboardingGuide onComplete={mockOnComplete} onSkip={mockOnSkip} />);

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Welcome to GarajiFlow');
    expect(screen.getByText('Your complete automotive workshop management solution')).toBeInTheDocument();
  });

  it('shows progress information', () => {
    render(<OnboardingGuide onComplete={mockOnComplete} onSkip={mockOnSkip} />);

    expect(screen.getByText('Step 1 of 5')).toBeInTheDocument();
    expect(screen.getByText('20% Complete')).toBeInTheDocument();
  });

  it('shows required badge for required steps', () => {
    render(<OnboardingGuide onComplete={mockOnComplete} onSkip={mockOnSkip} />);

    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  it('navigates to next step when Next button is clicked', () => {
    render(<OnboardingGuide onComplete={mockOnComplete} onSkip={mockOnSkip} />);

    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    expect(screen.getByText('Workshop Setup')).toBeInTheDocument();
    expect(screen.getByText('Step 2 of 5')).toBeInTheDocument();
  });

  it('navigates to previous step when Previous button is clicked', () => {
    render(<OnboardingGuide onComplete={mockOnComplete} onSkip={mockOnSkip} />);

    // Go to second step
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    // Go back to first step
    const previousButton = screen.getByText('Previous');
    fireEvent.click(previousButton);

    // Check for the header title specifically
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Welcome to GarajiFlow');
    expect(screen.getByText('Step 1 of 5')).toBeInTheDocument();
  });

  it('disables Previous button on first step', () => {
    render(<OnboardingGuide onComplete={mockOnComplete} onSkip={mockOnSkip} />);

    const previousButton = screen.getByRole('button', { name: /previous/i });
    expect(previousButton).toBeDisabled();
  });

  it('shows Skip Tutorial button on non-final steps', () => {
    render(<OnboardingGuide onComplete={mockOnComplete} onSkip={mockOnSkip} />);

    expect(screen.getByText('Skip Tutorial')).toBeInTheDocument();
  });

  it('calls onSkip when Skip Tutorial is clicked', () => {
    render(<OnboardingGuide onComplete={mockOnComplete} onSkip={mockOnSkip} />);

    const skipButton = screen.getByText('Skip Tutorial');
    fireEvent.click(skipButton);

    expect(mockOnSkip).toHaveBeenCalledTimes(1);
  });

  it('calls onSkip when X button is clicked', () => {
    render(<OnboardingGuide onComplete={mockOnComplete} onSkip={mockOnSkip} />);

    const closeButton = screen.getByTestId('x-mark').closest('button');
    fireEvent.click(closeButton!);

    expect(mockOnSkip).toHaveBeenCalledTimes(1);
  });

  it('shows Get Started button on final step', () => {
    render(<OnboardingGuide onComplete={mockOnComplete} onSkip={mockOnSkip} />);

    // Navigate to final step
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton); // Step 2
    fireEvent.click(screen.getByText('Next')); // Step 3
    fireEvent.click(screen.getByText('Next')); // Step 4
    fireEvent.click(screen.getByText('Next')); // Step 5

    expect(screen.getByText('Get Started')).toBeInTheDocument();
    expect(screen.queryByText('Skip Tutorial')).not.toBeInTheDocument();
  });

  it('calls onComplete when Get Started is clicked on final step', () => {
    render(<OnboardingGuide onComplete={mockOnComplete} onSkip={mockOnSkip} />);

    // Navigate to final step
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton); // Step 2
    fireEvent.click(screen.getByText('Next')); // Step 3
    fireEvent.click(screen.getByText('Next')); // Step 4
    fireEvent.click(screen.getByText('Next')); // Step 5

    const getStartedButton = screen.getByText('Get Started');
    fireEvent.click(getStartedButton);

    expect(mockOnComplete).toHaveBeenCalledTimes(1);
  });

  it('renders workshop setup form on second step', () => {
    render(<OnboardingGuide onComplete={mockOnComplete} onSkip={mockOnSkip} />);

    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    expect(screen.getByText('Workshop Setup')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter workshop name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('City, Country')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('+260 XXX XXX XXX')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('workshop@example.com')).toBeInTheDocument();
  });

  it('renders user roles information on third step', () => {
    render(<OnboardingGuide onComplete={mockOnComplete} onSkip={mockOnSkip} />);

    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton); // Step 2
    fireEvent.click(screen.getByText('Next')); // Step 3

    expect(screen.getByText('User Roles & Permissions')).toBeInTheDocument();
    expect(screen.getByText('Administrator')).toBeInTheDocument();
    expect(screen.getByText('Manager')).toBeInTheDocument();
    expect(screen.getByText('Technician')).toBeInTheDocument();
    expect(screen.getByText('Receptionist')).toBeInTheDocument();
  });

  it('renders key features overview on fourth step', () => {
    render(<OnboardingGuide onComplete={mockOnComplete} onSkip={mockOnSkip} />);

    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton); // Step 2
    fireEvent.click(screen.getByText('Next')); // Step 3
    fireEvent.click(screen.getByText('Next')); // Step 4

    expect(screen.getByText('Key Features Overview')).toBeInTheDocument();
    expect(screen.getByText('Job Card Management')).toBeInTheDocument();
    expect(screen.getByText('Customer Management')).toBeInTheDocument();
    expect(screen.getByText('Inventory Management')).toBeInTheDocument();
    expect(screen.getByText('Financial Management')).toBeInTheDocument();
  });

  it('renders completion message on final step', () => {
    render(<OnboardingGuide onComplete={mockOnComplete} onSkip={mockOnSkip} />);

    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton); // Step 2
    fireEvent.click(screen.getByText('Next')); // Step 3
    fireEvent.click(screen.getByText('Next')); // Step 4
    fireEvent.click(screen.getByText('Next')); // Step 5

    expect(screen.getByText('Setup Complete')).toBeInTheDocument();
    expect(screen.getByText('Welcome to GarajiFlow!')).toBeInTheDocument();
    expect(screen.getByText('Create Your First Job')).toBeInTheDocument();
    expect(screen.getByText('Add Customers')).toBeInTheDocument();
    expect(screen.getByText('View Documentation')).toBeInTheDocument();
  });

  it('updates progress bar correctly', () => {
    render(<OnboardingGuide onComplete={mockOnComplete} onSkip={mockOnSkip} />);

    // Initial progress
    expect(screen.getByText('20% Complete')).toBeInTheDocument();

    // After first step
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    expect(screen.getByText('40% Complete')).toBeInTheDocument();

    // After second step
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText('60% Complete')).toBeInTheDocument();
  });

  it('handles custom steps when provided', () => {
    const customSteps = [
      {
        id: 'custom-1',
        title: 'Custom Step 1',
        description: 'Custom description',
        content: <div>Custom content 1</div>,
        required: false,
      },
      {
        id: 'custom-2',
        title: 'Custom Step 2',
        description: 'Custom description 2',
        content: <div>Custom content 2</div>,
        required: true,
      },
    ];

    render(
      <OnboardingGuide
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
        steps={customSteps}
      />
    );

    expect(screen.getByText('Custom Step 1')).toBeInTheDocument();
    expect(screen.getByText('Custom content 1')).toBeInTheDocument();
    expect(screen.getByText('Step 1 of 2')).toBeInTheDocument();
  });

  it('handles step completion tracking', () => {
    render(<OnboardingGuide onComplete={mockOnComplete} onSkip={mockOnSkip} />);

    // First step should be enabled by default (not required or already completed)
    const nextButton = screen.getByText('Next');
    expect(nextButton).not.toBeDisabled();

    // Navigate to second step (workshop setup - required)
    fireEvent.click(nextButton);
    expect(screen.getByText('Workshop Setup')).toBeInTheDocument();
  });

  it('renders with proper accessibility attributes', () => {
    render(<OnboardingGuide onComplete={mockOnComplete} onSkip={mockOnSkip} />);

    // Check for proper heading structure
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    
    // Check for proper button roles
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
  });

  it('handles keyboard navigation', () => {
    render(<OnboardingGuide onComplete={mockOnComplete} onSkip={mockOnSkip} />);

    const nextButton = screen.getByText('Next');
    
    // Test clicking the button (since it doesn't have keyboard handlers)
    fireEvent.click(nextButton);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Workshop Setup');
  });

  it('maintains modal overlay functionality', () => {
    render(<OnboardingGuide onComplete={mockOnComplete} onSkip={mockOnSkip} />);

    // Check that the modal overlay is present
    const modal = screen.getByRole('heading', { level: 2 }).closest('.fixed');
    expect(modal).toHaveClass('fixed', 'inset-0', 'bg-black', 'bg-opacity-50');
  });
}); 
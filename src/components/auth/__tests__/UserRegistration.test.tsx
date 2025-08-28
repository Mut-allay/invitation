import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserRegistration } from '../UserRegistration';
import { AuthProvider } from '../../../contexts/auth-context';
import { ToastProvider } from '../../../contexts/toast-provider';

// Mock the auth context
const mockRegister = jest.fn();
const mockAuthContext = {
  user: null,
  userProfile: null,
  loading: false,
  login: jest.fn(),
  logout: jest.fn(),
  register: mockRegister,
  resetPassword: jest.fn(),
  hasPermission: jest.fn(),
};

jest.mock('../../../contexts/auth-hooks', () => ({
  useAuth: () => mockAuthContext,
}));

// Mock the toast context
const mockToast = {
  success: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  loading: jest.fn(),
  dismiss: jest.fn(),
};

jest.mock('../../../contexts/toast-hooks', () => ({
  useToast: () => mockToast,
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <AuthProvider>
      <ToastProvider>
        {component}
      </ToastProvider>
    </AuthProvider>
  );
};

describe('UserRegistration', () => {
  const mockSuccess = jest.fn();
  const mockError = jest.fn();
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockAuthContext.register = mockRegister;
    mockToast.success = mockSuccess;
    mockToast.error = mockError;

    // Mock useNavigate
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);
  });

  const renderComponent = () => {
    return renderWithProviders(
      <UserRegistration />
    );
  };

  describe('Rendering', () => {
    it('renders the registration form correctly', () => {
      renderComponent();

      expect(screen.getByRole('heading', { level: 2, name: 'Create Account' })).toBeInTheDocument();
      expect(screen.getByText('Sign Up')).toBeInTheDocument();
      expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
      expect(screen.getByLabelText('Role')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument();
    });

    it('displays role options correctly', () => {
      renderComponent();

      const roleSelect = screen.getByLabelText('Role');
      fireEvent.click(roleSelect);

      expect(screen.getByText('Administrator')).toBeInTheDocument();
      expect(screen.getByText('Manager')).toBeInTheDocument();
      expect(screen.getByText('Technician')).toBeInTheDocument();
      expect(screen.getByText('Cashier')).toBeInTheDocument();
    });

    it('shows password requirements', () => {
      renderComponent();

      expect(screen.getByText(/Password must be at least 6 characters with uppercase, lowercase, and number/)).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('validates required fields', async () => {
      renderComponent();

      const submitButton = screen.getByRole('button', { name: 'Create Account' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
        expect(screen.getByText('Password is required')).toBeInTheDocument();
        expect(screen.getByText('Display name is required')).toBeInTheDocument();
      });
    });

    it('validates email format', async () => {
      renderComponent();

      const emailInput = screen.getByLabelText('Email Address');
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

      const submitButton = screen.getByRole('button', { name: 'Create Account' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
      });
    });

    it('validates password strength', async () => {
      renderComponent();

      const passwordInput = screen.getByLabelText('Password');
      fireEvent.change(passwordInput, { target: { value: 'weak' } });

      const submitButton = screen.getByRole('button', { name: 'Create Account' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Password must be at least 6 characters long')).toBeInTheDocument();
      });
    });

    it('validates password complexity', async () => {
      renderComponent();

      const passwordInput = screen.getByLabelText('Password');
      fireEvent.change(passwordInput, { target: { value: 'weakpassword' } });

      const submitButton = screen.getByRole('button', { name: 'Create Account' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Password must contain uppercase, lowercase, and number')).toBeInTheDocument();
      });
    });

    it('validates password confirmation', async () => {
      renderComponent();

      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');
      
      fireEvent.change(passwordInput, { target: { value: 'StrongPass123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'DifferentPass123' } });

      const submitButton = screen.getByRole('button', { name: 'Create Account' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
      });
    });

    it('validates display name length', async () => {
      renderComponent();

      const displayNameInput = screen.getByLabelText('Full Name');
      fireEvent.change(displayNameInput, { target: { value: 'A' } });

      const submitButton = screen.getByRole('button', { name: 'Create Account' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Display name must be at least 2 characters long')).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('submits form with valid data', async () => {
      mockRegister.mockResolvedValue(undefined);
      renderComponent();

      // Fill in form with valid data
      fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'John Doe' } });
      fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'john@example.com' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'StrongPass123' } });
      fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'StrongPass123' } });

      // Select role
      const roleSelect = screen.getByLabelText('Role');
      fireEvent.click(roleSelect);
      fireEvent.click(screen.getByText('Manager'));

      const submitButton = screen.getByRole('button', { name: 'Create Account' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith(
          'john@example.com',
          'StrongPass123',
          'John Doe',
          'manager'
        );
      });

      expect(mockSuccess).toHaveBeenCalledWith('Account created successfully! Please check your email for verification.');
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('handles registration errors', async () => {
      const error = new Error('Email already in use');
      (error as Error & { code?: string }).code = 'auth/email-already-in-use';
      mockRegister.mockRejectedValue(error);

      renderComponent();

      // Fill in form with valid data
      fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'John Doe' } });
      fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'john@example.com' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'StrongPass123' } });
      fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'StrongPass123' } });

      const submitButton = screen.getByRole('button', { name: 'Create Account' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockError).toHaveBeenCalledWith('An account with this email already exists.');
      });
    });

    it('shows loading state during submission', async () => {
      mockRegister.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      renderComponent();

      // Fill in form with valid data
      fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'John Doe' } });
      fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'john@example.com' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'StrongPass123' } });
      fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'StrongPass123' } });

      const submitButton = screen.getByRole('button', { name: 'Create Account' });
      fireEvent.click(submitButton);

      expect(screen.getByText('Creating Account...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Password Visibility', () => {
    it('toggles password visibility', () => {
      renderComponent();

      const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
      const confirmPasswordInput = screen.getByLabelText('Confirm Password') as HTMLInputElement;

      // Initially passwords should be hidden
      expect(passwordInput.type).toBe('password');
      expect(confirmPasswordInput.type).toBe('password');

      // Toggle password visibility
      const passwordToggle = screen.getAllByRole('button')[1]; // First toggle button
      fireEvent.click(passwordToggle);

      expect(passwordInput.type).toBe('text');

      // Toggle confirm password visibility
      const confirmPasswordToggle = screen.getAllByRole('button')[2]; // Second toggle button
      fireEvent.click(confirmPasswordToggle);

      expect(confirmPasswordInput.type).toBe('text');
    });
  });

  describe('Navigation', () => {
    it('navigates to login when cancel is clicked', () => {
      renderComponent();

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      fireEvent.click(cancelButton);

      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('navigates to login when "Sign in here" is clicked', () => {
      renderComponent();

      const signInLink = screen.getByText('Sign in here');
      fireEvent.click(signInLink);

      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  describe('Error Handling', () => {
    it('handles weak password error', async () => {
      const error = new Error('Weak password');
      (error as Error & { code?: string }).code = 'auth/weak-password';
      mockRegister.mockRejectedValue(error);

      renderComponent();

      // Fill in form with valid data
      fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'John Doe' } });
      fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'john@example.com' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'StrongPass123' } });
      fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'StrongPass123' } });

      const submitButton = screen.getByRole('button', { name: 'Create Account' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockError).toHaveBeenCalledWith('Password is too weak. Please choose a stronger password.');
      });
    });

    it('handles invalid email error', async () => {
      const error = new Error('Invalid email');
      (error as any).code = 'auth/invalid-email';
      mockRegister.mockRejectedValue(error);

      renderComponent();

      // Fill in form with valid data
      fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'John Doe' } });
      fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'john@example.com' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'StrongPass123' } });
      fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'StrongPass123' } });

      const submitButton = screen.getByRole('button', { name: 'Create Account' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockError).toHaveBeenCalledWith('Please enter a valid email address.');
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper form labels and associations', () => {
      renderComponent();

      const displayNameInput = screen.getByLabelText('Full Name');
      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');

      expect(displayNameInput).toHaveAttribute('id', 'displayName');
      expect(emailInput).toHaveAttribute('id', 'email');
      expect(passwordInput).toHaveAttribute('id', 'password');
      expect(confirmPasswordInput).toHaveAttribute('id', 'confirmPassword');
    });

    it('has proper button types', () => {
      renderComponent();

      const submitButton = screen.getByRole('button', { name: 'Create Account' });
      const cancelButton = screen.getByRole('button', { name: 'Cancel' });

      expect(submitButton).toHaveAttribute('type', 'submit');
      expect(cancelButton).toHaveAttribute('type', 'button');
    });

    it('has proper ARIA attributes for password toggles', () => {
      renderComponent();

      const passwordToggles = screen.getAllByRole('button').slice(1, 3); // Password toggle buttons
      
      passwordToggles.forEach(toggle => {
        expect(toggle).toHaveAttribute('type', 'button');
      });
    });
  });
}); 
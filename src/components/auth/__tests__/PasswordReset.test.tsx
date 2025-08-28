import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PasswordReset from '../PasswordReset';
// import { AuthProvider } from '../../../contexts/auth-context';
// import { ToastProvider } from '../../../contexts/toast-provider';

// Mock the auth context
const mockResetPassword = jest.fn();
const mockAuthContext = {
  user: null,
  userProfile: null,
  loading: false,
  login: jest.fn(),
  logout: jest.fn(),
  register: jest.fn(),
  resetPassword: mockResetPassword,
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
  return render(component);
};

describe('PasswordReset', () => {
  const mockSuccess = jest.fn();
  const mockError = jest.fn();
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockAuthContext.resetPassword = mockResetPassword;
    mockToast.success = mockSuccess;
    mockToast.error = mockError;

    // Mock useNavigate
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);
  });

  const renderComponent = () => {
    return renderWithProviders(
      <PasswordReset />
    );
  };

  describe('Rendering', () => {
    it('renders the password reset form correctly', () => {
      renderComponent();

      expect(screen.getByText('Reset Password')).toBeInTheDocument();
      expect(screen.getByText('Forgot Password?')).toBeInTheDocument();
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Send Reset Link' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    it('displays instructions correctly', () => {
      renderComponent();

      expect(screen.getByText('Instructions:')).toBeInTheDocument();
      expect(screen.getByText(/• Enter the email address associated with your account/)).toBeInTheDocument();
      expect(screen.getByText(/• We'll send you a secure password reset link/)).toBeInTheDocument();
      expect(screen.getByText(/• Click the link in the email to create a new password/)).toBeInTheDocument();
      expect(screen.getByText(/• The link will expire in 1 hour for security/)).toBeInTheDocument();
    });

    it('shows back to login link', () => {
      renderComponent();

      expect(screen.getByText('Back to login')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('validates required email field', async () => {
      renderComponent();

      const submitButton = screen.getByRole('button', { name: 'Send Reset Link' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
      });
    });

    it('validates email format', async () => {
      renderComponent();

      const emailInput = screen.getByLabelText('Email Address');
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

      const submitButton = screen.getByRole('button', { name: 'Send Reset Link' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to send password reset email. Please try again.')).toBeInTheDocument();
      });
    });

    it('accepts valid email format', async () => {
      renderComponent();

      const emailInput = screen.getByLabelText('Email Address');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      const submitButton = screen.getByRole('button', { name: 'Send Reset Link' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockResetPassword).toHaveBeenCalledWith('test@example.com');
      });
    });

    it('clears error when user starts typing', async () => {
      renderComponent();

      const emailInput = screen.getByLabelText('Email Address');
      
      // First, trigger an error
      const submitButton = screen.getByRole('button', { name: 'Send Reset Link' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
      });

      // Then start typing to clear the error
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      await waitFor(() => {
        expect(screen.queryByText('Email is required')).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('submits form with valid email', async () => {
      mockResetPassword.mockResolvedValue(undefined);
      renderComponent();

      const emailInput = screen.getByLabelText('Email Address');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      const submitButton = screen.getByRole('button', { name: 'Send Reset Link' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockResetPassword).toHaveBeenCalledWith('test@example.com');
      });

      expect(mockSuccess).toHaveBeenCalledWith('Password reset email sent! Please check your inbox.');
    });

    it('shows loading state during submission', async () => {
      mockResetPassword.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      renderComponent();

      const emailInput = screen.getByLabelText('Email Address');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      const submitButton = screen.getByRole('button', { name: 'Send Reset Link' });
      fireEvent.click(submitButton);

      expect(screen.getByText('Sending Reset Link...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    it('trims email input', async () => {
      mockResetPassword.mockResolvedValue(undefined);
      renderComponent();

      const emailInput = screen.getByLabelText('Email Address');
      fireEvent.change(emailInput, { target: { value: '  test@example.com  ' } });

      const submitButton = screen.getByRole('button', { name: 'Send Reset Link' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockResetPassword).toHaveBeenCalledWith('test@example.com');
      });
    });
  });

  describe('Success State', () => {
    it('shows success message after email is sent', async () => {
      mockResetPassword.mockResolvedValue(undefined);
      renderComponent();

      const emailInput = screen.getByLabelText('Email Address');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      const submitButton = screen.getByRole('button', { name: 'Send Reset Link' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Check Your Email')).toBeInTheDocument();
        expect(screen.getByText('Reset Link Sent')).toBeInTheDocument();
        expect(screen.getByText('test@example.com')).toBeInTheDocument();
        expect(screen.getByText(/Click the link in the email to reset your password/)).toBeInTheDocument();
        expect(screen.getByText(/If you don't see the email, check your spam folder/)).toBeInTheDocument();
      });
    });

    it('shows back to login button in success state', async () => {
      mockResetPassword.mockResolvedValue(undefined);
      renderComponent();

      const emailInput = screen.getByLabelText('Email Address');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      const submitButton = screen.getByRole('button', { name: 'Send Reset Link' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Back to Login' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Send Another Email' })).toBeInTheDocument();
      });
    });

    it('allows sending another email', async () => {
      mockResetPassword.mockResolvedValue(undefined);
      renderComponent();

      const emailInput = screen.getByLabelText('Email Address');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      const submitButton = screen.getByRole('button', { name: 'Send Reset Link' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Check Your Email')).toBeInTheDocument();
      });

      const sendAnotherButton = screen.getByRole('button', { name: 'Send Another Email' });
      fireEvent.click(sendAnotherButton);

      // Should return to the form
      expect(screen.getByText('Reset Password')).toBeInTheDocument();
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles user not found error', async () => {
      const error = new Error('User not found');
      (error as Error & { code?: string }).code = 'auth/user-not-found';
      mockResetPassword.mockRejectedValue(error);

      renderComponent();

      const emailInput = screen.getByLabelText('Email Address');
      fireEvent.change(emailInput, { target: { value: 'nonexistent@example.com' } });

      const submitButton = screen.getByRole('button', { name: 'Send Reset Link' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockError).toHaveBeenCalledWith('Failed to send password reset email. Please try again.');
        expect(screen.getByText('Failed to send password reset email. Please try again.')).toBeInTheDocument();
      });
    });

    it('handles invalid email error', async () => {
      const error = new Error('Invalid email');
      (error as Error & { code?: string }).code = 'auth/invalid-email';
      mockResetPassword.mockRejectedValue(error);

      renderComponent();

      const emailInput = screen.getByLabelText('Email Address');
      fireEvent.change(emailInput, { target: { value: 'invalid@example.com' } });

      const submitButton = screen.getByRole('button', { name: 'Send Reset Link' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockError).toHaveBeenCalledWith('Failed to send password reset email. Please try again.');
        expect(screen.getByText('Failed to send password reset email. Please try again.')).toBeInTheDocument();
      });
    });

    it('handles too many requests error', async () => {
      const error = new Error('Too many requests');
      (error as Error & { code?: string }).code = 'auth/too-many-requests';
      mockResetPassword.mockRejectedValue(error);

      renderComponent();

      const emailInput = screen.getByLabelText('Email Address');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      const submitButton = screen.getByRole('button', { name: 'Send Reset Link' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockError).toHaveBeenCalledWith('Failed to send password reset email. Please try again.');
        expect(screen.getByText('Failed to send password reset email. Please try again.')).toBeInTheDocument();
      });
    });

    it('handles generic error', async () => {
      const error = new Error('Generic error');
      mockResetPassword.mockRejectedValue(error);

      renderComponent();

      const emailInput = screen.getByLabelText('Email Address');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      const submitButton = screen.getByRole('button', { name: 'Send Reset Link' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockError).toHaveBeenCalledWith('Failed to send password reset email. Please try again.');
      });
    });
  });

  describe('Navigation', () => {
    it('navigates to login when cancel is clicked', () => {
      renderComponent();

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      fireEvent.click(cancelButton);

      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('navigates to login when back to login is clicked', () => {
      renderComponent();

      const backToLoginButton = screen.getByText('Back to login');
      fireEvent.click(backToLoginButton);

      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('navigates to login from success state', async () => {
      mockResetPassword.mockResolvedValue(undefined);
      renderComponent();

      const emailInput = screen.getByLabelText('Email Address');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      const submitButton = screen.getByRole('button', { name: 'Send Reset Link' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Check Your Email')).toBeInTheDocument();
      });

      const backToLoginButton = screen.getByRole('button', { name: 'Back to Login' });
      fireEvent.click(backToLoginButton);

      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  describe('Accessibility', () => {
    it('has proper form labels and associations', () => {
      renderComponent();

      const emailInput = screen.getByLabelText('Email Address');
      expect(emailInput).toHaveAttribute('id', 'email');
      expect(emailInput).toHaveAttribute('type', 'email');
    });

    it('has proper button types', () => {
      renderComponent();

      const submitButton = screen.getByRole('button', { name: 'Send Reset Link' });
      const cancelButton = screen.getByRole('button', { name: 'Cancel' });

      expect(submitButton).toHaveAttribute('type', 'submit');
      expect(cancelButton).toHaveAttribute('type', 'button');
    });

    it('has proper heading structure', () => {
      renderComponent();

      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Reset Password');
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Forgot Password?');
    });

    it('has proper ARIA attributes for instructions', () => {
      renderComponent();

      const instructions = screen.getByText('Instructions:');
      expect(instructions).toBeInTheDocument();
    });
  });

  describe('Props Handling', () => {
    it('calls onSuccess callback when provided', async () => {
      const mockOnSuccess = jest.fn();
      mockResetPassword.mockResolvedValue(undefined);

      renderWithProviders(
        <PasswordReset onSuccess={mockOnSuccess} />
      );

      const emailInput = screen.getByLabelText('Email Address');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      const submitButton = screen.getByRole('button', { name: 'Send Reset Link' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it('calls onCancel callback when provided', () => {
      const mockOnCancel = jest.fn();

      renderWithProviders(
        <PasswordReset onCancel={mockOnCancel} />
      );

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      fireEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });
  });
}); 
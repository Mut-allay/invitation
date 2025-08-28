import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/auth-hooks';
import { useToast } from '../../contexts/toast-hooks';
import { EnvelopeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';

interface PasswordResetProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const PasswordReset: React.FC<PasswordResetProps> = ({ onSuccess, onCancel }) => {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  const { resetPassword } = useAuth();
  const { success, error: showError } = useToast();
  const navigate = useNavigate();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});

    // Validate email
    if (!email.trim()) {
      setErrors({ email: 'Email is required' });
      return;
    }

    if (!validateEmail(email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }

    setLoading(true);

    try {
      await resetPassword(email.trim());
      setEmailSent(true);
      success('Password reset email sent! Please check your inbox.');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: unknown) {
      console.error('Password reset error:', error);
      
      let errorMessage = 'Failed to send password reset email. Please try again.';
      
      if (error instanceof Error && error.message === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
        setErrors({ email: errorMessage });
      } else if (error instanceof Error && error.message === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
        setErrors({ email: errorMessage });
      } else if (error instanceof Error && error.message === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later.';
        setErrors({ email: errorMessage });
      }
      
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate('/login');
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg mb-6">
              <EnvelopeIcon className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-responsive-3xl font-bold text-slate-900 mb-2">
              Check Your Email
            </h2>
            <p className="text-responsive-base text-slate-600">
              We've sent a password reset link to your email
            </p>
          </div>

          {/* Success Message */}
          <Card className="shadow-floating border-0 glass">
            <CardContent className="pt-6 space-y-4">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <EnvelopeIcon className="h-8 w-8 text-green-600" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Reset Link Sent
                  </h3>
                  <p className="text-sm text-slate-600">
                    We've sent a password reset link to:
                  </p>
                  <p className="text-sm font-medium text-slate-900 bg-slate-50 px-3 py-2 rounded-md">
                    {email}
                  </p>
                </div>

                <div className="space-y-3 text-sm text-slate-600">
                  <p>
                    Click the link in the email to reset your password. The link will expire in 1 hour.
                  </p>
                  <p>
                    If you don't see the email, check your spam folder.
                  </p>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-3">
              <Button
                onClick={handleBackToLogin}
                className="w-full"
              >
                Back to Login
              </Button>
              
              <Button
                variant="outline"
                onClick={() => {
                  setEmailSent(false);
                  setEmail('');
                }}
                className="w-full"
              >
                Send Another Email
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg mb-6">
            <span className="text-3xl font-bold text-white">GF</span>
          </div>
          <h2 className="text-responsive-3xl font-bold text-slate-900 mb-2">
            Reset Password
          </h2>
          <p className="text-responsive-base text-slate-600">
            Enter your email to receive a password reset link
          </p>
        </div>

        {/* Password Reset Form */}
        <Card className="shadow-floating border-0 glass">
          <CardHeader className="space-y-1">
            <h3 className="text-2xl font-semibold text-center">Forgot Password?</h3>
            <p className="text-sm text-muted-foreground text-center">
              No worries, we'll send you reset instructions
            </p>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) {
                        setErrors(prev => ({ ...prev, email: '' }));
                      }
                    }}
                    className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                    disabled={loading}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Instructions:</strong>
                </p>
                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                  <li>• Enter the email address associated with your account</li>
                  <li>• We'll send you a secure password reset link</li>
                  <li>• Click the link in the email to create a new password</li>
                  <li>• The link will expire in 1 hour for security</li>
                </ul>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-3">
              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 text-base font-medium"
                size="xl"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Sending Reset Link...</span>
                  </div>
                ) : (
                  'Send Reset Link'
                )}
              </Button>

              {/* Cancel Button */}
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
                className="w-full"
              >
                Cancel
              </Button>

              {/* Back to Login */}
              <div className="flex items-center justify-center">
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                  disabled={loading}
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  <span>Back to login</span>
                </button>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default PasswordReset; 
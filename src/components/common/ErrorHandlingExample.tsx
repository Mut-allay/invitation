import React, { useState, useEffect } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { LoadingSpinner, LoadingButton, LoadingOverlay } from './LoadingStates';
import { Alert, ConfirmationDialog, StatusIndicator, ProgressBar } from './UserFeedback';
import { useNetworkErrorHandler, withLoadingState } from '../../utils/networkErrorHandler';
import { useToast } from '../../contexts/toast-hooks';

interface User {
  id: number;
  name: string;
  email: string;
  status: 'active' | 'inactive' | 'pending';
}

const ErrorHandlingExample: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isOnlineState, setIsOnline] = useState(navigator.onLine);

  const { handleError, retryRequest, addOnlineListener, addOfflineListener, isOnline, getErrorHistory, clearErrorHistory } = useNetworkErrorHandler();
  const toast = useToast();

  // Network status monitoring
  useEffect(() => {
    const removeOnlineListener = addOnlineListener(() => {
      setIsOnline(true);
      toast?.success('Connection restored!');
    });

    const removeOfflineListener = addOfflineListener(() => {
      setIsOnline(false);
      toast?.error('Connection lost. Please check your internet connection.');
    });

    return () => {
      removeOnlineListener();
      removeOfflineListener();
    };
  }, [addOnlineListener, addOfflineListener, toast]);

  // Simulated API call with error handling
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API call that might fail
      const response = await fetch('/api/users');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch users`);
      }

      const data = await response.json();
      setUsers(data);
      toast?.success('Users loaded successfully!');
    } catch (err) {
      const networkError = handleError(err);
      setError(networkError.message);
    } finally {
      setLoading(false);
    }
  };

  // Example with retry mechanism
  const fetchUsersWithRetry = async () => {
    try {
      await retryRequest(
        async () => {
          const response = await fetch('/api/users');
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: Failed to fetch users`);
          }
          return await response.json();
        },
        { retryAttempts: 3, retryDelay: 1000 }
      );
    } catch (err) {
      handleError(err);
    }
  };

  // Example with loading state wrapper
  const deleteUser = async (user: User) => {
    await withLoadingState(
      async () => {
        const response = await fetch(`/api/users/${user.id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error(`Failed to delete user: ${user.name}`);
        }

        setUsers(prev => prev.filter(u => u.id !== user.id));
        toast?.success(`User ${user.name} deleted successfully!`);
      },
      setLoading,
      { handleError, retryRequest, addOnlineListener, addOfflineListener, isOnline, getErrorHistory, clearErrorHistory }
    );
  };

  // Simulated file upload with progress
  const uploadFile = async () => {
    setUploadProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    try {
      // Simulate file upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast?.success('File uploaded successfully!');
    } catch (err) {
      handleError(err);
    } finally {
      clearInterval(interval);
      setUploadProgress(0);
    }
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setShowConfirmation(true);
  };

  const handleConfirmDelete = () => {
    if (userToDelete) {
      deleteUser(userToDelete);
    }
    setShowConfirmation(false);
    setUserToDelete(null);
  };

  const handleCancelDelete = () => {
    setShowConfirmation(false);
    setUserToDelete(null);
  };

  return (
    <ErrorBoundary>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Error Handling & User Feedback Demo</h2>
          
          {/* Network Status */}
          <div className="mb-4">
            <StatusIndicator 
              status={isOnlineState ? 'success' : 'error'} 
              label={isOnlineState ? 'Online' : 'Offline'}
            />
          </div>

          {/* Error Display */}
          {error && (
            <Alert
              type="error"
              title="Error"
              message={error}
              onClose={() => setError(null)}
              autoDismiss={true}
              autoDismissDelay={5000}
            />
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 mb-6">
            <LoadingButton
              isLoading={loading}
              onClick={fetchUsers}
              loadingText="Loading users..."
            >
              Load Users
            </LoadingButton>

            <LoadingButton
              isLoading={loading}
              onClick={fetchUsersWithRetry}
              loadingText="Loading with retry..."
            >
              Load with Retry
            </LoadingButton>

            <button
              onClick={() => {
                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) {
                    uploadFile();
                  }
                };
                fileInput.click();
              }}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Upload File
            </button>
          </div>

          {/* Upload Progress */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="mb-4">
              <ProgressBar
                progress={uploadProgress}
                label="File Upload"
                showPercentage={true}
                color="green"
              />
            </div>
          )}

          {/* Users List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Users</h3>
            
            {loading && users.length === 0 ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : users.length === 0 ? (
              <Alert
                type="info"
                message="No users found. Click 'Load Users' to fetch data."
              />
            ) : (
              <div className="space-y-2">
                {users.map(user => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium">{user.name}</h4>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <StatusIndicator
                        status={user.status === 'active' ? 'success' : user.status === 'pending' ? 'warning' : 'error'}
                        label={user.status}
                        size="sm"
                      />
                    </div>
                    <button
                      onClick={() => handleDeleteClick(user)}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={showConfirmation}
          title="Delete User"
          message={`Are you sure you want to delete ${userToDelete?.name}? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />

        {/* Loading Overlay */}
        <LoadingOverlay
          isVisible={loading && users.length > 0}
          message="Processing request..."
        />
      </div>
    </ErrorBoundary>
  );
};

export default ErrorHandlingExample; 
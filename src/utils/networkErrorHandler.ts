import { useToast } from '../contexts/toast-hooks';

export interface NetworkError {
  message: string;
  status?: number;
  code?: string;
  details?: unknown;
  timestamp: Date;
}

export interface ErrorHandlerConfig {
  showToast?: boolean;
  logError?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
}

export class NetworkErrorHandler {
  private static instance: NetworkErrorHandler;
  private errorHistory: NetworkError[] = [];
  private retryAttempts: number = 3;
  private retryDelay: number = 1000;

  private constructor() {}

  static getInstance(): NetworkErrorHandler {
    if (!NetworkErrorHandler.instance) {
      NetworkErrorHandler.instance = new NetworkErrorHandler();
    }
    return NetworkErrorHandler.instance;
  }

  private logError(error: NetworkError): void {
    if (process.env.NODE_ENV === 'development') {
      console.error('Network Error:', error);
    } else {
      // In production, send to error tracking service
      // TODO: Integrate with Sentry or similar service
      console.error('Production Network Error:', {
        message: error.message,
        status: error.status,
        code: error.code,
        timestamp: error.timestamp
      });
    }
  }

  private getErrorMessage(error: unknown): string {
    if (typeof error === 'string') {
      return error;
    }

    if (error && typeof error === 'object' && 'message' in error) {
      return String(error.message);
    }

    if (error && typeof error === 'object' && 'response' in error) {
      const response = (error as { response: { data?: { message?: string }; status?: number } }).response;
      if (response?.data?.message) {
        return response.data.message;
      }
      if (response?.status) {
        return this.getStatusMessage(response.status);
      }
    }

    return 'An unexpected error occurred. Please try again.';
  }

  private getStatusMessage(status: number): string {
    const statusMessages: Record<number, string> = {
      400: 'Bad request. Please check your input and try again.',
      401: 'Unauthorized. Please log in and try again.',
      403: 'Forbidden. You don\'t have permission to perform this action.',
      404: 'Resource not found. Please check the URL and try again.',
      409: 'Conflict. The resource already exists or has been modified.',
      422: 'Validation error. Please check your input and try again.',
      429: 'Too many requests. Please wait a moment and try again.',
      500: 'Internal server error. Please try again later.',
      502: 'Bad gateway. Please try again later.',
      503: 'Service unavailable. Please try again later.',
      504: 'Gateway timeout. Please try again later.'
    };

    return statusMessages[status] || `HTTP ${status} error occurred.`;
  }

  public isNetworkError(error: unknown): boolean {
    if (error && typeof error === 'object' && 'code' in error) {
      return (error as { code?: string }).code === 'NETWORK_ERROR';
    }
    if (error && typeof error === 'object' && 'message' in error) {
      const message = String((error as { message: string }).message);
      return message.includes('Network Error') || message.includes('Failed to fetch');
    }
    return !navigator.onLine;
  }

  public isTimeoutError(error: unknown): boolean {
    if (error && typeof error === 'object' && 'code' in error) {
      return (error as { code?: string }).code === 'ECONNABORTED';
    }
    if (error && typeof error === 'object' && 'message' in error) {
      const message = String((error as { message: string }).message);
      return message.includes('timeout') || message.includes('Timeout');
    }
    return false;
  }

  handleError(
    error: unknown,
    config: ErrorHandlerConfig = {}
  ): NetworkError {
    const {
      showToast = true,
      logError = true
    } = config;

    const networkError: NetworkError = {
      message: this.getErrorMessage(error),
      status: error && typeof error === 'object' && 'response' in error 
        ? (error as { response: { status?: number } }).response?.status 
        : undefined,
      code: error && typeof error === 'object' && 'code' in error 
        ? String((error as { code?: string }).code) 
        : undefined,
      details: error,
      timestamp: new Date()
    };

    // Log error if configured
    if (logError) {
      this.logError(networkError);
    }

    // Add to error history
    this.errorHistory.push(networkError);

    // Show toast notification if configured
    if (showToast) {
      this.showErrorToast(networkError);
    }

    return networkError;
  }

  private showErrorToast(error: NetworkError): void {
    // This will be called from React components that have access to the toast context
    // The actual toast implementation is handled by the useNetworkErrorHandler hook
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _error = error; // Use error parameter to avoid linting error
    console.warn('Toast notification should be handled by useNetworkErrorHandler hook');
  }

  async retryRequest<T>(
    requestFn: () => Promise<T>,
    config: ErrorHandlerConfig = {}
  ): Promise<T> {
    const {
      retryAttempts = this.retryAttempts,
      retryDelay = this.retryDelay
    } = config;

    let lastError: unknown;

    for (let attempt = 1; attempt <= retryAttempts; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error;

        // Don't retry on certain error types
        if (
          error && typeof error === 'object' && 'response' in error &&
          (error as { response: { status?: number } }).response?.status === 401 ||
          (error as { response: { status?: number } }).response?.status === 403 ||
          (error as { response: { status?: number } }).response?.status === 404 ||
          !this.isNetworkError(error)
        ) {
          throw error;
        }

        // Wait before retrying (exponential backoff)
        if (attempt < retryAttempts) {
          const delay = retryDelay * Math.pow(2, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }

  getErrorHistory(): NetworkError[] {
    return [...this.errorHistory];
  }

  clearErrorHistory(): void {
    this.errorHistory = [];
  }

  isOnline(): boolean {
    return navigator.onLine;
  }

  addOnlineListener(callback: () => void): () => void {
    const handleOnline = () => callback();
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }

  addOfflineListener(callback: () => void): () => void {
    const handleOffline = () => callback();
    window.addEventListener('offline', handleOffline);
    return () => window.removeEventListener('offline', handleOffline);
  }
}

// React hook for using the network error handler with toast notifications
export const useNetworkErrorHandler = () => {
  const toast = useToast();
  const errorHandler = NetworkErrorHandler.getInstance();

  const handleError = (
    error: unknown,
    config: ErrorHandlerConfig = {}
  ): NetworkError => {
    const networkError = errorHandler.handleError(error, { ...config, showToast: false });

    // Show toast notification
    if (config.showToast !== false && toast) {
      if (errorHandler.isNetworkError(error)) {
        toast.error('Network connection error. Please check your internet connection.');
      } else if (errorHandler.isTimeoutError(error)) {
        toast.error('Request timed out. Please try again.');
      } else {
        toast.error(networkError.message);
      }
    }

    return networkError;
  };

  const retryRequest = async <T>(
    requestFn: () => Promise<T>,
    config: ErrorHandlerConfig = {}
  ): Promise<T> => {
    return errorHandler.retryRequest(requestFn, config);
  };

  return {
    handleError,
    retryRequest,
    isOnline: errorHandler.isOnline.bind(errorHandler),
    addOnlineListener: errorHandler.addOnlineListener.bind(errorHandler),
    addOfflineListener: errorHandler.addOfflineListener.bind(errorHandler),
    getErrorHistory: errorHandler.getErrorHistory.bind(errorHandler),
    clearErrorHistory: errorHandler.clearErrorHistory.bind(errorHandler)
  };
};

// Utility function for handling fetch errors
export const handleFetchError = async (response: Response): Promise<never> => {
  if (!response.ok) {
    let errorMessage: string;
    let errorData: unknown;
    
    try {
      errorData = await response.json();
      errorMessage = errorData && typeof errorData === 'object' && 'message' in errorData 
        ? String((errorData as { message: string }).message) 
        : `HTTP ${response.status} error`;
    } catch {
      errorMessage = `HTTP ${response.status} error`;
      errorData = null;
    }

    const error = new Error(errorMessage) as Error & { response: { status: number; data: unknown } };
    error.response = { status: response.status, data: errorData };
    throw error;
  }

  throw new Error('Network response was not ok');
};

// Utility function for creating API request with error handling
export const createApiRequest = async <T>(
  url: string,
  options: RequestInit = {},
  errorHandler: ReturnType<typeof useNetworkErrorHandler>
): Promise<T> => {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      await handleFetchError(response);
    }

    return await response.json();
  } catch (error) {
    errorHandler.handleError(error);
    throw error;
  }
};

// Utility function for handling async operations with loading states
export const withLoadingState = async <T>(
  operation: () => Promise<T>,
  setLoading: (loading: boolean) => void,
  errorHandler: ReturnType<typeof useNetworkErrorHandler>
): Promise<T> => {
  setLoading(true);
  try {
    const result = await operation();
    return result;
  } catch (error) {
    errorHandler.handleError(error);
    throw error;
  } finally {
    setLoading(false);
  }
}; 
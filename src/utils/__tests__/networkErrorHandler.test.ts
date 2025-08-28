import { NetworkErrorHandler, useNetworkErrorHandler, handleFetchError, createApiRequest, withLoadingState } from '../networkErrorHandler';
import { renderHook } from '@testing-library/react';

// Mock the toast context
jest.mock('../../contexts/toast-hooks', () => ({
  useToast: () => ({
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    loading: jest.fn(),
    dismiss: jest.fn(),
  }),
}));

describe('NetworkErrorHandler', () => {
  let errorHandler: NetworkErrorHandler;

  beforeEach(() => {
    errorHandler = NetworkErrorHandler.getInstance();
    // Clear error history before each test
    errorHandler.clearErrorHistory();
  });

  describe('getInstance', () => {
    it('returns the same instance', () => {
      const instance1 = NetworkErrorHandler.getInstance();
      const instance2 = NetworkErrorHandler.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('handleError', () => {
    it('handles string errors', () => {
      const error = 'Test error message';
      const result = errorHandler.handleError(error);
      
      expect(result.message).toBe('Test error message');
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it('handles Error objects', () => {
      const error = new Error('Test error');
      const result = errorHandler.handleError(error);
      
      expect(result.message).toBe('Test error');
      expect(result.details).toBe(error);
    });

    it('handles axios-like errors', () => {
      const error = {
        response: {
          status: 404,
          data: { message: 'Not found' }
        }
      };
      const result = errorHandler.handleError(error);
      
      expect(result.message).toBe('Not found');
      expect(result.status).toBe(404);
    });

    it('handles errors with status but no message', () => {
      const error = {
        response: { status: 500 }
      };
      const result = errorHandler.handleError(error);
      
      expect(result.message).toBe('Internal server error. Please try again later.');
      expect(result.status).toBe(500);
    });

    it('handles unknown errors', () => {
      const error = {};
      const result = errorHandler.handleError(error);
      
      expect(result.message).toBe('An unexpected error occurred. Please try again.');
    });

    it('logs errors in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = 'Test error';
      
      errorHandler.handleError(error, { logError: true });
      
      expect(consoleSpy).toHaveBeenCalledWith('Network Error:', expect.objectContaining({
        message: 'Test error'
      }));
      
      consoleSpy.mockRestore();
      process.env.NODE_ENV = originalEnv;
    });

    it('does not log errors when logError is false', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = 'Test error';
      
      errorHandler.handleError(error, { logError: false });
      
      expect(consoleSpy).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('getStatusMessage', () => {
    it('returns correct message for 400', () => {
      const error = { response: { status: 400 } };
      const result = errorHandler.handleError(error);
      expect(result.message).toBe('Bad request. Please check your input and try again.');
    });

    it('returns correct message for 401', () => {
      const error = { response: { status: 401 } };
      const result = errorHandler.handleError(error);
      expect(result.message).toBe('Unauthorized. Please log in and try again.');
    });

    it('returns correct message for 403', () => {
      const error = { response: { status: 403 } };
      const result = errorHandler.handleError(error);
      expect(result.message).toBe('Forbidden. You don\'t have permission to perform this action.');
    });

    it('returns correct message for 404', () => {
      const error = { response: { status: 404 } };
      const result = errorHandler.handleError(error);
      expect(result.message).toBe('Resource not found. Please check the URL and try again.');
    });

    it('returns correct message for 500', () => {
      const error = { response: { status: 500 } };
      const result = errorHandler.handleError(error);
      expect(result.message).toBe('Internal server error. Please try again later.');
    });

    it('returns generic message for unknown status', () => {
      const error = { response: { status: 999 } };
      const result = errorHandler.handleError(error);
      expect(result.message).toBe('HTTP 999 error occurred.');
    });
  });

  describe('retryRequest', () => {
    it('succeeds on first attempt', async () => {
      const mockRequest = jest.fn().mockResolvedValue('success');
      
      const result = await errorHandler.retryRequest(mockRequest);
      
      expect(result).toBe('success');
      expect(mockRequest).toHaveBeenCalledTimes(1);
    });

    it('retries on network error and succeeds', async () => {
      const mockRequest = jest.fn()
        .mockRejectedValueOnce({ message: 'Network Error' })
        .mockResolvedValue('success');
      
      const result = await errorHandler.retryRequest(mockRequest);
      
      expect(result).toBe('success');
      expect(mockRequest).toHaveBeenCalledTimes(2);
    });

    it('fails after max retries', async () => {
      const mockRequest = jest.fn().mockRejectedValue({ message: 'Network Error' });
      
      await expect(errorHandler.retryRequest(mockRequest)).rejects.toEqual({
        message: 'Network Error'
      });
      
      expect(mockRequest).toHaveBeenCalledTimes(3);
    });

    it('does not retry on 401 errors', async () => {
      const mockRequest = jest.fn().mockRejectedValue({
        response: { status: 401 }
      });
      
      await expect(errorHandler.retryRequest(mockRequest)).rejects.toEqual({
        response: { status: 401 }
      });
      
      expect(mockRequest).toHaveBeenCalledTimes(1);
    });

    it('does not retry on 403 errors', async () => {
      const mockRequest = jest.fn().mockRejectedValue({
        response: { status: 403 }
      });
      
      await expect(errorHandler.retryRequest(mockRequest)).rejects.toEqual({
        response: { status: 403 }
      });
      
      expect(mockRequest).toHaveBeenCalledTimes(1);
    });

    it('does not retry on 404 errors', async () => {
      const mockRequest = jest.fn().mockRejectedValue({
        response: { status: 404 }
      });
      
      await expect(errorHandler.retryRequest(mockRequest)).rejects.toEqual({
        response: { status: 404 }
      });
      
      expect(mockRequest).toHaveBeenCalledTimes(1);
    });
  });

  describe('error history', () => {
    it('adds errors to history', () => {
      const error = 'Test error';
      errorHandler.handleError(error);
      
      const history = errorHandler.getErrorHistory();
      expect(history).toHaveLength(1);
      expect(history[0].message).toBe('Test error');
    });

    it('clears error history', () => {
      const error = 'Test error';
      errorHandler.handleError(error);
      
      expect(errorHandler.getErrorHistory()).toHaveLength(1);
      
      errorHandler.clearErrorHistory();
      expect(errorHandler.getErrorHistory()).toHaveLength(0);
    });
  });

  describe('network status', () => {
    it('checks online status', () => {
      // Mock navigator.onLine
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true
      });
      
      expect(errorHandler.isOnline()).toBe(true);
      
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });
      
      expect(errorHandler.isOnline()).toBe(false);
    });

    it('adds online listener', () => {
      const callback = jest.fn();
      const removeListener = errorHandler.addOnlineListener(callback);
      
      // Simulate online event
      window.dispatchEvent(new Event('online'));
      
      expect(callback).toHaveBeenCalledTimes(1);
      
      removeListener();
    });

    it('adds offline listener', () => {
      const callback = jest.fn();
      const removeListener = errorHandler.addOfflineListener(callback);
      
      // Simulate offline event
      window.dispatchEvent(new Event('offline'));
      
      expect(callback).toHaveBeenCalledTimes(1);
      
      removeListener();
    });
  });
});

describe('useNetworkErrorHandler', () => {
  it('returns error handler functions', () => {
    const { result } = renderHook(() => useNetworkErrorHandler());
    
    expect(result.current.handleError).toBeDefined();
    expect(result.current.retryRequest).toBeDefined();
    expect(result.current.isOnline).toBeDefined();
    expect(result.current.addOnlineListener).toBeDefined();
    expect(result.current.addOfflineListener).toBeDefined();
    expect(result.current.getErrorHistory).toBeDefined();
    expect(result.current.clearErrorHistory).toBeDefined();
  });
});

describe('handleFetchError', () => {
  it('handles response with error data', async () => {
    const mockResponse = {
      ok: false,
      status: 400,
      json: jest.fn().mockResolvedValue({ message: 'Bad request' })
    } as unknown as Response;
    
    await expect(handleFetchError(mockResponse)).rejects.toThrow('Bad request');
  });

  it('handles response without error data', async () => {
    const mockResponse = {
      ok: false,
      status: 500,
      json: jest.fn().mockRejectedValue(new Error('Invalid JSON'))
    } as unknown as Response;
    
    await expect(handleFetchError(mockResponse)).rejects.toThrow('HTTP 500 error');
  });
});

describe('createApiRequest', () => {
  it('creates successful API request', async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({ data: 'test' })
    };
    
    global.fetch = jest.fn().mockResolvedValue(mockResponse);
    
    const { result } = renderHook(() => useNetworkErrorHandler());
    const requestHandler = result.current;
    const apiResult = await createApiRequest('/api/test', {}, requestHandler);
    
    expect(apiResult).toEqual({ data: 'test' });
  });

  it('handles API request errors', async () => {
    const mockResponse = {
      ok: false,
      status: 404,
      json: jest.fn().mockResolvedValue({ message: 'Not found' })
    };
    
    global.fetch = jest.fn().mockResolvedValue(mockResponse);
    
    const { result } = renderHook(() => useNetworkErrorHandler());
    const requestHandler = result.current;
    
    await expect(createApiRequest('/api/test', {}, requestHandler)).rejects.toThrow('Not found');
  });
});

describe('withLoadingState', () => {
  it('handles successful operation', async () => {
    const mockOperation = jest.fn().mockResolvedValue('success');
    const setLoading = jest.fn();
    const { result } = renderHook(() => useNetworkErrorHandler());
    
    const operationResult = await withLoadingState(mockOperation, setLoading, result.current);
    
    expect(operationResult).toBe('success');
    expect(setLoading).toHaveBeenCalledWith(true);
    expect(setLoading).toHaveBeenCalledWith(false);
    expect(mockOperation).toHaveBeenCalledTimes(1);
  });

  it('handles operation errors', async () => {
    const mockOperation = jest.fn().mockRejectedValue(new Error('Test error'));
    const setLoading = jest.fn();
    const { result } = renderHook(() => useNetworkErrorHandler());
    
    await expect(withLoadingState(mockOperation, setLoading, result.current)).rejects.toThrow('Test error');
    
    expect(setLoading).toHaveBeenCalledWith(true);
    expect(setLoading).toHaveBeenCalledWith(false);
  });
}); 
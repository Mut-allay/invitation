import { performanceMonitor, PerformanceMetric, PerformanceObserver } from '../performance';

// Mock performance API
const mockPerformance = {
  now: jest.fn(),
  memory: {
    usedJSHeapSize: 50 * 1024 * 1024, // 50MB
    totalJSHeapSize: 100 * 1024 * 1024, // 100MB
    jsHeapSizeLimit: 200 * 1024 * 1024, // 200MB
  },
};

const mockPerformanceObserver = jest.fn();

Object.defineProperty(window, 'performance', {
  value: mockPerformance,
  writable: true,
});

Object.defineProperty(window, 'PerformanceObserver', {
  value: mockPerformanceObserver,
  writable: true,
});

describe('PerformanceMonitor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    performanceMonitor.clearMetrics();
    performanceMonitor.setEnabled(true);
  });

  describe('recordMetric', () => {
    it('should record a metric', () => {
      const metric: PerformanceMetric = {
        name: 'TestMetric',
        value: 100,
        unit: 'ms',
        timestamp: Date.now(),
      };

      performanceMonitor.recordMetric(metric);
      const metrics = performanceMonitor.getMetrics();

      expect(metrics).toHaveLength(1);
      expect(metrics[0]).toEqual(metric);
    });

    it('should not record metrics when disabled', () => {
      performanceMonitor.setEnabled(false);
      
      const metric: PerformanceMetric = {
        name: 'TestMetric',
        value: 100,
        unit: 'ms',
        timestamp: Date.now(),
      };

      performanceMonitor.recordMetric(metric);
      const metrics = performanceMonitor.getMetrics();

      expect(metrics).toHaveLength(0);
    });
  });

  describe('measureComponentRender', () => {
    it('should measure component render time', () => {
      const mockPerformanceNow = jest.fn()
        .mockReturnValueOnce(1000) // start time
        .mockReturnValueOnce(1100); // end time

      Object.defineProperty(window, 'performance', {
        value: { ...mockPerformance, now: mockPerformanceNow },
        writable: true,
      });

      const renderFn = jest.fn();
      performanceMonitor.measureComponentRender('TestComponent', renderFn);

      expect(renderFn).toHaveBeenCalled();
      expect(mockPerformanceNow).toHaveBeenCalledTimes(2);

      const metrics = performanceMonitor.getMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0].name).toBe('ComponentRender_TestComponent');
      expect(metrics[0].value).toBe(100);
      expect(metrics[0].unit).toBe('ms');
    });
  });

  describe('measureAsyncOperation', () => {
    it('should measure successful async operation', async () => {
      const mockPerformanceNow = jest.fn()
        .mockReturnValueOnce(1000) // start time
        .mockReturnValueOnce(1100); // end time

      Object.defineProperty(window, 'performance', {
        value: { ...mockPerformance, now: mockPerformanceNow },
        writable: true,
      });

      const operation = jest.fn().mockResolvedValue('result');
      const result = await performanceMonitor.measureAsyncOperation('TestOperation', operation);

      expect(result).toBe('result');
      expect(operation).toHaveBeenCalled();

      const metrics = performanceMonitor.getMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0].name).toBe('AsyncOperation_TestOperation');
      expect(metrics[0].value).toBe(100);
      expect(metrics[0].metadata?.success).toBe(true);
    });

    it('should measure failed async operation', async () => {
      const mockPerformanceNow = jest.fn()
        .mockReturnValueOnce(1000) // start time
        .mockReturnValueOnce(1100); // end time

      Object.defineProperty(window, 'performance', {
        value: { ...mockPerformance, now: mockPerformanceNow },
        writable: true,
      });

      const error = new Error('Test error');
      const operation = jest.fn().mockRejectedValue(error);

      await expect(performanceMonitor.measureAsyncOperation('TestOperation', operation))
        .rejects.toThrow('Test error');

      const metrics = performanceMonitor.getMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0].name).toBe('AsyncOperation_TestOperation');
      expect(metrics[0].value).toBe(100);
      expect(metrics[0].metadata?.success).toBe(false);
      expect(metrics[0].metadata?.error).toBe('Test error');
    });
  });

  describe('measureUserInteraction', () => {
    it('should measure user interaction time', () => {
      const mockPerformanceNow = jest.fn()
        .mockReturnValueOnce(1000) // start time
        .mockReturnValueOnce(1100); // end time

      Object.defineProperty(window, 'performance', {
        value: { ...mockPerformance, now: mockPerformanceNow },
        writable: true,
      });

      const interactionFn = jest.fn();
      performanceMonitor.measureUserInteraction('TestInteraction', interactionFn);

      expect(interactionFn).toHaveBeenCalled();

      const metrics = performanceMonitor.getMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0].name).toBe('UserInteraction_TestInteraction');
      expect(metrics[0].value).toBe(100);
      expect(metrics[0].unit).toBe('ms');
    });
  });

  describe('getMemoryUsage', () => {
    it('should return memory usage when available', () => {
      const memoryUsage = performanceMonitor.getMemoryUsage();

      expect(memoryUsage).not.toBeNull();
      expect(memoryUsage?.name).toBe('MemoryUsage');
      expect(memoryUsage?.value).toBe(50); // 50MB
      expect(memoryUsage?.unit).toBe('MB');
      expect(memoryUsage?.metadata?.totalJSHeapSize).toBe(100);
      expect(memoryUsage?.metadata?.jsHeapSizeLimit).toBe(200);
    });

    it('should return null when memory is not available', () => {
      Object.defineProperty(window, 'performance', {
        value: { now: jest.fn() },
        writable: true,
      });

      const memoryUsage = performanceMonitor.getMemoryUsage();
      expect(memoryUsage).toBeNull();
    });
  });

  describe('getMetricsByName', () => {
    it('should return metrics by name', () => {
      const metric1: PerformanceMetric = {
        name: 'TestMetric',
        value: 100,
        unit: 'ms',
        timestamp: Date.now(),
      };

      const metric2: PerformanceMetric = {
        name: 'TestMetric',
        value: 200,
        unit: 'ms',
        timestamp: Date.now(),
      };

      const metric3: PerformanceMetric = {
        name: 'OtherMetric',
        value: 300,
        unit: 'ms',
        timestamp: Date.now(),
      };

      performanceMonitor.recordMetric(metric1);
      performanceMonitor.recordMetric(metric2);
      performanceMonitor.recordMetric(metric3);

      const testMetrics = performanceMonitor.getMetricsByName('TestMetric');
      expect(testMetrics).toHaveLength(2);
      expect(testMetrics).toEqual([metric1, metric2]);
    });
  });

  describe('getAverageMetric', () => {
    it('should return average metric value', () => {
      const metric1: PerformanceMetric = {
        name: 'TestMetric',
        value: 100,
        unit: 'ms',
        timestamp: Date.now(),
      };

      const metric2: PerformanceMetric = {
        name: 'TestMetric',
        value: 200,
        unit: 'ms',
        timestamp: Date.now(),
      };

      performanceMonitor.recordMetric(metric1);
      performanceMonitor.recordMetric(metric2);

      const average = performanceMonitor.getAverageMetric('TestMetric');
      expect(average).toBe(150);
    });

    it('should return null for non-existent metric', () => {
      const average = performanceMonitor.getAverageMetric('NonExistent');
      expect(average).toBeNull();
    });
  });

  describe('observers', () => {
    it('should add and remove observers', () => {
      const observer: PerformanceObserver = {
        onMetric: jest.fn(),
      };

      performanceMonitor.addObserver(observer);
      performanceMonitor.removeObserver(observer);

      // Should not throw error when removing non-existent observer
      expect(() => performanceMonitor.removeObserver(observer)).not.toThrow();
    });

    it('should notify observers of new metrics', () => {
      const observer: PerformanceObserver = {
        onMetric: jest.fn(),
      };

      performanceMonitor.addObserver(observer);

      const metric: PerformanceMetric = {
        name: 'TestMetric',
        value: 100,
        unit: 'ms',
        timestamp: Date.now(),
      };

      performanceMonitor.recordMetric(metric);

      expect(observer.onMetric).toHaveBeenCalledWith(metric);
    });

    it('should handle observer errors gracefully', () => {
      const observer: PerformanceObserver = {
        onMetric: jest.fn().mockImplementation(() => {
          throw new Error('Observer error');
        }),
      };

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      performanceMonitor.addObserver(observer);

      const metric: PerformanceMetric = {
        name: 'TestMetric',
        value: 100,
        unit: 'ms',
        timestamp: Date.now(),
      };

      performanceMonitor.recordMetric(metric);

      expect(consoleSpy).toHaveBeenCalledWith('Error in performance observer:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('clearMetrics', () => {
    it('should clear all metrics', () => {
      const metric: PerformanceMetric = {
        name: 'TestMetric',
        value: 100,
        unit: 'ms',
        timestamp: Date.now(),
      };

      performanceMonitor.recordMetric(metric);
      expect(performanceMonitor.getMetrics()).toHaveLength(1);

      performanceMonitor.clearMetrics();
      expect(performanceMonitor.getMetrics()).toHaveLength(0);
    });
  });

  describe('exportMetrics', () => {
    it('should export metrics as JSON', () => {
      const metric: PerformanceMetric = {
        name: 'TestMetric',
        value: 100,
        unit: 'ms',
        timestamp: Date.now(),
      };

      performanceMonitor.recordMetric(metric);
      const exported = performanceMonitor.exportMetrics();
      const parsed = JSON.parse(exported);

      expect(parsed.metrics).toHaveLength(1);
      expect(parsed.summary.totalMetrics).toBe(1);
      expect(parsed.metrics[0]).toEqual(metric);
    });
  });
}); 
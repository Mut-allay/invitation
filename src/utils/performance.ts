/**
 * Performance monitoring utility for tracking application performance metrics
 */

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface PerformanceObserver {
  onMetric: (metric: PerformanceMetric) => void;
}

class PerformanceMonitor {
  private observers: Array<PerformanceObserver> = [];
  private metrics: Array<PerformanceMetric> = [];
  private isEnabled: boolean = true;

  constructor() {
    this.initializePerformanceObserver();
  }

  /**
   * Initialize performance observer to track navigation timing
   */
  private initializePerformanceObserver(): void {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      try {
        const navigationObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === 'navigation') {
              const navEntry = entry as PerformanceNavigationTiming;
              this.recordNavigationMetrics(navEntry);
            }
          });
        });

        navigationObserver.observe({ entryTypes: ['navigation'] });
      } catch (error) {
        console.warn('PerformanceObserver not supported:', error);
      }
    }
  }

  /**
   * Record navigation timing metrics
   */
  private recordNavigationMetrics(navEntry: PerformanceNavigationTiming): void {
    const metrics = [
      {
        name: 'DOMContentLoaded',
        value: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
        unit: 'ms',
        timestamp: Date.now(),
      },
      {
        name: 'LoadComplete',
        value: navEntry.loadEventEnd - navEntry.loadEventStart,
        unit: 'ms',
        timestamp: Date.now(),
      },
      {
        name: 'FirstContentfulPaint',
        value: navEntry.domContentLoadedEventEnd - navEntry.fetchStart,
        unit: 'ms',
        timestamp: Date.now(),
      },
    ];

    metrics.forEach(metric => this.recordMetric(metric));
  }

  /**
   * Record a custom performance metric
   */
  recordMetric(metric: PerformanceMetric): void {
    if (!this.isEnabled) return;

    this.metrics.push(metric);
    this.notifyObservers(metric);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Performance Metric: ${metric.name} = ${metric.value}${metric.unit}`);
    }
  }

  /**
   * Measure component render time
   */
  measureComponentRender(componentName: string, renderFn: () => void): void {
    const startTime = performance.now();
    renderFn();
    const endTime = performance.now();

    this.recordMetric({
      name: `ComponentRender_${componentName}`,
      value: endTime - startTime,
      unit: 'ms',
      timestamp: Date.now(),
      metadata: { componentName },
    });
  }

  /**
   * Measure async operation time
   */
  async measureAsyncOperation<T>(
    operationName: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();
    try {
      const result = await operation();
      const endTime = performance.now();

      this.recordMetric({
        name: `AsyncOperation_${operationName}`,
        value: endTime - startTime,
        unit: 'ms',
        timestamp: Date.now(),
        metadata: { operationName, success: true },
      });

      return result;
    } catch (error) {
      const endTime = performance.now();

      this.recordMetric({
        name: `AsyncOperation_${operationName}`,
        value: endTime - startTime,
        unit: 'ms',
        timestamp: Date.now(),
        metadata: { operationName, success: false, error: error.message },
      });

      throw error;
    }
  }

  /**
   * Measure user interaction time
   */
  measureUserInteraction(interactionName: string, interactionFn: () => void): void {
    const startTime = performance.now();
    interactionFn();
    const endTime = performance.now();

    this.recordMetric({
      name: `UserInteraction_${interactionName}`,
      value: endTime - startTime,
      unit: 'ms',
      timestamp: Date.now(),
      metadata: { interactionName },
    });
  }

  /**
   * Get current memory usage
   */
  getMemoryUsage(): PerformanceMetric | null {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance as Performance & { memory: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
      return {
        name: 'MemoryUsage',
        value: memory.usedJSHeapSize / 1024 / 1024, // Convert to MB
        unit: 'MB',
        timestamp: Date.now(),
        metadata: {
          totalJSHeapSize: memory.totalJSHeapSize / 1024 / 1024,
          jsHeapSizeLimit: memory.jsHeapSizeLimit / 1024 / 1024,
        },
      };
    }
    return null;
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get metrics by name
   */
  getMetricsByName(name: string): Array<PerformanceMetric> {
    return this.metrics.filter(metric => metric.name === name);
  }

  /**
   * Get average metric value by name
   */
  getAverageMetric(name: string): number | null {
    const metrics = this.getMetricsByName(name);
    if (metrics.length === 0) return null;

    const sum = metrics.reduce((acc, metric) => acc + metric.value, 0);
    return sum / metrics.length;
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Add performance observer
   */
  addObserver(observer: PerformanceObserver): void {
    this.observers.push(observer);
  }

  /**
   * Remove performance observer
   */
  removeObserver(observer: PerformanceObserver): void {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  /**
   * Notify all observers of new metric
   */
  private notifyObservers(metric: PerformanceMetric): void {
    this.observers.forEach(observer => {
      try {
        observer.onMetric(metric);
      } catch (error) {
        console.error('Error in performance observer:', error);
      }
    });
  }

  /**
   * Enable/disable performance monitoring
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics(): string {
    return JSON.stringify({
      metrics: this.metrics,
      summary: {
        totalMetrics: this.metrics.length,
        averageLoadTime: this.getAverageMetric('LoadComplete'),
        averageRenderTime: this.getAverageMetric('ComponentRender'),
        memoryUsage: this.getMemoryUsage(),
      },
    }, null, 2);
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Export convenience functions
export const measureComponentRender = (componentName: string, renderFn: () => void) =>
  performanceMonitor.measureComponentRender(componentName, renderFn);

export const measureAsyncOperation = <T>(operationName: string, operation: () => Promise<T>) =>
  performanceMonitor.measureAsyncOperation(operationName, operation);

export const measureUserInteraction = (interactionName: string, interactionFn: () => void) =>
  performanceMonitor.measureUserInteraction(interactionName, interactionFn);

export const recordMetric = (metric: PerformanceMetric) =>
  performanceMonitor.recordMetric(metric);

export default performanceMonitor; 
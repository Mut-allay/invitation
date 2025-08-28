import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Skeleton, 
  ProgressiveImage, 
  ProgressiveList 
} from '@/components/common/ProgressiveLoading';
import { performanceMonitor } from '@/utils/performance';
import { memoryCache, cacheStats } from '@/utils/caching';

interface PerformanceMetrics {
  totalMetrics: number;
  averageLoadTime: number | null;
  averageRenderTime: number | null;
  memoryUsage: { value: number } | null;
}

interface CacheStatistics {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
}

const PerformanceOptimizationDemo: React.FC = () => {
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    totalMetrics: 0,
    averageLoadTime: null,
    averageRenderTime: null,
    memoryUsage: null,
  });

  const [cacheStatistics, setCacheStatistics] = useState<CacheStatistics>({
    hits: 0,
    misses: 0,
    size: 0,
    hitRate: 0,
  });

  const [isMonitoring, setIsMonitoring] = useState(false);

  // Mock data for progressive loading demo
  const mockVehicles = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    name: `Vehicle ${i + 1}`,
    make: `Make ${i + 1}`,
    model: `Model ${i + 1}`,
    year: 2020 + (i % 5),
    price: 25000 + (i * 1000),
    image: `https://picsum.photos/300/200?random=${i + 1}`,
  }));

  const renderVehicleCard = (vehicle: { id: number; name: string; make: string; model: string; year: number; price: number; image: string }) => (
    <Card key={vehicle.id} className="w-full max-w-sm">
      <CardContent className="p-4">
        <ProgressiveImage
          src={vehicle.image}
          alt={vehicle.name}
          width={300}
          height={200}
          className="w-full h-48 object-cover rounded-md mb-4"
        />
        <h3 className="text-lg font-semibold mb-2">{vehicle.name}</h3>
        <p className="text-gray-600 mb-2">{vehicle.make} {vehicle.model}</p>
        <p className="text-gray-600 mb-2">Year: {vehicle.year}</p>
        <p className="text-lg font-bold text-green-600">
          ${vehicle.price.toLocaleString()}
        </p>
      </CardContent>
    </Card>
  );

  // Performance monitoring functions
  const startPerformanceMonitoring = () => {
    setIsMonitoring(true);
    performanceMonitor.setEnabled(true);
    
    // Add observer to track metrics
    performanceMonitor.addObserver({
      onMetric: (metric) => {
        console.log('Performance metric recorded:', metric);
        updatePerformanceMetrics();
      },
    });
  };

  const stopPerformanceMonitoring = () => {
    setIsMonitoring(false);
    performanceMonitor.setEnabled(false);
  };

  const updatePerformanceMetrics = () => {
    const metrics = performanceMonitor.getMetrics();
    const memoryUsage = performanceMonitor.getMemoryUsage();
    
    setPerformanceMetrics({
      totalMetrics: metrics.length,
      averageLoadTime: performanceMonitor.getAverageMetric('LoadComplete'),
      averageRenderTime: performanceMonitor.getAverageMetric('ComponentRender'),
      memoryUsage,
    });
  };

  const updateCacheStatistics = () => {
    const stats = cacheStats();
    setCacheStatistics(stats);
  };

  // Cache demo functions
  const testCacheOperations = () => {
    // Test cache operations
    memoryCache.set('test-key-1', 'test-value-1');
    memoryCache.set('test-key-2', 'test-value-2');
    memoryCache.get('test-key-1'); // hit
    memoryCache.get('non-existent'); // miss
    memoryCache.get('test-key-2'); // hit
    
    updateCacheStatistics();
  };

  const clearCache = () => {
    memoryCache.clear();
    updateCacheStatistics();
  };

  // Measure component render time
  const measureComponentRender = () => {
    performanceMonitor.measureComponentRender('DemoComponent', () => {
      // Simulate some work
      const start = performance.now();
      for (let i = 0; i < 1000000; i++) {
        Math.random();
      }
      const end = performance.now();
      console.log(`Component render took ${end - start}ms`);
    });
    
    updatePerformanceMetrics();
  };

  // Measure async operation
  const measureAsyncOperation = async () => {
    await performanceMonitor.measureAsyncOperation('DemoAsyncOperation', async () => {
      // Simulate async work
      await new Promise(resolve => setTimeout(resolve, 100));
      return 'Async operation completed';
    });
    
    updatePerformanceMetrics();
  };

  useEffect(() => {
    updatePerformanceMetrics();
    updateCacheStatistics();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Performance Optimization Demo</h1>
        <p className="text-gray-600">
          Showcasing bundle optimization, performance monitoring, caching, and progressive loading
        </p>
      </div>

      {/* Performance Monitoring Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📊 Performance Monitoring
            <Badge variant={isMonitoring ? "default" : "secondary"}>
              {isMonitoring ? "Active" : "Inactive"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {performanceMetrics.totalMetrics}
              </div>
              <div className="text-sm text-gray-600">Total Metrics</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {performanceMetrics.averageLoadTime?.toFixed(2) || 'N/A'}ms
              </div>
              <div className="text-sm text-gray-600">Avg Load Time</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {performanceMetrics.averageRenderTime?.toFixed(2) || 'N/A'}ms
              </div>
              <div className="text-sm text-gray-600">Avg Render Time</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {performanceMetrics.memoryUsage?.value?.toFixed(1) || 'N/A'}MB
              </div>
              <div className="text-sm text-gray-600">Memory Usage</div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={startPerformanceMonitoring}
              disabled={isMonitoring}
              variant="default"
            >
              Start Monitoring
            </Button>
            <Button 
              onClick={stopPerformanceMonitoring}
              disabled={!isMonitoring}
              variant="outline"
            >
              Stop Monitoring
            </Button>
            <Button onClick={measureComponentRender} variant="outline">
              Measure Render
            </Button>
            <Button onClick={measureAsyncOperation} variant="outline">
              Measure Async
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Caching Section */}
      <Card>
        <CardHeader>
          <CardTitle>💾 Caching Strategy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {cacheStatistics.hits}
              </div>
              <div className="text-sm text-gray-600">Cache Hits</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {cacheStatistics.misses}
              </div>
              <div className="text-sm text-gray-600">Cache Misses</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {cacheStatistics.size}
              </div>
              <div className="text-sm text-gray-600">Cache Size</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {(cacheStatistics.hitRate * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Hit Rate</div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={testCacheOperations} variant="default">
              Test Cache Operations
            </Button>
            <Button onClick={clearCache} variant="outline">
              Clear Cache
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Progressive Loading Section */}
      <Card>
        <CardHeader>
          <CardTitle>⚡ Progressive Loading</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Skeleton Demo */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Skeleton Loading States</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Skeleton width="100%" height="100px" />
                <Skeleton width="100%" height="100px" variant="circular" />
                <Skeleton width="100%" height="100px" animation="wave" />
              </div>
            </div>

            {/* Progressive Image Demo */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Progressive Image Loading</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <ProgressiveImage
                    key={i}
                    src={`https://picsum.photos/300/200?random=${i}`}
                    alt={`Demo image ${i}`}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover rounded-md"
                  />
                ))}
              </div>
            </div>

            {/* Progressive List Demo */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Progressive List Loading</h3>
              <ProgressiveList
                items={mockVehicles}
                renderItem={renderVehicleCard}
                pageSize={6}
                skeletonCount={3}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bundle Optimization Info */}
      <Card>
        <CardHeader>
          <CardTitle>📦 Bundle Optimization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">✅ Implemented</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Code splitting with manual chunks</li>
                  <li>• Tree shaking and minification</li>
                  <li>• Vendor chunk separation</li>
                  <li>• Optimized dependency pre-bundling</li>
                  <li>• Cache headers for static assets</li>
                </ul>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">📊 Benefits</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Reduced initial bundle size</li>
                  <li>• Faster page load times</li>
                  <li>• Better caching efficiency</li>
                  <li>• Improved user experience</li>
                  <li>• Progressive enhancement</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceOptimizationDemo; 
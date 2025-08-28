import React, { useState, useEffect, useCallback, ReactNode } from 'react';
import { measureComponentRender } from '@/utils/performance';

export interface ProgressiveLoadingProps {
  children: ReactNode;
  fallback?: ReactNode;
  skeleton?: ReactNode;
  delay?: number; // Delay before showing skeleton (ms)
  threshold?: number; // Intersection observer threshold
  onLoadStart?: () => void;
  onLoadComplete?: () => void;
  onLoadError?: (error: Event | Error) => void;
  className?: string;
  style?: React.CSSProperties;
}

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  style?: React.CSSProperties;
  variant?: 'text' | 'circular' | 'rectangular';
  animation?: 'pulse' | 'wave' | 'none';
}

/**
 * Skeleton loading component
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '20px',
  className = '',
  style = {},
  variant = 'rectangular',
  animation = 'pulse',
}) => {
  const baseClasses = 'bg-gray-200 dark:bg-gray-700';
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-pulse',
    none: '',
  };

  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
  };

  const classes = `${baseClasses} ${animationClasses[animation]} ${variantClasses[variant]} ${className}`;

  return (
    <div
      className={classes}
      style={{
        width,
        height,
        ...style,
      }}
    />
  );
};

/**
 * Progressive loading component with intersection observer
 */
export const ProgressiveLoading: React.FC<ProgressiveLoadingProps> = ({
  children,
  fallback = <Skeleton />,
  skeleton = <Skeleton />,
  delay = 200,
  threshold = 0.1,
  onLoadStart,
  onLoadComplete,
  onLoadError,
  className = '',
  style = {},
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [shouldShowSkeleton, setShouldShowSkeleton] = useState(false);
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);

  // Show skeleton after delay
  useEffect(() => {
    if (isLoading && delay > 0) {
      const timer = setTimeout(() => {
        setShouldShowSkeleton(true);
      }, delay);

      return () => clearTimeout(timer);
    } else if (isLoading) {
      setShouldShowSkeleton(true);
    } else {
      setShouldShowSkeleton(false);
    }
  }, [isLoading, delay]);

  // Intersection observer to trigger loading
  useEffect(() => {
    if (!containerRef) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible && !isLoading) {
            setIsVisible(true);
            setIsLoading(true);
            onLoadStart?.();
          }
        });
      },
      {
        threshold,
        rootMargin: '50px',
      }
    );

    observer.observe(containerRef);

    return () => {
      observer.disconnect();
    };
  }, [containerRef, isVisible, isLoading, threshold, onLoadStart]);

  // Handle loading completion
  const handleLoadComplete = useCallback(() => {
    measureComponentRender('ProgressiveLoading', () => {
      setIsLoading(false);
      setShouldShowSkeleton(false);
      onLoadComplete?.();
    });
  }, [onLoadComplete]);

  // Handle loading error
  const handleLoadError = useCallback((error: Event | Error) => {
    setIsLoading(false);
    setShouldShowSkeleton(false);
    setHasError(true);
    if (onLoadError && error instanceof Error) {
      onLoadError(error);
    }
  }, [onLoadError]);

  // Render content based on state
  const renderContent = () => {
    if (hasError) {
      return fallback;
    }

    if (!isVisible) {
      return skeleton;
    }

    if (isLoading && shouldShowSkeleton) {
      return (
        <div className="relative">
          {skeleton}
          <div className="absolute inset-0">
            {React.cloneElement(children as React.ReactElement<{ onLoad?: () => void; onError?: (error: Event | Error) => void }>, {
              onLoad: handleLoadComplete,
              onError: handleLoadError,
            })}
          </div>
        </div>
      );
    }

    return React.cloneElement(children as React.ReactElement<{ onLoad?: () => void; onError?: (error: Event | Error) => void }>, {
      onLoad: handleLoadComplete,
      onError: handleLoadError,
    });
  };

  return (
    <div
      ref={setContainerRef}
      className={`progressive-loading ${className}`}
      style={style}
    >
      {renderContent()}
    </div>
  );
};

/**
 * Lazy loading wrapper for components
 */
export const LazyLoad: React.FC<{
  children: ReactNode;
  fallback?: ReactNode;
  threshold?: number;
}> = ({ children, fallback = <Skeleton />, threshold = 0.1 }) => {
  return (
    <ProgressiveLoading
      fallback={fallback}
      skeleton={fallback}
      threshold={threshold}
    >
      {children}
    </ProgressiveLoading>
  );
};

/**
 * Image progressive loading component
 */
export const ProgressiveImage: React.FC<{
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}> = ({
  src,
  alt,
  width,
  height,
  className = '',
  style = {},
  placeholder,
  onLoad,
  onError,
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder || src);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleLoad = () => {
    if (imageSrc !== src) {
      setImageSrc(src);
    }
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    const errorObj = new Error(`Failed to load image: ${src}`);
    if (onError) {
      onError(errorObj);
    }
  };

  const handleImageError = () => {
    const errorObj = new Error(`Failed to load image: ${src}`);
    if (onError) {
      onError(errorObj);
    }
  };

  return (
    <ProgressiveLoading
      skeleton={
        <Skeleton
          width={width}
          height={height}
          variant="rectangular"
          animation="pulse"
        />
      }
      onLoadComplete={handleLoad}
      onLoadError={handleError}
    >
      <img
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        style={style}
        onLoad={handleLoad}
        onError={handleImageError}
      />
    </ProgressiveLoading>
  );
};

/**
 * List progressive loading component
 */
export const ProgressiveList: React.FC<{
  items: unknown[];
  renderItem: (item: unknown, index: number) => ReactNode;
  pageSize?: number;
  skeletonCount?: number;
  className?: string;
}> = ({
  items,
  renderItem,
  pageSize = 10,
  skeletonCount = 5,
  className = '',
}) => {
  const [visibleItems, setVisibleItems] = useState(pageSize);
  const [isLoading, setIsLoading] = useState(false);

  const loadMore = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      setVisibleItems((prev) => Math.min(prev + pageSize, items.length));
      setIsLoading(false);
    }, 300);
  }, [items.length, pageSize]);

  const visibleItemsList = items.slice(0, visibleItems);
  const hasMore = visibleItems < items.length;

  return (
    <div className={`progressive-list ${className}`}>
      {visibleItemsList.map((item, index) => (
        <LazyLoad key={index} threshold={0.1}>
          {renderItem(item, index)}
        </LazyLoad>
      ))}
      
      {isLoading && (
        <div className="flex gap-2 mt-4">
          {Array.from({ length: skeletonCount }).map((_, index) => (
            <Skeleton key={index} width="100%" height="60px" />
          ))}
        </div>
      )}
      
      {hasMore && !isLoading && (
        <div className="mt-4 text-center">
          <button
            onClick={loadMore}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default ProgressiveLoading; 
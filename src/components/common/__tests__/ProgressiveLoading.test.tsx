import React from 'react';
import { render } from '@testing-library/react';
import {
  ProgressiveLoading,
  Skeleton,
  LazyLoad,
  ProgressiveImage,
  ProgressiveList,
} from '../ProgressiveLoading';

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});
window.IntersectionObserver = mockIntersectionObserver;

// Mock performance API
const mockPerformance = {
  now: jest.fn(),
};

Object.defineProperty(window, 'performance', {
  value: mockPerformance,
  writable: true,
});

describe('ProgressiveLoading Components', () => {
  it('should render Skeleton without errors', () => {
    expect(() => {
      render(<Skeleton />);
    }).not.toThrow();
  });

  it('should render Skeleton with custom props without errors', () => {
    expect(() => {
      render(
        <Skeleton
          width="200px"
          height="100px"
          variant="circular"
          animation="wave"
          className="custom-class"
        />
      );
    }).not.toThrow();
  });

  it('should render ProgressiveLoading without errors', () => {
    expect(() => {
      render(
        <ProgressiveLoading>
          <div>Content</div>
        </ProgressiveLoading>
      );
    }).not.toThrow();
  });

  it('should render ProgressiveLoading with custom fallback without errors', () => {
    expect(() => {
      render(
        <ProgressiveLoading fallback={<div>Custom fallback</div>}>
          <div>Content</div>
        </ProgressiveLoading>
      );
    }).not.toThrow();
  });

  it('should render LazyLoad without errors', () => {
    expect(() => {
      render(
        <LazyLoad>
          <div>Lazy content</div>
        </LazyLoad>
      );
    }).not.toThrow();
  });

  it('should render ProgressiveImage without errors', () => {
    expect(() => {
      render(
        <ProgressiveImage
          src="test.jpg"
          alt="Test image"
          placeholder="placeholder.jpg"
        />
      );
    }).not.toThrow();
  });

  it('should render ProgressiveList without errors', () => {
    const mockItems = [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' },
    ];

    const renderItem = (item: { id: number; name: string }) => (
      <div key={item.id} data-testid={`item-${item.id}`}>
        {item.name}
      </div>
    );

    expect(() => {
      render(
        <ProgressiveList
          items={mockItems}
          renderItem={renderItem}
          pageSize={2}
        />
      );
    }).not.toThrow();
  });

  it('should render multiple components together without errors', () => {
    expect(() => {
      render(
        <div>
          <Skeleton />
          <ProgressiveLoading>
            <div>Content</div>
          </ProgressiveLoading>
          <LazyLoad>
            <div>Lazy content</div>
          </LazyLoad>
        </div>
      );
    }).not.toThrow();
  });
}); 
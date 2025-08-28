import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  LoadingSpinner,
  LoadingSkeleton,
  LoadingOverlay,
  LoadingButton,
  LoadingCard,
  LoadingTable
} from '../LoadingStates';

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('w-6', 'h-6', 'text-blue-600');
  });

  it('renders with custom size', () => {
    render(<LoadingSpinner size="lg" />);
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass('w-8', 'h-8');
  });

  it('renders with custom color', () => {
    render(<LoadingSpinner color="white" />);
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass('text-white');
  });

  it('renders with custom className', () => {
    render(<LoadingSpinner className="custom-class" />);
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass('custom-class');
  });
});

describe('LoadingSkeleton', () => {
  it('renders with default props', () => {
    render(<LoadingSkeleton />);
    const skeleton = screen.getByTestId('loading-skeleton');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton.children).toHaveLength(1);
  });

  it('renders multiple lines', () => {
    render(<LoadingSkeleton lines={3} />);
    const skeleton = screen.getByTestId('loading-skeleton');
    expect(skeleton.children).toHaveLength(3);
  });

  it('renders with custom height', () => {
    render(<LoadingSkeleton height="h-8" />);
    const skeleton = screen.getByTestId('loading-skeleton');
    const firstLine = skeleton.children[0];
    expect(firstLine).toHaveClass('h-8');
  });

  it('renders with custom className', () => {
    render(<LoadingSkeleton className="custom-class" />);
    const skeleton = screen.getByTestId('loading-skeleton');
    expect(skeleton).toHaveClass('custom-class');
  });
});

describe('LoadingOverlay', () => {
  it('renders when visible', () => {
    render(<LoadingOverlay isVisible={true} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('does not render when not visible', () => {
    render(<LoadingOverlay isVisible={false} />);
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('renders with custom message', () => {
    render(<LoadingOverlay isVisible={true} message="Custom loading message" />);
    expect(screen.getByText('Custom loading message')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    render(<LoadingOverlay isVisible={true} className="custom-class" />);
    const overlay = screen.getByText('Loading...').closest('div');
    expect(overlay?.parentElement).toHaveClass('custom-class');
  });
});

describe('LoadingButton', () => {
  it('renders with default props', () => {
    render(<LoadingButton isLoading={false}>Click me</LoadingButton>);
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<LoadingButton isLoading={true}>Click me</LoadingButton>);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows custom loading text', () => {
    render(
      <LoadingButton isLoading={true} loadingText="Processing...">
        Click me
      </LoadingButton>
    );
    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });

  it('handles click when not loading', () => {
    const handleClick = jest.fn();
    render(
      <LoadingButton isLoading={false} onClick={handleClick}>
        Click me
      </LoadingButton>
    );
    screen.getByRole('button').click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not handle click when loading', () => {
    const handleClick = jest.fn();
    render(
      <LoadingButton isLoading={true} onClick={handleClick}>
        Click me
      </LoadingButton>
    );
    screen.getByRole('button').click();
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renders with custom className', () => {
    render(
      <LoadingButton isLoading={false} className="custom-class">
        Click me
      </LoadingButton>
    );
    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });
});

describe('LoadingCard', () => {
  it('renders with default skeleton content', () => {
    render(<LoadingCard />);
    const card = screen.getByTestId('loading-card');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('bg-white', 'rounded-lg', 'shadow', 'p-6');
  });

  it('renders with title skeleton', () => {
    render(<LoadingCard title="Test Title" />);
    const card = screen.getByTestId('loading-card');
    expect(card).toBeInTheDocument();
  });

  it('renders with custom children', () => {
    render(
      <LoadingCard>
        <div data-testid="custom-content">Custom content</div>
      </LoadingCard>
    );
    expect(screen.getByTestId('custom-content')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    render(<LoadingCard className="custom-class" />);
    const card = screen.getByTestId('loading-card');
    expect(card).toHaveClass('custom-class');
  });
});

describe('LoadingTable', () => {
  it('renders with default props', () => {
    render(<LoadingTable />);
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
  });

  it('renders with custom rows and columns', () => {
    render(<LoadingTable rows={3} columns={2} />);
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    render(<LoadingTable className="custom-class" />);
    const tableContainer = screen.getByRole('table').closest('div');
    expect(tableContainer).toHaveClass('custom-class');
  });
}); 
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {
  Alert,
  ConfirmationDialog,
  StatusIndicator,
  ProgressBar
} from '../UserFeedback';

describe('Alert', () => {
  it('renders success alert', () => {
    render(<Alert type="success" message="Success message" />);
    expect(screen.getByText('Success message')).toBeInTheDocument();
  });

  it('renders error alert', () => {
    render(<Alert type="error" message="Error message" />);
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });

  it('renders warning alert', () => {
    render(<Alert type="warning" message="Warning message" />);
    expect(screen.getByText('Warning message')).toBeInTheDocument();
  });

  it('renders info alert', () => {
    render(<Alert type="info" message="Info message" />);
    expect(screen.getByText('Info message')).toBeInTheDocument();
  });

  it('renders with title', () => {
    render(
      <Alert type="success" title="Success Title" message="Success message" />
    );
    expect(screen.getByText('Success Title')).toBeInTheDocument();
    expect(screen.getByText('Success message')).toBeInTheDocument();
  });

  it('handles close button click', () => {
    const onClose = jest.fn();
    render(
      <Alert type="success" message="Success message" onClose={onClose} />
    );
    
    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('auto dismisses after delay', async () => {
    jest.useFakeTimers();
    const onClose = jest.fn();
    
    render(
      <Alert
        type="success"
        message="Success message"
        onClose={onClose}
        autoDismiss={true}
        autoDismissDelay={1000}
      />
    );

    expect(screen.getByText('Success message')).toBeInTheDocument();
    
    jest.advanceTimersByTime(1000);
    
    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1);
    });
    
    jest.useRealTimers();
  });

  it('renders non-dismissible alert', () => {
    render(
      <Alert type="success" message="Success message" dismissible={false} />
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders with custom className', () => {
    render(
      <Alert type="success" message="Success message" className="custom-class" />
    );
    const alert = screen.getByTestId('alert');
    expect(alert).toHaveClass('custom-class');
  });
});

describe('ConfirmationDialog', () => {
  it('renders when open', () => {
    render(
      <ConfirmationDialog
        isOpen={true}
        title="Confirm Action"
        message="Are you sure?"
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    );
    
    expect(screen.getByText('Confirm Action')).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <ConfirmationDialog
        isOpen={false}
        title="Confirm Action"
        message="Are you sure?"
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    );
    
    expect(screen.queryByText('Confirm Action')).not.toBeInTheDocument();
  });

  it('handles confirm button click', () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    
    render(
      <ConfirmationDialog
        isOpen={true}
        title="Confirm Action"
        message="Are you sure?"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );
    
    const confirmButton = screen.getByText('Confirm');
    fireEvent.click(confirmButton);
    
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('handles cancel button click', () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    
    render(
      <ConfirmationDialog
        isOpen={true}
        title="Confirm Action"
        message="Are you sure?"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('renders with custom button text', () => {
    render(
      <ConfirmationDialog
        isOpen={true}
        title="Confirm Action"
        message="Are you sure?"
        confirmText="Yes, proceed"
        cancelText="No, cancel"
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    );
    
    expect(screen.getByText('Yes, proceed')).toBeInTheDocument();
    expect(screen.getByText('No, cancel')).toBeInTheDocument();
  });

  it('renders with danger type', () => {
    render(
      <ConfirmationDialog
        isOpen={true}
        title="Confirm Action"
        message="Are you sure?"
        type="danger"
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    );
    
    const confirmButton = screen.getByText('Confirm');
    expect(confirmButton).toHaveClass('bg-red-600');
  });

  it('renders with custom className', () => {
    render(
      <ConfirmationDialog
        isOpen={true}
        title="Confirm Action"
        message="Are you sure?"
        className="custom-class"
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    );
    
    const dialog = screen.getByTestId('confirmation-dialog');
    expect(dialog).toHaveClass('custom-class');
  });
});

describe('StatusIndicator', () => {
  it('renders success status', () => {
    render(<StatusIndicator status="success" />);
    const indicator = screen.getByTestId('status-indicator');
    expect(indicator).toBeInTheDocument();
  });

  it('renders error status', () => {
    render(<StatusIndicator status="error" />);
    const indicator = screen.getByTestId('status-indicator');
    expect(indicator).toBeInTheDocument();
  });

  it('renders warning status', () => {
    render(<StatusIndicator status="warning" />);
    const indicator = screen.getByTestId('status-indicator');
    expect(indicator).toBeInTheDocument();
  });

  it('renders info status', () => {
    render(<StatusIndicator status="info" />);
    const indicator = screen.getByTestId('status-indicator');
    expect(indicator).toBeInTheDocument();
  });

  it('renders pending status', () => {
    render(<StatusIndicator status="pending" />);
    const indicator = screen.getByTestId('status-indicator');
    expect(indicator).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<StatusIndicator status="success" label="Active" />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders with custom size', () => {
    render(<StatusIndicator status="success" size="lg" />);
    const indicator = screen.getByTestId('status-indicator');
    const dot = indicator.children[0];
    expect(dot).toHaveClass('w-4', 'h-4');
  });

  it('renders with custom className', () => {
    render(
      <StatusIndicator status="success" className="custom-class" />
    );
    const indicator = screen.getByTestId('status-indicator');
    expect(indicator).toHaveClass('custom-class');
  });
});

describe('ProgressBar', () => {
  it('renders with progress', () => {
    render(<ProgressBar progress={50} />);
    const progressBar = screen.getByTestId('progress-bar');
    expect(progressBar).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<ProgressBar progress={50} label="Upload Progress" />);
    expect(screen.getByText('Upload Progress')).toBeInTheDocument();
  });

  it('renders with percentage', () => {
    render(<ProgressBar progress={75} showPercentage={true} />);
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('clamps progress to 0-100 range', () => {
    render(<ProgressBar progress={150} showPercentage={true} />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('renders with custom size', () => {
    render(<ProgressBar progress={50} size="lg" />);
    const progressBar = screen.getByTestId('progress-bar');
    const bar = progressBar.children[0];
    expect(bar).toHaveClass('h-3');
  });

  it('renders with custom color', () => {
    render(<ProgressBar progress={50} color="green" />);
    const progressBar = screen.getByTestId('progress-bar');
    const bar = progressBar.children[0];
    const fill = bar.children[0];
    expect(fill).toHaveClass('bg-green-600');
  });

  it('renders with custom className', () => {
    render(
      <ProgressBar progress={50} className="custom-class" />
    );
    const progressBar = screen.getByTestId('progress-bar');
    expect(progressBar).toHaveClass('custom-class');
  });

  it('handles zero progress', () => {
    render(<ProgressBar progress={0} showPercentage={true} />);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('handles negative progress', () => {
    render(<ProgressBar progress={-10} showPercentage={true} />);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });
}); 
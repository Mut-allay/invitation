import React from 'react';
import { screen } from '@testing-library/react';
import { render as renderWithProviders } from '../../../test/utils/test-utils';
import { PartsOrderForm } from '../PartsOrderForm';

describe('PartsOrderForm', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    tenantId: 'demo-tenant',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render when isOpen is true', () => {
    renderWithProviders(<PartsOrderForm {...defaultProps} />);

    // Check that the form is rendered
    expect(screen.getByTestId('parts-order-form')).toBeInTheDocument();
    expect(screen.getByText(/create parts order/i)).toBeInTheDocument();
    
    // Check that basic form elements are present
    expect(screen.getByLabelText(/supplier name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/expected delivery/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();
    expect(screen.getByText(/order items/i)).toBeInTheDocument();
  });

  it('should not render when isOpen is false', () => {
    renderWithProviders(
      <PartsOrderForm {...defaultProps} isOpen={false} />
    );

    // The component should not render the form when isOpen is false
    expect(screen.queryByTestId('parts-order-form')).not.toBeInTheDocument();
  });

});

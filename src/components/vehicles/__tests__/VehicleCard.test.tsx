import React from 'react';
import { render, screen, fireEvent } from '../../../test/utils/test-utils';
import { VehicleCard } from '../VehicleCard';
import { createMockVehicle } from '../../../test/utils/test-utils';

describe('VehicleCard', () => {
  const mockVehicle = createMockVehicle();
  const mockOnView = jest.fn();
  const mockOnEdit = jest.fn();
  const mockOnSale = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders vehicle information correctly', () => {
    render(
      <VehicleCard
        vehicle={mockVehicle}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onSale={mockOnSale}
      />
    );

    expect(screen.getByText('Toyota Corolla')).toBeInTheDocument();
    expect(screen.getByText('2020')).toBeInTheDocument();
    expect(screen.getByText('ABC123')).toBeInTheDocument();
    expect(screen.getByText('ABC123456789')).toBeInTheDocument();
    expect(screen.getByText('K18,000')).toBeInTheDocument();
    expect(screen.getByText('Available')).toBeInTheDocument();
  });

  it('displays vehicle features correctly', () => {
    render(
      <VehicleCard
        vehicle={mockVehicle}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onSale={mockOnSale}
      />
    );

    expect(screen.getByText('Air Conditioning')).toBeInTheDocument();
    expect(screen.getByText('Bluetooth')).toBeInTheDocument();
  });

  it('calls onView when view button is clicked', () => {
    render(
      <VehicleCard
        vehicle={mockVehicle}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onSale={mockOnSale}
      />
    );

    const viewButton = screen.getByRole('button', { name: /view/i });
    fireEvent.click(viewButton);

    expect(mockOnView).toHaveBeenCalledTimes(1);
  });

  it('calls onEdit when edit button is clicked', () => {
    render(
      <VehicleCard
        vehicle={mockVehicle}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onSale={mockOnSale}
      />
    );

    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledTimes(1);
  });

  it('calls onSale when sale button is clicked', () => {
    render(
      <VehicleCard
        vehicle={mockVehicle}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onSale={mockOnSale}
      />
    );

    const saleButton = screen.getByRole('button', { name: /sell/i });
    fireEvent.click(saleButton);

    expect(mockOnSale).toHaveBeenCalledTimes(1);
  });

  it('displays correct status badge for available vehicle', () => {
    render(
      <VehicleCard
        vehicle={mockVehicle}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onSale={mockOnSale}
      />
    );

    const statusBadge = screen.getByText('Available');
    expect(statusBadge).toHaveClass('bg-green-100', 'text-green-800');
  });

  it('displays correct status badge for sold vehicle', () => {
    const soldVehicle = createMockVehicle({ status: 'sold' });
    
    render(
      <VehicleCard
        vehicle={soldVehicle}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onSale={mockOnSale}
      />
    );

    const statusBadge = screen.getByText('Sold');
    expect(statusBadge).toHaveClass('bg-red-100', 'text-red-800');
  });

  it('displays correct status badge for reserved vehicle', () => {
    const reservedVehicle = createMockVehicle({ status: 'reserved' });
    
    render(
      <VehicleCard
        vehicle={reservedVehicle}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onSale={mockOnSale}
      />
    );

    const statusBadge = screen.getByText('Reserved');
    expect(statusBadge).toHaveClass('bg-yellow-100', 'text-yellow-800');
  });

  it('displays correct status badge for in repair vehicle', () => {
    const inRepairVehicle = createMockVehicle({ status: 'in_repair' });
    
    render(
      <VehicleCard
        vehicle={inRepairVehicle}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onSale={mockOnSale}
      />
    );

    const statusBadge = screen.getByText('In Repair');
    expect(statusBadge).toHaveClass('bg-blue-100', 'text-blue-800');
  });

  it('displays vehicle image when available', () => {
    const vehicleWithImage = createMockVehicle({
      images: ['https://example.com/car.jpg']
    });
    
    render(
      <VehicleCard
        vehicle={vehicleWithImage}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onSale={mockOnSale}
      />
    );

    const image = screen.getByAltText('Toyota Corolla');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/car.jpg');
  });

  it('displays placeholder image when no images available', () => {
    render(
      <VehicleCard
        vehicle={mockVehicle}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onSale={mockOnSale}
      />
    );

    const placeholderImage = screen.getByAltText('Vehicle placeholder');
    expect(placeholderImage).toBeInTheDocument();
  });

  it('formats price correctly with thousands separator', () => {
    const expensiveVehicle = createMockVehicle({ sellingPrice: 250000 });
    
    render(
      <VehicleCard
        vehicle={expensiveVehicle}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onSale={mockOnSale}
      />
    );

    expect(screen.getByText('K250,000')).toBeInTheDocument();
  });

  it('displays vehicle specifications correctly', () => {
    render(
      <VehicleCard
        vehicle={mockVehicle}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onSale={mockOnSale}
      />
    );

    expect(screen.getByText('50,000 km')).toBeInTheDocument();
    expect(screen.getByText('Petrol')).toBeInTheDocument();
    expect(screen.getByText('Automatic')).toBeInTheDocument();
    expect(screen.getByText('White')).toBeInTheDocument();
  });

  it('handles missing optional fields gracefully', () => {
    const minimalVehicle = createMockVehicle({
      mileage: undefined,
      fuelType: undefined,
      transmission: undefined,
      color: undefined,
      features: undefined,
    });
    
    render(
      <VehicleCard
        vehicle={minimalVehicle}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onSale={mockOnSale}
      />
    );

    expect(screen.getByText('Toyota Corolla')).toBeInTheDocument();
    expect(screen.getByText('K18,000')).toBeInTheDocument();
    expect(screen.getByText('Available')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(
      <VehicleCard
        vehicle={mockVehicle}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onSale={mockOnSale}
      />
    );

    const viewButton = screen.getByRole('button', { name: /view/i });
    const editButton = screen.getByRole('button', { name: /edit/i });
    const saleButton = screen.getByRole('button', { name: /sell/i });

    expect(viewButton).toBeInTheDocument();
    expect(editButton).toBeInTheDocument();
    expect(saleButton).toBeInTheDocument();
  });
}); 
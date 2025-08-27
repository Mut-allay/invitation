
import React from 'react';
import { render, screen } from '@testing-library/react';
import { PartnerCatalog } from '../PartnerCatalog';
import { useGetPartnerCatalogQuery } from '../../../store/api/partnerBusinessApi';

jest.mock('../../../store/api/partnerBusinessApi');

describe('PartnerCatalog', () => {
  const mockUseGetPartnerCatalogQuery = useGetPartnerCatalogQuery as jest.Mock;

  it('should render the partner catalog', () => {
    mockUseGetPartnerCatalogQuery.mockReturnValue({ data: [], isLoading: false, error: null });
    render(<PartnerCatalog partnerTenantId="partner-a" />);
    expect(screen.getByText('Partner Catalog for partner-a')).toBeInTheDocument();
  });

  it('should display a loading message', () => {
    mockUseGetPartnerCatalogQuery.mockReturnValue({ data: [], isLoading: true, error: null });
    render(<PartnerCatalog partnerTenantId="partner-a" />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should display an error message', () => {
    mockUseGetPartnerCatalogQuery.mockReturnValue({ data: [], isLoading: false, error: new Error('test error') });
    render(<PartnerCatalog partnerTenantId="partner-a" />);
    expect(screen.getByText('Error loading catalog.')).toBeInTheDocument();
  });

  it('should display a list of catalog items', () => {
    const mockData = [
      { id: '1', name: 'Brake Pads' },
      { id: '2', name: 'Oil Filter' },
    ];
    mockUseGetPartnerCatalogQuery.mockReturnValue({ data: mockData, isLoading: false, error: null });
    render(<PartnerCatalog partnerTenantId="partner-a" />);
    expect(screen.getByText('Brake Pads')).toBeInTheDocument();
    expect(screen.getByText('Oil Filter')).toBeInTheDocument();
  });
});

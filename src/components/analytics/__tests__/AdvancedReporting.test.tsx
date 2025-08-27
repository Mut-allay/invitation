import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdvancedReporting from '../AdvancedReporting';

describe('AdvancedReporting', () => {
  it('renders the component with header', () => {
    render(<AdvancedReporting />);
    
    expect(screen.getByText('Advanced Reporting')).toBeInTheDocument();
    expect(screen.getByText('Custom reports, exports, and scheduled analytics')).toBeInTheDocument();
  });

  it('shows navigation tabs', () => {
    render(<AdvancedReporting />);
    
    expect(screen.getByText('Report Templates')).toBeInTheDocument();
    expect(screen.getByText('Custom Reports')).toBeInTheDocument();
    expect(screen.getByText('Scheduled Reports')).toBeInTheDocument();
  });

  it('displays report templates', () => {
    render(<AdvancedReporting />);
    
    expect(screen.getByText('Sales Summary Report')).toBeInTheDocument();
    expect(screen.getByText('Inventory Status Report')).toBeInTheDocument();
    expect(screen.getByText('Customer Insights Report')).toBeInTheDocument();
    expect(screen.getByText('Repair Performance Report')).toBeInTheDocument();
    expect(screen.getByText('Financial Summary Report')).toBeInTheDocument();
  });

  it('shows template descriptions', () => {
    render(<AdvancedReporting />);
    
    expect(screen.getByText(/Comprehensive sales performance analysis/)).toBeInTheDocument();
    expect(screen.getByText(/Current inventory levels/)).toBeInTheDocument();
    expect(screen.getByText(/Customer behavior analysis/)).toBeInTheDocument();
  });

  it('has generate buttons for templates', () => {
    render(<AdvancedReporting />);
    
    const generateButtons = screen.getAllByText('Generate');
    expect(generateButtons.length).toBeGreaterThan(0);
  });

  it('shows new report button', () => {
    render(<AdvancedReporting />);
    
    expect(screen.getByText('New Report')).toBeInTheDocument();
  });

  it('opens report builder modal when new report is clicked', () => {
    render(<AdvancedReporting />);
    
    fireEvent.click(screen.getByText('New Report'));
    
    expect(screen.getByText('Report Builder')).toBeInTheDocument();
    expect(screen.getByText('Configure your custom report with filters, columns, and export options.')).toBeInTheDocument();
  });

  it('shows custom reports tab content', () => {
    render(<AdvancedReporting />);
    
    fireEvent.click(screen.getByText('Custom Reports'));
    
    expect(screen.getByText('No Custom Reports')).toBeInTheDocument();
    expect(screen.getByText('Create your first custom report to get started')).toBeInTheDocument();
  });

  it('shows scheduled reports tab content', () => {
    render(<AdvancedReporting />);
    
    fireEvent.click(screen.getByText('Scheduled Reports'));
    
    expect(screen.getByText('Daily Sales Report')).toBeInTheDocument();
    expect(screen.getByText('Weekly Inventory Report')).toBeInTheDocument();
  });

  it('displays report builder form fields', () => {
    render(<AdvancedReporting />);
    
    fireEvent.click(screen.getByText('New Report'));
    
    expect(screen.getByLabelText('Report Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
  });

  it('can close report builder modal', () => {
    render(<AdvancedReporting />);
    
    fireEvent.click(screen.getByText('New Report'));
    fireEvent.click(screen.getByText('Cancel'));
    
    expect(screen.queryByText('Report Builder')).not.toBeInTheDocument();
  });
});

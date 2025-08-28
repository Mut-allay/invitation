// Mock Firebase functions
jest.mock('firebase/functions', () => ({
  httpsCallable: jest.fn()
}));

// Mock Firebase config
jest.mock('../../../config/firebase', () => ({
  functions: {}
}));

import { zraApi } from '../zraApi';
import { httpsCallable } from 'firebase/functions';

describe('ZRA API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateTPIN', () => {
    it('should validate TPIN successfully', async () => {
      const mockResponse = {
        isValid: true,
        businessName: 'Test Business Ltd',
        registrationDate: '2020-01-01',
        status: 'ACTIVE'
      };

      (httpsCallable as jest.Mock).mockReturnValue(() => Promise.resolve({ data: mockResponse }));

      const result = await zraApi.validateTPIN('1234567890');
      
      expect(result).toEqual(mockResponse);
      expect(httpsCallable).toHaveBeenCalledWith(expect.objectContaining({ httpsCallable: expect.any(Function) }), 'validateTPIN');
    });

    it('should handle invalid TPIN format', async () => {
      const result = await zraApi.validateTPIN('123');
      
      expect(result).toEqual({
        isValid: false,
        message: 'Invalid TPIN format. Must be 10 digits.'
      });
    });

    it('should handle API errors', async () => {
      (httpsCallable as jest.Mock).mockReturnValue(() => Promise.reject(new Error('API Error')));

      const result = await zraApi.validateTPIN('1234567890');
      
      expect(result).toEqual({
        isValid: false,
        message: 'Failed to validate TPIN. Please try again.'
      });
    });
  });

  describe('submitInvoiceToZRA', () => {
    const mockInvoice = {
      invoiceNumber: 'ZRA-20241201-001',
      invoiceDate: new Date(),
      customerName: 'Test Customer',
      customerTpin: '1234567890',
      businessName: 'Test Business',
      businessTpin: '0987654321',
      items: [{
        description: 'Test Item',
        quantity: 1,
        unitPrice: 100,
        vatRate: 16,
        vatExempt: false,
        total: 116,
        vatAmount: 16
      }],
      subtotal: 100,
      totalVat: 16,
      totalAmount: 116,
      currency: 'ZMW' as const
    };

    it('should submit invoice successfully', async () => {
      const mockResponse = {
        success: true,
        zraReference: 'ZRA-REF-123',
        qrCode: 'data:image/svg+xml;base64,...',
        message: 'Invoice submitted successfully',
        submittedAt: new Date()
      };

      (httpsCallable as jest.Mock).mockReturnValue(() => Promise.resolve({ data: mockResponse }));

      const result = await zraApi.submitInvoiceToZRA(mockInvoice);
      
      expect(result).toEqual(mockResponse);
      expect(httpsCallable).toHaveBeenCalledWith(expect.objectContaining({ httpsCallable: expect.any(Function) }), 'submitToZRA');
    });

    it('should handle validation errors', async () => {
      const invalidInvoice = { ...mockInvoice, customerName: '' };
      
      const result = await zraApi.submitInvoiceToZRA(invalidInvoice);
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Validation failed');
    });

    it('should handle API errors', async () => {
      (httpsCallable as jest.Mock).mockReturnValue(() => Promise.reject(new Error('API Error')));

      const result = await zraApi.submitInvoiceToZRA(mockInvoice);
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to submit invoice to ZRA. Please try again.');
    });
  });

  describe('getComplianceReport', () => {
    it('should fetch compliance report successfully', async () => {
      const mockReport = {
        period: 'current-month',
        totalInvoices: 50,
        totalAmount: 50000,
        totalVAT: 8000,
        submittedInvoices: 45,
        pendingInvoices: 5,
        complianceStatus: 'COMPLIANT' as const,
        lastSubmissionDate: new Date()
      };

      (httpsCallable as jest.Mock).mockReturnValue(() => Promise.resolve({ data: mockReport }));

      const result = await zraApi.getComplianceReport('current-month');
      
      expect(result).toEqual(mockReport);
      expect(httpsCallable).toHaveBeenCalledWith(expect.objectContaining({ httpsCallable: expect.any(Function) }), 'getZRAComplianceReport');
    });

    it('should handle API errors', async () => {
      (httpsCallable as jest.Mock).mockReturnValue(() => Promise.reject(new Error('API Error')));

      await expect(zraApi.getComplianceReport('current-month')).rejects.toThrow('Failed to fetch ZRA compliance report');
    });
  });

  describe('generateZRAQRCode', () => {
    const mockInvoiceData = {
      invoiceNumber: 'ZRA-20241201-001',
      invoiceDate: new Date('2024-12-01'),
      customerName: 'Test Customer',
      customerTpin: '0987654321',
      businessName: 'Test Business',
      businessTpin: '1234567890',
      items: [{
        description: 'Test Item',
        quantity: 1,
        unitPrice: 100,
        vatRate: 16,
        vatExempt: false,
        total: 116,
        vatAmount: 16
      }],
      subtotal: 100,
      totalVat: 16,
      totalAmount: 116,
      currency: 'ZMW' as const,
      zraReference: 'ZRA-REF-123'
    };

    it('should generate QR code successfully', async () => {
      const mockQRCode = 'data:image/svg+xml;base64,test-qr-code';

      (httpsCallable as jest.Mock).mockReturnValue(() => Promise.resolve({ data: mockQRCode }));

      const result = await zraApi.generateZRAQRCode(mockInvoiceData);
      
      expect(result).toBe(mockQRCode);
      expect(httpsCallable).toHaveBeenCalledWith(expect.objectContaining({ httpsCallable: expect.any(Function) }), 'generateZRAQRCode');
    });

    it('should return fallback QR code on error', async () => {
      (httpsCallable as jest.Mock).mockReturnValue(() => Promise.reject(new Error('API Error')));

      const result = await zraApi.generateZRAQRCode(mockInvoiceData);
      
      expect(result).toContain('data:image/svg+xml;base64');
      expect(result).toContain('data:image/svg+xml;base64');
    });
  });

  describe('checkZRAStatus', () => {
    it('should check ZRA status successfully', async () => {
      const mockStatus = {
        status: 'ONLINE' as const,
        message: 'ZRA API is available'
      };

      (httpsCallable as jest.Mock).mockReturnValue(() => Promise.resolve({ data: mockStatus }));

      const result = await zraApi.checkZRAStatus();
      
      expect(result).toEqual(mockStatus);
      expect(httpsCallable).toHaveBeenCalledWith(expect.objectContaining({ httpsCallable: expect.any(Function) }), 'checkZRAStatus');
    });

    it('should handle API errors', async () => {
      (httpsCallable as jest.Mock).mockReturnValue(() => Promise.reject(new Error('API Error')));

      const result = await zraApi.checkZRAStatus();
      
      expect(result).toEqual({
        status: 'OFFLINE',
        message: 'Unable to connect to ZRA services'
      });
    });
  });

  describe('getZRAVATRates', () => {
    it('should fetch VAT rates successfully', async () => {
      const mockVATRates = [
        { value: 0, label: '0% (Exempt)', description: 'VAT Exempt items' },
        { value: 16, label: '16% (Standard)', description: 'Standard VAT rate in Zambia' }
      ];

      (httpsCallable as jest.Mock).mockReturnValue(() => Promise.resolve({ data: mockVATRates }));

      const result = await zraApi.getZRAVATRates();
      
      expect(result).toEqual(mockVATRates);
      expect(httpsCallable).toHaveBeenCalledWith(expect.objectContaining({ httpsCallable: expect.any(Function) }), 'getZRAVATRates');
    });

    it('should return default VAT rates on error', async () => {
      (httpsCallable as jest.Mock).mockReturnValue(() => Promise.reject(new Error('API Error')));

      const result = await zraApi.getZRAVATRates();
      
      expect(result).toHaveLength(2);
      expect(result[0].value).toBe(0);
      expect(result[1].value).toBe(16);
    });
  });

  describe('submitBatchInvoices', () => {
    const mockInvoices = [
      {
        invoiceNumber: 'ZRA-20241201-001',
        invoiceDate: new Date('2024-12-01'),
        customerName: 'Customer 1',
        customerTpin: '1234567890',
        businessName: 'Test Business',
        businessTpin: '0987654321',
        items: [{
          description: 'Test Item',
          quantity: 1,
          unitPrice: 100,
          vatRate: 16,
          vatExempt: false,
          total: 116,
          vatAmount: 16
        }],
        subtotal: 100,
        totalVat: 16,
        totalAmount: 116,
        currency: 'ZMW' as const
      },
      {
        invoiceNumber: 'ZRA-20241201-002',
        invoiceDate: new Date('2024-12-01'),
        customerName: 'Customer 2',
        customerTpin: '1234567891',
        businessName: 'Test Business',
        businessTpin: '0987654321',
        items: [{
          description: 'Test Item 2',
          quantity: 2,
          unitPrice: 100,
          vatRate: 16,
          vatExempt: false,
          total: 232,
          vatAmount: 32
        }],
        subtotal: 200,
        totalVat: 32,
        totalAmount: 232,
        currency: 'ZMW' as const
      }
    ];

    it('should submit batch invoices successfully', async () => {
      const mockResponse = {
        success: true,
        submitted: 2,
        failed: 0,
        results: [
          { invoiceNumber: 'ZRA-20241201-001', success: true, message: 'Successfully submitted to ZRA' },
          { invoiceNumber: 'ZRA-20241201-002', success: true, message: 'Successfully submitted to ZRA' }
        ]
      };

      (httpsCallable as jest.Mock).mockReturnValue(() => Promise.resolve({ data: mockResponse }));

      const result = await zraApi.submitBatchInvoices(mockInvoices);
      
      expect(result).toEqual(mockResponse);
      expect(httpsCallable).toHaveBeenCalledWith(expect.objectContaining({ httpsCallable: expect.any(Function) }), 'submitBatchToZRA');
    });

    it('should handle API errors', async () => {
      (httpsCallable as jest.Mock).mockReturnValue(() => Promise.reject(new Error('API Error')));

      const result = await zraApi.submitBatchInvoices(mockInvoices);
      
      expect(result.success).toBe(false);
      expect(result.submitted).toBe(0);
      expect(result.failed).toBe(2);
      expect(result.results).toHaveLength(2);
    });
  });
});
